# Visual configuration — Phase 2

This API describes a single scene configuration. It does not implement a Three.js loader, frontend subscription, asset upload, or animation playback. All configuration fields must be supplied by the admin. No records are created automatically.

## HTTP contract

| Method | Endpoint | Authentication / result |
| --- | --- | --- |
| GET | `/api/ui/3d-config` | Public; validated response or 404 when unconfigured |
| GET | `/api/admin/visual-config` | Admin JWT; same response envelope |
| POST | `/api/admin/visual-config` | Admin JWT; create once, 201; existing singleton gives 409 |
| PUT | `/api/admin/visual-config` | Admin JWT and quoted revision in `If-Match`; complete configuration replacement |
| DELETE | `/api/admin/visual-config` | Admin JWT and quoted revision in `If-Match`; 204 |

POST and PUT accept the configuration object itself, not the response envelope. GET/POST/PUT return `data` (the complete config), `revision` (a UUID), and `updatedAt` (an ISO UTC timestamp). The ETag header contains the quoted revision. Responses are `Cache-Control: no-store`.

PUT and DELETE require the exact ETag from the last read. Missing If-Match returns 428; malformed If-Match returns 400; stale or deleted configuration returns 409. Wildcard and multiple ETags are unsupported. Writes use an atomic ID/revision predicate. Each replacement generates a new UUID; deleting and recreating cannot accidentally reuse an old numeric version.

A malformed stored record returns 503 rather than leaking values to the renderer. A missing record returns 404. Neither response includes a substitute configuration. Authentication errors are 401/403, malformed request bodies are 400, and rate limiting is 429. Existing generic error middleware intentionally hides internal service errors.

## Required fields

| Field | Meaning and constraint |
| --- | --- |
| `schemaVersion` | Literal number 1; reject unknown versions |
| `modelUrl` | Root-relative or HTTPS URL with a `.glb` or `.gltf` pathname; maximum 2048 characters |
| `modelScale` | Uniform positive model scale, 0.001–100 |
| `modelRotationQuaternion` | Four numeric components `[x,y,z,w]`; unit norm within 0.000001 |
| `lightingIntensity` | Scalar light intensity, 0–20; frontend mapping to individual lights remains to be implemented |
| `cameraPivotPoints` | Ordered array of 1–32 camera poses; each has `position` and `rotationQuaternion` |
| `cameraPivotPoints[].position` | Three numeric world-space coordinates `[x,y,z]`, each between -10000 and 10000 |
| `cameraPivotPoints[].rotationQuaternion` | Camera orientation `[x,y,z,w]`, same normalized quaternion rule |
| `cameraFov` | Vertical perspective field of view in degrees, 10–120 |
| `drivetrainAnimationSpeed` | Angular velocity in radians per second, 0–20; zero explicitly stops the drivetrain |
| `hexColors` | Strict object with `background`, `primary`, and `accent`, each a six-digit `#RRGGBB` string |

Positions and orientations use the Three.js scene coordinate system; no geospatial interpretation is implied. Camera orientation is explicit, not a look-at target. Pivot transition timing/interpolation and material mapping are not defined in Phase 2. Use admin-authored values suitable for your assets, without automatic correction or normalization.

Numbers must be finite JSON numbers. Strings, null, extra fields, missing values, zero-length quaternions, invalid tuple lengths, and excessive array lengths are rejected. The bounds are API safety limits, not default scene values.

## Model assets

URLs cannot contain credentials, fragments, raw whitespace, backslashes, control characters, or dot-segment traversal. Encoded spaces allow an existing asset such as the repository's `Main Cycle.glb` to be addressed if explicitly configured by the admin. URL query strings support versioned/signed asset links, but the response is public: never include private credentials in them.

Root-relative paths resolve against the frontend origin when integrated. An absolute URL must use HTTPS. The backend does not fetch or inspect assets, follow redirects, check GLTF contents, or verify asset CORS headers. `.gltf` may refer to additional buffers/textures, whose validation belongs to the loading pipeline. A syntactically valid URL does not guarantee a usable model.

## Source of truth and types

- `src/visual-contract.js`: executable Zod input and response schemas. Validate input before Mongoose can coerce values; validate raw database output before exposing it publicly.
- `contracts/visual-config.ts`: TypeScript types inferred directly from the executable validators. Import it as a **type-only** dependency in future frontend integration.
- `contracts/visual-config.schema.json`: generated structural JSON Schema for tooling. It cannot express the quaternion norm calculation or all URL refinements; it is not a replacement for runtime Zod validation.
- `scripts/export-visual-contract.js`: regenerate the JSON Schema after contract changes with `node scripts/export-visual-contract.js` from `backend/`.

The MongoDB singleton uses the unique built-in `_id` index (`current` is an internal identity, not a default record). No new secondary index is required. The schema has no business defaults. Direct database writes bypass HTTP validation; public output validation is a second defense, not permission to write unvalidated documents directly. A corrupt record may require operator repair because admin reads also fail closed.

## Admin console

Sign in at `/admin/` on the backend service, select **3D settings**, and enter a complete JSON object. An unconfigured database shows an empty editor. Field guidance is available without prefilled sample content. Refresh reloads the current server version; save and delete use the loaded revision. On a conflict, copy any unsaved work before refreshing and reapplying your changes.

## Phase 4 integration requirements

1. Fetch the public endpoint and check HTTP status, schema version and runtime response shape before applying values.
2. Display an explicit unconfigured/error state for 404/503. Do not invent a model, color or camera pose.
3. Load and validate the admin-selected asset before swapping the active scene. Handle loader errors, cancellation and disposal of old resources.
4. Apply transforms to existing scene objects without remounting the canvas on every update. Coordinate asset loading with the current revision to prevent stale requests overwriting newer data.
5. Define camera transitions, light/material bindings and mesh animation targets explicitly for the actual models.
6. Handle WebGL context loss, unsupported devices, and resource limits. Backend validation alone cannot guarantee a stable WebGL context.

Phase 2 exposes settings on fetch; it does not push changes in real time. Existing frontend mock data/fallbacks are still present until the integration phase.

## Verification scope

Local tests cover contracts, response serialization, auth rejection, error states and optimistic-revision HTTP behavior using non-persisted test inputs and storage doubles. They do not seed application collections. Successful Atlas CRUD and real concurrent MongoDB writes have not been exercised without an Atlas environment.

References: [Zod contracts](https://zod.dev/api), [Three.js normalized quaternions](https://threejs.org/docs/pages/Quaternion.html), [Mongoose schemas](https://mongoosejs.com/docs/guide.html).
