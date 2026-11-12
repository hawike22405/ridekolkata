# Ride Kolkata — Backend (Phases 1–4)

Node.js 24, Express 5, MongoDB Atlas/Mongoose, strict Zod input contracts and a same-origin admin console. This service implements routes, pricing, admin authentication, validated visual configuration, ride telemetry and analytics. The Phase 4 React interface connects through the same-origin web proxy. No demo records are included.

## Zero-data policy

Startup never creates any business records or accounts. List endpoints return `{data: [], page, limit}` when empty. There are no sample routes, default tariffs, seeded users, implicit waypoints or recovery data. Every route and pricing field must be supplied by an authenticated administrator. Infrastructure defaults (port, pagination, pool limits) are not business configuration. The non-persisted timing hash used for unknown login emails is not an account.

## Repository integration

This directory is an independently deployed backend. The repository root retains the existing React/Vite application and `server.ts`. Root npm commands still start that existing app; they do not start this service. Run the commands below from `backend/`.

For local development, use backend PORT=3001, NODE_ENV=development and ALLOWED_ORIGIN=http://localhost:3000. Start the root web process separately on port 3000 and access `/admin/` through that web origin. The active React application loads published data from this backend. Legacy prototype components remain as unused source references; the old web server recommendation and upload handlers are removed.

## Run

1. Install Node.js 24 or newer and run `npm ci`.
2. Copy `.env.example` to `.env`. Fill MONGODB_URI with your own Atlas connection string, including an explicit application database. Use a least-privilege Atlas database user and restrict network access to your deployment's egress. Never commit `.env`.
3. Generate JWT_SECRET and a separate TELEMETRY_JWT_SECRET by running this command twice: `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`. Store both in your deployment secret manager; the keys must differ.
4. Set ALLOWED_ORIGIN to the exact permitted browser origin, without a trailing slash. Production requires HTTPS. For local use explicitly set NODE_ENV=development and ALLOWED_ORIGIN to your local server origin.
5. Run `npm run indexes` before serving traffic. This creates the unique admin email index and route start/end 2dsphere indexes. It also creates RideSession unique and 2dsphere indexes. Run it before serving rides; it never drops indexes. Automatic index building is disabled.
6. Create your real admin using `npm run admin:create`. The command reads one JSON object with `email` and `password` from standard input until EOF. Password must be 12–128 characters. Supply input from a protected secret manager/process or a temporary file with restrictive permissions, then delete it. Avoid putting passwords in command arguments or shell history. This is an operator-only provisioning command; no public signup or default credentials exist. It creates only the explicitly requested real account.
7. Run `npm start` and open `http://localhost:3000/admin/` through the root web proxy. Sign in with the account you created.

The console starts empty. Choose Routes or Pricing, click New record, enter all required fields as JSON, then Create. Edit fetches the saved fields into the editor. Unknown fields and invalid types are rejected. A 409 requires refreshing and reopening the record before editing again. Deletion requires confirmation. Tokens remain in page memory and expire after 15 minutes; reloading requires login. Sign out invalidates all tokens for that account.

## Visual configuration

Select **3D settings** in the admin console to create, edit or delete the single explicit visual configuration. The public endpoint is `GET /api/ui/3d-config`; no settings returns 404, and invalid stored settings or database failure returns 503. No default model or scene is substituted. See the [full Phase 2 contract](docs/visual-config.md) for fields, inferred TypeScript types, revision-based writes and integration requirements.

## Ride telemetry and analytics

Phase 3 adds the **Ride telemetry** admin tab, per-ride access tokens, Socket.IO ingestion, a bounded GeoJSON history, and live/historical analytics. Existing installations must add **TELEMETRY_JWT_SECRET**, run `npm ci`, run `npm run indexes`, and restart. No riders or rides are seeded. See [telemetry setup and API](docs/telemetry.md) for token issuance, GPS validation, units, sampling limits and deployment requirements.

The Node/container entry point hosts sockets; the generic serverless entry point remains HTTP-only. The current rider frontend does not request device location or send pings yet.

## Data contracts

All bodies use `application/json`. These are field descriptions, not records to insert.

Route:

| Field | Required type / constraint |
| --- | --- |
| name | Nonblank string, up to 120 characters |
| description | String, up to 2000 characters; may be empty |
| start, end | GeoJSON object with `type: "Point"` and `coordinates: [longitude, latitude]` |
| waypoints | Ordered array of GeoJSON Points, explicitly supplied, 0–200 entries |
| enabled | Boolean explicitly chosen by the admin |

Longitude range is -180 to 180; latitude range is -90 to 90. Numbers must be finite JSON numbers, not numeric strings. Point objects cannot contain extra properties. Coordinates describe an admin-configured route, not turn-by-turn directions or a verified safe cycling path.

Pricing:

| Field | Required type / constraint |
| --- | --- |
| name | Nonblank string, up to 120 characters |
| currency | Literal `INR` |
| baseFareMinor | Integer paise, 0–100000000 |
| perMinuteMinor | Integer paise per minute, 0–100000000 |
| surgeMultiplier | Finite number, 0.01–100 |
| enabled | Boolean explicitly chosen by the admin |

Pricing supports multiple independent admin-authored plans. Phase 1 does not choose a plan for a ride, apply surge to a fare, or impose a billing rounding policy. Those rules must be defined explicitly before billing. Ride sessions retain the chosen route ID and actual route name as historical metadata. Deleting a route does not delete ride history; new rides require an enabled route. Pricing selection and billing remain unimplemented.

Admin has normalized unique email, a scrypt password hash excluded from default queries, an admin role, explicit active status and a token version. No admin-management HTTP endpoint exposes hashes. An operator may disable an account or increment tokenVersion to revoke all sessions; every protected request checks the current account in MongoDB.

## API

| Method | Path | Behavior |
| --- | --- | --- |
| POST | /api/admin/auth/login | email/password to 15-minute HS256 JWT |
| POST | /api/admin/auth/logout | Revoke all current admin sessions; 204 |
| GET | /api/admin/routes | Paginated records, including disabled records |
| POST | /api/admin/routes | Create complete route; 201 |
| GET | /api/admin/routes/:id | One record and ETag; 404 if absent |
| PUT | /api/admin/routes/:id | Full replacement of editable fields |
| DELETE | /api/admin/routes/:id | Permanently delete matching version; 204 |
| GET/POST | /api/admin/pricing | Same list/create semantics |
| GET/PUT/DELETE | /api/admin/pricing/:id | Same individual-record semantics |
| GET | /health/live | Process liveness |
| GET | /health/ready | Database readiness; 503 if unavailable |

The public 3D configuration read endpoint, login, and health endpoints do not require authentication. All other API operations require `Authorization: Bearer <your token>`. Rider endpoints require a ride token, while admin endpoints require an admin token; they are not interchangeable. List queries accept only page (default 1) and limit (default 25, maximum 100). Objects include `_id`, `__v`, `createdAt` and `updatedAt`; do not send these in editable JSON.

Route/pricing PUT and DELETE require `If-Match` containing the quoted integer version from the record's `__v` or ETag. Missing version: 428. Invalid fields: 400. Missing/expired token: 401. Forbidden origin/role: 403. Concurrent changes: 409. Rate limit: 429. Database/service failure: 503, with no data substitution. Updates use Mongoose optimistic concurrency; deletes atomically match ID and version.

## Deployment

Container: build with `docker build -t ride-kolkata .`, then inject environment variables using your orchestrator. The image runs as an unprivileged user. Termination drains HTTP connections and closes MongoDB. TLS must terminate at the ingress/load balancer. Do not expose an unencrypted public admin service.

Serverless: `src/serverless.js` exports an Express handler without listening on a port. Map all relevant paths through the provider's Node.js HTTP adapter and bundle `public/`; provider-specific deployment configuration remains to be supplied. The MongoDB connection is reused within a warm instance, failed attempts can retry, and requests have a 5-second server-selection timeout. Pool sizing must fit Atlas connection limits across all instances. This entry point does not host Socket.IO; telemetry requires the long-running Node/container server or a separate telemetry deployment.

CORS permits only ALLOWED_ORIGIN when a browser sends an Origin header. Non-browser requests and same-origin requests without Origin still require authentication. Set TRUST_PROXY_HOPS only after verifying your ingress topology; the default trusts no proxy. Never set arbitrary proxy trust.

The bundled rate limiter is per-process. For multiple containers/serverless production, enforce distributed login and API throttling at an API gateway or shared limiter store before exposing the service. Do not count the memory store as a global defense. Use secret rotation, restricted Atlas access and managed HTTPS at deployment. This scaffold is not a claim of production certification.

## Validation and scope

`npm test` runs isolated security/schema/service checks and real local Socket.IO transport tests; tests do not seed or connect to a database. The delivered verification also covers telemetry timing, distance, sequence idempotency, token revocation, stale tracking, limits and analytics query construction. Storage adapters in tests are isolated and non-persistent. It does not exercise successful Atlas CRUD, index construction, login against a real account, concurrent database writes or a deployed browser. Those require your credentials/deployment and have not been claimed as tested.

Before production, use your configured records to verify login, create/list/read/update/delete and stale-version conflicts against Atlas. Check an empty collection returns an empty array. No business records should be generated for this purpose without explicit operator input.

The connected React interface validates responses before display and handles asset errors explicitly. Backend numeric validation alone cannot guarantee every model loads on every WebGL device. See the deployment guide for file budgets and target-device verification.

Implementation references: https://expressjs.com/en/5x/guide/error-handling/ and https://mongoosejs.com/docs/guide.html.

Phase 4 is implemented in this branch.

## Phase 4: connected rider interface

Run the root web process on port 3000 and this API on port 3001. Use ALLOWED_ORIGIN=http://localhost:3000 for development and access the admin console through http://localhost:3000/admin/. Public GET `/api/catalog/routes` and `/api/catalog/pricing` return only enabled, validated records, with page/limit/total metadata. Both endpoints support page (1–100000) and limit (1–100) and return empty data when nothing is published. Disabled documents and database internals are not returned. Read/write errors never substitute records.

The rider interface also consumes `/api/ui/3d-config`, `/api/rides/current`, `/api/rides/finish` and authenticated Socket.IO pings. See the root README and [deployment guide](../docs/deployment.md) for current settings, origin/proxy requirements, model restrictions and environment templates.
