from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from schemas import Pose, NavByName, Speed, MaxSpeed, Charge
from robot_client import get, post
from storage import load_data, save_data, merge_layout

from pathlib import Path
import shutil
import uuid


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
    return get("/reeman/history_map")

@app.post("/robot/map/save")
def save_map():
    return post("/cmd/save_map")

@app.post("/robot/map/apply")
def apply_map(name: dict):
    return post("/cmd/apply_map", name)
