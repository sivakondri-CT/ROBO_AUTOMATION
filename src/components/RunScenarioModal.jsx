import React, { useState,useEffect } from "react";
export default function RunScenarioModal({ order, coordinates,selectedScenario, onSubmit, onClose,onSave }) {
  const [cycleEnabled,setCycleEnabled]=useState(false);
  const uniqueOrder = [...new Set(order)];

  const [customEnabled, setCustomEnabled] = useState(false);
  const [customOrderText, setCustomOrderText] = useState("");
  
  const parseCustomOrder = (text) =>
  text
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const baseOrder = customEnabled
  ? parseCustomOrder(customOrderText)
  : order;

  const applyCycle = (order, enabled) => {
  if (!enabled || order.length <= 1) return order;
  return [...order, ...order.slice(0, -1).reverse()];
};
  const finalOrder = applyCycle(baseOrder, cycleEnabled);
  const [values, setValues] = useState(() =>
    order.reduce((acc, id,index) => {
      acc[index] = {
        coord: id,
        duration: coordinates[id]?.duration || "",
        angle: coordinates[id]?.angle || ""
      };
      return acc;
    }, {})
  );

  const finalValues = finalOrder.reduce((acc, coord, index) => {
  const originalIndex = order.indexOf(coord);
  const original = values[originalIndex] || {};

  acc[index] = {
    coord,
    duration: original.duration || "",
    angle: original.angle || ""
  };
  return acc;
}, {});


console.log("Unique Order:", uniqueOrder);

  const [iterations, setIterations] = useState(1);

  // const handleChange = (id, field, val) => {
  //   setValues(v => ({
  //     ...v,
  //     [id]: { ...v[id], [field]: val }
  //   }));
  // };

  const handleChange = (index, field, val) => {
  setValues(v => ({
    ...v,
    [index]: { ...v[index], [field]: val }
  }));
};





  const handleRun = async () => {
    console.log("Order:", order);
    console.log("Values:", JSON.stringify(values, null, 2));
    try {

      const req = await fetch("http://localhost:8000/celery/running");
      const res = await req.json();

      if (!res.running) {
        alert("Celery is not running. Please start Celery.");
        return; 
      }

      const response = await fetch("http://localhost:8000/run-robo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coordinate_data: finalValues,
          iterations:iterations,
          order:finalOrder,
          name:selectedScenario,
        })
      });

      const data = await response.json();
      console.log("Task started:", data);
      alert(`Task started! ID: ${data.task_id}`);
    } catch (err) {
      console.error("Error starting task:", err);
      alert("Failed to start task");
    }
    onSubmit({ values, iterations, runName: selectedScenario });

  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide" onClick={e => e.stopPropagation()}>
        <h3>Run Scenario</h3>
       <div className="param-grid-wrapper">
        <div className="param-grid">
          <div className="param-header">Point</div>
          <div className="param-header">Duration (min)</div>
          <div className="param-header">Angles (°)</div>
          {uniqueOrder.map((id, index) => (
          <React.Fragment key={index}>
            <div className="param-cell">Point {id}</div>

            <input
              type="number"
              value={values[index]?.duration || ""}
              onChange={e => handleChange(index, "duration", e.target.value)}
            />

            <input
              type="text"
              value={values[index]?.angle || ""}
              onChange={e => handleChange(index, "angle", e.target.value)}
            />
          </React.Fragment>
        ))}

        </div>
        <div className="iteration-row">
        <div className="iteration-item">
          <label>Iterations</label>
          <input
            type="number"
            min="1"
            step="1"
            value={iterations}
            onChange={e => setIterations(Number(e.target.value))}
          />
        </div>

        <div className="cycle-item">
          <label className="cycle-label">
            <input
              type="checkbox"
              checked={cycleEnabled}
              onChange={e => setCycleEnabled(e.target.checked)}
            />
            <span>Cycle</span>
          </label>
        </div>
        <div className="cycle-item">
  <label className="cycle-label">
    <input
      type="checkbox"
      checked={customEnabled}
      onChange={e => setCustomEnabled(e.target.checked)}
    />
    <span>Custom</span>
  </label>
</div>
{customEnabled && (
  <div className="custom-order-row">
    <label>Custom Coordinate Order</label>
    <input
      type="text"
      placeholder="Example: 7,6,3"
      value={customOrderText}
      onChange={e => setCustomOrderText(e.target.value)}
    />
  </div>
)}

      </div>

        <div className="modal-actions1">
          <button className="btn" onClick={() => onSave(finalValues)}>Save</button>
          <button className="btn primary" onClick={handleRun}>Run</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
      </div>
    </div>
  );
}
