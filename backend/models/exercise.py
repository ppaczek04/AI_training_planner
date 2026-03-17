from typing import List
from pydantic import BaseModel


class ExerciseDefinition(BaseModel):
    name: str
    muscle_groups: List[str]
    primary_muscle: str
    equipment: List[str]
    difficulty: str
    suitable_levels: List[str]


class PlannedExercise(BaseModel):
    name: str
    sets: int
    reps: str
    rest_seconds: int