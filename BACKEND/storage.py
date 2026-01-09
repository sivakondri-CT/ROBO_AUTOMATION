import json
from pathlib import Path

DATA_FILE = Path("data/layout.json")

def load_data():
    if not DATA_FILE.exists():
        return {"houses": {}}
    return json.loads(DATA_FILE.read_text())

def save_data(data: dict):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(data, indent=2))
def merge_layout(payload: dict):
    data = load_data()

    house = payload.get("house")
    floor = payload.get("floor")
    scenario_data = payload.get("scenario", {})
    scenario_name = scenario_data.get("name")

    if not house or not floor:
        print("Skipping merge: invalid house/floor", house, floor)
        return

    data.setdefault("houses", {})
    data["houses"].setdefault(house, {"floors": {}})
    data["houses"][house].setdefault("floors", {})
    data["houses"][house]["floors"].setdefault(floor, {
        "floorMap": None,
        "coordinates": {},
        "scenarios": {},
        "slamMap": None         
    })

    floor_obj = data["houses"][house]["floors"][floor]

    # floorMap
    if payload.get("floorMap"):
        floor_obj["floorMap"] = payload["floorMap"]

    # slamMap
    if "slamMap" in payload and payload["slamMap"] is not None:
        floor_obj["slamMap"] = payload["slamMap"]

    # coordinates
    coords = payload.get("coordinates", {})
    if isinstance(coords, dict):
        floor_obj.setdefault("coordinates", {})
        for cid, coord in coords.items():
            floor_obj["coordinates"].setdefault(cid, {})
            for k, v in coord.items():
                if v is not None:
                    floor_obj["coordinates"][cid][k] = v

    # scenarios
    if scenario_name:
        floor_obj.setdefault("scenarios", {})
        floor_obj["scenarios"].setdefault(scenario_name, {})
        if "Coordinate_order" in scenario_data:
            floor_obj["scenarios"][scenario_name]["Coordinate_order"] = scenario_data["Coordinate_order"]

    save_data(data)
