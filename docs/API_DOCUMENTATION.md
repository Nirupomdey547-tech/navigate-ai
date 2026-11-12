# Navigate AI — REST & WebSocket API Specification

## Base URL
- Development: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Interactive ReDoc: `http://localhost:8000/redoc`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Create a new user account.
```json
{
  "email": "user@example.com",
  "username": "researcher1",
  "password": "SecurePassword123!"
}
```
**Response (201 Created)**:
```json
{
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG...",
  "token_type": "Bearer"
}
```

### `POST /api/auth/login`
Authenticate with email and password.
```json
{
  "email": "researcher@navigate.ai",
  "password": "Researcher123!"
}
```

### `GET /api/auth/me`
Retrieve authenticated researcher profile. Requires `Authorization: Bearer <token>`.

---

## 2. Environments Endpoints

### `GET /api/environments`
List all accessible environments with node and edge counts.

### `GET /api/environments/{env_id}`
Retrieve complete environment graph with 3D node coordinates, room types, landmarks, and edges.

### `GET /api/environments/{env_id}/instructions`
Retrieve curated multilingual instructions for the environment.

### `POST /api/environments`
Register a new custom graph environment.

---

## 3. Navigation Endpoints

### `POST /api/navigation/start`
Start an interactive navigation run.
```json
{
  "environment_id": "office_floor",
  "instruction": "Walk forward through the corridor, turn left into Conference Room A.",
  "language": "en",
  "start_node": "reception",
  "goal_node": "conference_room_a"
}
```
**Response**:
```json
{
  "run_id": "run_1710000000",
  "environment_id": "office_floor",
  "state": {
    "current_node_id": "reception",
    "current_heading": 0.0,
    "visited_nodes": ["reception"],
    "distance_to_goal": 8.0,
    "confidence": 0.95
  }
}
```

### `POST /api/navigation/{run_id}/step`
Execute a single sequential decision step. Returns candidate actions, scores, grounded explanation, and updated agent state.

### `POST /api/navigation/{run_id}/pause`
Pause automatic execution.

### `POST /api/navigation/{run_id}/resume`
Resume paused execution.

### `POST /api/navigation/{run_id}/stop`
Terminate navigation run and compute final RxR evaluation metrics.

### `POST /api/navigation/{run_id}/reset`
Reset agent position back to start node.

### `POST /api/navigation/{run_id}/intervene`
Execute manual researcher override:
```json
{
  "run_id": 1,
  "action_type": "move_to_node",
  "target_node": "conference_room_a"
}
```

---

## 4. Agent Endpoints

### `POST /api/agent/parse-instruction`
Parse instruction text into structured representation.

### `POST /api/agent/observe`
Retrieve 360° viewpoint sensory observations and visual features at a specific node.

### `GET /api/agent/status`
Retrieve status of all AI pipeline modules and device accelerators.

---

## 5. WebSocket Live Streaming

### `WebSocket /ws/navigation/{run_id}`
Streams real-time JSON navigation events:
- `navigation_started`
- `candidate_actions`
- `uncertainty_detected`
- `action_selected`
- `movement_completed`
- `state_updated`
- `navigation_completed`
- `navigation_failed`
