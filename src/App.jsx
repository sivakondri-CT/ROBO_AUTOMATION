import React, { useState, useEffect } from "react";
import UploadScreen from "./components/UploadScreen";
import Sidebar from "./components/Sidebar";
import FloorMapCanvas from "./components/FloorMapCanvas";
import CoordinateModal from "./components/CoordinateModal";
import AddHouseModal from "./components/AddHouseModal";
import AddFloorModal from "./components/AddFloorModal";
import AddScenarioModal from "./components/AddScenarioModal";
import RunScenarioModal from "./components/RunScenarioModal";
import { layoutAPI } from "./services/layoutAPI";
import "./styles/upload.css";
import "./styles/RobotConfig.css";
// import RobotConfigBar from "./components/RobotConfigBar";
import "./styles/RobotConfig.css";
import GlobalHeader from "./components/GlobalHeader";
const SAMPLE_PATH = "/50T.png";

export default function App() {
  const [data, setData] = useState({ houses: {} });
  const [mapURL, setMapURL] = useState(null);
  const [pendingPos, setPendingPos] = useState(null);

  const [selectedHouse, setSelectedHouse] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);

  const [showCoordModal, setShowCoordModal] = useState(false);
  const [showAddHouse, setShowAddHouse] = useState(false);
  const [showAddFloor, setShowAddFloor] = useState(false);
  const [showAddScenario, setShowAddScenario] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);

  const [status, setStatus] = useState("");
  

  useEffect(() => {
    layoutAPI.get().then(d => setData(d || { houses: {} }));
  }, []);

  const currentFloor =
    selectedHouse && selectedFloor
      ? data.houses?.[selectedHouse]?.floors?.[selectedFloor]
      : null;

  useEffect(() => {
    if (currentFloor?.floorMap) {
      // setMapURL(`/maps/${currentFloor.floorMap}`);
      setMapURL(`http://localhost:8000/maps/${currentFloor.floorMap}`);

    }
  }, [currentFloor]);
  const handleUpload = async (fileOrUrl) => {
  try {
    let file = fileOrUrl;

    // If sample map (string), fetch it and convert to File
    if (typeof fileOrUrl === "string") {
      const res = await fetch(fileOrUrl);
      const blob = await res.blob();
      file = new File([blob], fileOrUrl.split("/").pop(), { type: blob.type });
    }

    const uploadRes = await layoutAPI.uploadMap(file);
    const filename = uploadRes.filename;

    const updated = structuredClone(data);

    if (!selectedHouse || !selectedFloor) {
      alert("Please create and select a house and floor before uploading.");
      return;
    }

    if (!updated.houses[selectedHouse]) {
      updated.houses[selectedHouse] = { floors: {} };
    }

    if (!updated.houses[selectedHouse].floors[selectedFloor]) {
      updated.houses[selectedHouse].floors[selectedFloor] = {
        floorMap: null,
        coordinates: {},
        scenarios: {}
      };
    }

    updated.houses[selectedHouse].floors[selectedFloor].floorMap = filename;

    setData(updated);
    setMapURL(`http://localhost:8000/maps/${filename}`);
  } catch (err) {
    console.error("Upload failed", err);
    alert("Upload failed");
  }
};
 const handleRunScenario = () => {
  if (!selectedHouse || !selectedFloor || !selectedScenario) return;
  setShowRunModal(true);
};

const handleRunSubmit = async ({ values, iterations }) => {
  const updated = structuredClone(data);
  const floor = updated.houses[selectedHouse].floors[selectedFloor];

  Object.entries(values).forEach(([id, { duration, angle }]) => {
    if (!floor.coordinates[id]) return;

    if (duration !== "") {
      floor.coordinates[id].duration = Number(duration);
    }

    if (angle !== "") {
      if (Array.isArray(angle)) {
        floor.coordinates[id].angle = angle.map(Number);
      } else if (typeof angle === "string") {
        floor.coordinates[id].angle = angle
          .split(",")
          .map(a => a.trim())
          .filter(a => a.length)
          .map(Number);
      }
    }
  });

  setData(updated);
  setShowRunModal(false);

  await layoutAPI.save(updated);

  console.log("Running Scenario:", {
    order: floor.scenarios[selectedScenario]?.Coordinate_order,
    iterations,
    coordinates: floor.coordinates
  });
};





  const saveCurrentFloor = async () => {
    if (!mapURL || !selectedHouse || !selectedFloor || !selectedScenario) {
      alert("Select house, floor, scenario and upload map");
      return;
    }

    const floor = data.houses[selectedHouse].floors[selectedFloor];

    const payload = {
      floorMap: mapURL.split("/").pop(),
      house: selectedHouse,
      floor: selectedFloor,
      scenario: {
        name: selectedScenario,
            Coordinate_order: floor.scenarios[selectedScenario]?.Coordinate_order || []


      },
      coordinates: floor.coordinates || {}
    };

    await layoutAPI.save(payload);
    alert("Saved to backend");
  };

  const houseList = Object.keys(data.houses || {});
  const floorList = selectedHouse ? Object.keys(data.houses[selectedHouse]?.floors || {}) : [];
  const scenarioList =
    selectedHouse && selectedFloor
      ? Object.keys(data.houses[selectedHouse].floors[selectedFloor]?.scenarios || {})
      : [];

  return (
    <div className="app-root">
       <GlobalHeader
    onStop={async () => {
    try {
        const response = await fetch("http://localhost:8000/stoptest", {
          method: "POST"
        });

        const data = await response.json();
        console.log(data.message);
      } catch (err) {
        console.error("Stop failed:", err);
      }
    }}
    onCharge={async () => {
      try {
        const response = await fetch("http://localhost:8000/charge", {
          method: "POST"
        });

        const data = await response.json();
        console.log(data.message);
      } catch (err) {
        console.error("Charge failed:", err);
      }
    }}
  />
      <Sidebar     
        houseList={houseList}
        floorList={floorList}
        scenarioList={scenarioList}
        selectedHouse={selectedHouse}
        selectedFloor={selectedFloor}
        selectedScenario={selectedScenario}
        onSelectHouse={(h) => { setSelectedHouse(h); setSelectedFloor(null); }}
        onSelectFloor={(f) => { setSelectedFloor(f); }}
        onSelectScenario={setSelectedScenario}
        onAddHouse={() => setShowAddHouse(true)}
        onAddFloor={() => setShowAddFloor(true)}
        onAddScenario={() => setShowAddScenario(true)}
        onOpenAddCoordinate={() => setShowCoordModal(true)}
        onSaveFloor={saveCurrentFloor}
        onReset={() => window.location.reload()}
        mapUploaded={!!mapURL}
        onRunScenario={handleRunScenario}
        status={status}
      />
      {!mapURL && <UploadScreen onUpload={handleUpload} samplePath={SAMPLE_PATH} status={status} setStatus={setStatus} />}
      {mapURL && (
  <FloorMapCanvas
    mapURL={mapURL}
    data={data}
    selectedHouse={selectedHouse}
    selectedFloor={selectedFloor}
    onAddCoordinate={(id, x, y) => {
      const updated = structuredClone(data);
      updated.houses[selectedHouse].floors[selectedFloor].coordinates[id] = { x, y };
      setData(updated);
    }}
    onMoveCoordinate={(id, x, y) => {
      const updated = structuredClone(data);
      updated.houses[selectedHouse].floors[selectedFloor].coordinates[id] = { x, y };
      setData(updated);
    }}
    onPrepareCoordinatePosition={setPendingPos}
    onOpenAddCoordinate={() => setShowCoordModal(true)}  
  />
  
)}
{showCoordModal && (
  <CoordinateModal status={status}
    onSubmit={(coordId) => {
      const updated = structuredClone(data);
      updated.houses[selectedHouse].floors[selectedFloor].coordinates[coordId] = pendingPos;
      setData(updated);
      setShowCoordModal(false);
    }}
    onClose={() => setShowCoordModal(false)}
  />
)}
{showRunModal && (
  <RunScenarioModal
    order={data.houses[selectedHouse].floors[selectedFloor]
      .scenarios[selectedScenario].Coordinate_order}
    coordinates={data.houses[selectedHouse].floors[selectedFloor].coordinates}
    selectedScenario={selectedScenario}
    onSubmit={handleRunSubmit}
    onClose={() => setShowRunModal(false)}
  />
)}



      {showAddHouse && (
  <AddHouseModal
    onSubmit={(name) => {
      const updated = structuredClone(data);
      updated.houses[name] = { floors: {} };
      setData(updated);
      setSelectedHouse(name);
      setMapURL(null);    
      setShowAddHouse(false);
    }}
    onClose={() => setShowAddHouse(false)}
  />
)}

{showAddFloor && (
  <AddFloorModal
    houseList={houseList}
    onSubmit={(house, floor) => {
      const updated = structuredClone(data);
      updated.houses[house].floors[floor] = { coordinates: {}, scenarios: {} };
      setData(updated);
      setSelectedHouse(house);
      setSelectedFloor(floor);
      setShowAddFloor(false);
    }}
    onClose={() => setShowAddFloor(false)}
  />
)}

{showAddScenario && (
  <AddScenarioModal
    houseList={houseList}
    floorListFunc={() => floorList}
   onSubmit={(house, floor, scenario, coordinateOrder) => {
  const updated = structuredClone(data);

  updated.houses[house].floors[floor].scenarios[scenario] = {
    Coordinate_order: coordinateOrder
  };

  setData(updated);
  setSelectedScenario(scenario);
  setShowAddScenario(false);
}}

    onClose={() => setShowAddScenario(false)}
  />
)}


    </div>
  );
}
