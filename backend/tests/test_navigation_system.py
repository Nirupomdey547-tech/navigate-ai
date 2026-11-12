"""
Automated Test Suite for Navigate AI:
- Multilingual Instruction Parsing (English & Hindi)
- Environment Graph Topology & Connectivity
- Instruction-Conditioned Decision Policy
- Uncertainty Estimation & Explanations
- Metric Calculations (SR, SPL, NE, nDTW, SDTW)
- Full End-to-End Navigation Execution Loop
"""
import pytest
from app.environments.service import get_environment_service
from app.language.instruction_parser import InstructionParser
from app.navigation.policy import NavigationPolicy
from app.navigation.state import AgentState
from app.navigation.actions import ActionType
from app.evaluation.metrics import spl, ndtw, sdtw
from app.services.navigation_service import get_navigation_service


def test_environments_loading():
    """Verify all 5 demo environments load with nodes, edges and valid graphs."""
    service = get_environment_service()
    envs = service.get_all_environments()
    assert len(envs) >= 5, f"Expected at least 5 environments, got {len(envs)}"

    expected_ids = {"office_floor", "residential_apartment", "hotel_corridor", "university_building", "multi_room_indoor"}
    loaded_ids = {e["id"] for e in envs}
    for eid in expected_ids:
        assert eid in loaded_ids, f"Environment {eid} missing"
        nav_env = service.get_nav_environment(eid)
        assert nav_env is not None
        assert len(nav_env.get_all_nodes()) >= 7
        assert len(nav_env.get_all_edges()) >= 6


def test_multilingual_instruction_parsing_english():
    """Test English instruction parsing."""
    parser = InstructionParser()
    text = "Walk forward down the corridor, turn left before the elevators, and enter Conference Room A."
    parsed = parser.parse(text, lang="en").to_dict()

    assert parsed["language"] == "en"
    assert parsed["initial_direction"] in ("forward", "turn_left")
    assert len(parsed["landmarks"]) > 0


def test_multilingual_instruction_parsing_hindi():
    """Test Hindi instruction parsing."""
    parser = InstructionParser()
    text = "सीधे गलियारे में आगे बढ़ें, सीढ़ियों के पास बाएं मुड़ें और रिसेप्शन डेस्क के सामने से गुजरते हुए आखिरी कमरे में जाएं।"
    parsed = parser.parse(text, lang="hi").to_dict()

    assert parsed["language"] == "hi"
    assert len(parsed["landmarks"]) > 0 or parsed["initial_direction"] != ""



def test_graph_pathfinding():
    """Verify Dijkstra / shortest path finding on office_floor."""
    service = get_environment_service()
    nav_env = service.get_nav_environment("office_floor")
    assert nav_env is not None

    path = nav_env.shortest_path("reception", "executive_office")
    assert len(path) >= 3
    assert path[0] == "reception"
    assert path[-1] == "executive_office"


def test_policy_scoring_and_action_selection():
    """Verify that policy selects valid actions towards destination."""
    service = get_environment_service()
    nav_env = service.get_nav_environment("office_floor")
    policy = NavigationPolicy()

    state = AgentState(
        current_node_id="reception",
        previous_node_id=None,
        current_heading=0.0,
        visited_nodes={"reception"},
        remaining_waypoints=["corridor_south", "executive_office"],
        current_objective="executive_office",
        distance_to_goal=nav_env.shortest_path_length("reception", "executive_office"),
        start_node_id="reception",
        goal_node_id="executive_office",
    )

    parsed = {
        "language": "en",
        "initial_direction": "forward",
        "landmarks": ["reception_desk", "notice_board"],
        "destination": "executive_office",
    }

    decision = policy.evaluate_step(
        state=state,
        environment=nav_env,
        parsed_instruction=parsed,
        destination_node_id="executive_office",
    )

    assert decision.selected_action is not None
    assert decision.confidence >= 0.5
    assert len(decision.candidate_scores) > 0
    assert decision.grounded_explanation != ""



def test_uncertainty_estimation_for_unreachable_landmark():
    """Verify uncertainty detection when an instruction references non-existent landmarks."""
    service = get_environment_service()
    nav_env = service.get_nav_environment("office_floor")
    policy = NavigationPolicy()

    state = AgentState(
        current_node_id="reception",
        current_heading=0.0,
        visited_nodes={"reception"},
        start_node_id="reception",
        goal_node_id="non_existent_node",
    )

    parsed = {
        "language": "en",
        "initial_direction": "forward",
        "landmarks": ["heliport_deck", "submarine_bay"],
        "destination": "non_existent_node",
    }

    decision = policy.evaluate_step(
        state=state,
        environment=nav_env,
        parsed_instruction=parsed,
        destination_node_id="non_existent_node",
    )

    assert decision.uncertainty_level in ("medium", "high")
    assert decision.confidence < 0.65


def test_evaluation_metrics_spl_and_dtw():
    """Verify SPL, nDTW, and SDTW metric computations."""
    results = [
        {"success": True, "shortest_path_length": 10.0, "agent_path_length": 10.0},
        {"success": False, "shortest_path_length": 10.0, "agent_path_length": 12.0},
    ]
    computed_spl = spl(results)
    assert 0.45 <= computed_spl <= 0.55

    # Test coordinate DTW
    agent_path = [[0.0, 0.0, 0.0], [0.0, 0.0, 5.0], [0.0, 0.0, 10.0]]
    ref_path = [[0.0, 0.0, 0.0], [0.0, 0.0, 5.0], [0.0, 0.0, 10.0]]
    val_ndtw = ndtw(agent_path, ref_path)
    val_sdtw = sdtw(agent_path, ref_path, success=True)
    assert val_ndtw > 0.95
    assert val_sdtw > 0.95


@pytest.mark.asyncio
async def test_end_to_end_navigation_service():
    """Test full sequential execution in NavigationService."""
    nav_service = get_navigation_service()

    start_payload = await nav_service.start_navigation(
        environment_id="office_floor",
        instruction="Walk forward through the corridor to the executive office.",
        language="en",
    )

    run_id = start_payload["run_id"]
    assert run_id != ""

    # Execute steps until finished or step limit
    is_done = False
    success = False
    for _ in range(10):
        step_res = await nav_service.step_navigation(run_id=run_id)
        if step_res.get("is_done"):
            is_done = True
            success = step_res.get("success", False)
            break

    assert is_done, "Agent should complete navigation within step limit"
    assert success, "Agent should reach executive office"
