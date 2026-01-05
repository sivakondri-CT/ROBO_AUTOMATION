import requests
import config

def set_robot_host(ip: str):
    config.ROBOT_HOST = ip
    config.BASE_URL = f"http://{ip}"
    print(f"Robot host set to {config.BASE_URL}")

def _check_config():
    if not config.BASE_URL:
        raise RuntimeError("Robot IP not configured")

def get(path: str):
    _check_config()
    r = requests.get(f"{config.BASE_URL}{path}", timeout=config.TIMEOUT)
    r.raise_for_status()
    return r.json()

def post(path: str, body: dict ):
    _check_config()
    r = requests.post(f"{config.BASE_URL}{path}", json=body or {}, timeout=config.TIMEOUT)
    r.raise_for_status()
    return r.json()
