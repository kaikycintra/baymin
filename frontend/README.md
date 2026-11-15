# Baymax Frontend

The frontend is a React Router application with separate pages for astronauts, mission CMOs, and flight surgeons. Most pages still use mock data and local demo state. The CMO remedy catalog and inventory use the onboard FastAPI backend.

## Run Locally

From the repository root, install dependencies and start the frontend and onboard API:

```bash
make setup
make dev
```

Or, from this directory:

```bash
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173`. Create a production build with `npm run build`; run the TypeScript check with `npm run typecheck`.

## Browser Routes

These are frontend page routes, not backend API endpoints:

| Method | Path | Page |
| --- | --- | --- |
| GET | `/` | Redirects to `/astronaut`. |
| GET | `/astronaut` | Astronaut routine, sleep and mood check-in, reaction check, health history, and local environment warning. |
| GET | `/cmo` | Mission crew roster, alerts, and onboard remedy inventory with stock adjustments. |
| GET | `/surgeon` | Mission and crew selection, routine editing, trend flags, mock private messages, and read-only Artemis III remedy inventory. |

All three pages currently render without login. The routes only separate the page interfaces; they do not restrict access. Add authentication and server-side authorization before treating any route or health data as private.

## Backend Status

The onboard Baymax API is organized by feature. `backend/app/core/` holds shared configuration and SQLite setup; `backend/app/remedies/` holds remedy API models, business logic, and routes. The frontend's routine data, crew, trends, messages, and simulated CO2 event are still local mock state. The remaining API paths below are a proposed integration contract, not implemented endpoints.

### Onboard Remedy Inventory (Implemented Demo)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/remedies` | Return fictional catalog items, stock lots, locations, expiry, and available quantity. |
| POST | `/api/v1/remedies/{remedyId}/stock-adjustments` | Record `used`, `received`, or `discarded` stock with a quantity, lot ID, and reason. |

The database is SQLite at `backend/baymax.sqlite3` by default. Set `BAYMAX_DB_PATH` to use another location. On first startup, `backend/app/remedies/seed.sql` creates the remedy tables and inserts three fictional items and four lots; later restarts preserve stock changes. In Docker, mount a persistent volume at `/data` (for example `-v baymax-data:/data`). The backend image serves only the API; serve the frontend separately with `/api` routed to the backend. The Vite development server already proxies `/api` to FastAPI on port 8000, so run both with `make dev`.

The CMO can record stock changes. The surgeon sees the same inventory without stock controls when Artemis III is selected. The other missions show an unavailable state because the demo backend does not provide mission-scoped inventories.

This is a demonstration without authentication. The catalog's uses and procedure IDs are fictional; it does not prescribe treatment. Add server-side CMO authorization, real approved formulary content, and a review process before using actual medical inventory.

## Proposed API Contract

Use a versioned API namespace such as `/api/v1` so API requests cannot conflict with the browser page paths. The browser routes above should remain stable while React Router loaders/actions are connected to these APIs.

### Identity and Role Context

| Method | Proposed path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/me` | Return the authenticated user's ID, role (`astronaut`, `cmo`, or `surgeon`), and assigned mission/astronaut IDs. Use this to choose the appropriate landing page after login. |

The frontend can use the role to hide unrelated navigation and redirect users to their assigned page. This is a user-experience measure only: the backend must independently authorize every API request and filter mission/health data by the authenticated user's permissions.

### Astronaut Page

| Method | Proposed path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/astronauts/me/dashboard` | Return the astronaut's current mission, routine, latest vitals, environmental context, and active alerts. |
| GET | `/api/v1/astronauts/me/health-history?from={date}&to={date}` | Return physical, sleep, mood, and cognitive measurements for the selected time range. |
| POST | `/api/v1/astronauts/me/check-ins` | Save a sleep/mood check-in or reaction-test result. Validate values and timestamps on the server. |

The astronaut route should load its initial data through a React Router loader and submit check-ins through an action or API client. Device telemetry should generally arrive through a trusted device/gateway integration rather than being treated as user-entered data.

### CMO Page

| Method | Proposed path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/missions/{missionId}/crew-health` | Return the crew roster, permitted health summaries, routine completion, and behavioral trends for the CMO's mission. |
| GET | `/api/v1/missions/{missionId}/alerts` | Return current environmental, biometric, and behavioral alerts for that mission. |
| POST | `/api/v1/alerts/{alertId}/acknowledgements` | Record that the CMO reviewed an alert, including the authenticated user and timestamp. |

The backend must confirm that the requesting CMO is assigned to the requested mission before returning crew health information or accepting an acknowledgement.

### Flight Surgeon Page

| Method | Proposed path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/missions` | Return missions the authenticated surgeon is allowed to review. |
| GET | `/api/v1/missions/{missionId}/crew-health` | Return authorized mission and crew summaries for cross-mission review. |
| PATCH | `/api/v1/astronauts/{astronautId}/routine` | Update a crew member's health routine, sleep schedule, or check-in cadence. Record the surgeon and change history. |
| GET | `/api/v1/conversations?missionId={missionId}` | Return conversations the surgeon is allowed to access for the selected mission. |
| POST | `/api/v1/conversations/{conversationId}/messages` | Send a message in an authorized private conversation. |

### Environmental Events and Live Updates

Environmental sensor data should be ingested and validated by the backend or a trusted telemetry service, then correlated with health events. The frontend's current CO2 toggle is only a local demonstration. If it is later connected to the backend, use a development-only simulation endpoint; do not send simulated readings to production telemetry APIs.

For live alerts, the backend can publish mission-scoped events through Server-Sent Events, for example `GET /api/v1/missions/{missionId}/events/stream`. Event payloads should include an event ID, mission ID, type, timestamp, source, and typed payload. The server must authorize the stream before sending any mission data.

## Integration Guidance

- Keep backend requests in a shared typed API client rather than calling `fetch` from individual display components.
- Use React Router loaders for initial page data and actions for mutations. Keep loading, empty, offline, and API error states visible in each workflow.
- Configure the API base URL per environment. Prefer a same-origin `/api/v1` path in deployment; configure a Vite development proxy or a development API URL locally.
- Use explicit request/response types and validate data at the backend boundary. Do not rely on TypeScript types as runtime validation.
- Treat health records and private messages as sensitive. Enforce role, mission, and astronaut-level permissions on the backend, even when the frontend hides a page or control.
- Return standard HTTP errors (`401` unauthenticated, `403` not authorized, `404` not found, `422` invalid input) and have the frontend handle them without exposing sensitive details.
