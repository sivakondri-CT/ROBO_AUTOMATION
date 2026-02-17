from lf_base_robo import RobotClass
import time
import os
import json
import argparse
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def duration_to_seconds(duration):
    
    if isinstance(duration, (int, float)):
        return float(duration*60)

    if not isinstance(duration, str):
        return 0.0
    duration = duration.strip().lower()
    if duration.endswith("s"):
        return float(duration[:-1])
    elif duration.endswith("m"):
        return float(duration[:-1]) * 60
    elif duration.endswith("h"):
        return float(duration[:-1]) * 3600

    try:
        return float(duration) * 60
    except ValueError:
        return 0.0
    
def is_stopped(json_path):
    try:
        with open(json_path, "r") as f:
            data = json.load(f)
        return data.get("status") == "Stopped"
    except Exception:
        return False
    
def main():
    parser=argparse.ArgumentParser()

    parser.add_argument('--robot_ip',required=True,help='hostname for where Robot server is running')
    parser.add_argument("--coordinate_data",required=True,help="JSON string containing coordinate data")
    parser.add_argument("--min_battery",type=int,default=20,help="Minimum battery level (default: 20)")
    parser.add_argument("--max_battery",type=int,default=100,help="Maximum battery level (default: 100)")
    parser.add_argument("--timeout",type=int,default=60,help="Timeout for robot actions in seconds (default: 30)")
    parser.add_argument("--iterations",type=int,default=1,help="Number of times to iterate through coordinates (default: 1)"
    )
    args = parser.parse_args()
    print("args are given below",args)
    robot = RobotClass(robo_ip=args.robot_ip,min_battery=args.min_battery,max_battery=args.max_battery,time_to_reach=args.timeout)
    try:
        coordinate_data = json.loads(args.coordinate_data)
    except json.JSONDecodeError as e:
        raise ValueError("Invalid JSON passed to --coordinate_data") from e
    print(type(coordinate_data))
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(BASE_DIR, "nav.json")
    robot.nav_data_path=json_path
    robot.runtime_dir=BASE_DIR
    abort_all = False
    with open(json_path, "w") as f:
        json.dump({"prev": None, "current": None}, f)
    for iteration in range(args.iterations):
        if is_stopped(json_path):
            logging.info("Test is stopped by user")
            break
        for _, data in coordinate_data.items():
            coord=data.get("coord")
            print("coord",coord)
            print("data",data)
            if is_stopped(json_path):
                logging.info("Test is stopped by user")
                abort_all = True
                break
            rotation = data.get("angle","")
            if isinstance(rotation, list):
                # If list like ["60,180"] or ["60", "180"]
                angles = []
                for a in rotation:
                    try:
                        angles.append(int(a))
                    except (ValueError, TypeError):
                        continue
                rotation=angles
            else:
                rotation = rotation.split(",")

            logging.info(f"rotation {rotation}")
            duration = data.get("duration", 0)
            if duration!=0:
                duration =duration_to_seconds(duration)
            logging.info("checking for battery")
            pause,stopped=robot.wait_for_battery()
            if stopped:
                abort_all=True
                break
            # logging.info(f"Moving to point {coord}")
            matched,abort = robot.move_to_coordinate(coord=coord)
            print("abort",abort)
            if abort:
                abort_all=True
                break
            if matched:
                logging.info(f"Reached point {coord}")  
                if isinstance(rotation, list) and any(rotation):
                    for angle in rotation:
                        pause,stopped=robot.wait_for_battery()
                        if stopped:
                            abort_all=True
                            break
                        rotated=robot.rotate_angle(angle)
                        if rotated:
                            logging.info(f"waiting for duration {duration} seconds")
                            time.sleep(duration)
                        else:
                            continue
                else:
                    if(duration!=0):
                        logging.info(f"waiting for duration {duration} seconds")
                        time.sleep(duration)
                    else:
                        continue
                        
        if abort_all:
            break
    with open(json_path, "w") as f:
        json.dump({}, f)
    logging.info("Test completed")

if __name__ == "__main__":
    main()