import React from "react";
import "../styles/upload.css";
import logo from "../assets/candela.png";

export default function GlobalHeader({ onStop, onCharge }) {
  return (
    <div className="upload-header minimal">

      <div className="header-left">
        <button className="icon-btn stop" onClick={onStop}>
          stop
        </button>
        <button className="icon-btn charge" onClick={onCharge}>
          charge
        </button>
      </div>

      <div className="header-right">
        <img src={logo} alt="Candela" className="candela-logo" />
      </div>

    </div>
  );
}
