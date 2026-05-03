import { useState, useEffect, useRef } from "react";

const DB_API = "http://localhost:3001/api";
const PING_URL = "https://1.1.1.1/cdn-cgi/trace";
const DOWNLOAD_URL = "https://speed.cloudflare.com/__down?bytes=25000000";
const UPLOAD_URL = "https://httpbin.org/post";
const UPLOAD_BYTES = 5 * 1024 * 1024; 

const toMbps = (bytes, ms) => (ms > 0 ? (bytes * 8) / (ms * 1000) : 0);

export default function App() {
  const [phase, setPhase] = useState("idle");
  const [data, setData] = useState({ ping: 0, dl: 0, ul: 0 });
  const [history, setHistory] = useState([]);
  const [running, setRunning] = useState(false);
  const abortController = useRef(null);

  const loadHistory = async () => {
    try {
      const r = await fetch(`${DB_API}/results`);
      setHistory(await r.json());
    } catch (e) { console.error("History fetch failed"); }
  };

  useEffect(() => { loadHistory(); }, []);

  const runTest = async () => {
    if (running) return;
    setRunning(true);
    setPhase("pinging");
    setData({ ping: 0, dl: 0, ul: 0 });
    abortController.current = new AbortController();

    try {
      // 1. PING (Cloudflare Edge)
      const t0 = performance.now();
      await fetch(PING_URL, { mode: 'no-cors', signal: abortController.current.signal });
      const pingVal = Math.round(performance.now() - t0);
      setData(prev => ({ ...prev, ping: pingVal }));

      // 2. DOWNLOAD (Streaming)
      setPhase("downloading");
      const dlRes = await fetch(`${DOWNLOAD_URL}&_=${Date.now()}`, { signal: abortController.current.signal });
      const reader = dlRes.body.getReader();
      let received = 0;
      const startDl = performance.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        setData(prev => ({ ...prev, dl: toMbps(received, performance.now() - startDl) }));
      }
      // CRITICAL: Store final result in local variable to bypass state delay
      const finalDl = toMbps(received, performance.now() - startDl);

      // 3. UPLOAD (XHR)
      setPhase("uploading");
      const finalUl = await new Promise((resolve, reject) => {
        const CHUNK = 65536; // Browser entropy limit
        const buf = new Uint8Array(UPLOAD_BYTES);
        for (let i = 0; i < UPLOAD_BYTES; i += CHUNK) {
          crypto.getRandomValues(buf.subarray(i, Math.min(i + CHUNK, UPLOAD_BYTES)));
        }
        
        const xhr = new XMLHttpRequest();
        let startUl;
        xhr.upload.onloadstart = () => (startUl = performance.now());
        xhr.upload.onprogress = (e) => {
          if (e.loaded > 0) setData(prev => ({ ...prev, ul: toMbps(e.loaded, performance.now() - startUl) }));
        };
        xhr.onload = () => resolve(toMbps(UPLOAD_BYTES, performance.now() - startUl));
        xhr.onerror = reject;
        xhr.open("POST", `${UPLOAD_URL}?_=${Date.now()}`);
        xhr.send(buf);
      });

      // 4. SAVE (Local DB)
      setPhase("saving");
      await fetch(`${DB_API}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ping: pingVal, download: finalDl, upload: finalUl }),
      });
      
      await loadHistory();
      setPhase("done");
    } catch (e) {
      if (e.name !== "AbortError") setPhase("error");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Network Speed Test</h1>
      <div style={styles.card}>
        <div style={styles.metrics}>
          <Metric label="PING" val={data.ping} unit="ms" color="#fbbf24" />
          <Metric label="DOWNLOAD" val={data.dl.toFixed(1)} unit="Mbps" color="#22d3ee" />
          <Metric label="UPLOAD" val={data.ul.toFixed(1)} unit="Mbps" color="#34d399" />
        </div>
        <button onClick={runTest} disabled={running} style={styles.btn}>
          {running ? "Testing..." : "Start Test"}
        </button>
        <p style={styles.status}>Status: {phase.toUpperCase()}</p>
      </div>

      {history.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr><th>Time</th><th>Ping</th><th>Down</th><th>Up</th></tr>
          </thead>
          <tbody>
            {history.map((r, i) => (
              <tr key={i}>
                <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
                <td style={{color: "#fbbf24"}}>{r.ping}ms</td>
                <td style={{color: "#22d3ee"}}>{r.download.toFixed(1)}</td>
                <td style={{color: "#34d399"}}>{r.upload.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const Metric = ({ label, val, unit, color }) => (
  <div style={{ textAlign: "center" }}>
    <p style={{ fontSize: "10px", color: "#64748b" }}>{label}</p>
    <h2 style={{ color, fontSize: "28px", margin: "5px 0" }}>{val}</h2>
    <p style={{ fontSize: "10px", color: "#475569" }}>{unit}</p>
  </div>
);

const styles = {
  container: { background: "#020617", minHeight: "100vh", color: "white", padding: "40px", fontFamily: "monospace" },
  title: { textAlign: "center", marginBottom: "40px" },
  card: { background: "#0f172a", padding: "30px", borderRadius: "16px", maxWidth: "500px", margin: "0 auto", border: "1px solid #1e293b" },
  metrics: { display: "flex", justifyContent: "space-around", marginBottom: "30px" },
  btn: { width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#3b82f6", color: "white", fontWeight: "bold", cursor: "pointer" },
  status: { textAlign: "center", fontSize: "10px", marginTop: "15px", color: "#475569" },
  table: { width: "100%", maxWidth: "500px", margin: "40px auto", borderCollapse: "collapse", fontSize: "12px" }
};