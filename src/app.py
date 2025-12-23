from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import time
import math

app = Flask(__name__)
CORS(app)  # allow React (localhost:5173 or 3000) to call this API

# ---- Global simulated robot state ----
state = {
    "pose": {"x": 0.0, "y": 0.0, "theta": 0.0},  # current robot position
    "targets": [],        # list of {"id": n, "x": , "y": }
    "current_index": 0,   # which target we are going to
    "status": "idle"      # "idle" | "moving" | "stopped" | "completed"
}

state_lock = threading.Lock()


def distance(a, b):
    """Euclidean distance between two points."""
    return math.hypot(a["x"] - b["x"], a["y"] - b["y"])


def robot_simulation_loop():
    """
    Background loop that simulates robot movement towards current target.
    Runs in a separate thread.
    """
    step_size = 20  # pixels per tick (adjust to make it faster/slower)
    tick = 0.1      # seconds per tick

    while True:
        time.sleep(tick)

        with state_lock:
            if state["status"] != "moving" or not state["targets"]:
                continue

            pose = state["pose"]
            idx = state["current_index"]

            if idx >= len(state["targets"]):
                # No more targets
                state["status"] = "completed"
                continue

            target = state["targets"][idx]
            dx = target["x"] - pose["x"]
            dy = target["y"] - pose["y"]
            dist = math.hypot(dx, dy)

            # If we're close enough to the target, move to next
            arrive_threshold = 10  # pixels
            if dist <= arrive_threshold:
                if idx + 1 < len(state["targets"]):
                    state["current_index"] += 1
                else:
                    state["status"] = "completed"
                continue

            # Move towards the target
            if dist > 0:
                ratio = min(step_size, dist) / dist
                new_x = pose["x"] + dx * ratio
                new_y = pose["y"] + dy * ratio
                theta = math.atan2(dy, dx)  # facing direction

                state["pose"] = {"x": new_x, "y": new_y, "theta": theta}


# Start background simulation thread
sim_thread = threading.Thread(target=robot_simulation_loop, daemon=True)
sim_thread.start()


# ---------- API ENDPOINTS ----------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/pose", methods=["GET"])
def get_pose():
    """Current simulated robot position."""
    with state_lock:
        return jsonify({
            "pose": state["pose"],
            "status": state["status"],
            "current_target_index": state["current_index"],
            "total_targets": len(state["targets"])
        })


@app.route("/status", methods=["GET"])
def get_status():
    """High-level status info."""
    with state_lock:
        current_target = None
        if 0 <= state["current_index"] < len(state["targets"]):
            current_target = state["targets"][state["current_index"]]

        return jsonify({
            "status": state["status"],
            "current_target": current_target,
            "targets": state["targets"]
        })


@app.route("/navigate", methods=["POST"])
def navigate():
    """
    Start navigation through a list of coordinates.
    Expected JSON:
    {
      "coords": [
        {"id": 1, "x": 120, "y": 300},
        {"id": 2, "x": 450, "y": 200}
      ],
      "start_pose": {"x": 0, "y": 0}  # optional
    }
    """
    data = request.get_json(silent=True) or {}
    coords = data.get("coords", [])
    start_pose = data.get("start_pose")

    if not coords:
        return jsonify({"error": "coords array is required"}), 400

    # Optional: sort by id so robot always follows 1,2,3,... order
    coords_sorted = sorted(coords, key=lambda c: c.get("id", 0))

    with state_lock:
        if start_pose:
            state["pose"] = {
                "x": float(start_pose.get("x", 0.0)),
                "y": float(start_pose.get("y", 0.0)),
                "theta": 0.0
            }

        state["targets"] = [
            {"id": c.get("id"), "x": float(c["x"]), "y": float(c["y"])}
            for c in coords_sorted
        ]
        state["current_index"] = 0
        state["status"] = "moving"

    return jsonify({
        "status": "moving",
        "targets_count": len(coords_sorted),
        "message": "Navigation started"
    }), 200


@app.route("/stop", methods=["POST"])
def stop():
    """Stop robot movement."""
    with state_lock:
        state["status"] = "stopped"
    return jsonify({"status": "stopped"}), 200


@app.route("/reset", methods=["POST"])
def reset():
    """Reset robot to idle, clear targets."""
    with state_lock:
        state["pose"] = {"x": 0.0, "y": 0.0, "theta": 0.0}
        state["targets"] = []
        state["current_index"] = 0
        state["status"] = "idle"
    return jsonify({"status": "idle"}), 200


if __name__ == "__main__":
    # Run on localhost:5000 by default
    app.run(host="0.0.0.0", port=5000, debug=True)
