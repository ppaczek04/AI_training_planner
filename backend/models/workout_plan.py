from typing import List
from pydantic import BaseModel, Field

from backend.models.exercise import PlannedExercise
from backend.models.user_profile import UserProfile


class PlanMetadata(BaseModel):
    plan_name: str
    plan_type: str
    difficulty: str
    estimated_session_time_minutes: int


class WorkoutDay(BaseModel):
    day_number: int
    day_name: str
    focus: str
    exercises: List[PlannedExercise] = Field(default_factory=list)


class WorkoutPlan(BaseModel):
    user_profile: UserProfile
    plan_metadata: PlanMetadata
    days: List[WorkoutDay] = Field(default_factory=list)
    days_requested: int = 0
    days_generated: int = 0
    warnings: List[str] = Field(default_factory=list)