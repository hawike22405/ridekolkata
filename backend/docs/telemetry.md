# Ride telemetry and analytics — Phase 3

The container/Node server now accepts Socket.IO location pings for explicitly created rides. It stores accepted GPS samples, a GeoJSON LineString, timing and distance summaries in one RideSession document. No rides, locations, riders, routes or analytics records are seeded.

The current React app is **not connected** to this service. Phase 4 will add browser location permission, token delivery, frontend API wiring, error handling and removal of prototype data.

## Upgrade existing installations

1. Run `npm ci` inside `backend/` to install the locked Socket.IO dependencies.
2. Generate a **new, separate** random secret for `TELEMETRY_JWT_SECRET` using the same generation command documented for JWT_SECRET. Put it in your secret manager or backend `.env`. Startup rejects missing/short keys and reuse of the admin key.
3. Run `npm run indexes` before serving traffic. This creates the required unique and geospatial indexes. Indexes are not created automatically on startup. Do not operate without them.
4. Restart the backend with `npm start` or deploy the container. The HTTP and Socket.IO services share its configured port.

Keep both keys identical across the REST and telemetry instances of the same deployment, while keeping the admin key different from the telemetry key. Rotation of a signing key invalidates tokens signed with the old key.

## Identity and ride lifecycle

There is no rider login/account system in the existing application. An authenticated admin must verify the real rider externally, provide that rider's stable `riderRef`, select an existing **enabled** route ID, and explicitly start a ride. This is an operator-issued bearer capability, not a claim that rider identity has already been verified by the backend.

The new **Ride telemetry** admin tab supports starting, reading, ending and replacing the token of a ride, plus live and historical analytics. It contains no prefilled rider or route. Generate a new request UUID for each new ride; reuse the same request UUID when retrying an uncertain start result. A duplicate request with matching admin/rider/route details returns the existing active ride; different details return 409. Concurrent duplicate inserts may initially return 409; retry with the same request ID to recover the result.

Each token grants telemetry/current/finish access to exactly one ride. It uses a separate JWT signing key, issuer, audience and scope, expires after at most one hour, and cannot act as an admin token. Admins can replace it before expiry; replacement increments the stored token version, revoking old tokens. Tokens are returned only in start/rotation responses and should be delivered privately to that rider. Never put them in query strings, repository files or public URLs.

Rides have a 24-hour hard lifetime and at most 20,000 accepted samples. An admin may end any ride; a rider with a valid token may end only their own. Ending is idempotent and immediately blocks further pings. Token expiry or a socket disconnect does not automatically finish the ride. A closed session remains readable with an unexpired matching ride token until token expiry, but cannot accept telemetry.

One active ride per rider is enforced by a unique partial index. Starting a new ride automatically closes that rider's overdue active session at its recorded expiry time. Admin finish can close an overdue session explicitly. Analytics also treat overdue active sessions as expired even before that housekeeping write occurs. This avoids counting overdue sessions as live without requiring an in-process timer or background cron.

## HTTP endpoints

All responses inherit the API's `Cache-Control: no-store` policy. Admin endpoints use the existing admin JWT. Rider endpoints use the new ride token in `Authorization: Bearer ...`.

| Method | Endpoint | Result |
| --- | --- | --- |
| POST | `/api/admin/rides` | Start a ride; body requires requestId UUID, riderRef string, routeId ObjectId. Returns ride summary and token; 201 on creation, 200 on idempotent recovery |
| GET | `/api/admin/rides/:id` | Ride summary |
| POST | `/api/admin/rides/:id/token` | Replace token and revoke previous tokens; empty body or `{}` |
| POST | `/api/admin/rides/:id/finish` | End the ride; empty body or `{}` |
| GET | `/api/admin/rides/:id/path` | GeoJSON path or null, path vertex/sample counts and status |
| GET | `/api/admin/rides/:id/samples?after=&limit=` | Accepted samples after a sequence number; default after 0, default limit 100, maximum 200. `nextAfter` is null when exhausted |
| GET | `/api/rides/current` | Summary of the ride identified by the token, including last accepted sequence and server time |
| POST | `/api/rides/finish` | End only the token's ride; empty body or `{}` |
| GET | `/api/admin/analytics/rides?from=&to=&routeId=` | Historical summary, top 20 routes and UTC daily totals |
| GET | `/api/admin/analytics/live?page=&limit=` | Distinct fresh riders and paginated fresh sessions; default limit 25, maximum 100 |

The ride summary includes server start/end/expiry timestamps, elapsed duration, last accepted sequence, sample count, observed distance/time, gap time, current speed, two average-speed measures, tracking freshness and last observed position. It does not expose tokens, internal revisions, or the full sample array.

Do not interpret an absent path or `null` speed/distance as zero. A newly created ride has no location or measured distance. The first sample establishes a position but cannot establish a speed. Stationary pairs can legitimately produce zero speed. Disconnecting does not imply zero speed.

## Socket.IO protocol

Connect using a Socket.IO v4 client, path `/socket.io`, **WebSocket transport only**, and `auth.token` containing the ride token. A raw WebSocket client is not a Socket.IO client. The browser's Origin must exactly match ALLOWED_ORIGIN. The server validates authentication during the handshake and again for every event. An expiry timer also disconnects a connection at token expiry.

Send the event `telemetry:ping` with an acknowledgement callback. Each payload contains only:

| Field | Requirement |
| --- | --- |
| sequence | Positive safe integer; exactly lastSequence + 1 |
| capturedAt | UTC ISO timestamp; no future time, no earlier than ride start, no more than 30 seconds old |
| coordinates | `[longitude, latitude]`, finite numeric values in geographic ranges |
| accuracyMeters | Positive finite accuracy estimate, at most 50 metres |

There is no client-supplied ride ID or rider ID in the ping; the token selects the session. Acknowledgements use `{ok: true, duplicate, ride}` or `{ok: false, error: {code, message, ...}}`. A success acknowledgement is sent only after persistence succeeds. Payloads without an acknowledgement callback are ignored.

Keep only one ping outstanding. Wait for its acknowledgement before sending the next. On an uncertain transport result, reconnect, read `/api/rides/current`, and retry the exact last payload if needed. An identical retry of the most recently accepted sample is idempotent and does not increase distance or counts. Changed contents, older sequence numbers, or skipped sequence numbers are rejected. There is no offline bulk-upload protocol; old captures must not be replayed as live data.

Both capture timestamps and server receipt times must be at least 250 ms apart, limiting accepted telemetry to four pings per second per ride. Each socket also has a 250 ms attempt limit and permits only one in-flight handler. Two connections per ride per process are permitted for reconnect overlap. HTTP rate limits are independent. Clock skew produces an explicit timestamp error; clients should use returned serverTime to detect a clock problem rather than falsify sample timestamps.

Errors include INVALID_PING, INVALID_RIDE_TOKEN, TOKEN_REVOKED, RIDE_NOT_ACTIVE, SEQUENCE_CONFLICT, WRITE_CONFLICT, TIMESTAMP_REJECTED, TIME_ORDER, IMPLAUSIBLE_SPEED, PING_RATE, BACKPRESSURE and SAMPLE_LIMIT. Retry transient conflicts with the same sample; correct rejected input or stop/reauthorize as appropriate. Never increment the sequence solely because a request was sent.

## Calculations and measurement limits

- **Duration:** server end time minus server start time. For active rides use current server time, capped at the hard expiry. This is elapsed riding-session time, including stops, not moving time.
- **Segment distance:** Haversine great-circle distance between consecutive accepted GPS coordinates, with mean Earth radius 6,371,008.8 metres.
- **Current speed:** segment distance divided by capture-time interval, converted to km/h. It becomes null after 30 seconds without fresh captures/receipts, after a long gap, or after closure.
- **Observed average speed:** accumulated distance divided by accumulated valid segment time. This is time-weighted, not the arithmetic mean of instantaneous speeds.
- **Session average speed:** accumulated observed distance divided by total elapsed session duration. Missing intervals can make this underestimate actual ride speed; it is separately labelled.
- **GPS gap:** an interval over 30 seconds is recorded with `gapBefore: true`. Its duration contributes to gapSeconds; its distance and speed are not invented. An implied speed above 25 m/s (90 km/h) is rejected even across a gap.

All accepted samples retain timestamps, accuracy, coordinates and gap markers. Consecutive coincident positions are retained as samples but need not add another geometry vertex. A LineString is absent until two distinct positions are available. Its vertices are observed positions, not a surveyed or map-matched exact route. It connects successive positions geometrically even across gaps; frontend rendering must use sample `gapBefore` flags to break/hide unknown intervals. Do not present those straight connectors as measured travel.

GPS jitter, device accuracy reports, clock quality and maliciously fabricated client input limit accuracy. Validation rejects structurally invalid and grossly implausible readings; it does not prove physical location or remove all GPS noise. This telemetry is not a billing or safety certification mechanism.

## Storage consistency and indexes

Each accepted ping updates the sample history, LineString, last position and aggregate counters together in a single MongoDB document. Updates compare stored version, status and tokenVersion, then increment version. A competing ping, finish or token rotation cannot silently overwrite the other operation. No separate sample insert/aggregate transaction is required.

Metadata reads project out history and geometry. Pings append with `$push` rather than fetching and resending the full history. The hard 20,000-sample cap keeps the document bounded; there is no silent truncation. At 1 Hz it accommodates roughly 5.5 hours, and at 4 Hz roughly 83 minutes. Longer rides at those rates need a future chunked storage design. The 24-hour lifecycle cap is independent of the sample cap.

Required RideSession indexes, created by `npm run indexes`:

| Index | Purpose |
| --- | --- |
| requestId, unique | Idempotent start requests |
| riderRef, unique where status=active | One active ride per rider |
| status + startedAt | Historical queries |
| routeId + status + startedAt | Route-filtered history |
| status + lastReceivedAt | Fresh-session queries |
| status + expiresAt | Expiry filtering |
| path, 2dsphere | Geographic LineString queries |
| lastLocation, 2dsphere | Geographic latest-position queries |

No TTL index deletes ride history. Configure a deliberate retention policy before collecting production location data. Route ID and the actual route name at session creation are retained for historical analytics; deleting a configured route does not cascade-delete rides. New sessions still require an existing enabled route.

## Analytics semantics

Historical queries require explicit ISO from/to dates, with an exclusive upper bound and a maximum window of 31 days. They select completed/expired rides **by start time**; trips crossing the range boundary are attributed entirely to their start date. Optional routeId narrows the query. Summary average speed is total observed distance divided by total observed time. Empty results contain empty facet arrays, not demo records. Popular routes count completed/expired sessions, not individual GPS pings. Daily totals use UTC.

Live users means distinct rider references on active, unexpired sessions whose latest accepted receipt and capture are both within 30 seconds. It is a fresh-telemetry count, not a connected-socket count; a just-disconnected rider can remain visible for up to that window. The admin console displays an as-of timestamp and refresh button. Historical and live statistics use MongoDB aggregation, bounded pagination, and a 10-second query deadline.

## Deployment and remaining integration

Use the Node/container entry point for Socket.IO. The generic serverless Express export serves HTTP only; it cannot maintain the socket server. If HTTP APIs are deployed serverlessly, deploy a separate long-running telemetry service sharing the same database, signing keys and allowed rider origin, with HTTPS/WSS ingress and WebSocket upgrades enabled.

Only WebSocket transport is enabled, so polling-session stickiness is not needed. This implementation sends acknowledgements to the originating client; it does not broadcast rooms or presence between instances. Database revision checks and receipt-time limits apply across instances. Per-process connection/attempt limits do not replace global API gateway protections. Apply distributed abuse controls, measure Atlas throughput, and size pools for instance count before production scale. No load benchmark is claimed.

Phase 4 must connect the real rider identity/token flow, browser geolocation permission, API reads, guarded 3D loading and production origin. No GPS collection starts merely by opening the current rider frontend.

## Verification

Tests exercise pure calculations, strict payloads, token isolation, idempotency, concurrent service calls, revocation/finish behavior, sample bounds and query construction. Real local Socket.IO server/client tests cover authentication, origin rejection, event revocation, malformed input and backpressure. Storage tests use an isolated in-memory adapter; no real accounts or location records are inserted. Live Atlas index construction, actual database concurrency, aggregation execution and production throughput still require your environment.

References: [Socket.IO middleware](https://socket.io/docs/v4/middlewares/), [MongoDB GeoJSON](https://www.mongodb.com/docs/manual/reference/geojson/), [MongoDB partial indexes](https://www.mongodb.com/docs/manual/core/index-partial/), [Mongoose atomic updates](https://mongoosejs.com/docs/tutorials/findoneandupdate).
