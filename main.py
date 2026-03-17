from backend.models.user_profile import UserProfile
from backend.models.workout_plan import PlanMetadata, WorkoutDay, WorkoutPlan
from backend.models.exercise import PlannedExercise
from backend.openai_service import describe_workout_plan


user_profile = UserProfile(
    sex="male",
    age=22,
    height_cm=180,
    weight_kg=78,
    experience_level="beginner",
    days_per_week=4,
    available_equipment=["barbell", "dumbbell", "bench", "machine", "cable_machine"]
)

plan_metadata = PlanMetadata(
    plan_name="4-Day Upper Lower Split",
    plan_type="upper_lower",
    difficulty="beginner",
    estimated_session_time_minutes=60
)

days = [
    WorkoutDay(
        day_number=1,
        day_name="Upper A",
        focus="chest_back_shoulders_arms",
        exercises=[
            PlannedExercise(name="Bench Press", sets=4, reps="6-8", rest_seconds=120),
            PlannedExercise(name="Lat Pulldown", sets=4, reps="8-10", rest_seconds=90),
            PlannedExercise(name="Seated Dumbbell Shoulder Press", sets=3, reps="8-10", rest_seconds=90),
        ]
    )
]

training_plan = WorkoutPlan(
    user_profile=user_profile,
    plan_metadata=plan_metadata,
    days=days
)


if __name__ == "__main__":

    plan_dict = training_plan.model_dump()
    result = describe_workout_plan(plan_dict)

    print("\n===== AI DESCRIPTION =====\n")
    print(result)

    with open("AI_output.txt", "w", encoding="utf-8") as file:
        file.write(result)
