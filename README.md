<div align="center">

# Ride Kolkata 

### Explore the city. Find your rhythm. Ride its stories.

An interactive cycling experience that brings Kolkata's heritage, route discovery, and a 3D bicycle showroom together.

**React 19 · Three.js · Node.js · Express · MongoDB Atlas**

[Explore the code](src/) · [Run locally](#run-locally) · [Admin backend](backend/README.md) · [3D configuration](backend/docs/visual-config.md)

</div>

---

## A different way to see Kolkata

Ride Kolkata combines a city-focused interface with an interactive bicycle experience. Explore heritage routes, inspect the bike in 3D, and discover features for night rides, ride history, weather, and route recommendations.

The project is evolving from a frontend prototype into a platform with database-managed routes, pricing, and visual settings. The goal is simple: give administrators control over what riders see, with explicit validation and no invented backend content.

## Explore the experience

| Experience | What is in the repository |
| --- | --- |
| **Interactive bicycle showroom** | Three.js canvas, bicycle models, and fleet views |
| **Kolkata heritage discovery** | Heritage explorer, map, and route views |
| **Ride planning** | Route recommender UI and a Gemini-backed endpoint |
| **Community and rider views** | Night rides, past rides, profiles, and community sections |
| **Admin operations** | Separate authenticated console for routes, pricing, and 3D settings |
| **Validated configuration** | Strict MongoDB models and API validation with explicit empty/error states |

**Current status:** the existing rider frontend still uses prototype data and fallback behavior. The new backend is a separate service; it is not yet connected to the rider frontend. No production availability, real-time tracking, completed booking flow, or database-only rendering is implied by the interface.

## Architecture

| Part | Location | Purpose |
| --- | --- | --- |
| Rider experience | `src/`, `public/` | React/Vite UI, styles, assets, and Three.js scenes |
| Existing app server | `server.ts` | Serves the frontend and existing recommendation/model endpoints |
| Admin/configuration service | `backend/` | Express 5 APIs, MongoDB models, JWT authentication, and admin console |
| Visual contract | `backend/src/visual-contract.js` | Shared runtime rules for saved settings and public API responses |
| API documentation | `backend/docs/visual-config.md` | Field meanings, versioning, and frontend integration requirements |

The two services have independent dependencies and environment files. The root `npm run dev` command starts the existing app. It does not start the new MongoDB backend.

## Run locally

### 1. Start the existing frontend app

Use Node.js 24 or newer for a consistent environment across both services.

```bash
npm install
```

Copy the root `.env.example` to `.env` and provide your own credentials for the integrations you intend to use. The current `server.ts` loads `.env` through `dotenv.config()`; it does not explicitly load `.env.local`.

```bash
npm run dev
```

Open **http://localhost:3000**. The root app's Gemini route endpoint requires your `GEMINI_API_KEY`. Its existing fallback behavior is part of the prototype and has not yet been migrated to the new backend.

### 2. Set up the admin backend

In a separate terminal:

```bash
cd backend
npm ci
```

Copy `backend/.env.example` to `backend/.env`. Supply your Atlas URI and JWT secret, then explicitly use these local settings:

```dotenv
NODE_ENV=development
PORT=3001
ALLOWED_ORIGIN=http://localhost:3001
TRUST_PROXY_HOPS=0
```

These values let the backend's own admin console run separately from the frontend on port 3000. They do not connect the two services.

Follow the [backend setup instructions](backend/README.md) to generate a JWT secret, create indexes, and provision your real admin account. There are **no default credentials or seeded accounts**.

```bash
npm run indexes
# Provision your admin using the documented stdin-based command first.
npm start
```

Open **http://localhost:3001/admin/**. Sign in and configure your own routes, fares, and scene settings. New databases begin empty.

### 3. Run backend checks

```bash
npm test --prefix backend
```

The suite covers authentication rejection, strict schemas, configuration output validation, and revision handling. It does not require Atlas or populate business collections. Live Atlas integration and deployment tests still require your environment.

## 3D settings, controlled by the admin

Phase 2 adds a single explicit scene configuration containing:

- Model URL, scale, and normalized rotation quaternion.
- Lighting intensity and scene colors.
- Camera field of view and ordered camera pivot poses.
- Drivetrain animation speed in radians per second.

`GET /api/ui/3d-config` exposes validated settings. Missing configuration returns **404**; malformed stored configuration or a database outage returns **503**. The backend never substitutes a demo scene.

Admin writes require JWT authentication. Updates and deletion use revision-based `If-Match` checks to reject stale edits. See the [complete API contract](backend/docs/visual-config.md).

## Development roadmap

| Phase | Scope | Status in this branch |
| --- | --- | --- |
| **1 — Foundation** | Admin authentication, routes, pricing, and deployment scaffold | Implemented |
| **2 — Visual configuration** | Strict 3D schema, public read endpoint, and admin editor | Implemented |
| **3 — Ride telemetry** | Rider sessions, geospatial history, speed, duration, and analytics | Planned |
| **4 — Frontend integration** | Connect UI to APIs, remove prototype data, and complete deployment hardening | Planned |

Saving a 3D setting does not yet update the current rider canvas. Frontend loading, asset failure handling, and configuration application belong to the integration phase.

## Deployment notes

The backend includes a non-root Docker image definition and a serverless Express entry point. Deployment still requires Atlas network access, a secret manager, HTTPS, and distributed request throttling. Read [backend deployment guidance](backend/README.md#deployment) before exposing it publicly.

The existing root server's `/api/upload-model` handler does not authenticate uploads. Treat that legacy endpoint as a migration item before production exposure. Backend validation checks model URL syntax, not the contents or reachability of remote assets.

## Contribute

Ideas, bug reports, and focused pull requests are welcome. Explain the behavior you want to change, keep changes scoped, and include the checks you ran. For backend changes, preserve explicit admin configuration and avoid adding seeded content or fallback business values.

[Open an issue](https://github.com/hawike22405/ridekolkata/issues) · [Review pull requests](https://github.com/hawike22405/ridekolkata/pulls)

---

<div align="center">

**Built around Kolkata. Shaped by every ride.**

</div>
