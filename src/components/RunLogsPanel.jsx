import { useEffect, useState, useRef } from "react";
import "../styles/logs.css";

export default function RunLogsPanel({ runName, onClose }) {
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!runName) return;

    const poll = async () => {
      try {
        const res = await fetch(`http://localhost:8000/robot/logs/${runName}`);
        const data = await res.json();
        setLogs(data.lines || []);
      } catch (e) {
        console.error("Log fetch failed", e);
      }
    };

    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [runName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="logs-backdrop" onClick={onClose}>
      <div className="logs-modal" onClick={(e) => e.stopPropagation()}>
        <div className="logs-header">
          <h3>Run Logs — {runName}</h3>
          <button className="logs-close-btn" onClick={onClose}>✕</button>
        </div>

        <pre className="logs-box">
          {logs.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          <div ref={bottomRef} />
        </pre>
      </div>
    </div>
  );
}
