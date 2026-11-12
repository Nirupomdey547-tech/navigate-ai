# Navigate AI — Navigation Engine & State-Space Reasoning

## 1. Environmental State-Space Graph

Environments are formalized as directed topological graphs:

$$G = (\mathcal{V}, \mathcal{E})$$

Where each node $v_i \in \mathcal{V}$ contains:
- `id`: Unique string identifier (e.g., `reception`, `conference_room_a`).
- `position`: Cartesian coordinates $(x, y, z)$ in meters.
- `room_type`: High-level room category (e.g. `Reception Lobby`, `Executive Suite`).
- `landmarks`: Visible landmark objects located within the room.
- `description`: Architectural and visual textual description.

Each directed edge $e = (u, v) \in \mathcal{E}$ contains:
- `source`, `target`: Connected node pairs.
- `distance`: Euclidean distance in meters.
- `direction`: Compass orientation (`north`, `south`, `east`, `west`, `forward`).
- `action`: Discrete action type required to traverse (`move_forward`, `turn_left`, `turn_right`).
- `accessibility`: Traversal permission (blocked doors or security clearance).

---

## 2. Agent State Representation

The agent maintains an explicit state $\mathcal{S}_t$:

```python
@dataclass
class AgentState:
    current_node_id: str
    previous_node_id: Optional[str]
    current_heading: float              # Degrees [0, 360)
    visited_nodes: Set[str]             # Loop detection
    remaining_waypoints: List[str]      # Sequential goal tracking
    current_objective: str
    distance_to_goal: float             # Geodesic shortest path length
    confidence: float                   # Calibrated confidence in [0, 1]
    uncertainty: float                  # 1.0 - confidence
    steps_taken: int
```

---

## 3. Discrete Action Space

The agent executes actions from the discrete space:

| Action | Description | Effect on State |
|---|---|---|
| `MOVE_TO_NODE` | Traverse directed edge to target node | Updates `current_node_id` & `current_heading` |
| `MOVE_FORWARD` | Move forward along current heading | Advances along aligned corridor |
| `TURN_LEFT` | Rotate heading -90° | Adjusts visual azimuth |
| `TURN_RIGHT` | Rotate heading +90° | Adjusts visual azimuth |
| `TURN_AROUND` | Rotate heading 180° | Inverts orientation |
| `STOP` | Terminate navigation episode | Ends episode; evaluates success |
| `WAIT` | Remain stationary | Maintains position |

---

## 4. Manual Intervention Override

Researchers can execute human interventions during navigation to force a transition to any accessible node. Interventions are recorded as overrides in the execution history and reflected in evaluation metrics.
