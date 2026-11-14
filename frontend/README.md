# Baymax Frontend

The frontend is a React Router application with separate pages for astronauts, mission CMOs, and flight surgeons. The pages currently use mock data and local demo state; they do not call the FastAPI backend yet.

## Run Locally

From the repository root, install dependencies and start the frontend:

```bash
make setup
make dev-frontend
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
| GET | `/cmo` | Mission crew roster, sleep/cognitive trend flags, and alerts. |
| GET | `/surgeon` | Mission and crew selection, routine editing, long-term trend flags, and mock private messages. |

All three pages currently render without login. The routes only separate the page interfaces; they do not restrict access. Add authentication and server-side authorization before treating any route or health data as private.

## Backend Status

The current `backend/main.py` creates a FastAPI application but does not define application API routes. The frontend's routine data, crew, trends, messages, and simulated CO2 event are currently local mock state. The API paths below are a proposed integration contract, not implemented endpoints.

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
