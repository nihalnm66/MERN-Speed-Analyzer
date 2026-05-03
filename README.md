# MERN Network Speed Analyzer (NetDiag)

A professional-grade, full-stack network diagnostic tool designed to measure real-world internet throughput. Unlike standard "browser-only" or loopback tests, NetDiag forces data across the physical network interface to global edge infrastructure, bypassing ISP compression to provide honest, high-fidelity performance metrics.

---

## 🚀 Technical Highlights
*   **Real-Time Latency (Ping):** Measures Round-Trip Time (RTT) to Cloudflare’s `1.1.1.1` edge nodes for authentic internet lag diagnostics.
*   **Web Streams Download:** Leverages the **Web Streams API** to process a 25MB payload chunk-by-chunk, updating UI gauges in real-time with microsecond precision.
*   **Incompressible Upload:** Transmits 5MB of cryptographically random data to `httpbin.org` via **XHR Progress Events** to ensure ISPs cannot artificially inflate speeds using compression.
*   **Persistent History:** Full CRUD integration that automatically saves and retrieves test results from a MongoDB database to monitor network consistency.
*   **High-Res Metrics:** Uses the `performance.now()` API for sub-millisecond calculation accuracy.

---

## 🛠 Tech Stack
*   **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB, Mongoose.
*   **Network:** Web Streams API, Performance API, XHR, Cloudflare Edge.

---

## 📈 Calculation Logic
Throughput is calculated using high-resolution timestamps to ensure accuracy across volatile connections:

$$Mbps = \frac{Total\ Bytes \times 8}{Total\ Milliseconds \times 1000}$$

---

## 💻 Installation & Setup

### 1. Prerequisites
*   **Node.js:** [Download v18+](https://nodejs.org/)
*   **MongoDB Compass (Optional):** [Download GUI](https://www.mongodb.com/products/tools/compass) to visually manage your data.

### 2. Database Installation

#### **For macOS (Homebrew)**
```bash
brew tap mongodb/brew
brew install mongodb-community@8.0
brew services start mongodb-community@8.0
```

#### **For Windows**
1.  Download the **MongoDB Community Server MSI** [here](https://www.mongodb.com/try/download/community).
2.  Run the installer and ensure **"Install MongoDB as a Service"** is checked.
3.  The database will run automatically on `localhost:27017`.

### 3. Backend Setup (Server)
```bash
cd server
npm install

# Create Environment File
# Mac:
printf "MONGO_URI=mongodb://localhost:27017/speedtest\nPORT=3001" > .env
# Windows:
echo MONGO_URI=mongodb://localhost:27017/speedtest > .env

npm run dev
```
> **Note:** Server runs on **Port 3001** to avoid macOS AirPlay/system conflicts.

### 4. Frontend Setup (Client)
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗 System Architecture
The system follows a **Decoupled Client-Server-Edge** flow:
1.  **Orchestration:** React manages the measurement logic and real-time UI rendering.
2.  **External Fetch:** Data is pulled from/pushed to Cloudflare and httpbin to test the **actual** internet pipe.
3.  **Local Storage:** Results are piped to the Node.js API which validates and commits them to MongoDB.
4.  **Verification:** The history component fetches previous records on load to track performance trends.

---

## ⚠️ Troubleshooting
*   **"Status: Error":** Ensure your Node.js server is running and the terminal displays `✅ MongoDB connected`.
*   **Download 0 Mbps:** Check if an ad-blocker or firewall is stopping the 25MB test payload.
*   **CORS Issues:** The backend is preset to allow requests from `localhost:5173`. Ensure your frontend hasn't switched to a different port.

---
*Developed as a high-fidelity diagnostic tool for network engineering and performance tracking.*
