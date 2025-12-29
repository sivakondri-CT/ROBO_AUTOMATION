# robot_client.py

import requests
from config import BASE_URL, TIMEOUT

def get(path: str):
    r = requests.get(f"{BASE_URL}{path}", timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()

def post(path: str, body: dict | None = None):
    r = requests.post(f"{BASE_URL}{path}", json=body or {}, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()
