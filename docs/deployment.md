# Deploying the connected application

## Services and origins

Deploy two Node 24 processes: the root web server and `backend/src/server.js`. Serve the web process behind HTTPS on your actual production domain. Set `PUBLIC_ORIGIN` to that exact HTTPS origin (no path/trailing slash). Set API `ALLOWED_ORIGIN` to precisely the same string. Production startup refuses a missing origin or HTTP public origin. No production domain is guessed or allowed by wildcard.

The web process’s `BACKEND_ORIGIN` is the private API service origin, including its port when needed. It must contain no credentials or path. Restrict API ingress to the trusted web/gateway network; do not expose a bypass around the proxy. The web proxy forwards the original path, Authorization, Origin, If-Match, ETag and raw request body. It supports Socket.IO WebSocket upgrades. API outages return 502 JSON, never the SPA page. Configure your outer proxy for WebSocket upgrades and suitable idle/read timeouts.

Set `TRUST_PROXY_HOPS` to the actual trusted hop count seen by the API. A web-only proxy is one hop; adding a load balancer may change it. Protect the API against clients bypassing trusted proxies. Rate limits are per process; a production gateway should enforce distributed limits when scaling. Do not use a blind `trust proxy=true` setting.

Copy the production templates into your hosting environment/secret manager, supplying real values without committing them. `PORT` is per process; examples use web 3000 and API 3001. The backend Docker image exposes 3000 by default, so explicitly set PORT=3001 or point BACKEND_ORIGIN at its chosen port. Health endpoints are `/health/live` and `/health/ready` on the API and are forwarded by the web proxy.

The web build runs `npm ci && npm ci --prefix backend && npm run build`; `npm start` runs `build/server.cjs`. `dist/` holds only public frontend assets. Do not serve the entire repository or the `build/` server directory. Start the API with `node src/server.js` inside backend when environment variables are supplied by your host. `npm start` in backend expects a local `.env` file. The frontend build imports pure validation contracts from `backend/src`; it does not bundle Mongoose, signing keys or database access.

## Browser security and model assets

The web server sets Helmet headers and a production CSP. Scripts are same-origin; objects and framing are denied. Google Fonts styles/fonts are explicitly permitted. Admin assets have their own backend Helmet policy. JWTs are bearer tokens in memory, never localStorage, cookies or URLs. Configure TLS at the outer ingress and use HTTPS/WSS everywhere public.

`MODEL_ASSET_ORIGINS` is a comma-separated list of exact HTTPS asset origins permitted by CSP, or blank for same-origin models only. External asset hosts must independently allow CORS GET requests from your public origin. This allowlist does not select a model: the administrator must still save its URL. URLs are never fetched by the backend. Publish files through a controlled deployment or asset hosting workflow; there is no unauthenticated upload endpoint.

The rider loader supports self-contained glTF 2.0 GLB or glTF JSON with embedded resources. External buffer/image dependencies are rejected. Limits: 50 MiB downloaded/declared buffers, 3,000 objects, 1,000,000 loaded vertices, 3,000,000 VEC3 accessor elements, 64 source images, 4096×4096 per decoded texture and 32 million decoded texture pixels total. Unsupported compressed assets may require republishing without those extensions. Validation of configuration cannot prove an arbitrary asset safe for every GPU. File parsing/render errors and context loss produce an explicit state; a fallback bicycle is never generated. Test your actual asset on supported devices before publishing it.

Configuration polls every 30 seconds while visible, or on Refresh. The canvas remains mounted across updates. Palette, light, camera, scale and speed changes apply to the existing scene; a changed URL or drivetrain binding cancels/disposes the old asset and loads the selected asset. Late loads cannot replace newer configuration. A missing/deleted/invalid config clears the scene. The loader uses configured colors for background and ambient/key/rim lighting. Authored model materials are preserved.

`drivetrainBinding` is optional for backward compatibility: absent/null means no named drivetrain animation. To animate, supply `{nodeName, axis, pivot}` using an exact unique non-root node name, axis x/y/z and model-local pivot. Speed is configured radians/second. The browser never guesses component names or pivots. Pause controls animation only. Camera view controls select explicit admin poses; there is no invented camera path.

## Atlas credentials and index migration

Use an Atlas database user limited to the application database; allow only deployment network egress in Atlas Network Access. Store MONGODB_URI and separate JWT_SECRET / TELEMETRY_JWT_SECRET only in API secrets. URI-encode reserved password characters. Keep admin and telemetry secrets distinct and consistent across instances of the same deployment. Rotate any credentials disclosed outside your secret manager.

Before accepting writes, run from backend with its environment configured:

```sh
npm run indexes
```

Or when the host injects environment variables rather than a `.env` file:

```sh
node scripts/indexes.js
```

This uses `createIndexes`, not `syncIndexes`, so it does not drop unrelated indexes. Fix duplicates that prevent unique-index creation before opening traffic. Automatic index creation is disabled.

| Collection/model | Required indexes |
| --- | --- |
| Admin | unique email |
| Route / Pricing | Route start/end: 2dsphere; Pricing: built-in _id |
| VisualConfig | built-in unique singleton `_id` |
| RideSession | unique requestId; unique riderRef where status is active |
| RideSession | status + startedAt; routeId + status + startedAt |
| RideSession | status + lastReceivedAt; status + expiresAt |
| RideSession | **path: 2dsphere**, **lastLocation: 2dsphere** |

GeoJSON uses `[longitude, latitude]`. A path is absent until two distinct observed positions exist, rather than storing an invalid one-point LineString. Long telemetry gaps do not add measured distance. The stored line still geometrically connects samples across gaps; use the sample gap flags if adding a map later. No map-matched or exact physical route is claimed. No TTL policy silently deletes ride history; choose a retention policy before production collection.

## Serverless and operations

`backend/src/serverless.js` is HTTP-only. If using it, run the Socket.IO API in a separate persistent Node service with the same database and signing keys, and explicitly route `/socket.io` to that service at the ingress. The default web BACKEND_ORIGIN assumes a single persistent API service for HTTP and sockets.

Create the first administrator with `npm run admin:create`; this reads real credentials from a JSON object on standard input and does not create a demo account. Publish real configuration through `/admin/`. Historical analytics use explicit windows of at most 31 days; live counts represent fresh accepted GPS, not socket count. See the telemetry guide for sample/session limits and calculation semantics.

Before launch, verify Atlas connectivity/index creation, login and CRUD, a published model on target devices, a real rider’s consent/GPS flow, token expiry/revocation, finish behavior and your HTTPS/WSS ingress. These deployment-specific checks have not been performed by local automated tests.
