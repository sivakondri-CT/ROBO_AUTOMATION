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

  const [iterations, setIterations] = useState(1);

  const handleChange = (id, field, val) => {
    setValues(v => ({
      ...v,
      [id]: { ...v[id], [field]: val }
    }));
  };

  const handleRun = () => {
    onSubmit({ values, iterations });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide" onClick={e => e.stopPropagation()}>
        <h3>Run Scenario</h3>

        <div className="param-grid">
          <div className="param-header">Point</div>
          <div className="param-header">Duration (min)</div>
          <div className="param-header">Angles (°)</div>

          {order.map(id => (
            <React.Fragment key={id}>
              <div className="param-cell">Point {id}</div>

              <input
                type="number"
                min="0"
                step="1"
                value={values[id].duration}
                onChange={e => handleChange(id, "duration", e.target.value)}
              />

              <input
                type="text"
                placeholder="0,45,90"
                value={values[id].angle}
                onChange={e => handleChange(id, "angle", e.target.value)}
              />
            </React.Fragment>
          ))}
        </div>

        <div className="iteration-row">
          <label>Iterations</label>
          <input
            type="number"
            min="1"
            step="1"
            value={iterations}
            onChange={e => setIterations(Number(e.target.value))}
          />
        </div>

        <div className="modal-actions1">
          <button className="btn primary" onClick={handleRun}>Run</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
