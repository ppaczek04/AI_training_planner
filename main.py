from backend.openai_service import describe_workout_plan

sample_plan = {
    "user_profile": {
        "sex": "male",
        "age": 22,
        "height_cm": 180,
        "weight_kg": 78,
        "experience_level": "beginner",
        "days_per_week": 4,
    },
    "days": [
        {
            "day_number": 1,
            "day_name": "Upper A",
            "focus": "chest_back_shoulders_arms",
            "exercises": [
                {
                    "name": "Bench Press",
                    "sets": 4,
                    "reps": "6-8",
                    "rest_seconds": 120
                },
                {
                    "name": "Lat Pulldown",
                    "sets": 4,
                    "reps": "8-10",
                    "rest_seconds": 90
                },
                {
                    "name": "Seated Dumbbell Shoulder Press",
                    "sets": 3,
                    "reps": "8-10",
                    "rest_seconds": 90
                }
            ]
        },
        {
            "day_number": 2,
            "day_name": "Lower A",
            "focus": "quads_hamstrings_glutes_calves",
            "exercises": [
                {
                    "name": "Back Squat",
                    "sets": 4,
                    "reps": "6-8",
                    "rest_seconds": 120
                },
                {
                    "name": "Romanian Deadlift",
                    "sets": 4,
                    "reps": "8-10",
                    "rest_seconds": 120
                },
                {
                    "name": "Standing Calf Raise",
                    "sets": 4,
                    "reps": "12-15",
                    "rest_seconds": 60
                }
            ]
        },
        {
            "day_number": 3,
            "day_name": "Upper B",
            "focus": "chest_back_shoulders_arms",
            "exercises": [
                {
                    "name": "Incline Dumbbell Press",
                    "sets": 4,
                    "reps": "8-10",
                    "rest_seconds": 90
                },
                {
                    "name": "Pull Ups",
                    "sets": 3,
                    "reps": "6-8",
                    "rest_seconds": 120
                },
                {
                    "name": "Hammer Curl",
                    "sets": 3,
                    "reps": "10-12",
                    "rest_seconds": 60
                }
            ]
        },
        {
            "day_number": 4,
            "day_name": "Lower B",
            "focus": "quads_hamstrings_glutes_calves",
            "exercises": [
                {
                    "name": "Deadlift",
                    "sets": 3,
                    "reps": "5-6",
                    "rest_seconds": 150
                },
                {
                    "name": "Bulgarian Split Squat",
                    "sets": 3,
                    "reps": "8-10 per leg",
                    "rest_seconds": 90
                },
                {
                    "name": "Hip Thrust",
                    "sets": 3,
                    "reps": "8-10",
                    "rest_seconds": 90
                }
            ]
        }
    ]
}

if __name__ == "__main__":

    result = describe_workout_plan(sample_plan)
    print("\n===== AI DESCRIPTION =====\n")
    print(result)

    with open("AI_output.txt", "w", encoding="utf-8") as file:
        file.write(result)
