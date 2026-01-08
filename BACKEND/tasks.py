from celery_app import celery
# from robo_control import run_robo
import os
import subprocess
import shlex
import json

@celery.task(bind=True)
def run_robo_task(self,script_name: str, args: dict):
    print("args",args)
    robo_ip = args["robot_ip"]
    coordinate_data = args["coordinate_data"]["coordinate_data"]
    iteration = args["coordinate_data"]["iterations"]
    order=args['coordinate_data']['order']
    coordinate_data = {
        key: coordinate_data[key]
        for key in order
        if key in coordinate_data
    }
    coordinate_json = json.dumps(coordinate_data)
    print("coordinatedata",coordinate_data)
    cmd = "python3 robo_control.py --robot_ip {} --coordinate_data '{}' --iterations {}".format(robo_ip,coordinate_json,iteration)
    BASE_DIR=os.path.dirname(os.path.abspath(__file__))
    script_dir = BASE_DIR
    # process = subprocess.Popen(shlex.split(cmd), cwd=script_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    # 3️⃣ Set up logging
    print(cmd)
    instance_name = "2"
    result_dir = os.path.join(BASE_DIR, "results", instance_name)
    print("scriptdir",result_dir)
    os.makedirs(result_dir, exist_ok=True) 
    # 4️⃣ Run the subprocess
    stdout_log_path = os.path.join(result_dir, 'stdout.log')
    stderr_log_path = os.path.join(result_dir, 'stderr.log')

    # Run subprocess and stream logs in real-time
    with open(stdout_log_path, 'w') as out_log, open(stderr_log_path, 'w') as err_log:
        process = subprocess.Popen(
            shlex.split(cmd),
            cwd=script_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        # Stream stdout line by line
        for line in iter(process.stdout.readline, ''):
            if line:
                print(line.strip())          # prints to Celery worker console
                out_log.write(line)
                out_log.flush()

        # Stream stderr line by line
        for line in iter(process.stderr.readline, ''):
            if line:
                print("[ERR]", line.strip())
                err_log.write(line)
                err_log.flush()

        # Wait for process to complete
        # process.wait()

    print("Command finished:", cmd)

    return {
        "status": "completed",
        "returncode": process.returncode,
        "command": cmd
    }