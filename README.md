# AegisFlow

Real-time **Blockchain Security & Analytics** platform — event-driven microservices with Kafka, PostgreSQL, and Redis.

## Monorepo layout

```txt
aegisflow/
├── apps/
│   ├── web/                 # Next.js dashboard (port 3000)
│   ├── admin/               # Next.js admin (port 3001)
│   └── gateway/             # API Gateway — NestJS (port 4000)
├── services/
│   ├── indexer/             # Go — blockchain indexing
│   ├── whale-tracker/       # Go — whale wallet tracking
│   ├── mev-engine/          # Go — MEV detection
│   ├── anomaly-engine/      # NestJS — price/market anomalies
│   ├── security-engine/     # Python FastAPI — contract analysis
│   └── notification-service/# Node — alerts (Telegram, WS, …)
├── packages/
│   ├── tsconfig/            # Shared TypeScript configs
│   ├── config/              # Env validation (Zod)
│   ├── logger/              # Structured logging (Pino)
│   ├── kafka/               # KafkaJS client helpers
│   └── protobuf/            # Protobuf schemas (placeholder)
└── infra/
    ├── docker/              # Docker Compose + base Dockerfiles
    ├── k8s/                 # Kubernetes manifests
    ├── terraform/           # IaC placeholder
    └── monitoring/          # Prometheus config
```

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| pnpm | ≥ 9 |
| Docker | latest |
| Go | ≥ 1.22 (for Go services) |
| Python | ≥ 3.11 (for security-engine) |

## Quick start

### 1. Infrastructure

```powershell
pnpm infra:up
```

| Service | URL |
|---------|-----|
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |
| Kafka | `localhost:9092` |
| Kafka UI | http://localhost:8080 |

### 2. Environment

```powershell
copy .env.example .env
copy infra\docker\.env.example infra\docker\.env
```

### 3. Install & build (Node/TS workspace)

```powershell
corepack enable
pnpm install
pnpm build
```

### 4. Development

```powershell
pnpm dev          # Turbo — all packages with dev script
```

Individual apps:

```powershell
pnpm --filter @aegisflow/web dev
pnpm --filter @aegisflow/gateway dev
```

### Go services

```powershell
go run ./services/indexer/cmd/indexer
go run ./services/whale-tracker/cmd/whale-tracker
go run ./services/mev-engine/cmd/mev-engine
```

### Python security engine

```powershell
cd services/security-engine
python -m venv .venv
.\.venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload --port 5000
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev servers (Turbo) |
| `pnpm build` | Build all TS packages & apps |
| `pnpm lint` | Lint workspace |
| `pnpm infra:up` | Start Docker Compose stack |
| `pnpm infra:down` | Stop stack |

## Kafka topics (planned)

- `market-swaps`
- `liquidity-events`
- `whale-transfers`
- `security-alerts`
- `mev-events`

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)
- [TASKS.md](./TASKS.md)

## License

Private — all rights reserved.
