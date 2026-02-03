

## System Architecture

```
Frontend (React)
   ↓ REST APIs
Backend (FastAPI)
   ↓ Task Queue
Celery Worker
   ↓
Robot Control Script
```

**Redis** is used as the message broker for Celery.

---

## Supported OS

* Ubuntu **20.04**
* Ubuntu **22.04** ✅ (Recommended)

---

## Requirements

### System

* Python **3.10+**
* pip
* Node.js **v20.x**
* npm **v10.x+**
* Redis Server

---

## Python Dependencies

Installed automatically via `requirements.txt`

* fastapi
* uvicorn
* requests
* pydantic
* celery

---

## Python Virtual Environment

### Step 1: Create & Activate venv

python3 -m venv venv
source venv/bin/activate


> ⚠️ Keep the virtual environment active for **Backend & Celery**

---

## Frontend Setup (Terminal 1)

### Step 2: Frontend

```bash
node -v
npm -v
```

Recommended:

* Node.js **v20.x**
* npm **v10.x+**

If outdated, install using **nvm**:

```bash
sudo apt install curl -y
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
```

Install dependencies & start UI:

```bash
npm install
npm run dev
```

UI runs at:

```
http://localhost:5173
```

---

## Backend Setup (Terminal 2)

### Step 3: FastAPI Backend

```bash
cd ROBO_AUTOMATION/BACKEND
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at:

```
http://localhost:8000
```

---

## Celery Worker (Terminal 3)

### Step 4: Celery Worker

```bash
cd ROBO_AUTOMATION/BACKEND
celery -A celery_app worker --loglevel=info
```

---

## Running Services Summary

| Service  | Command                       | Status / URL                                   |
| -------- | ----------------------------- | ---------------------------------------------- |
| Frontend | `npm run dev`                 | [http://localhost:5173](http://localhost:5173) |
| Backend  | `uvicorn main:app --reload`   | [http://localhost:8000](http://localhost:8000) |
| Celery   | `celery -A celery_app worker` | Terminal running                               |
| Redis    | `redis-server`                | Background service                             |

---

## Robot Connection Flow

1. User enters **Robot IP** in UI
2. Backend validates via:

   ```
   GET http://<robot-ip>/reeman/hostname
   ```
3. If reachable → UI switches to **Connected Mode**
4. Global Header controls become active

---

## Core APIs Used

### 1️⃣ Robot Hostname

```
GET http://<host>/reeman/hostname
```

Used to validate robot availability.

---

### 2️⃣ Battery Status

```
GET http://<host>/reeman/base_encode
```

Response:

```json
{
  "battery": 100,
  "chargeFlag": 1,
  "emergencyButton": 0
}
```

---

### 3️⃣ Navigation Status

```
GET http://<host>/reeman/nav_status
```

Response:

```json
{
  "res": 3,
  "reason": 0,
  "goal": "A",
  "dist": 1.8,
  "mileage": 2.3
}
```

| Field   | Meaning                      |
| ------- | ---------------------------- |
| res     | Navigation phase             |
| goal    | Target coordinate / waypoint |
| dist    | Distance to goal             |
| mileage | Distance traveled            |

---

### 4️⃣ Navigate to Named Point

```
POST http://<host>/cmd/nav_name
```

Payload:

```json
{ "point": "A" }
```

---

### 5️⃣ Cancel Navigation

```
POST http://<host>/cmd/cancel_goal
```

Payload:

```json
{}
```

---

### 6️⃣ List Available Maps

```
GET http://<host>/reeman/history_map
```

Used when creating floors.

---

### 7️⃣ Apply Map

```
POST http://<host>/cmd/apply_map
```

Payload:

```json
{ "name": "map_name" }
```

---

### 8️⃣ Waypoints List

```
GET http://<host>/reeman/position
```

Response:

```json
{
  "waypoints": [
    {
      "name": "1",
      "type": "delivery",
      "pose": { "x": -2.06, "y": 0.77, "theta": 0.19 }
    }
  ]
}
```

---

### 9️⃣ Robot Pose

```
GET http://<host>/reeman/pose
```

Response:

```json
{
  "x": 297,
  "y": 251,
  "theta": 0.97
}
```

---

### 🔟 Manual Speed Control

```
POST http://localhost/cmd/speed
```

Payload:

```json
{
  "vx": 0.3,
  "vth": 0.5
}
```

| Field | Meaning          |
| ----- | ---------------- |
| vx    | Linear velocity  |
| vth   | Angular velocity |

---

## Scenario Execution

### Scenario Flow

1. User selects **Scenario**
2. UI shows ordered coordinates
3. Optional:

   * Iterations
   * Cycle path
   * Custom coordinate order
4. Scenario is sent to backend
5. Backend triggers Celery task
6. Celery executes robot script
7. Logs stored under:

   ```
   BACKEND/results/<scenario-name>/
   ```

---

## Common Issues & Fixes

### npm install fails

✔ Upgrade Node using nvm

---

### Redis connection error

✔ Ensure Redis is running:

```bash
sudo systemctl status redis
```

---

## Notes

* Use **three terminals**

  * Terminal 1 → Frontend
  * Terminal 2 → Backend
  * Terminal 3 → Celery
* Do **not deactivate venv** while backend or celery is running

---

## Compatibility

* Ubuntu 20.04
* Ubuntu 22.04 ✅
* Works reliably on modern Linux systems

---

