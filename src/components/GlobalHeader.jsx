import React, { useEffect, useState } from "react";
import "../styles/upload.css";
import logo from "../assets/candela.png";

const isFixedGoal = (goal) =>
  typeof goal === "string" && /^\d+$/.test(goal);

const findNearestWaypoint = (rx, ry, waypoints) => {
  let nearest = null;
  let minDist = Infinity;

  waypoints.forEach(wp => {
    const dx = rx - wp.pose.x;
    const dy = ry - wp.pose.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < minDist) {
      minDist = d;
      nearest = wp.name;
    }
  });

  return minDist < 0.05 ? nearest : null;
};


export default function GlobalHeader({ onStop, onCharge, showLogs, onToggleLogs }) {
  const [battery, setBattery] = useState(null);
  const [nav, setNav] = useState(null);
  const [pose, setPose] = useState(null);

  const [displayGoal, setDisplayGoal] = useState(null);
  const [waypoints, setWaypoints] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/robot/waypoints")
      .then(res => res.json())
      .then(data => setWaypoints(data.waypoints || []))
      .catch(() => setWaypoints([]));
  }, []);

  useEffect(() => {
  if (!nav) return;

  if (isFixedGoal(nav.goal)) {
    setDisplayGoal(nav.goal);
    return;
  }

  if (pose && waypoints.length > 0) {
    const nearest = findNearestWaypoint(pose.x, pose.y, waypoints);
    if (nearest) {
      setDisplayGoal(nearest);
      return;
    }
  }

}, [nav, pose, waypoints]);


  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const bRes = await fetch("http://localhost:8000/robot/battery");
        const bData = await bRes.json();
        setBattery(bData.battery);

        const nRes = await fetch("http://localhost:8000/robot/nav_status");
        const nData = await nRes.json();
        setNav(nData);

        const aRes = await fetch("http://localhost:8000/robot/pose");
        const aData = await aRes.json();
        setPose(aData);

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
  const thetaDeg = pose ? (pose.theta * 180 / Math.PI).toFixed(1) : null;


  return (
    <div className="upload-header minimal">
      <div className="header-left">
        <button className="icon-btn stop" onClick={onStop}>stop</button>
        <button className="icon-btn charge" onClick={onCharge}>charge</button>

        {battery !== null && (
          <span className="battery-indicator">⚡🔋 {battery}%</span>
        )}

         {pose && (
          <span className="robot-angle">
            Angle :  {thetaDeg}°
          </span>
        )}

        {nav && (
          <span className="robot-status">
            🤖 {statusText} → 🎯 {displayGoal ?? "—"}
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
