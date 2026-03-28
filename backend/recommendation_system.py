import json
import random
from pathlib import Path
from typing import List, Dict, Optional

from backend.models.exercise import ExerciseDefinition, PlannedExercise
from backend.models.user_profile import UserProfile
from backend.models.workout_plan import WorkoutPlan, WorkoutDay, PlanMetadata


def load_exercises() -> List[ExerciseDefinition]:
    """Load all exercises from exercises.json"""
    exercises_path = Path(__file__).parent / "data" / "exercises.json"
    with open(exercises_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [ExerciseDefinition(**ex) for ex in data]


def load_latest_survey() -> Optional[Dict]:
    """Load the most recent survey from surveys.json"""
    surveys_path = Path(__file__).parent.parent / "surveys.json"

    if not surveys_path.exists():
        return None

    with open(surveys_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not data.get("surveys"):
        return None

    # Get the latest survey (last in the list)
    return data["surveys"][-1]


def filter_exercises_by_equipment(
    exercises: List[ExerciseDefinition],
    available_equipment: List[str]
) -> List[ExerciseDefinition]:
    """
    Filter exercises based on available equipment.
    An exercise is available only if ALL required equipment is available.
    """
    filtered = []
    for exercise in exercises:
        # Check if all required equipment is available
        if all(eq in available_equipment for eq in exercise.equipment):
            filtered.append(exercise)
    return filtered


def filter_exercises_by_difficulty(
    exercises: List[ExerciseDefinition],
    experience_level: str
) -> List[ExerciseDefinition]:
    """
    Filter exercises based on user experience level.
    - beginner: only beginner difficulty exercises
    - intermediate: beginner + intermediate difficulty exercises
    - advanced: all exercises
    """
    if experience_level == "beginner":
        return [ex for ex in exercises if ex.difficulty == "beginner"]
    elif experience_level == "intermediate":
        return [ex for ex in exercises if ex.difficulty in ["beginner", "intermediate"]]
    else:  # advanced
        return exercises


def select_exercises_for_day(
    available_exercises: List[ExerciseDefinition],
    exercises_per_day: int = 8
) -> List[ExerciseDefinition]:
    """
    Select exercises for a training day, trying to balance muscle groups.
    """
    if len(available_exercises) <= exercises_per_day:
        return available_exercises

    # Group exercises by primary muscle
    muscle_groups = {}
    for ex in available_exercises:
        primary = ex.primary_muscle
        if primary not in muscle_groups:
            muscle_groups[primary] = []
        muscle_groups[primary].append(ex)

    # Try to pick exercises from different muscle groups
    selected = []
    muscle_list = list(muscle_groups.keys())
    random.shuffle(muscle_list)

    # First pass: one exercise per muscle group
    for muscle in muscle_list:
        if len(selected) >= exercises_per_day:
            break
        if muscle_groups[muscle]:
            selected.append(random.choice(muscle_groups[muscle]))

    # Second pass: fill remaining slots
    if len(selected) < exercises_per_day:
        remaining = [ex for ex in available_exercises if ex not in selected]
        random.shuffle(remaining)
        needed = exercises_per_day - len(selected)
        selected.extend(remaining[:needed])

    return selected


def create_planned_exercise(
    exercise_def: ExerciseDefinition,
    experience_level: str
) -> PlannedExercise:
    """
    Convert ExerciseDefinition to PlannedExercise with sets/reps based on experience level.
    """
    if experience_level == "beginner":
        sets = 3
        reps = "10-12"
        rest = 60
    elif experience_level == "intermediate":
        sets = 4
        reps = "8-10"
        rest = 90
    else:  # advanced
        sets = 4
        reps = "6-8"
        rest = 120

    return PlannedExercise(
        name=exercise_def.name,
        sets=sets,
        reps=reps,
        rest_seconds=rest
    )


def generate_workout_plan_from_survey() -> Optional[WorkoutPlan]:
    """
    Main function: Generate a workout plan based on the latest survey response.
    """
    # Load survey data
    survey = load_latest_survey()
    if not survey:
        print("No survey data found!")
        return None

    # Create UserProfile from survey
    user_profile = UserProfile(
        sex=survey["sex"].lower(),
        age=survey["age"],
        height_cm=survey["height"],
        weight_kg=survey["weight"],
        experience_level=survey["experienceLevel"],
        days_per_week=survey["daysPerWeek"],
        available_equipment=survey.get("availableEquipment", [])
    )

    # Load and filter exercises
    all_exercises = load_exercises()

    # Filter by equipment
    filtered_by_equipment = filter_exercises_by_equipment(
        all_exercises,
        user_profile.available_equipment
    )

    # Filter by difficulty
    filtered_exercises = filter_exercises_by_difficulty(
        filtered_by_equipment,
        user_profile.experience_level
    )

    print(f"Total exercises: {len(all_exercises)}")
    print(f"After equipment filter: {len(filtered_by_equipment)}")
    print(f"After difficulty filter: {len(filtered_exercises)}")

    if not filtered_exercises:
        print("No exercises available with current equipment and experience level!")
        return None

    # Determine exercises per day
    exercises_per_day = min(8, len(filtered_exercises))

    # Create workout days
    days = []
    for day_num in range(1, user_profile.days_per_week + 1):
        # Select exercises for this day
        selected_exercises = select_exercises_for_day(filtered_exercises, exercises_per_day)

        # Convert to PlannedExercise
        planned_exercises = [
            create_planned_exercise(ex, user_profile.experience_level)
            for ex in selected_exercises
        ]

        # Create workout day
        workout_day = WorkoutDay(
            day_number=day_num,
            day_name=f"Day {day_num}",
            focus="full_body",
            exercises=planned_exercises
        )
        days.append(workout_day)

    # Create plan metadata
    plan_metadata = PlanMetadata(
        plan_name=f"{user_profile.days_per_week}-Day Training Plan",
        plan_type="rule_based",
        difficulty=user_profile.experience_level,
        estimated_session_time_minutes=60
    )

    # Create workout plan
    workout_plan = WorkoutPlan(
        user_profile=user_profile,
        plan_metadata=plan_metadata,
        days=days
    )

    return workout_plan
