import React, { useState } from "react";

export default function RunScenarioModal({ order, coordinates, onSubmit, onClose }) {
  const [values, setValues] = useState(() =>
    order.reduce((acc, id) => {
      acc[id] = {
        duration: coordinates[id]?.duration || "",
        angle: coordinates[id]?.angle || ""
      };
      return acc;
    }, {})
  );

  const handleChange = (id, field, val) => {
    setValues(v => ({
      ...v,
      [id]: { ...v[id], [field]: val }
    }));
  };

  const handleRun = () => {
    onSubmit(values);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h3>Scenario Parameters</h3>

        {order.map(id => (
          <div key={id} className="param-row">
            <span>Point {id}</span>
            <input
              type="number"
              placeholder="Duration (M)"
              value={values[id].duration}
              onChange={e => handleChange(id, "duration", e.target.value)}
            />
            <input
              type="text"
              placeholder="Angles (e.g. 0,45,90)"
              value={values[id].angle}
              onChange={e => handleChange(id, "angle", e.target.value)}
            />
          </div>
        ))}

        <div className="modal-actions">
          <button className="btn primary" onClick={handleRun}>Run</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
