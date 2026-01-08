import React, { useState, useRef, useEffect } from "react";

export default function AddFloorModal({ houseList, onSubmit, onClose }) {
  const [house, setHouse] = useState(houseList[0] || "");
  const [floor, setFloor] = useState("");
  const [maps, setMaps] = useState([]);
  const [slamMap, setSlamMap] = useState("null");
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    fetch("http://localhost:8000/reeman/history_map")
      .then(res => res.json())
      .then(data => setMaps(data.maps || []))
      .catch(() => setMaps([]));
  }, []);

  // const applyMap = (name) => {
  //   if (!name) return;
  //   fetch("http://localhost:8000/cmd/apply_map", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ name })
  //   }).catch(console.error);
  // };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3>Add Floor</h3>

        {/* <label className="muted small field-label">House</label> */}
        <select
          className="modal-select"
          value={house}
          onChange={(e) => setHouse(e.target.value)}
        >
          <option value="">-- Select House --</option>
          {houseList.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

            {/* <label className="muted small field-label">SLAM Map</label> */}
        <select
          className="modal-select"
          value={slamMap?.id || ""}
          onChange={(e) => {
            const id = e.target.value;
            const map = maps.find(m => m.id === id);
            setSlamMap(map);
          }}
        >
          <option value="">-- Select SLAM Map --</option>
          {maps.map(m => (
            <option key={m.id} value={m.id}>{m.alias}</option>
          ))}
        </select>


        {/* <label className="muted small field-label">Floor name</label> */}
        <input
          ref={ref}
          className="modal-input"
          type="text"
          placeholder="Enter floor name"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
        />

    

        <div className="modal-actions">
          <button
            className="btn primary"
                    onClick={() => {
            if (!house || !floor || !slamMap)
              return alert("Select house, floor and map");

            onSubmit(house, floor, slamMap);  
            applyMap(slamMap.id);
          }}

          >
            Create
          </button>
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
