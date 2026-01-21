import React, { useState, useRef, useEffect } from "react";

export default function CoordinateModal({ onSubmit, onClose }) {
  const [coord, setCoord] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleAdd = () => {
    if (!coord) return alert("Enter coordinate ID(s)");

    const ids = coord
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);

    const invalid = ids.find(id => !/^\d+$/.test(id));
    if (invalid) {
      return alert(`Invalid coordinate ID: ${invalid}`);
    }

    onSubmit(ids);   
    setCoord("");
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3>Add Coordinate</h3>
        <input
          ref={ref}
          type="text"
          placeholder="Enter coordinate IDs (1,2,3...)"
          value={coord}
          onChange={(e) => setCoord(e.target.value)}
        />
        <div className="modal-actions">
          <button className="btn primary" onClick={handleAdd}>Add</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
