import React, { useRef, useState } from "react";

export default function UploadScreen({ onUpload, samplePath, status, setStatus }) {
  const ref = useRef(null);
  const [ip, setIp] = useState("");

  const connected = status === "connected";

  const connect = async () => {
    try {
      const res = await fetch("http://localhost:8000/robot/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip })
      });

      if (!res.ok) throw new Error();
      setStatus("connected");
    } catch {
      setStatus("failed");
    }
  };

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) onUpload(f);
  };

  return (
    <div className="upload-screen">
      <div className="upload-card">

        {!connected && (
          <>
            <h1 className="brand">Connect to Robot</h1>
            <div className="robot-connect">
              <input
                placeholder="192.168.1.100"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
              />
              <button onClick={connect}>Connect</button>
              {status && <span className={`status ${status}`}>{status}</span>}
            </div>
          </>
        )}

        {connected && (
          <>
            <h1 className="brand">Upload Floor Map</h1>

            <div className="upload-actions">
              <label className="btn primary">
                Upload
                <input
                  ref={ref}
                  className="hidden-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                />
              </label>

              <button
                className="btn secondary"
                onClick={() => {
                  if (!samplePath) return alert("No sample available.");
                  onUpload(samplePath);
                }}
              >
                Use Sample Map
              </button>
            </div>

            <small className="hint">Supported: PNG, JPG.</small>
          </>
        )}

      </div>
    </div>
  );
}
