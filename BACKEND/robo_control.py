from lf_base_robo import RobotClass
import time
import os
import json
import argparse

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
    parser.add_argument("--iterations",type=int,default=1,help="Number of times to iterate through coordinates (default: 1)"
    )
    args = parser.parse_args()
    robot = RobotClass(robo_ip=args.robot_ip)
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
            print("Test is stopped by user")
            break
        for coord , data in coordinate_data.items():
            print("coord",coord)
            print("data",data)
            if is_stopped(json_path):
                print("Test is stopped by user")
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

            print("rotation",rotation)
            duration = data.get("duration", 0)
            if duration!=0:
                duration =duration_to_seconds(duration)
            print("checking for battery")
            pause,stopped=robot.wait_for_battery()
            if stopped:
                abort_all=True
                break
            print("Moving to point",coord)
            matched,abort = robot.move_to_coordinate(coord=coord)
            print("abort",abort)
            if abort:
                abort_all=True
                break
            if matched:
                print("Reached point",coord)
                if isinstance(rotation, list) and any(rotation):
                    for angle in rotation:
                        pause,stopped=robot.wait_for_battery()
                        if stopped:
                            abort_all=True
                            break
                        rotated=robot.rotate_angle(angle)
                        if rotated:
                            print("waiting for duration",duration)
                            time.sleep(duration)
                        else:
                            continue
                else:
                    if(duration!=0):
                        print("waiting for duration",duration)
                        time.sleep(duration)
                    else:
                        continue
                        
        if abort_all:
            break
    with open(json_path, "w") as f:
        json.dump({}, f)
    print("TEST COMPLETED .......")

if __name__ == "__main__":
    main()