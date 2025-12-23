import React, { useState, useRef, useEffect } from "react";

export default function AddHouseModal({ onSubmit, onClose }) {
  const [name, setName] = useState("");
  const ref = useRef(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3>Add House</h3>
        <input ref={ref} type="text" placeholder="House name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="modal-actions">
          <button className="btn primary" onClick={() => { if (!name) return alert("Enter name"); onSubmit(name); }}>Create</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
