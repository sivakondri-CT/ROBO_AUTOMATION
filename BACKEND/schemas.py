# schemas.py

from pydantic import BaseModel

class Pose(BaseModel):
    x: float
    y: float
    theta: float

class NavByName(BaseModel):
    point: str

class Speed(BaseModel):
    vx: float
    vth: float

class MaxSpeed(BaseModel):
    speed: float

class Charge(BaseModel):
    type: int
    point: str 
class RobotConfig(BaseModel):
    ip: str
