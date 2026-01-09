from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from schemas import Pose, NavByName, Speed, MaxSpeed, Charge, RobotConfig
from robot_client import get, post, set_robot_host
from storage import load_data, save_data, merge_layout

from pathlib import Path
from celery_app import celery
import shutil
import uuid
from fastapi import HTTPException
import requests
import config
import json

from tasks import run_robo_task
origins = ["*"]

app = FastAPI(title="SLAM Robot Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAP_DIR = Path("maps")
MAP_DIR.mkdir(exist_ok=True)

app.mount("/maps", StaticFiles(directory=str(MAP_DIR)), name="maps")


@app.get("/layout")
def get_layout():
    return load_data()

@app.post("/layout")
def update_layout(data: dict = Body(...)):
    merge_layout(data)
    return {"status": "ok"}

# @app.get("/reeman/history_map")
# def get_history_maps():
#     return {
#         "maps": ["Office", "Warehouse", "Lab", "Floor1"]
#     }

@app.get("/reeman/history_map")
def history_map():
    data = get("/reeman/history_map")  

    maps = []
    for m in data.get("maps", []):
        alias = m.get("alias")
        name = m.get("name")
        if alias:
            maps.append({
                "id": name,
                "alias": alias
            })

    return {"maps": maps}

@app.post("/cmd/apply_map")
def apply_map(payload: dict):
    try:
        print("Apply map called:", payload)

        resp = post("/cmd/apply_map", payload)

        # If robot_client.post already raises on error, this line won't be reached on failure
        return {
            "status": "ok",
            "robot_response": resp
        }

    except Exception as e:
        print("Apply map failed:", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to apply map: {str(e)}")


# @app.post("/robot/config")
# def set_robot(cfg: RobotConfig):
#     set_robot_host(cfg.ip)
#     return {"status": "ok", "ip": cfg.ip}

@app.post("/robot/config")
def set_robot(cfg: RobotConfig):
    try:
        # Try setting the robot IP
        set_robot_host(cfg.ip)

        # Test connectivity 
        r = requests.get(f"http://{cfg.ip}/reeman/hostname", timeout=3)
        r.raise_for_status()

        return {"status": "ok", "ip": cfg.ip}

    except requests.exceptions.RequestException:
        # Reset robot host if unreachable
        set_robot_host(None)
        raise HTTPException(status_code=400, detail="Robot not reachable at given IP")

@app.post("/layout/upload_map")
async def upload_map(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix  # ".png", ".jpg"
    unique_name = f"{uuid.uuid4()}{ext}"
    dest = MAP_DIR / unique_name

    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": unique_name}


@app.get("/robot/version")
def version():
    return get("/reeman/current_version")

@app.get("/robot/pose")
def pose():
    return get("/reeman/pose")

@app.get("/robot/mode")
def mode():
    return get("/reeman/get_mode")

@app.get("/robot/battery")
def battery():
    return get("/reeman/base_encode")

@app.get("/robot/laser")
def laser():
    return get("/reeman/laser")

@app.post("/robot/nav/coordinate")
def nav_coordinate(pose: Pose):
    return post("/cmd/nav", pose.dict())

@app.post("/robot/nav/name")
def nav_name(data: NavByName):
    return post("/cmd/nav_name", data.dict())

@app.get("/robot/nav/status")
def nav_status():
    return get("/reeman/nav_status")

@app.post("/robot/nav/cancel")
def cancel_nav():
    return post("/cmd/cancel_goal")

@app.post("/robot/speed")
def set_speed(speed: Speed):
    return post("/cmd/speed", speed.dict())

@app.post("/robot/max_speed")
def set_max_speed(speed: MaxSpeed):
    return post("/cmd/max_speed", speed.dict())

@app.post("/robot/charge")
def charge(data: Charge):
    return post("/cmd/charge", data.dict())

@app.get("/robot/map/current")
def current_map():
    return get("/reeman/current_map")
@app.get("/robot/map/list")
def map_list():
    try:
        return get("/reeman/history_map")

    except requests.exceptions.RequestException:
        # Robot unreachable → return mock data
        return {
            "maps": [
                {"name": "mock_map_1", "alias": "Office Map"},
                {"name": "mock_map_2", "alias": "Warehouse Map"},
                {"name": "mock_map_3", "alias": "Test Environment"}
            ],
            "mock": True
        }

@app.post("/robot/map/save")
def save_map():
    return post("/cmd/save_map")

@app.post("/robot/map/apply")
def apply_map(name: dict):
    return post("/cmd/apply_map", name)

@app.post("/run-robo")
def run_robo_endpoint(coordinate_data:dict, robot_ip: str = "192.168.200.175"):
    args = {
        "coordinate_data": coordinate_data,
        "robot_ip": robot_ip
    }

    task = run_robo_task.delay("robo_control.py", args)
    return {"task_id": task.id, "status": "started"}

@app.post("/stoptest")
def cancel_navigation():
    post("/cmd/cancel_goal")
    NAV_FILE = Path(__file__).parent / "nav.json"
    try:
        # 1. Read nav.json
        if NAV_FILE.exists():
            with open(NAV_FILE, "r") as f:
                nav_data = json.load(f)
        else:
            nav_data = {}

        nav_data["status"] = "Stopped"

        with open(NAV_FILE, "w") as f:
            json.dump(nav_data, f, indent=2)

        return {"message": "Navigation stopped", "status": "Stopped"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update nav.json: {str(e)}"
        )
    

@app.post("/charge")
def move_to_chargepoint():
    data=get("/reeman/position")   
    charge_point_name=None
    for wp in data.get("waypoints", []):
        if wp.get("type") == "charge":
            charge_point_name = wp["name"]
    body={"point": charge_point_name}
    
    return post("/cmd/nav_name",body)


@app.get("/celery/running")
def is_celery_running():
    try:
        insp = celery.control.inspect(timeout=1)
        response = insp.ping()
        return {"running": bool(response)}
    except Exception:
        return {"running": False}
@app.get("/robot/nav/status")
def nav_status():
    with open("nav.json") as f:
        return json.load(f)

