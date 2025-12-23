import React, { useState } from "react";
import UploadScreen from "./components/UploadScreen";
import Sidebar from "./components/Sidebar";
import FloorMapCanvas from "./components/FloorMapCanvas";
import CoordinateModal from "./components/CoordinateModal";
import AddHouseModal from "./components/AddHouseModal";
import AddFloorModal from "./components/AddFloorModal";
import AddScenarioModal from "./components/AddScenarioModal";

const SAMPLE_PATH = "/50T.png";

export default function App() {
  // overall hierarchical data: dict of dict
  const [data, setData] = useState({ houses: {} });
  const [pendingPos, setPendingPos] = useState(null);
//pending props where the user clicks before entering the coordinate ID
  // current map & selection
  const [mapURL, setMapURL] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null); // string name
  const [selectedFloor, setSelectedFloor] = useState(null); // string name
  const [selectedScenario, setSelectedScenario] = useState(null);


  // UI state
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [showAddHouse, setShowAddHouse] = useState(false);
  const [showAddFloor, setShowAddFloor] = useState(false);
  const [showAddScenario, setShowAddScenario] = useState(false);

  // upload handler (accepts File or URL string)
  const handleUpload = (fileOrUrl) => {
    if (!fileOrUrl) return;
    if (typeof fileOrUrl === "string") {
      setMapURL(fileOrUrl);
    } else {
      setMapURL(URL.createObjectURL(fileOrUrl));
    }
  };

  // Add house (creates empty floors dict)
  const addHouse = (houseName) => {
    setData((prev) => {
      if (!houseName) return prev;
      if (prev.houses[houseName]) return prev; // already exists
      return {
        ...prev,
        houses: {
          ...prev.houses,
          [houseName]: { floors: {} },
        },
      };
    });
    setSelectedHouse(houseName);
    setSelectedFloor(null);
    setSelectedScenario(null);
  };

  // Add floor to selected house
  const addFloor = (houseName, floorName) => {
    if (!houseName || !floorName) return;
    setData((prev) => {
      const houses = { ...(prev.houses || {}) };
      houses[houseName] = houses[houseName] || { floors: {} };
      houses[houseName].floors = houses[houseName].floors || {};
      if (houses[houseName].floors[floorName]) return prev; // exists
      houses[houseName].floors[floorName] = {
        coordinates: {},
        scenarios: {},
      };
      return { ...prev, houses };
    });
    setSelectedHouse(houseName);
    setSelectedFloor(floorName);
  };

  // Add scenario under house->floor
  const addScenario = (houseName, floorName, scenarioName, devices = []) => {
    if (!houseName || !floorName || !scenarioName) return;
    setData((prev) => {
      const houses = { ...(prev.houses || {}) };
      houses[houseName] = houses[houseName] || { floors: {} };
      houses[houseName].floors = houses[houseName].floors || {};
      houses[houseName].floors[floorName] = houses[houseName].floors[floorName] || {
        coordinates: {},
        scenarios: {},
      };
      const scenarios = { ...(houses[houseName].floors[floorName].scenarios || {}) };
      scenarios[scenarioName] = { devices: devices || [] };
      houses[houseName].floors[floorName].scenarios = scenarios;
      return { ...prev, houses };
    });
  };

  // Add or update coordinate for currently selected house/floor
  const addCoordinateToSelectedFloor = (coordId, x, y) => {
    if (!selectedHouse || !selectedFloor) {
      alert("Please select a House and Floor before adding coordinates.");
      return;
    }
    setData((prev) => {
      const houses = { ...(prev.houses || {}) };
      houses[selectedHouse] = houses[selectedHouse] || { floors: {} };
      houses[selectedHouse].floors = houses[selectedHouse].floors || {};
      houses[selectedHouse].floors[selectedFloor] =
        houses[selectedHouse].floors[selectedFloor] || { coordinates: {}, scenarios: {} };

      const coordinates = { ...(houses[selectedHouse].floors[selectedFloor].coordinates || {}) };
      coordinates[coordId] = { x, y };
      houses[selectedHouse].floors[selectedFloor].coordinates = coordinates;
      return { ...prev, houses };
    });
  };

  // Move existing coordinate (id) within selected floor (x,y in pixels)
  const moveCoordinate = (coordId, x, y) => {
    if (!selectedHouse || !selectedFloor) return;
    setData((prev) => {
      const houses = { ...(prev.houses || {}) };
      const floor = houses[selectedHouse]?.floors?.[selectedFloor];
      if (!floor) return prev;
      const coordinates = { ...(floor.coordinates || {}) };
      if (!coordinates[coordId]) return prev;
      coordinates[coordId] = { x, y };
      houses[selectedHouse].floors[selectedFloor].coordinates = coordinates;
      return { ...prev, houses };
    });
  };

  // Save entire data object (houses) as JSON
  const saveAllData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `houses_layout_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    alert("Data exported (download started).");
  };

  // Save only current floor layout (floorMap + coordinates)
  const saveCurrentFloor = () => {
  if (!mapURL || !selectedHouse || !selectedFloor) {
    alert("Upload map and select House & Floor before saving floor layout.");
    return;
  }

  if (!selectedScenario) {
    alert("Please select a Scenario before saving.");
    return;
  }

  const floor = data.houses?.[selectedHouse]?.floors?.[selectedFloor];
  const scenarioData =
    floor?.scenarios?.[selectedScenario] || { devices: [] };

  const filename = mapURL.split("/").pop() || "floor.png";

  const payload = {
    floorMap: filename,
    house: selectedHouse,
    floor: selectedFloor,
    scenario: {
      name: selectedScenario,
      devices: scenarioData.devices
    },
    coordinates: floor?.coordinates || {},
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${selectedHouse}_${selectedFloor}_${selectedScenario}_layout.json`;
  a.click();
  URL.revokeObjectURL(a.href);

  alert("Scenario layout JSON downloaded.");
};

  // Reset everything and go back to upload screen
  const resetAll = () => {
    if (!confirm("Reset app: clear map and selections?")) return;
    setMapURL(null);
    setSelectedHouse(null);
    setSelectedFloor(null);
    if (selectedHouse && selectedFloor) {
      setData((prev) => {
        const houses = { ...(prev.houses || {}) };
        if (houses[selectedHouse]?.floors?.[selectedFloor]) {
          houses[selectedHouse].floors[selectedFloor].coordinates = {};
        }
        return { ...prev, houses };
      });
    }
  };

  // Helper: list of houses and floors for selection UI (Sidebar will provide selection)
  const houseList = Object.keys(data.houses || {});
  const floorList = selectedHouse ? Object.keys((data.houses[selectedHouse]?.floors) || {}) : [];
  const scenarioList =
  selectedHouse && selectedFloor
    ? Object.keys(data.houses[selectedHouse].floors[selectedFloor].scenarios || {})
    : [];


  return (
    <div className="app-root">
      {!mapURL ? (
        <UploadScreen onUpload={handleUpload} samplePath={SAMPLE_PATH} /> //sets map url
      ) : (
        <div className="main-layout">
        <Sidebar
  houseList={houseList}
  floorList={floorList}
  scenarioList={scenarioList}
  selectedHouse={selectedHouse}
  selectedFloor={selectedFloor}
  selectedScenario={selectedScenario}
  onSelectHouse={(h) => {
    setSelectedHouse(h);
    setSelectedFloor(null);
    setSelectedScenario(null);
  }}
  onSelectFloor={(f) => {
    setSelectedFloor(f);
    setSelectedScenario(null);
  }}
  onSelectScenario={setSelectedScenario}
  onAddHouse={() => setShowAddHouse(true)}
  onAddFloor={() => setShowAddFloor(true)}
  onAddScenario={() => setShowAddScenario(true)}
  onOpenAddCoordinate={() => setShowCoordModal(true)}

  // ✔ FIXED HERE
  onSaveAll={saveAllData}
  onSaveFloor={saveCurrentFloor}
  onReset={resetAll}

  mapUploaded={!!mapURL}
/>


          <FloorMapCanvas
            mapURL={mapURL}
            data={data}
            selectedHouse={selectedHouse}
            selectedFloor={selectedFloor}
            onAddCoordinate={(id, x, y) => addCoordinateToSelectedFloor(id, x, y)}
            onMoveCoordinate={(id, x, y) => moveCoordinate(id, x, y)}
            onOpenAddCoordinate={() => setShowCoordModal(true)}
            onPrepareCoordinatePosition={(pos) => setPendingPos(pos)}
          />
        </div>
      )}

      {showCoordModal && (
      <CoordinateModal
      onSubmit={(coordId) => {
        if (pendingPos) {
          addCoordinateToSelectedFloor(coordId, pendingPos.x, pendingPos.y);
        }
        setPendingPos(null);
        setShowCoordModal(false);
      }}
      onClose={() => setShowCoordModal(false)}
    />

      )}

      {showAddHouse && (
        <AddHouseModal
          onSubmit={(name) => {
            addHouse(name);
            setShowAddHouse(false);
          }}
          onClose={() => setShowAddHouse(false)}
        />
      )}

      {showAddFloor && (
        <AddFloorModal
          houseList={houseList}
          onSubmit={(houseName, floorName) => {
            addFloor(houseName, floorName);
            setShowAddFloor(false);
          }}
          onClose={() => setShowAddFloor(false)}
        />
      )}

      {showAddScenario && (
        <AddScenarioModal
          houseList={houseList}
          floorListFunc={() => floorList}
          onSubmit={(houseName, floorName, scenarioName, devices) => {
            addScenario(houseName, floorName, scenarioName, devices);
            setShowAddScenario(false);
          }}
          onClose={() => setShowAddScenario(false)}
        />
      )}
    </div>
  );
}
