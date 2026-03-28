from backend.recommendation_system import generate_workout_plan_from_survey
from backend.openai_service import describe_workout_plan
import json


if __name__ == "__main__":
    print("Generating workout plan from survey data...")

    # Generate workout plan based on the latest survey
    training_plan = generate_workout_plan_from_survey()

    if not training_plan:
        print("Failed to generate workout plan. Check survey data.")
        exit(1)

    print("\n===== GENERATED WORKOUT PLAN =====\n")
    print(f"Plan: {training_plan.plan_metadata.plan_name}")
    print(f"User: {training_plan.user_profile.sex}, {training_plan.user_profile.age} years old")
    print(f"Experience: {training_plan.user_profile.experience_level}")
    print(f"Days per week: {training_plan.user_profile.days_per_week}")
    print(f"Available equipment: {', '.join(training_plan.user_profile.available_equipment)}")
    print(f"\nTotal training days: {len(training_plan.days)}")

    for day in training_plan.days:
        print(f"\n{day.day_name}: {len(day.exercises)} exercises")
        for ex in day.exercises:
            print(f"  - {ex.name}: {ex.sets} sets x {ex.reps} reps, {ex.rest_seconds}s rest")

    # Convert to dict for API
    plan_dict = training_plan.model_dump()

    # Save raw plan to JSON file
    print("\nSaving raw plan to planner_output.txt...")
    with open("planner_output.txt", "w", encoding="utf-8") as file:
        json.dump(plan_dict, file, indent=2, ensure_ascii=False)

    # Send to OpenAI for description
    print("Sending to OpenAI for human-readable description...")
    result = describe_workout_plan(plan_dict)

    print("\n===== AI DESCRIPTION =====\n")
    print(result)

    with open("AI_output.txt", "w", encoding="utf-8") as file:
        file.write(result)

    print("\n\nRaw workout plan saved to planner_output.txt")
    print("AI description saved to AI_output.txt")
