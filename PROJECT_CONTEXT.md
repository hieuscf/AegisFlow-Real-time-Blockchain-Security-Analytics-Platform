# AegisFlow — PROJECT_CONTEXT.md

# 1. Project Overview

AegisFlow là một nền tảng Real-time Blockchain Security & Analytics Platform được xây dựng nhằm giám sát, phân tích và phát hiện các hành vi bất thường trên thị trường Web3 theo thời gian thực.

Dự án tập trung vào:

- Theo dõi Swap Events từ các DEX
- Phân tích biến động giá token
- Phát hiện Rug Pull và Flash Crash
- Tự động audit Smart Contract
- Realtime Security Alerts
- Streaming dữ liệu realtime tới dashboard

Mục tiêu của dự án là xây dựng một hệ thống có kiến trúc gần với production thực tế nhưng vẫn đủ lightweight để phù hợp với:

- Solo developer
- MVP development
- Vibe coding workflow
- Local development
- Docker deployment

---

# 2. Project Goals

## Primary Goals

### Realtime Blockchain Monitoring

Theo dõi dữ liệu blockchain theo thời gian thực thông qua WebSocket RPC nodes.

---

### Event Streaming Architecture

Sử dụng Kafka làm event bus để xử lý dữ liệu realtime theo kiến trúc event-driven.

---

### Market Anomaly Detection

Phát hiện:

- Price crash
- Rug pull
- Liquidity drain
- Extreme volatility

---

### Automated Smart Contract Security Analysis

Tự động quét Smart Contract bằng Slither khi phát hiện abnormal activity.

---

### Realtime Frontend Dashboard

Hiển thị:

- Realtime trading chart
- Live security alerts
- WebSocket streaming data

---

### Web3-native Authentication

Sử dụng:

- WalletConnect
- SIWE (Sign-In With Ethereum)

Không sử dụng:

- Email/password authentication

---

# 3. MVP Scope

Phiên bản hiện tại là MVP (Minimum Viable Product).

MVP chỉ bao gồm:

- Blockchain Indexer
- Kafka Streaming
- Analytics Core
- Realtime Alerts
- Smart Contract Auditor
- Frontend Dashboard
- Docker Infrastructure

---

# 4. Architecture Philosophy

Dự án được thiết kế theo hướng:

- Event-driven
- Realtime-first
- Modular architecture
- Lightweight infrastructure
- Low-latency communication
- Future scalability

---

# 5. Why This Architecture

Ban đầu hệ thống được thiết kế theo hướng nhiều microservices độc lập.

Tuy nhiên để:

- Giảm complexity
- Giảm resource usage
- Dễ debug
- Dễ hoàn thành MVP
- Tối ưu workflow với Cursor AI

kiến trúc hiện tại đã được tối giản thành:

- 1 ingestion service
- 1 analytics core service
- 1 frontend app

Điều này giúp:

- Vẫn giữ mindset production
- Nhưng tránh overengineering

---

# 6. High-Level System Flow

```txt
Blockchain RPC Node
        ↓
Indexer Service (Go)
        ↓
Kafka Topic
        ↓
Analytics Core (Node.js)
        ↓
Redis / PostgreSQL
        ↓
Socket.IO
        ↓
Frontend Dashboard
```
