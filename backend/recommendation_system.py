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


def load_split_templates() -> Dict:
    """Load split templates from split_templates.json"""
    templates_path = Path(__file__).parent / "data" / "split_templates.json"
    with open(templates_path, "r", encoding="utf-8") as f:
        return json.load(f)


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
    An exercise is available only if ALL required equipment is available,
    OR if it requires no specific equipment (empty equipment list).
    """
    filtered = []
    for exercise in exercises:
        # If exercise has no equipment requirement, always include it
        if not exercise.equipment:
            filtered.append(exercise)
        # Otherwise check if all required equipment is available
        elif all(eq in available_equipment for eq in exercise.equipment):
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


def select_split_strategy(days_per_week: int) -> str:
    """Select optimal split strategy based on training days per week"""
    if days_per_week == 1:
        return "full_body"
    elif days_per_week == 2:
        return "full_body_ab"
    elif days_per_week == 3:
        return "push_pull_legs"
    elif days_per_week == 4:
        return "upper_lower"
    elif days_per_week == 5:
        return "push_pull_legs_extended"
    else:
        return "full_body"


def get_exercises_for_muscle_group(
    exercises: List[ExerciseDefinition],
    muscle_group: str,
    already_selected: List[str]
) -> List[ExerciseDefinition]:
    """
    Get available exercises for a specific muscle group,
    excluding already selected exercises.
    """
    available = [
        ex for ex in exercises
        if ex.primary_muscle == muscle_group and ex.name not in already_selected
    ]
    return available


def select_exercises_for_day(
    available_exercises: List[ExerciseDefinition],
    muscle_groups_template: Dict[str, int],
    already_selected: List[str]
) -> List[ExerciseDefinition]:
    """
    Select exercises for a training day based on muscle group template.
    muscle_groups_template: {"chest": 2, "back": 2, "biceps": 1, ...}
    Returns list of selected exercises.
    """
    selected = []

    # For each muscle group in template, select the required number of exercises
    for muscle_group, count in muscle_groups_template.items():
        available_for_muscle = get_exercises_for_muscle_group(
            available_exercises, muscle_group, already_selected
        )

        # Select up to 'count' exercises from this muscle group
        to_select = min(count, len(available_for_muscle))
        selected_for_muscle = random.sample(available_for_muscle, to_select)

        selected.extend(selected_for_muscle)
        # Track selected exercises to avoid duplicates within the day
        already_selected.extend([ex.name for ex in selected_for_muscle])

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
    Uses split strategy and muscle group templates for intelligent exercise selection.
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
        height_cm=int(round(survey["height"])),
        weight_kg=survey["weight"],
        experience_level=survey["experienceLevel"],
        days_per_week=survey["daysPerWeek"],
        available_equipment=survey.get("availableEquipment", [])
    )

    # Load exercises and templates
    all_exercises = load_exercises()
    split_templates = load_split_templates()

    # Filter exercises
    filtered_by_equipment = filter_exercises_by_equipment(
        all_exercises,
        user_profile.available_equipment
    )

    filtered_exercises = filter_exercises_by_difficulty(
        filtered_by_equipment,
        user_profile.experience_level
    )

    print(f"Total exercises: {len(all_exercises)}")
    print(f"After equipment filter: {len(filtered_by_equipment)}")
    print(f"After difficulty filter: {len(filtered_exercises)}")
    print(f"Available equipment: {user_profile.available_equipment}")

    if not filtered_exercises:
        print("\n[ERROR] No exercises available with current equipment and experience level!")
        return None

    # Select split strategy
    split_strategy = select_split_strategy(user_profile.days_per_week)
    split_data = split_templates[split_strategy]

    print(f"\nSelected split strategy: {split_strategy}")

    # Create workout days based on split template
    days = []
    selected_across_all_days = []
    warnings = []

    for day_num in range(1, user_profile.days_per_week + 1):
        day_key = f"day_{day_num}"
        day_template = split_data["day_template"][day_key]

        # Select exercises for this day based on muscle group template
        selected_exercises = select_exercises_for_day(
            filtered_exercises,
            day_template["muscle_groups"],
            selected_across_all_days
        )

        # Calculate expected vs actual exercises
        expected_exercise_count = sum(day_template["muscle_groups"].values())
        actual_exercise_count = len(selected_exercises)

        # Check if day is incomplete or empty
        if actual_exercise_count == 0:
            warning_msg = f"Day {day_num} ({day_template['focus']}): Could not find any exercises for required muscle groups"
            warnings.append(warning_msg)
            print(f"\n[WARNING] {warning_msg}")
            print(f"   Required muscle groups: {list(day_template['muscle_groups'].keys())}")
            missing_muscles = []
            for muscle in day_template['muscle_groups'].keys():
                available = get_exercises_for_muscle_group(filtered_exercises, muscle, selected_across_all_days)
                if not available:
                    missing_muscles.append(muscle)
            if missing_muscles:
                print(f"   Missing: {', '.join(missing_muscles)}")
            continue

        elif actual_exercise_count < expected_exercise_count:
            warning_msg = f"Day {day_num} ({day_template['focus']}): Only {actual_exercise_count} exercises found instead of {expected_exercise_count}"
            warnings.append(warning_msg)
            print(f"\n[WARNING] {warning_msg}")
            print(f"   Reason: Not enough equipment or exercises available for all required muscle groups")

        # Convert to PlannedExercise
        planned_exercises = [
            create_planned_exercise(ex, user_profile.experience_level)
            for ex in selected_exercises
        ]

        # Create workout day
        workout_day = WorkoutDay(
            day_number=day_num,
            day_name=f"Training {day_num}",
            focus=day_template["focus"],
            exercises=planned_exercises
        )
        days.append(workout_day)

    if warnings:
        print(f"\n[WARNING] Generated plan with {len(warnings)} incomplete day(s).")
        print(f"   Reason: Not enough equipment or exercises available.\n")

    if not days:
        print("\n[ERROR] Could not generate any training days!")
        return None

    # Create plan metadata
    plan_metadata = PlanMetadata(
        plan_name=f"{len(days)}-Day {split_strategy.upper()} Training Plan",
        plan_type="rule_based",
        difficulty=user_profile.experience_level,
        estimated_session_time_minutes=60
    )

    # Create workout plan
    workout_plan = WorkoutPlan(
        user_profile=user_profile,
        plan_metadata=plan_metadata,
        days=days,
        days_requested=user_profile.days_per_week,
        days_generated=len(days),
        warnings=warnings
    )

    return workout_plan
