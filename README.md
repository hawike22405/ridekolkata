<div align="center">

# Ride Kolkata ↗
### Take the scenic route.

**A closer look at the city, from the saddle.**

Explore published cycling routes, inspect an administrator-selected bicycle in 3D, and share location during an active ride.

**React 19 · Three.js · Express · MongoDB Atlas · Socket.IO**

[Get started](#run-locally) · [Project roadmap](ROADMAP.md) · [Deployment](docs/deployment.md) · [Admin guide](backend/README.md) · [3D contract](backend/docs/visual-config.md) · [Telemetry](backend/docs/telemetry.md)

</div>

---

## Built around the real ride

A dark, green-accented interface puts the route, bicycle and ride details first. Administrators publish the content; riders see exactly those enabled records. An empty database produces an empty catalog. Missing configuration or a network failure produces an explicit state, with a way to retry.

| For riders | For administrators |
| --- | --- |
| Browse published routes and their configured waypoints | Create, edit, disable and remove routes and INR tariffs |
| View base fare, per-minute rate and surge multiplier | Set model URL, camera poses, lighting, colors and animation |
| Inspect the configured 3D asset and select camera views | Start verified riders’ sessions and privately issue scoped tokens |
| Explicitly start/pause GPS sharing and finish a session | Query live telemetry and historical ride analytics |

The active application contains **no seeded records, invented availability, ratings, weather, generated routes or simulated bookings**. Previous prototype components remain in `src/components`, `src/services` and `src/data` for reference, but the connected `App.tsx` does not import them. Legacy Gemini recommendation and model-upload endpoints have been removed from the web server. Model files are published through your controlled asset/deployment process.

## How it fits together

The web process serves React and proxies `/api`, `/admin`, `/health` and `/socket.io` to the separate API process. Browser requests use the same public origin; database credentials and signing keys exist only in the API environment. The Node/container API persists to MongoDB Atlas and hosts Socket.IO. A generic serverless API export supports HTTP only; telemetry still requires a long-running Node service.

## Run locally

Use **Node.js 24 or later** and npm. Install both locked dependency sets:

```sh
npm ci
npm ci --prefix backend
cp .env.example .env
cp backend/.env.example backend/.env
```

Fill `backend/.env` with your Atlas URI and **two different** random signing keys of at least 64 characters. Generate each key separately:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Default development settings are web `http://localhost:3000`, API `http://localhost:3001`, and API `ALLOWED_ORIGIN=http://localhost:3000`. The example proxy hop count is one for the web proxy; review it for your topology. Never put credentials in `VITE_*` variables or commit a real `.env`.

Create the required indexes and your first real administrator from the backend directory:

```sh
cd backend
npm run indexes
npm run admin:create
npm run dev
```

In another terminal, from the repository root:

```sh
npm run dev
```

Open `http://localhost:3000` and `http://localhost:3000/admin/`. Sign in with the administrator you created. Publish routes and prices, then create a complete 3D configuration. Every required configuration value must be chosen explicitly. Use a self-contained GLB or glTF with embedded resources. The checked-in asset can be selected explicitly as `/Main%20Cycle.glb`; it is never auto-selected.

## Start a real ride

In the admin **Ride telemetry** tab, select an enabled route by its ID, enter a verified rider reference, and start the session with a new request UUID. Privately give its ride token to the rider. The rider enters it in **Your ride**, connects, and presses **Share location**. Browser location permission and HTTPS (or localhost) are required. Tokens are kept only in page memory; reloading requires entering the token again.

The browser sends at most one GPS sample per second, with one acknowledgement outstanding. It does not buffer offline locations. Connection/acknowledgement errors stop sharing; reconnect reads the server’s accepted sequence before using new locations. Pausing location sharing does not finish the session. Finish explicitly, or ask the administrator to finish it. Token expiry also stops sharing; administrators can issue a replacement token.

## Verify and deploy

```sh
npm run lint
npm test
npm test --prefix backend
npm run build
```

Browser checks: `npx playwright install chromium`, then `npm run test:browser`. Test inputs live only in isolated test transports and are never inserted into Atlas or served by the application.

For production, configure exact HTTPS origins using the intentionally blank `.env.production.example` templates, deploy the API privately behind the web proxy, enable WebSocket upgrades, run the index migration and start the web build with `npm start`. Full instructions, index requirements, asset restrictions and serverless limits are in [deployment.md](docs/deployment.md).

This release connects catalog, 3D and telemetry flows. Rider account registration, reservations, payment collection and automatic billing are outside the implemented API. Prices are displayed as configured; the fare formula shown is an estimate, not a payment transaction. No live Atlas, public-domain deployment, physical GPS accuracy or production load test is claimed. See [verification](backend/VERIFICATION.md).
