# Phases 1–4 verification

Verified locally with Node.js 24.19.0.

- `npm run lint`: passes, including strict null checks across the TypeScript source.
- `npm test`: 5/5 root integration checks pass. Covers production configuration rejection, exact HTTP proxy forwarding and controlled outages, a real WebSocket upgrade through the proxy, model preflight and frontend response rejection.
- `npm test --prefix backend`: 63/63 pass. Includes the prior 58 security/visual/telemetry checks an explicit drivetrain-binding check and four catalog checks for enabled filtering, pagination, output validation, empty results, outages and exact CORS.
- `npm run test:browser`: 6/6 pass in headless Chromium 153 using software WebGL. Covers empty/outage and malformed API states, configured catalogs, stable canvas identity during revision changes, clearing deleted config, failed model downloads, token transport, no automatic GPS, mobile overflow, and an active ride through consent, accepted/rejected pings, reconnect sequence synchronization and finish.
- `npm run build`: passes. The Three.js frontend bundle still triggers Vite's advisory size warning (about 1 MB JavaScript before gzip); no performance benchmark is claimed.
- Root npm audit: zero reported vulnerabilities at verification time. The backend production dependency audit also reports zero vulnerabilities.
- Mobile empty-state screenshot inspected. No horizontal overflow at 390px.

The standard Playwright Chromium download returned a truncated archive in this environment. Browser checks used the packaged Chromium binary from `@sparticuz/chromium`, with its software rendering libraries, through `CHROMIUM_EXECUTABLE_PATH`. That package and binary are test-environment-only and are not repository dependencies. On a normal development host, install Playwright Chromium using the README command.

Fixtures are isolated test inputs and transport/storage doubles. No real accounts, rides, catalog records or GPS samples were seeded, and no test connects to Atlas. Proxy tests use real local HTTP/WebSocket servers. Browser GPS is injected test input, not a physical-device accuracy check. Stable-canvas checks use a minimal in-memory glTF test asset, not the repository bicycle file.

Live Atlas CRUD/login, index construction, actual MongoDB concurrency, aggregation execution, real model/device compatibility, physical GPS, HTTPS ingress and production load/deployment remain environment-specific checks and have not been claimed as completed. Production templates intentionally require the operator's real domain and secrets. No credentials or real `.env` files are included.
