import React, { useState } from "react";
import { robotAPI } from "../services/robotAPI";

export default function RobotControls() {
  const [targetName, setTargetName] = useState("");

  const handleMove = async (dir) => {
    const SPEED = 0.3;
    const TURN = 0.5;

    try {
      switch (dir) {
        case "up":
          await robotAPI.manual(SPEED, 0);
          break;
        case "down":
          await robotAPI.manual(-SPEED, 0);
          break;
        case "left":
          await robotAPI.manual(0, TURN);
          break;
        case "right":
          await robotAPI.manual(0, -TURN);
          break;
        case "stop":
          await robotAPI.manual(0, 0);
          setStatus("idle");
          return;
        default:
          return;
      }
    } catch (err) {
      console.error("Robot command failed:", err);
      setStatus("error");
    }
  };

  const handleGoToName = async () => {
    if (!targetName) return alert("Enter coordinate name");

    try {
      await robotAPI.goToName(targetName);
    } catch (err) {
      console.error("Navigation failed:", err);
      setStatus("error");
    }
  };


  return (
  <div className="robot-controls">
    <div className="robot-title">Robot Controls</div>

    <div className="dpad">
      <button onClick={() => handleMove("up")}>↑</button>

      <div className="mid-row">
        <button onClick={() => handleMove("left")}>←</button>
        <button className="center" onClick={() => handleMove("stop")}>○</button>
        <button onClick={() => handleMove("right")}>→</button>
      </div>

      <button onClick={() => handleMove("down")}>↓</button>
    </div>

    <div className="goto-controls">
  <input
    type="text"
    className="goto-input"
    placeholder="1"
    value={targetName}
    onChange={(e) => setTargetName(e.target.value)}
  />
  <button className="go-btn" onClick={handleGoToName}>Go</button>
</div>

  </div>
);

}
