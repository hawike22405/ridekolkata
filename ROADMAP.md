# Ride Kolkata project roadmap

**Updated:** 15 October 2026  
**Repository status:** Phases 1–4 are merged to `main` in [PR #4](https://github.com/hawike22405/ridekolkata/pull/4).

This roadmap separates implemented code from the setup and real-world checks needed to operate it. A passing local test suite does not mean the database is connected or that the app is deployed.

## Progress so far

| Phase | Status | Delivered |
|---|---|---|
| 1. Backend and admin | Complete | Node.js/Express API, MongoDB/Mongoose models for admins, routes and INR pricing; JWT-protected admin sign-in and CRUD; no seeded business records. |
| 2. Configurable 3D | Complete | Strict visual configuration contract and admin controls for the selected model, scene, camera, colors and explicit drivetrain binding. |
| 3. Ride telemetry | Complete | Scoped ride tokens, Socket.IO GPS ingestion, validated samples, GeoJSON ride paths, Haversine calculations and admin analytics. |
| 4. Frontend and deployment foundation | Complete | React frontend reads published routes/prices and visual configuration; rider can connect to an admin-issued token and explicitly share, pause and finish GPS tracking. Added same-origin API/WebSocket proxy, security headers, environment templates, tests and deployment guidance. |

The merged code passed 5 root integration tests, 63 backend tests, 6 browser tests, TypeScript checks and a production build in the local verification environment. The npm audit checks reported no production dependency vulnerabilities at that time. These checks used test fixtures and local proxy servers; they did not connect to Atlas or verify a deployed domain, the repository’s bicycle model on real devices, or physical GPS. See [verification details](backend/VERIFICATION.md).

## Remaining work, in order

### 1. Protect and prepare the real environment

**Do this before using the project with real data.** A MongoDB URI and JWT secret were shared in chat during setup, so treat them as exposed.

- [ ] Change the Atlas database user’s password and update its least-privilege permissions and network allowlist.
- [ ] Generate two new independent random values for `JWT_SECRET` and `TELEMETRY_JWT_SECRET`. Replacing the values invalidates tokens signed with the old keys; issue new admin sessions and ride tokens afterward.
- [ ] Store the URI and signing keys in the backend’s local ignored `.env` or deployment secret manager. Do not put them in the frontend, GitHub files, `VITE_*` variables, screenshots or logs.
- [ ] Choose the real production HTTPS domain and hosting provider. No production domain or hosting platform is configured in this repository.
- [ ] Set the web service’s exact `PUBLIC_ORIGIN`, private `BACKEND_ORIGIN`, and permitted `MODEL_ASSET_ORIGINS`. Set backend `ALLOWED_ORIGIN` to the same exact public origin and choose `TRUST_PROXY_HOPS` for the actual network path.

Use the blank production templates in the repository and follow [the deployment guide](docs/deployment.md). Keep the API private behind the web service or trusted gateway, and enable HTTPS plus WebSocket upgrades.

**Complete when:** both services start with real secret-manager values, the web origin is exact HTTPS, `/health/ready` succeeds through the proxy, and `/api` errors are JSON rather than the homepage.

### 2. Connect Atlas and create the first administrator

- [ ] Create/confirm the Atlas cluster, application database user, database name and network access rules.
- [ ] Configure the backend environment without committing it.
- [ ] Install dependencies using the root README instructions.
- [ ] Run `npm run indexes` from `backend/` before accepting traffic. This creates the declared unique, route geospatial and ride `2dsphere` indexes.
- [ ] Create your real administrator with `npm run admin:create`. There is no default admin account.
- [ ] Start the API and web service and sign in through `/admin/` on the web origin.

**Complete when:** Atlas readiness succeeds, administrator login works, and indexes exist. Confirm this against the actual deployment; local tests have not verified Atlas credentials or network access.

### 3. Publish real routes, pricing and the bicycle configuration

The site is intentionally empty until an administrator publishes records. Do not add sample listings just to make the page look populated.

- [ ] Enter the real routes, start/end coordinates, waypoints and descriptions in the admin portal.
- [ ] Enter the real INR base fare, per-minute rate and surge multiplier. The frontend displays these values; it does not charge riders or process payments.
- [ ] Select the actual bicycle model and save all required camera, light, color, scale and rotation values.
- [ ] Check that the asset is self-contained GLB/glTF within the documented size/resource limits and is served from an allowed HTTPS or same-origin URL.
- [ ] Test the model on your supported phones and computers. If drivetrain animation is required, identify the correct unique model node and pivot explicitly; the application does not guess these.

**Complete when:** the public pages show only the records you published and the selected model loads correctly on target devices. Missing/invalid configuration should continue to show a clear empty or error state.

### 4. Run an end-to-end ride check

Use a consenting test rider and a real configured route. A browser fixture is not a substitute for physical GPS.

- [ ] Have an administrator verify the rider and create a ride for an enabled route.
- [ ] Deliver the ride token privately. The current system has no rider account registration or identity provider; issuing a ride token is an administrator action.
- [ ] Open the site on a GPS-capable device over HTTPS, enter the token and confirm the ride details load.
- [ ] Choose **Share location**, grant browser permission and verify fresh pings and analytics appear in the admin console.
- [ ] Test pause, stale GPS, temporary network loss, manual reconnect/sequence sync, token replacement/expiry and finish.
- [ ] Confirm the measured route and speeds are reasonable. GPS data is observational and is not a billing or safety certification.

**Complete when:** a real ride starts, authorized pings are stored once, a reconnect does not duplicate or invent samples, finishing prevents further pings, and historical/live admin views agree with the ride.

### 5. Set production operations and privacy controls

- [ ] Choose a GPS-data retention period and document how riders are told about collection, use, access and deletion before collecting production locations.
- [ ] Configure Atlas backups and rehearse a restore.
- [ ] Add production logs, uptime/health alerts and database/Socket.IO error alerts without logging tokens, credentials or raw location data unnecessarily.
- [ ] Set ingress and distributed rate limits appropriate to the deployment. Current in-process limits do not coordinate across multiple instances.
- [ ] Check HTTPS/WSS, CORS, admin access, secret rotation, database permissions, dependency audits and WebGL behavior in the deployed environment.
- [ ] Measure performance and database capacity with a controlled test before scaling. No load benchmark is included.

**Complete when:** an operator can detect outages, restore data, rotate secrets and follow a written location-data policy.

## Product features to decide on

These were not part of the completed backend/frontend phases. Decide whether they belong in the product before planning their implementation.

- **Rider accounts and identity verification:** riders currently receive a ride token from an administrator.
- **Reservations and bicycle availability:** no booking/stock system exists; the frontend does not simulate booking confirmations.
- **Payments, invoices and automatic fare calculation:** rates are informational; no payment provider or billing workflow is connected.
- **Map display, turn-by-turn navigation and route recommendations:** route coordinates can be viewed, but no configured map/routing provider is connected to the active rider interface.
- **Offline telemetry, notifications or multi-instance live presence:** offline locations are not queued or uploaded later; socket presence is not broadcast between instances.

## Recommended next sequence

1. Rotate the shared credentials and choose the production domain/host.
2. Connect Atlas, run indexes and create the real admin account.
3. Publish real routes, prices and the bicycle configuration.
4. Complete one consenting rider test from start through finish.
5. Deploy with HTTPS/WSS, privacy/retention rules, backups and alerts.
6. Decide whether accounts, bookings, payments or navigation are part of the next product release.

## Reference guides

- [Project setup and feature overview](README.md)
- [Production deployment, origins, assets and Atlas indexes](docs/deployment.md)
- [Admin setup and backend API](backend/README.md)
- [3D configuration contract](backend/docs/visual-config.md)
- [Telemetry and analytics semantics](backend/docs/telemetry.md)
- [Automated test scope and limitations](backend/VERIFICATION.md)
