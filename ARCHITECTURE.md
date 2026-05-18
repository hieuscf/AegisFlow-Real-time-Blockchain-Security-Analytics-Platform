# AegisFlow — ARCHITECTURE.md

> MVP Real-time Blockchain Security & Analytics Platform

---

# 1. System Overview

AegisFlow là một nền tảng giám sát và phân tích bảo mật Blockchain theo thời gian thực (Realtime Blockchain Security & Analytics Platform).

Hệ thống tập trung vào:

- Theo dõi Swap Events realtime từ DEX
- Phân tích biến động giá bất thường
- Phát hiện dấu hiệu Rug Pull
- Tự động audit Smart Contract
- Broadcast realtime security alerts
- Hiển thị dữ liệu realtime trên dashboard

---

# 2. MVP Architecture Philosophy

Phiên bản MVP được thiết kế theo hướng:

- Lightweight
- Realtime-first
- Event-driven
- Modular Monolith
- Low-latency
- Docker-ready

Thay vì tách nhiều microservices phức tạp, MVP chỉ bao gồm:

- 1 Blockchain Indexer Service
- 1 Analytics Core Service
- 1 Frontend Dashboard

Kiến trúc này giúp:

- Dễ phát triển
- Dễ debug
- Tiết kiệm RAM/CPU
- Dễ deploy VPS
- Dễ scale sau này

---

# 3. High-Level Architecture

```txt
┌────────────────────────────┐
│ Blockchain RPC Node        │
│ Infura / Alchemy           │
└─────────────┬──────────────┘
              │
              │ WebSocket
              ▼

┌────────────────────────────┐
│ Indexer Service (Go)       │
│                            │
│ - Subscribe Swap Events    │
│ - Decode Logs              │
│ - Publish Kafka Messages   │
└─────────────┬──────────────┘
              │
              ▼

┌────────────────────────────┐
│ Kafka                      │
│                            │
│ Topic: market-swaps        │
└─────────────┬──────────────┘
              │
              ▼

┌────────────────────────────┐
│ Analytics Core             │
│ Node.js + TypeScript       │
│                            │
│ - Kafka Consumer           │
│ - Price Anomaly Engine     │
│ - Alert Engine             │
│ - Slither Integration      │
│ - SIWE Authentication      │
│ - Socket.IO Hub            │
└──────┬─────────┬───────────┘
       │         │
       │         │
       ▼         ▼

   Redis      PostgreSQL

              │
              ▼

┌────────────────────────────┐
│ Frontend Dashboard         │
│ React + Vite               │
│                            │
│ - TradingView Charts       │
│ - Live Alerts Feed         │
│ - Web3 Wallet Login        │
└────────────────────────────┘
```

4. Core Components
   4.1 Blockchain Indexer Service
   Technology
   Golang
   go-ethereum
   kafka-go
   Responsibilities

Indexer Service chịu trách nhiệm:

Kết nối tới Blockchain RPC Node
Subscribe realtime Swap Events
Decode raw blockchain logs
Serialize event data
Publish events vào Kafka
Event Flow
Blockchain Swap Event
↓
Indexer nhận log
↓
Decode log data
↓
Tạo SwapEvent struct
↓
Push vào Kafka
WebSocket Reconnect Strategy

Indexer phải hỗ trợ:

Detect disconnect
Auto reconnect sau 5 giây
Retry liên tục
Không crash service
4.2 Kafka Event Streaming
Purpose

Kafka đóng vai trò Event Bus trung tâm.

Mọi blockchain events sẽ được stream thông qua Kafka trước khi tới Analytics Core.

Kafka Topics
market-swaps

Dùng để stream:

Swap events
Token price updates
Liquidity changes
Benefits

Kafka giúp:

Tách biệt ingestion và analytics
Buffer realtime events
Hỗ trợ scalability sau này
Hỗ trợ replay events
4.3 Analytics Core Service
Technology
Node.js
TypeScript
Fastify hoặc Express
Socket.IO
Redis
PostgreSQL
Responsibilities

Analytics Core là service trung tâm của hệ thống.

Bao gồm:

Kafka Consumer
Price Analytics
Alert Engine
WebSocket Hub
SIWE Authentication
Smart Contract Auditor
4.4 Price Anomaly Engine
Purpose

Phát hiện biến động giá bất thường theo thời gian thực.

Processing Flow
Swap Event
↓
Calculate Token Price
↓
Store Recent Prices
↓
Calculate Moving Average
↓
Compare Current Price
↓
Generate Alert
Detection Logic

Ví dụ:

IF:
Current Price < 50% Average Price

THEN:
Generate CRITICAL_ALERT
Redis Price Cache

Redis dùng để lưu:

10 mức giá gần nhất của mỗi token
Dữ liệu realtime cache
Session websocket
4.5 Alert Engine
Alert Levels
INFO

Biến động nhỏ.

WARNING

Biến động đáng chú ý.

CRITICAL

Biến động nguy hiểm:

Rug Pull
Flash Crash
Liquidity Drain
Broadcast Strategy

Khi có alert mới:

Alert Generated
↓
Save PostgreSQL
↓
Broadcast Socket.IO
↓
Frontend cập nhật realtime
4.6 Smart Contract Audit Engine
Technology
Slither CLI
child_process.exec
Trigger Strategy

Audit chỉ được chạy khi:

Detect abnormal price movement
Detect suspicious token activity

Điều này giúp:

Giảm CPU usage
Tránh scan toàn blockchain
Tối ưu performance
Audit Flow
Critical Alert
↓
Run Slither
↓
Parse JSON Result
↓
Detect Dangerous Functions
↓
Generate Security Alert
Dangerous Patterns

Phát hiện:

selfdestruct
unlimited mint
ownership abuse
honeypot behavior
4.7 PostgreSQL
Purpose

Lưu dữ liệu lâu dài.

Tables
alerts

Lưu lịch sử alerts.

audit_results

Lưu kết quả audit contracts.

4.8 Web3 Authentication (SIWE)
Authentication Method

Sử dụng:

Sign-In With Ethereum (SIWE)

Không dùng:

Email/password
Traditional authentication
Flow
Connect Wallet
↓
Generate Nonce
↓
Sign Message
↓
Verify Signature
↓
Generate JWT
4.9 WebSocket Hub
Technology
Socket.IO
Responsibilities

Realtime streaming:

Alerts
Token prices
Market updates
Socket Rooms
security-feed

Broadcast security alerts.

5. Frontend Dashboard
   Technology
   React
   Vite
   TypeScript
   Tailwind CSS
   Shadcn/UI
   Lightweight Charts
   Wagmi
   RainbowKit
   5.1 Dashboard Layout
   ┌──────────────────────┬────────────────────┐
   │ │ │
   │ Realtime Chart │ Security Feed │
   │ │ │
   │ │ 🔴 Critical Alert │
   │ │ 🟠 Warning │
   │ │ 🟡 Info │
   └──────────────────────┴────────────────────┘
   5.2 Realtime Chart
   Features
   Candlestick chart
   Realtime updates
   Price streaming
   Lightweight rendering
   Update Flow
   WebSocket Price Update
   ↓
   Frontend receives event
   ↓
   chart.update()
   ↓
   Realtime candle rendering
   5.3 Live Security Feed
   Features
   Realtime alerts
   Animated critical alerts
   Auto append newest alerts
   Max 20 alerts cached in UI
6. Mock Pipeline Architecture
   Purpose

Dùng để test toàn bộ hệ thống mà không cần blockchain thật.

6.1 Mock Data Generator
mock-data.js
↓
Kafka Topic
↓
Analytics Core
↓
Socket.IO
↓
Frontend
6.2 Crash Simulation

Mỗi 15 giây:

Inject fake crash event
Token price giảm 90%

Mục tiêu:

Test anomaly detection
Test websocket latency
Test realtime rendering 7. Infrastructure
Docker Compose

Infrastructure local gồm:

Kafka
Zookeeper
Redis
PostgreSQL
