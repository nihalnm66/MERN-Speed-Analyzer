# MERN Network Speed Analyzer (NetDiag)

A professional full-stack network diagnostic tool designed to measure real-world internet throughput by interacting with global edge infrastructure. Unlike standard loopback tests, this application forces data to travel across the physical network interface to provide honest performance metrics.

## 🚀 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS.
- **Backend:** Node.js, Express.
- **Database:** MongoDB, Mongoose.
- **Measurement:** Web Streams API, XHR, Cloudflare Edge.

## 🛠 Features
- **Real-Time Latency (Ping):** Measures Round-Trip Time (RTT) to Cloudflare’s `1.1.1.1` edge nodes for authentic internet lag diagnostics.
- **Live Download Tracking:** Utilizes the Web Streams API to process a 25MB payload chunk-by-chunk as it arrives, updating UI gauges in real-time with sub-millisecond precision.
- **Incompressible Upload Test:** Transmits 5MB of cryptographically random data to `httpbin.org` using XMLHttpRequest (XHR) progress events to bypass ISP compression and ensure measurement accuracy.
- **Persistent History:** Automatically saves test results to a local MongoDB database to monitor network consistency over time.

## 📈 Calculation Logic
The application uses the High-Resolution Time API (`performance.now()`) for microsecond precision. Throughput is calculated using the following formula:
`Mbps = (Bytes * 8) / (Milliseconds * 1000)`.

## 🚦 Getting Started

### 1. Prerequisites
- Node.js installed.
- MongoDB service running locally on port `27017`.

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
*The server will run on port `3001` to avoid macOS system conflicts.*

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 🏗 Architecture
The system follows a **Decoupled Client-Server-Edge** architecture:
1. **Client (React):** Orchestrates measurement logic and real-time UI rendering.
2. **Local Server (Node.js):** Acts as a storage API for test history to prevent local bottlenecking during active tests.
3. **Edge Infrastructure (Cloudflare):** Provides high-speed payloads to measure pure external throughput.

---
*Developed as a full-stack engineering tool to capture authentic network performance data.*
