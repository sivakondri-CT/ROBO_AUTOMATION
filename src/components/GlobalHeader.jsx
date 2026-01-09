import React, { useEffect, useState } from "react";
import "../styles/upload.css";
import logo from "../assets/candela.png";

export default function GlobalHeader({ onStop, onCharge }) {
  const [battery, setBattery] = useState(null);

  useEffect(() => {
    const fetchBattery = async () => {
      try {
        const res = await fetch("http://localhost:8000/robot/battery");
        const data = await res.json();
        setBattery(data.battery);
      } catch (err) {
        console.error("Battery fetch failed", err);
      }
    };

    fetchBattery(); // initial fetch
    const interval = setInterval(fetchBattery, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="upload-header minimal">

      <div className="header-left">
        <button className="icon-btn stop" onClick={onStop}>stop</button>
        <button className="icon-btn charge" onClick={onCharge}>charge</button>

        {battery !== null && (
          <span className="battery-indicator">⚡🔋 {battery}%</span>
        )}
      </div>

      <div className="header-right">
        <img src={logo} alt="Candela" className="candela-logo" />
      </div>

    </div>
  );
}
