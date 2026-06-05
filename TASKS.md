# AegisFlow — TASKS.md

> MVP Real-time Blockchain Security & Analytics Platform  
> **Cập nhật:** đồng bộ với codebase hiện tại (`web/`, `services/indexer`, `services/analytics`, `infra/Docker/`)

---

## Tiến độ tổng quan

| #   | Hạng mục                 | Trạng thái                              |
| --- | ------------------------ | --------------------------------------- |
| 0   | MVP Goal                 | Định nghĩa — xem bên dưới               |
| 1   | Project setup            | Gần xong                                |
| 2   | Docker infrastructure    | Xong                                    |
| 3   | Go indexer               | Xong                                    |
| 4   | Analytics (Node.js)      | Gần xong (2 item nhỏ còn lại)           |
| 5   | Frontend (Vite + React)  | Gần xong (gsap / candlestick khác spec) |
| 6   | Mock data pipeline       | Chưa làm                                |
| 7   | Dockerization (services) | Chưa làm                                |
| 8   | Production readiness     | Một phần                                |
| 9   | Final MVP deliverables   | Một phần                                |

**Ước lượng MVP:** ~75% — pipeline backend + dashboard realtime đã có; thiếu mock E2E, Dockerfile services, validation E2E có checklist.

---

# 0. MVP Goal

Mục tiêu của MVP:

- [x] Theo dõi realtime Swap events từ Uniswap V2 (`services/indexer`)
- [x] Stream dữ liệu vào Kafka (`market-swaps`)
- [x] Phân tích biến động giá token realtime (`services/analytics`)
- [x] Phát hiện abnormal price drop (anomaly detector)
- [x] Trigger smart contract audit bằng Slither (wrapper + mock khi `SLITHER_ENABLED=false`)
- [x] Broadcast realtime alerts qua WebSocket (Socket.IO)
- [x] Hiển thị biểu đồ realtime và security alerts trên dashboard (`web/`)
- [ ] Hoàn thành full E2E pipeline local bằng Docker (infra có Compose; app services chưa Dockerfile)

---

# 1. Project Setup & Monorepo Structure

## 1.1 Root / repo layout

- [x] Thư mục `services/indexer` (Go)
- [x] Thư mục `services/analytics` (Node.js + TypeScript)
- [x] Thư mục `web/` (Vite + React)
- [x] Thư mục `infra/Docker/` (Docker Compose)
- [x] Tài liệu: `README.md`, `ARCHITECTURE.md`, `PROJECT_CONTEXT.md`
- [ ] Monorepo tooling (pnpm workspace / Turbo) — README mô tả layout lớn hơn, chưa có `package.json` root
- [ ] Cấu trúc `apps/`, `packages/` như trong README (aspirational)

## 1.2 Env & secrets

- [x] `.env.example` cho indexer, analytics, web, `infra/Docker/`
- [x] Không hardcode secrets trong source (dùng env)

---

# 2. Infrastructure Setup (Docker) — `infra/Docker/`

## 2.1 Kafka & databases

- [x] Kafka container (`confluentinc/cp-kafka`)
- [x] Zookeeper container
- [x] Redis 7 container
- [x] PostgreSQL 15 container
- [x] Healthchecks + bridge network `aegis_network`
- [ ] Xác nhận manual: `docker compose up -d` + `docker compose ps` (tất cả healthy)

## 2.2 Kafka topics

- [x] Job `kafka-init` tạo topic `market-swaps`
- [x] Job `kafka-init` tạo topic `security-alerts`

## 2.3 Dev tooling (bonus)

- [x] Kafka UI (port host mặc định **8089** — tách khỏi Analytics `8080`; override `KAFKA_UI_PORT` trong `infra/Docker/.env`)
- [x] pgAdmin (port 5050)

---

# 3. Blockchain Indexer Service (Golang) — `services/indexer`

Service ingest blockchain events và publish vào Kafka.

## 3.1 Project initialization

- [x] Go module `aegisflow/indexer` (`go.mod`)
- [x] `github.com/ethereum/go-ethereum`
- [x] `github.com/segmentio/kafka-go` (thay cho tên gói `kafka-go` generic trong spec cũ)
- [x] `github.com/joho/godotenv`
- [x] Entry: `cmd/main.go`, config: `configs/`

## 3.2 Kafka producer

- [x] Module `internal/kafka/producer.go`
- [x] Kết nối broker từ env (`KAFKA_BROKERS`, mặc định `localhost:9092`)
- [x] `PublishToKafka(ctx, key, value)` (+ retry, timeout)
- [x] Retry khi Kafka unavailable (3 lần, backoff)

## 3.3 Blockchain WebSocket client

- [x] Đọc RPC WebSocket URL từ `.env`
- [x] Kết nối Infura / Alchemy qua `ethclient.DialContext`
- [x] Graceful shutdown (`SIGINT` / `SIGTERM` trong `main`)

## 3.4 Auto reconnect

- [x] Detect disconnect / client nil
- [x] Reconnect interval 5 giây (`defaultReconnectInterval`)
- [x] Log trạng thái reconnect

## 3.5 Uniswap event subscription

> Factory không emit Swap — subscribe `PairCreated` trước, rồi subscribe từng Pair.

- [x] Subscribe `PairCreated` từ Uniswap V2 Factory
- [x] Cache pair addresses + token0/token1 trong memory (`SwapListener.pairs`)
- [x] Subscribe `Swap` trên từng pair (dynamic)
- [x] Lọc log bằng topic + event signature (`internal/parser`, `subscriptions`)

## 3.6 Swap event parser

- [x] Struct `models.SwapEvent` với các field: `TxHash`, `PairAddress`, `Token0`, `Token1`, `Sender`, `Amount0In`, `Amount1In`, `Amount0Out`, `Amount1Out`, `BlockNumber`, `Timestamp`
- [x] Decode raw logs (`internal/parser/parser.go`)

## 3.7 Kafka integration

- [x] Serialize `SwapEvent` → JSON
- [x] Publish topic `market-swaps`
- [x] Structured logging cho swap events (`log` trong `main` / pipeline)

---

# 4. Analytics Core Service (Node.js + TypeScript) — `services/analytics`

Gộp: API Gateway · Anomaly Detection · WebSocket Hub · SIWE · Slither

## 4.1 Project initialization

- [x] Node.js + TypeScript project
- [x] Folder structure: `kafka/`, `anomaly/`, `websocket/`, `auth/`, `audit/`, `alerts/`, `database/`, `app/`, `analytics/`

## 4.2 Install core dependencies

- [x] express, kafkajs, ioredis, ethers, socket.io, pg, jsonwebtoken, dotenv, cors

## 4.3 Kafka consumer

- [x] Consumer group + subscribe `market-swaps`
- [x] Parse & validate swap events (`validateSwapEvent`)
- [x] Client retry / crash logging

## 4.4 Redis price cache

- [x] Redis connection + reconnect
- [x] LIST cache, max 10 prices per token

## 4.5 Price calculation engine

- [x] Realtime price from swap (`priceEngine.ts`)
- [x] Moving average
- [ ] Per-token on-chain decimals (MVP: fixed 18 decimals trong `formatUnits`)

## 4.6 Price anomaly detection

- [x] Compare price vs moving average
- [x] Trigger when drop > `ANOMALY_DROP_THRESHOLD` (default 50%)
- [x] Payload `type: CRITICAL_ALERT`

## 4.7 Alert engine

- [x] INFO / WARNING / CRITICAL
- [x] Timestamps
- [x] Basic deduplication (TTL cache)

## 4.8 Smart contract audit (Slither)

- [x] `runContractAudit(contractAddress)` via `child_process.exec`
- [x] Trigger on anomaly (`pipeline.ts`)
- [x] JSON parser + risk flags (`audit/parser.ts`)
- [x] Concurrent job limit (`MAX_CONCURRENT_AUDITS`)
- [ ] Live Slither — set `SLITHER_ENABLED=true` khi đã cài CLI Slither

## 4.9 PostgreSQL integration

- [x] Connection + auto schema (`initSchema`)
- [x] Tables `alerts`, `audit_results`
- [x] Persist alert & audit history

## 4.10 Web3 authentication (SIWE)

- [x] `GET /api/auth/nonce`
- [x] `POST /api/auth/verify`
- [x] ethers signature verify + JWT session + nonce in Redis

## 4.11 WebSocket hub

- [x] Socket.IO trên cùng HTTP server (mặc định port `8080`), room `security-feed`
- [x] Broadcast alerts + price updates
- [x] Client reconnect via Socket.IO transport (`web/src/services/websocket.ts`)

---

# 5. Frontend Dashboard (Vite + React) — `web/`

## 5.1 Frontend setup

- [x] Vite + React + TypeScript
- [x] Tailwind CSS v4 (`@tailwindcss/vite`)
- [~] Shadcn/UI — có `components.json`; UI chủ yếu custom Tailwind, chưa add nhiều component Shadcn
- [x] Zustand (`authStore`, `websocketStore`, `uiStore`, …)
- [x] Axios (`services/api.ts`)
- [ ] gsap — **chưa cài**; animation dùng **framer-motion**
- [x] React Router (`App.tsx`, landing + dashboard routes)
- [x] Landing page (`features/landing/`) — ngoài scope MVP gốc, đã có

## 5.2 Web3 integration

- [x] Wagmi + viem
- [x] RainbowKit (`Web3Provider`, `ConnectButton` trong `Header`)
- [x] Ethereum provider config (`config/wagmi.ts`)
- [x] Connect wallet (MetaMask / WalletConnect khi có `VITE_WALLETCONNECT_PROJECT_ID`)
- [x] SIWE signing (`useSiweAuth`, `siweAuth.ts`)
- [x] JWT lưu `localStorage` (`lib/auth.ts` + Zustand persist)
- [x] `AuthSessionGuard` bảo vệ route dashboard

## 5.3 Dashboard layout

- [x] Responsive layout (`DashboardLayout`, `Sidebar`, `Header`)
- [x] Trái: realtime chart · Phải: security feed (`DashboardPage.tsx`)
- [x] KPI row + analytics grid (`KpiCards`, `AnalyticsGrid`, `WelcomeBar`)

## 5.4 Realtime security feed

- [x] Socket.IO client (`hooks/useWebSocketConnection.ts`, `services/websocket.ts`)
- [x] Append alerts realtime (`websocketStore`)
- [x] Giới hạn tối đa **20** alerts (`MAX_ALERTS`)
- [x] Styling theo level — INFO (cyan), WARNING (cam), CRITICAL (đỏ + pulse)

## 5.5 Realtime trading chart

- [x] Package `lightweight-charts` (v5)
- [x] Component `RealtimeChart.tsx`
- [~] **Area + line series** (không phải candlestick như spec ban đầu)
- [x] Live updates từ WebSocket price payload
- [x] `series.update()` khi có giá mới

---

# 6. Mock Data Pipeline

Dùng để test toàn bộ hệ thống mà không cần blockchain thật.

## 6.1 Mock data generator

- [x] `services/analytics/scripts/mock-data.ts` + `npm run mock-data`
- [x] Publish fake swaps bằng kafkajs (`src/mock/kafkaProducer.ts`)

## 6.2 Fake market simulation

- [x] Gửi fake swaps liên tục (`src/mock/simulator.ts`, random walk ±1–3%)
- [x] Mỗi 15s: inject crash event (giữ 5–20% giá → drop 80–95%, kích hoạt anomaly detector)

## 6.3 E2E pipeline validation

### Startup flow (manual)

- [x] `docker compose up` trong `infra/Docker/`
- [x] Chạy Go indexer (optional khi dùng mock)
- [x] Chạy `services/analytics` (`npm run dev`)
- [x] Chạy `web` (`npm run dev`)
- [x] Chạy `npm run mock-data` trong `services/analytics`

### Acceptance criteria

- [x] Chart realtime update liên tục
- [x] Frontend không cần reload
- [x] Alert CRITICAL hiển thị realtime
- [x] Alert đỏ animate-pulse hoạt động
- [x] Kafka flow ổn định
- [x] WebSocket realtime hoạt động

---

# 7. Dockerization (application services)

- [ ] Dockerfile multi-stage — `services/indexer`
- [ ] Dockerfile multi-stage — `services/analytics`
- [ ] Dockerfile — `web/`
- [ ] `docker-compose` gộp infra + app services (optional)

---

# 8. Production Readiness (optional)

- [x] Structured logging (Pino) — `src/logging/logger.ts`, `LOG_LEVEL` env, JSON prod / pretty dev
- [x] Health check — `GET /health` (`services/analytics/src/app/routes.ts`)
- [x] Graceful shutdown — Kafka consumer, Redis, Postgres, HTTP (`index.ts`, `consumer.ts`)
- [ ] Basic rate limiting
- [x] Environment validation — `REQUIRED_KEYS` trong `config/env.ts` (một phần)
- [ ] Error middleware tập trung (Express)
- [x] Retry strategies — Kafka publish (indexer), consumer reconnect (analytics)

---

# 9. Final MVP Deliverables

| Deliverable                       | Trạng thái                                       |
| --------------------------------- | ------------------------------------------------ |
| Realtime blockchain ingestion     | [x]                                              |
| Kafka event streaming             | [x]                                              |
| Realtime anomaly detection        | [x]                                              |
| Automated smart contract auditing | [~] Mock + Slither wrapper; live Slither tùy env |
| SIWE authentication               | [x]                                              |
| Realtime WebSocket alerts         | [x]                                              |
| Trading dashboard                 | [x]                                              |
| E2E realtime pipeline             | [~] Mock script có; checklist manual chưa pass   |
| Dockerized services               | [~] Chỉ infra; chưa Dockerfile app               |

---

## Ghi chú triển khai local

```txt
# Thứ tự gợi ý (khi test thủ công)
1. infra/Docker/     → docker compose up -d
2. services/analytics → npm run dev
3. services/indexer   → go run ./cmd   (cần ETH_WS_URL)
4. web/               → npm run dev
```

**Port mặc định:** Analytics API + Socket.IO `8080` · Kafka UI `8089` · Web Vite `5173` · Kafka `9092` · Redis `6379` · Postgres `5432`

---

## Chú thích checkbox

- `[x]` — đã có trong codebase
- `[ ]` — chưa làm / chưa xác nhận
- `[~]` — làm một phần hoặc khác spec gốc
