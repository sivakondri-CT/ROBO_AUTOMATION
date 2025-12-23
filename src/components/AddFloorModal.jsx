import React, { useState, useRef, useEffect } from "react";

export default function AddFloorModal({ houseList, onSubmit, onClose }) {
  const [house, setHouse] = useState(houseList[0] || "");
  const [floor, setFloor] = useState("");
  const ref = useRef(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3>Add Floor</h3>

        <label className="muted small">House</label>
        <select value={house} onChange={(e) => setHouse(e.target.value)}>
          <option value="">-- Select House --</option>
          {houseList.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>

        <input ref={ref} type="text" placeholder="Floor name" value={floor} onChange={(e) => setFloor(e.target.value)} />

        <div className="modal-actions">
          <button className="btn primary" onClick={() => { if (!house || !floor) return alert("Select house & enter floor"); onSubmit(house, floor); }}>Create</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
