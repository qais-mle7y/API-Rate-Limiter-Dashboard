# API Rate Limiter Dashboard

A full-stack project demonstrating **sliding-window rate limiting** with real-time monitoring.

- **Backend** – Node.js / Express API with in-memory rate limiting
- **Frontend** – React dashboard with Chart.js live charts
- **Streaming** – Server-Sent Events (SSE) push metrics every 2 seconds

---

## Features

| Feature | Detail |
|---------|--------|
| Rate Limiting Algorithm | Sliding window counter (per-user, per-minute) |
| Tier System | **Free** – 10 req/min, **Premium** – 100 req/min |
| Live Dashboard | Stat cards, line chart, doughnut chart, top-users table |
| API Tester Panel | Send single or burst (20) requests from the UI |
| SSE Streaming | Real-time metrics pushed to the browser every 2 s |

---

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev       # starts on http://localhost:3001
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm start         # starts on http://localhost:3000
```

Open **http://localhost:3000** – the dashboard connects to the backend
automatically via SSE.

### 3. Try It Out

1. Use the **API Tester** panel to send requests.
2. Select a free-tier user and click **Burst 20 Requests** to trigger rate limiting.
3. Watch the charts and stats update in real time.

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.js              # Express entry point
│   │   ├── middleware/
│   │   │   └── rateLimiter.js    # Sliding window rate limiter
│   │   ├── routes/
│   │   │   ├── api.js            # Sample endpoints (/api/data, /api/users, /api/echo)
│   │   │   └── metrics.js        # Metrics snapshot + SSE stream
│   │   └── services/
│   │       ├── metricsStore.js   # In-memory metrics aggregation
│   │       └── tierConfig.js     # Free / Premium tier definitions
│   └── tests/                    # Jest + Supertest
├── frontend/
│   ├── src/
│   │   ├── components/           # Dashboard, Charts, Table, Tester
│   │   ├── hooks/useMetricsSSE.js
│   │   └── services/api.js
│   └── netlify.toml
└── README.md
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/data` | Mock server data |
| GET | `/api/users` | Mock user list |
| POST | `/api/echo` | Echo request body |
| GET | `/api/keys` | List preset API keys |
| GET | `/metrics/snapshot` | One-shot metrics JSON |
| GET | `/metrics/stream` | SSE metrics stream |
| GET | `/health` | Health check |

All `/api/*` routes require an `x-api-key` header.  
Keys: `free-user-1`, `free-user-2`, `premium-user-1`, `premium-user-2`.

---

## Rate Limit Headers

Every response from `/api/*` includes:

| Header | Meaning |
|--------|---------|
| `X-RateLimit-Limit` | Max requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in the current window |
| `X-RateLimit-Tier` | The user's tier (`free` / `premium`) |
| `Retry-After` | Seconds to wait (only on 429 responses) |

---

## Deployment

| Component | Target | Notes |
|-----------|--------|-------|
| Frontend | Netlify | `netlify.toml` included; set `REACT_APP_API_URL` env var |
| Backend | Local | Run `npm run dev` on your machine |

For a demo video, start both servers locally and record the dashboard in action.

---

## Running Tests

```bash
cd backend
npm test
```

16 tests covering tier configuration, rate limiter behaviour, API
endpoints, and metrics snapshot accuracy.

---

## License

MIT
