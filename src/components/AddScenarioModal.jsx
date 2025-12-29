import React, { useState, useEffect, useRef } from "react";

export default function AddScenarioModal({ houseList, floorListFunc, onSubmit, onClose }) {
  const [house, setHouse] = useState(houseList[0] || "");
  const [floor, setFloor] = useState("");
  const [scenario, setScenario] = useState("");
  const [coordinateText, setCoordinateText] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    if (houseList.length) setHouse(houseList[0]);
  }, [houseList]);

  useEffect(() => {
    const floors = floorListFunc();
    if (floors.length) setFloor(floors[0]);
    else setFloor("");
  }, [house, floorListFunc]);

  const handleCreate = () => {
    if (!house || !floor || !scenario) {
      alert("Select house, floor and enter scenario name.");
      return;
    }

    const coordinateOrder = coordinateText
      .split(",")
      .map(v => v.trim())
      .filter(v => v.length > 0);

    console.log("Sending coordinate order:", coordinateOrder);

    onSubmit(house, floor, scenario, coordinateOrder);
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3>Add Scenario</h3>

        <label className="muted small">House</label>
        <select value={house} onChange={(e) => setHouse(e.target.value)}>
          <option value="">-- Select House --</option>
          {houseList.map(h => <option key={h} value={h}>{h}</option>)}
        </select>

        <label className="muted small">Floor</label>
        <select value={floor} onChange={(e) => setFloor(e.target.value)} disabled={!house}>
          <option value="">-- Select Floor --</option>
          {floorListFunc().map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <input
          ref={ref}
          type="text"
          placeholder="Scenario name"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
        />

        <input
          type="text"
          placeholder="Coordinate order (e.g. 1,3,2)"
          value={coordinateText}
          onChange={(e) => setCoordinateText(e.target.value)}
        />

        <div className="modal-actions">
          <button className="btn primary" onClick={handleCreate}>Create</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
