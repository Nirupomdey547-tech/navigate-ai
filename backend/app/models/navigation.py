from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class NavigationRun(Base):
    __tablename__ = "navigation_runs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    environment_id = Column(String, nullable=False)
    instruction = Column(Text, nullable=False)
    language = Column(String, default="en")
    parsed_instruction = Column(JSON, default=dict)
    start_node = Column(String, nullable=True)
    goal_node = Column(String, nullable=True)

    # Status: pending | running | paused | completed | failed
    status = Column(String, default="pending", nullable=False, index=True)

    action_sequence = Column(JSON, default=list)
    state_history = Column(JSON, default=list)
    final_path = Column(JSON, default=list)
    success = Column(Integer, nullable=True)  # 1=success, 0=fail, None=ongoing
    metrics = Column(JSON, default=dict)
    execution_time = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="navigation_runs")
    actions = relationship("NavigationAction", back_populates="run", lazy="select")
    observations = relationship(
        "NavigationObservation", back_populates="run", lazy="select"
    )


class NavigationAction(Base):
    __tablename__ = "navigation_actions"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(
        Integer, ForeignKey("navigation_runs.id"), nullable=False, index=True
    )
    step = Column(Integer, nullable=False)
    action_type = Column(String, nullable=False)
    target_node = Column(String, nullable=True)
    score = Column(Float, nullable=True)
    components = Column(JSON, default=dict)
    explanation = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    run = relationship("NavigationRun", back_populates="actions")


class NavigationObservation(Base):
    __tablename__ = "navigation_observations"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(
        Integer, ForeignKey("navigation_runs.id"), nullable=False, index=True
    )
    step = Column(Integer, nullable=False)
    node_id = Column(String, nullable=False)
    observation = Column(JSON, default=dict)
    uncertainty_report = Column(JSON, default=dict)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    run = relationship("NavigationRun", back_populates="observations")

