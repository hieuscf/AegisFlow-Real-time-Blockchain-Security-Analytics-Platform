# AegisFlow — tasks.md

> MVP Real-time Blockchain Security & Analytics Platform

---

# 0. MVP Goal

Mục tiêu của MVP:

- Theo dõi realtime Swap events từ Uniswap V2
- Stream dữ liệu vào Kafka
- Phân tích biến động giá token realtime
- Phát hiện abnormal price drop
- Trigger smart contract audit bằng Slither
- Broadcast realtime alerts qua WebSocket
- Hiển thị biểu đồ realtime và security alerts trên dashboard
- Hoàn thành full E2E pipeline local bằng Docker

---

# 1. Project Setup & Monorepo Structure

## Root Setup

- [ ] Khởi tạo cấu trúc monorepo:

  2.Infrastructure Setup (Docker)

Kafka & Databases
Cấu hình Kafka container
Cấu hình Zookeeper container
Cấu hình Redis container
Cấu hình PostgreSQL container
Kiểm tra toàn bộ services chạy thành công bằng Docker Compose
Kafka Topics
Tạo topic market-swaps
Tạo topic security-alerts

3. Blockchain Indexer Service (Golang)

Service chịu trách nhiệm ingest blockchain events và publish vào Kafka.

3.1 Project Initialization

Khởi tạo Go module:

go mod init aegisflow/indexer
Cài đặt dependencies:
go-ethereum
kafka-go
godotenv
3.2 Kafka Producer
Tạo module Kafka Producer
Kết nối tới Kafka Broker (localhost:9092)

Viết hàm:

PublishToKafka(topic, key, value)
Thêm retry logic khi Kafka unavailable
3.3 Blockchain WebSocket Client
Đọc RPC WebSocket URL từ .env
Kết nối tới Infura hoặc Alchemy bằng WebSocket
Thêm graceful shutdown
3.4 Auto Reconnect Logic
Detect WebSocket disconnect
Tự động reconnect sau mỗi 5 giây
Log trạng thái reconnect
3.5 Uniswap Event Subscription

Lưu ý:
Factory contract không emit Swap event.
Cần lấy PairCreated trước rồi subscribe Pair contracts.

Pair Discovery
Subscribe PairCreated event từ Uniswap V2 Factory
Lưu danh sách Pair addresses vào memory cache
Swap Subscription
Subscribe Swap event từ các Pair contracts
Lọc event bằng Event Signature Hash
3.6 Swap Event Parser

Tạo struct:

type SwapEvent struct
Decode raw logs thành:
TxHash
PairAddress
Token0
Token1
Sender
Amount0In
Amount1In
Amount0Out
Amount1Out
BlockNumber
Timestamp
3.7 Kafka Integration
Serialize SwapEvent thành JSON

Publish vào Kafka topic:

market-swaps
Thêm structured logging cho từng swap event

# 4. Analytics Core Service (Node.js + TypeScript) — `services/analytics`

Gộp: API Gateway · Anomaly Detection · WebSocket Hub · SIWE · Slither

## 4.1 Project Initialization — [x]

- [x] Node.js + TypeScript project (`services/analytics`)
- [x] Folder structure: `kafka/`, `anomaly/`, `websocket/`, `auth/`, `audit/`, `alerts/`, `database/`, `app/`, `analytics/`

## 4.2 Install Core Dependencies — [x]

- [x] express, kafkajs, ioredis, ethers, socket.io, pg, jsonwebtoken, dotenv, cors

## 4.3 Kafka Consumer — [x]

- [x] Consumer group + subscribe `market-swaps`
- [x] Parse & validate swap events
- [x] Client retry / crash logging

## 4.4 Redis Price Cache — [x]

- [x] Redis connection + reconnect
- [x] LIST cache, max 10 prices per token

## 4.5 Price Calculation Engine — [x]

- [x] Realtime price from swap
- [x] Moving average
- [ ] Per-token on-chain decimals (MVP: fixed 18 decimals)

## 4.6 Price Anomaly Detection — [x]

- [x] Compare price vs moving average
- [x] Trigger when drop > `ANOMALY_DROP_THRESHOLD` (default 50%)
- [x] Payload `type: CRITICAL_ALERT`

## 4.7 Alert Engine — [x]

- [x] INFO / WARNING / CRITICAL
- [x] Timestamps
- [x] Basic deduplication (TTL cache)

## 4.8 Smart Contract Audit (Slither) — [x]

- [x] `runContractAudit(contractAddress)` via `child_process.exec`
- [x] Trigger on anomaly
- [x] JSON parser + risk flags (selfdestruct, mint, ownership)
- [x] Concurrent job limit (`MAX_CONCURRENT_AUDITS`)
- [ ] Live Slither (set `SLITHER_ENABLED=true` when CLI installed)

## 4.9 PostgreSQL Integration — [x]

- [x] Connection + auto schema
- [x] Tables `alerts`, `audit_results`
- [x] Persist alert & audit history

## 4.10 Web3 Authentication (SIWE) — [x]

- [x] `GET /api/auth/nonce`
- [x] `POST /api/auth/verify`
- [x] ethers signature verify + JWT session + nonce in Redis

## 4.11 WebSocket Hub — [x]

- [x] Socket.IO on port `8080`, room `security-feed`
- [x] Broadcast alerts + price updates
- [x] Client reconnect via Socket.IO transport

---

# 5. Frontend Dashboard (Vite + React)

5.1 Frontend Setup
Khởi tạo Vite + React + TypeScript
Cài Tailwind CSS
Cài Shadcn/UI
Cài Zustand
Cài Axios
Cài gsap
5.2 Web3 Integration
Cài Wagmi
Cài RainbowKit hoặc Privy
Cấu hình Ethereum provider
Connect Wallet

Tạo component:

ConnectWalletButton
Kết nối MetaMask
Thực hiện SIWE signing
Lưu JWT vào localStorage
5.3 Dashboard Layout
Tạo responsive dashboard layout
Chia layout:
Left: Realtime chart
Right: Security feed
5.4 Realtime Security Feed
WebSocket Integration
Kết nối Socket.IO backend
Feed Logic
Append alerts realtime

Giới hạn:

tối đa 20 alerts
Alert Styling
INFO → vàng
WARNING → cam
CRITICAL → đỏ animate-pulse
5.5 Realtime Trading Chart
Lightweight Charts

Cài:

@tradingview/lightweight-charts
Chart Component

Tạo:

RealtimeChart.tsx
Hiển thị candlestick series
Live Updates
Nhận realtime price từ WebSocket

Gọi:

chart.update()
Render realtime candles liên tục 6. Mock Data Pipeline

Dùng để test toàn bộ hệ thống mà không cần blockchain thật.

6.1 Mock Data Generator

Tạo:

scripts/mock-data.js
Dùng kafkajs publish fake swaps
6.2 Fake Market Simulation
Gửi fake swaps liên tục
Cứ mỗi 15 giây:
inject crash event
giảm giá token 90%
6.3 E2E Pipeline Validation
Startup Flow
Chạy Docker infrastructure
Chạy Go indexer
Chạy analytics-core
Chạy frontend
Chạy mock-data.js
Acceptance Criteria
Chart realtime update liên tục
Frontend không cần reload
Alert CRITICAL hiển thị realtime
Alert đỏ animate-pulse hoạt động
Kafka flow ổn định
WebSocket realtime hoạt động 7. Dockerization
Indexer
Viết Dockerfile multi-stage cho indexer
Analytics Core
Viết Dockerfile multi-stage cho analytics-core
Frontend
Viết Dockerfile cho frontend 8. Production Readiness (Optional)
Structured logging
Health check endpoint
Graceful shutdown
Basic rate limiting
Environment validation
Error middleware
Retry strategies 9. Final MVP Deliverables
Realtime blockchain ingestion
Kafka event streaming
Realtime anomaly detection
Automated smart contract auditing
SIWE authentication
Realtime WebSocket alerts
Trading dashboard
E2E realtime pipeline
Dockerized services
