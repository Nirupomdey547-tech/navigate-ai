"""
Database Seeding for Navigate AI.

Initializes default demo users, historical navigation runs, and benchmark experiments.
"""
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.user import User
from app.models.navigation import NavigationRun
from app.models.experiment import Experiment

logger = logging.getLogger(__name__)


async def seed_initial_data(db: AsyncSession) -> None:
    """Seed initial demo accounts and historical runs if database is empty."""
    # 1. Check if demo user exists
    user_res = await db.execute(select(User).where(User.email == "researcher@navigate.ai"))
    demo_user = user_res.scalar_one_or_none()

    if not demo_user:
        logger.info("Seeding demo researcher account (researcher@navigate.ai)...")
        demo_user = User(
            email="researcher@navigate.ai",
            username="researcher",
            hashed_password=get_password_hash("Researcher123!"),
            is_active=True,
            is_verified=True,
            settings={
                "theme": "dark",
                "default_language": "en",
                "default_environment": "office_floor",
            },
        )
        db.add(demo_user)
        await db.commit()
        await db.refresh(demo_user)

    # 2. Check if historical runs exist
    run_res = await db.execute(select(NavigationRun).limit(1))
    if not run_res.scalar_one_or_none():
        logger.info("Seeding sample historical runs for analytics...")
        sample_runs = [
            NavigationRun(
                user_id=demo_user.id,
                environment_id="office_floor",
                instruction="Walk straight forward past the reception desk, proceed through the central hub, and enter the executive office.",
                language="en",
                parsed_instruction={
                    "language": "en",
                    "initial_direction": "forward",
                    "landmarks": ["reception_desk", "central_hub", "executive_office"],
                    "destination": "executive_office",
                },
                start_node="reception",
                goal_node="executive_office",
                status="completed",
                success=1,
                action_sequence=[
                    {"action": "move_forward", "target_node_id": "corridor_south"},
                    {"action": "move_forward", "target_node_id": "central_hub"},
                    {"action": "move_forward", "target_node_id": "executive_office"},
                    {"action": "stop"},
                ],
                final_path=["reception", "corridor_south", "central_hub", "executive_office"],
                metrics={
                    "success": True,
                    "spl": 0.94,
                    "navigation_error": 0.0,
                    "ndtw": 0.98,
                    "sdtw": 0.98,
                    "path_length": 14.0,
                    "shortest_path_length": 14.0,
                    "steps": 3,
                },
                execution_time=2.4,
            ),
            NavigationRun(
                user_id=demo_user.id,
                environment_id="office_floor",
                instruction="रिसेप्शन डेस्क से सीधे आगे बढ़ें, गलियारे से होते हुए केंद्रीय हब को पार करें और अंत में कार्यकारी कार्यालय में प्रवेश करें।",
                language="hi",
                parsed_instruction={
                    "language": "hi",
                    "initial_direction": "forward",
                    "landmarks": ["रिसेप्शन", "हब", "कार्यालय"],
                    "destination": "executive_office",
                },
                start_node="reception",
                goal_node="executive_office",
                status="completed",
                success=1,
                action_sequence=[
                    {"action": "move_forward", "target_node_id": "corridor_south"},
                    {"action": "move_forward", "target_node_id": "central_hub"},
                    {"action": "move_forward", "target_node_id": "executive_office"},
                    {"action": "stop"},
                ],
                final_path=["reception", "corridor_south", "central_hub", "executive_office"],
                metrics={
                    "success": True,
                    "spl": 0.92,
                    "navigation_error": 0.0,
                    "ndtw": 0.97,
                    "sdtw": 0.97,
                    "path_length": 14.0,
                    "shortest_path_length": 14.0,
                    "steps": 3,
                },
                execution_time=2.6,
            ),
            NavigationRun(
                user_id=demo_user.id,
                environment_id="residential_apartment",
                instruction="Step forward through the entrance foyer, walk across the living room past the coffee table, and step out onto the balcony.",
                language="en",
                parsed_instruction={
                    "language": "en",
                    "initial_direction": "forward",
                    "landmarks": ["foyer", "living_room", "balcony"],
                    "destination": "balcony",
                },
                start_node="foyer",
                goal_node="balcony",
                status="completed",
                success=1,
                action_sequence=[
                    {"action": "move_forward", "target_node_id": "living_room"},
                    {"action": "move_forward", "target_node_id": "balcony"},
                    {"action": "stop"},
                ],
                final_path=["foyer", "living_room", "balcony"],
                metrics={
                    "success": True,
                    "spl": 0.98,
                    "navigation_error": 0.0,
                    "ndtw": 0.99,
                    "sdtw": 0.99,
                    "path_length": 8.5,
                    "shortest_path_length": 8.5,
                    "steps": 2,
                },
                execution_time=1.8,
            ),
            NavigationRun(
                user_id=demo_user.id,
                environment_id="hotel_corridor",
                instruction="Leave the elevator lobby, walk forward to the central rotunda, turn left into the North Wing corridor, and enter Presidential Suite 101.",
                language="en",
                parsed_instruction={
                    "language": "en",
                    "initial_direction": "turn_left",
                    "landmarks": ["elevator", "rotunda", "suite_101"],
                    "destination": "presidential_suite_101",
                },
                start_node="elevator_lobby",
                goal_node="presidential_suite_101",
                status="completed",
                success=1,
                action_sequence=[
                    {"action": "move_forward", "target_node_id": "central_rotunda"},
                    {"action": "turn_left", "target_node_id": "north_wing_corridor"},
                    {"action": "move_forward", "target_node_id": "presidential_suite_101"},
                    {"action": "stop"},
                ],
                final_path=["elevator_lobby", "central_rotunda", "north_wing_corridor", "presidential_suite_101"],
                metrics={
                    "success": True,
                    "spl": 0.91,
                    "navigation_error": 0.0,
                    "ndtw": 0.96,
                    "sdtw": 0.96,
                    "path_length": 13.0,
                    "shortest_path_length": 13.0,
                    "steps": 3,
                },
                execution_time=2.9,
            ),
        ]
        db.add_all(sample_runs)

        # Seed initial experiment
        sample_exp = Experiment(
            user_id=demo_user.id,
            name="RxR Baseline Evaluation — Multilingual Policy v1",
            environment_ids=["office_floor", "residential_apartment", "hotel_corridor"],
            instruction_ids=["en", "hi"],
            status="completed",
            config={
                "confidence_threshold": 0.65,
                "max_steps": 20,
                "model_config": {"encoder": "paraphrase-multilingual-MiniLM-L12-v2"},
            },
            results={
                "total_episodes": 12,
                "success_rate": 0.9167,
                "spl": 0.8845,
                "navigation_error": 0.42,
                "ndtw": 0.942,
                "sdtw": 0.893,
                "by_language": {
                    "en": {"total": 6, "success": 6, "success_rate": 1.0, "avg_spl": 0.932},
                    "hi": {"total": 6, "success": 5, "success_rate": 0.8333, "avg_spl": 0.837},
                },
            },
        )
        db.add(sample_exp)
        await db.commit()
