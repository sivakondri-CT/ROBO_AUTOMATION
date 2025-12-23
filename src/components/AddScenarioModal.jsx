import React, { useState, useEffect, useRef } from "react";

/**
 * Props:
 * - houseList: array of house names
 * - floorListFunc: function that returns array of floors for selected house
 * - onSubmit(houseName, floorName, scenarioName, devices)
 */
export default function AddScenarioModal({ houseList, floorListFunc, onSubmit, onClose }) {
  const [house, setHouse] = useState(houseList[0] || "");
  const [floor, setFloor] = useState("");
  const [scenario, setScenario] = useState("");
  const [devicesText, setDevicesText] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    if (houseList.length) setHouse(houseList[0]);
  }, [houseList]);

  useEffect(() => {
    const floors = floorListFunc();
    if (floors && floors.length) setFloor(floors[0]);
    else setFloor("");
  }, [house, floorListFunc]);

  const floorList = floorListFunc();

  const handleCreate = () => {
    if (!house || !floor || !scenario) return alert("Select house, floor and enter scenario name.");
    // parse devices by comma
    const devices = devicesText
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    onSubmit(house, floor, scenario, devices);
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3>Add Scenario</h3>

        <label className="muted small">House</label>
        <select value={house} onChange={(e) => setHouse(e.target.value)}>
          <option value="">-- Select House --</option>
          {houseList.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>

        <label className="muted small">Floor</label>
        <select value={floor} onChange={(e) => setFloor(e.target.value)} disabled={!house}>
          <option value="">-- Select Floor --</option>
          {(floorList || []).map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        <input ref={ref} type="text" placeholder="Scenario name" value={scenario} onChange={(e) => setScenario(e.target.value)} />
        <input type="text" placeholder="Devices (comma separated)" value={devicesText} onChange={(e) => setDevicesText(e.target.value)} />

        <div className="modal-actions">
          <button className="btn primary" onClick={handleCreate}>Create</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
