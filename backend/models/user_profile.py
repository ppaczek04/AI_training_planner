from typing import List
from pydantic import BaseModel, Field, field_validator


class UserProfile(BaseModel):
    sex: str
    age: int
    height_cm: int
    weight_kg: int
    experience_level: str
    days_per_week: int
    available_equipment: List[str] = Field(default_factory=list)

    @field_validator("sex")
    @classmethod
    def validate_sex(cls, value: str):
        if value not in {"male", "female", "other"}:
            raise ValueError("sex must be 'male', 'female', or 'other'")
        return value

    @field_validator("experience_level")
    @classmethod
    def validate_level(cls, value: str):
        if value not in {"beginner", "intermediate", "advanced"}:
            raise ValueError("invalid experience_level")
        return value

    @field_validator("days_per_week")
    @classmethod
    def validate_days(cls, value: int):
        if not (1 <= value <= 5):
            raise ValueError("days_per_week must be 1–5")
        return value