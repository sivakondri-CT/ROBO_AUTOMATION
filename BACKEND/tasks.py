from celery_app import celery
# from robo_control import run_robo
import os
import subprocess
import shlex
import json
from subprocess import Popen, PIPE, STDOUT
import sys

@celery.task(bind=True)
def run_robo_task(self,script_name: str, args: dict):
    print("args",args)
    robo_ip = args["robot_ip"]
    coordinate_data = args["coordinate_data"]["coordinate_data"]
    iteration = args["coordinate_data"]["iterations"]
    order=args['coordinate_data']['order']
    name = args['coordinate_data']['name']
    coordinate_data = coordinate_data
    coordinate_json = json.dumps(coordinate_data)
    print("coordinatedata",coordinate_data)
    cmd = " python3 -u robo_control.py --robot_ip {} --coordinate_data '{}' --iterations {}".format(robo_ip,coordinate_json,iteration)
    BASE_DIR=os.path.dirname(os.path.abspath(__file__))
    script_dir = BASE_DIR
    # process = subprocess.Popen(shlex.split(cmd), cwd=script_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    # 3️⃣ Set up logging
    print(cmd)
    instance_name = name
    result_dir = os.path.join(BASE_DIR, "results", instance_name)
    print("scriptdir",result_dir)
    os.makedirs(result_dir, exist_ok=True) 
    # 4️⃣ Run the subprocess
    stdout_log_path = os.path.join(result_dir, 'stdout.log')
    stderr_log_path = os.path.join(result_dir, 'stderr.log')
    print("resultdir",result_dir)
    with open(stdout_log_path, "w") as out, open(stderr_log_path, "w") as err:
        sp = Popen(
            shlex.split(cmd),
            cwd=BASE_DIR,
            stdin=PIPE,
            stdout=out,
            stderr=err,
            bufsize=0,
            universal_newlines=True
        )
        (out,err) = sp.communicate() 

    print("Command finished:", cmd)

    