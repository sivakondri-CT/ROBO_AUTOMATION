import React, { useEffect, useState } from "react";
import "../styles/upload.css";
import logo from "../assets/candela.png";

export default function GlobalHeader({ onStop, onCharge, showLogs, onToggleLogs }) {
  const [battery, setBattery] = useState(null);
  const [nav, setNav] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const bRes = await fetch("http://localhost:8000/robot/battery");
        const bData = await bRes.json();
        setBattery(bData.battery);

        const nRes = await fetch("http://localhost:8000/robot/nav_status");
        const nData = await nRes.json();
        setNav(nData);
      } catch (err) {
        console.error("Status fetch failed", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const isReached = nav?.res === 3 && Number(nav?.dist) < 0.5;
  const statusText = isReached ? "Reached" : "Moving";

  return (
    <div className="upload-header minimal">
      <div className="header-left">
        <button className="icon-btn stop" onClick={onStop}>stop</button>
        <button className="icon-btn charge" onClick={onCharge}>charge</button>

        {battery !== null && (
          <span className="battery-indicator">⚡🔋 {battery}%</span>
        )}

        {nav && (
          <span className="robot-status">
            🤖 {statusText} → 🎯 {nav.goal}
          </span>
        )}
        <button className="icon-btn logs" onClick={onToggleLogs}>
  🖥️
</button>

      </div>

      <div className="header-right">
        <img src={logo} alt="Candela" className="candela-logo" />
      </div>
    </div>
  );
}
