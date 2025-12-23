import React from "react";

export default function Sidebar({
  houseList,
  floorList,
  scenarioList,
  selectedHouse,
  selectedFloor,
  selectedScenario,
  onSelectHouse,
  onSelectFloor,
  onSelectScenario,
  onAddHouse,
  onAddFloor,
  onAddScenario,
  onOpenAddCoordinate,
  onSaveAll,
  onSaveFloor,
  onReset,
  mapUploaded,
}) {
  return (
    <aside className="sidebar">
      <div>
        <h2>Robo Automation</h2>
        {/* <p className="muted small">Robo Automation</p> */}
      </div>

      {/* HOUSE ROW */}
      <div className="selector-row">
        <label className="muted small">House</label>
        <div className="selector-with-btn">
          <select
            value={selectedHouse || ""}
            onChange={(e) => onSelectHouse(e.target.value || null)}
          >
            <option value="">-- Select House --</option>
            {houseList.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <button className="circle-add-btn" onClick={onAddHouse}>
            +
          </button>
        </div>
      </div>

      {/* FLOOR ROW */}
      <div className="selector-row">
        <label className="muted small">Floor</label>
        <div className="selector-with-btn">
          <select
            value={selectedFloor || ""}
            onChange={(e) => onSelectFloor(e.target.value || null)}
            disabled={!selectedHouse}
          >
            <option value="">-- Select Floor --</option>
            {floorList.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <button
            className="circle-add-btn"
            onClick={onAddFloor}
            disabled={!selectedHouse}
          >
            +
          </button>
        </div>
      </div>

      {/* SCENARIO ROW */}
      <div className="selector-row">
        <label className="muted small">Scenario</label>
        <div className="selector-with-btn">
          <select
            value={selectedScenario || ""}
            onChange={(e) => onSelectScenario(e.target.value || null)}
            disabled={!selectedFloor}
          >
            <option value="">-- Select Scenario --</option>
            {scenarioList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            className="circle-add-btn"
            onClick={onAddScenario}
            disabled={!selectedFloor}
          >
            +
          </button>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="sidebar-actions">

        {/* <button
          className="btn"
          onClick={onOpenAddCoordinate}
          disabled={!mapUploaded || !selectedHouse || !selectedFloor}
        >
          Add Coordinate
        </button> */}

        <button
          className="btn"
          onClick={onSaveFloor}
          disabled={!selectedHouse || !selectedFloor}
        >
          Save Floor Layout
        </button>

        {/* <button className="btn ghost" onClick={onSaveAll}>
          Export All Data
        </button> */}

        <button className="btn ghost" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="sidebar-footer muted small">
        Robot automation.
      </div>
    </aside>
  );
}
