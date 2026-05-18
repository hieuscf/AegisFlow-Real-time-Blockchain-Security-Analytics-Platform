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
Thêm structured logging cho từng swap event 4. Analytics Core Service (Node.js + TypeScript)

Gộp:

API Gateway
Anomaly Detection
WebSocket Hub
SIWE Authentication
Slither Integration
4.1 Project Initialization
Khởi tạo Node.js + TypeScript project

Thiết lập folder structure:

analytics-core/
├── src/
│ ├── kafka/
│ ├── anomaly/
│ ├── websocket/
│ ├── auth/
│ ├── audit/
│ ├── alerts/
│ └── database/
4.2 Install Core Dependencies
Cài:
Fastify hoặc Express
kafkajs
ioredis
ethers
socket.io
pg hoặc Prisma
jsonwebtoken
dotenv
4.3 Kafka Consumer
Tạo Kafka Consumer Group

Subscribe topic:

market-swaps
Parse incoming swap events
Thêm reconnect logic
4.4 Redis Price Cache
Kết nối Redis
Tạo helper lưu historical prices

Giới hạn tối đa:

10 giá gần nhất mỗi token
Sử dụng Redis LIST
4.5 Price Calculation Engine
Tính realtime token price từ swap event
Tính moving average
Chuẩn hóa decimals token
4.6 Price Anomaly Detection
Detection Logic
So sánh giá hiện tại với moving average

Trigger alert nếu:

price_drop > 50%

Tạo payload:

{
"type": "CRITICAL_ALERT"
}
4.7 Alert Engine
Tạo module Alert Engine
Generate:
INFO
WARNING
CRITICAL
Thêm timestamp cho alerts
Thêm alert deduplication cơ bản
4.8 Smart Contract Audit Integration
Slither CLI

Tạo hàm:

runContractAudit(contractAddress)

Dùng:

child_process.exec
Trigger audit khi detect anomaly
Slither Result Parser
Parse output JSON
Detect:
selfdestruct
unlimited mint
ownership risks
Audit Protection
Giới hạn tối đa concurrent audit jobs
Tránh spam Slither processes
4.9 PostgreSQL Integration
Kết nối PostgreSQL
Tạo bảng:
alerts
audit_results
Lưu toàn bộ lịch sử alerts
Lưu toàn bộ kết quả audit
4.10 Web3 Authentication (SIWE)
API

Tạo endpoint:

POST /api/auth/verify
Verification
Verify wallet signature bằng ethers
Generate JWT session
Validate nonce
4.11 WebSocket Hub
Socket.IO Server
Khởi tạo Socket.IO server port 8080
Rooms

Tạo room:

security-feed
Broadcasting
Broadcast realtime alerts
Broadcast realtime price updates
Thêm reconnect support 5. Frontend Dashboard (Vite + React)
5.1 Frontend Setup
Khởi tạo Vite + React + TypeScript
Cài Tailwind CSS
Cài Shadcn/UI
Cài Zustand
Cài Axios
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
