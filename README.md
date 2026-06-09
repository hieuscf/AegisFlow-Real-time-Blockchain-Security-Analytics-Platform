# AegisFlow

Real-time **Blockchain Security & Analytics** platform — ingest Uniswap V2 swaps, stream events through Kafka, detect price anomalies, trigger Slither contract audits, and push security alerts to a live dashboard via WebSocket.

Built as an MVP with production-style patterns (event-driven microservices, structured logging, health checks, Docker) while staying lightweight for local development.

## Features

| Area | Capability |
|------|------------|
| **Ingestion** | Go indexer — Uniswap V2 swap events over WebSocket RPC → Kafka |
| **Streaming** | Kafka topics `market-swaps`, `security-alerts` |
| **Analytics** | Moving-average price engine, anomaly detection (configurable drop threshold) |
| **Security** | Slither wrapper (mock when `SLITHER_ENABLED=false`) triggered on anomalies |
| **Alerts** | INFO / WARNING / CRITICAL with deduplication; REST + Socket.IO |
| **Auth** | SIWE (Sign-In with Ethereum) + JWT sessions |
| **Frontend** | Vite + React dashboard — realtime charts, analytics KPIs, alert feed |
| **Testing** | Mock data pipeline (`npm run mock-data`) — no blockchain required |
| **Ops** | Pino logging, rate limiting, `/health` + `/health/ready`, graceful shutdown |

## Architecture

```txt
Ethereum (WS RPC)
       │
       ▼
┌──────────────┐     market-swaps      ┌─────────────────┐
│ Go Indexer   │ ───────────────────►  │  Apache Kafka   │
│ (optional)   │                       └────────┬────────┘
└──────────────┘                                │
       ▲                                        ▼
       │ mock-data.ts                   ┌─────────────────┐
       └────────────────────────────────│ Analytics Core  │
                                        │ Node.js + TS    │
                                        └────────┬────────┘
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
              PostgreSQL               Redis              Socket.IO
              (alerts, audits)        (cache)            + REST API
                                                         │
                                                         ▼
                                                   ┌──────────┐
                                                   │ web/     │
                                                   │ React UI │
                                                   └──────────┘
```

## Repository layout

```txt
AegisFlow/
├── services/
│   ├── indexer/          # Go — Uniswap V2 swap listener → Kafka
│   └── analytics/        # Node.js — consumer, anomaly, alerts, SIWE, WebSocket
├── web/                  # Vite + React — landing, dashboard, analytics, alerts
├── infra/
│   └── Docker/           # Docker Compose (Kafka, Redis, Postgres) + app overlay
├── ARCHITECTURE.md
├── PROJECT_CONTEXT.md
└── TASKS.md              # MVP checklist & progress
```

## Prerequisites

| Tool | Version | Used by |
|------|---------|---------|
| **Node.js** | ≥ 20 | `web/`, `services/analytics/` |
| **Docker** | latest | Infrastructure + optional full stack |
| **Go** | ≥ 1.22 | `services/indexer/` (optional — use mock data instead) |

## Quick start

### Option A — Docker full stack (recommended)

From `infra/Docker/`:

```powershell
copy .env.example .env
# Edit .env: POSTGRES_PASSWORD, JWT_SECRET (min 32 chars), DATABASE_URL_DOCKER

docker compose -f docker-compose.yml -f docker-compose.apps.yml up -d --build
```

| Service | URL |
|---------|-----|
| Web (nginx) | http://localhost:5173 |
| Analytics API + Socket.IO | http://localhost:8080 |
| Kafka UI | http://localhost:8089 |
| pgAdmin | http://localhost:5050 |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |
| Kafka | `localhost:9092` |

Optional Go indexer (requires `RPC_WS_URL` in `.env`):

```powershell
docker compose -f docker-compose.yml -f docker-compose.apps.yml --profile indexer up -d --build
```

Stop:

```powershell
docker compose -f docker-compose.yml -f docker-compose.apps.yml down
```

### Option B — Local development

**1. Infrastructure**

```powershell
cd infra\Docker
copy .env.example .env
docker compose up -d
```

**2. Analytics**

```powershell
cd services\analytics
copy .env.example .env
# Set JWT_SECRET (min 32 chars), DATABASE_URL, REDIS_URL, KAFKA_BROKERS
npm install
npm run dev
```

**3. Web**

```powershell
cd web
copy .env.example .env
# Set VITE_API_BASE_URL, VITE_WALLETCONNECT_PROJECT_ID
npm install
npm run dev
```

**4. Mock data** (skip indexer — simulates swaps + periodic crashes)

```powershell
cd services\analytics
npm run mock-data
```

**5. Indexer** (optional — live Ethereum data)

```powershell
cd services\indexer
copy .env.example .env
# Set RPC_WS_URL (Alchemy/Infura), KAFKA_BROKERS
go run ./cmd
```

Open http://localhost:5173 → `/dashboard`, `/analytics`, `/alerts`.

## Environment

| Location | Purpose |
|----------|---------|
| `infra/Docker/.env` | Postgres, Redis, Kafka, JWT, Docker-internal URLs, `VITE_*` build args |
| `services/analytics/.env` | Analytics runtime (Kafka, Redis, Postgres, SIWE, Slither, rate limits) |
| `services/indexer/.env` | `RPC_WS_URL`, `KAFKA_BROKERS`, Uniswap factory address |
| `web/.env` | `VITE_API_BASE_URL`, `VITE_WS_URL`, `VITE_WALLETCONNECT_PROJECT_ID` |

Never commit `.env` files. Use `.env.example` as templates.

## API (Analytics — port 8080)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness |
| `GET` | `/health/ready` | Readiness (Redis check) |
| `GET` | `/api/auth/nonce` | SIWE nonce (`?address=0x…`) |
| `POST` | `/api/auth/verify` | Verify SIWE signature → JWT |
| `GET` | `/api/notifications` | List alerts (query: `limit`, `severity`) |
| `GET` | `/api/notifications/stats` | Alert counts by severity |
| `GET` | `/api/notifications/:id` | Single notification |
| `GET` | `/api/alerts` | Legacy alias for notifications |

**WebSocket:** Socket.IO on the same host as the API. Client joins room `security-feed` for realtime `CRITICAL_ALERT` and price updates.

## Kafka topics

| Topic | Producer | Consumer |
|-------|----------|----------|
| `market-swaps` | Indexer, mock-data | Analytics |
| `security-alerts` | Analytics | (extensible) |

Topics are created automatically by the `kafka-init` service on stack startup.

## Scripts

### `services/analytics`

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run production build |
| `npm run mock-data` | Publish fake swaps + crash events to Kafka |

### `web`

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

### `services/indexer`

```powershell
go run ./cmd          # Run indexer
go build -o indexer ./cmd   # Build binary
```

### Docker (individual images)

```powershell
docker build -t aegisflow-analytics:local .\services\analytics
docker build -t aegisflow-web:local --build-arg VITE_API_BASE_URL=http://localhost:8080 .\web
docker build -t aegisflow-indexer:local .\services\indexer
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design & data flow
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — goals & scope (Vietnamese)
- [TASKS.md](./TASKS.md) — MVP checklist & implementation status

## License

Private — all rights reserved.
