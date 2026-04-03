import json
from pathlib import Path

# Test with different days_per_week
test_surveys = [
    {"days": 1, "label": "1-Day Full Body"},
    {"days": 3, "label": "3-Day PPL"},
    {"days": 4, "label": "4-Day Upper/Lower"},
    {"days": 5, "label": "5-Day PPL Extended"},
]

surveys_path = Path("surveys.json")
with open(surveys_path, "r") as f:
    data = json.load(f)

latest = data["surveys"][-1]

for test in test_surveys:
    # Modify and append test survey
    test_survey = latest.copy()
    test_survey["daysPerWeek"] = test["days"]
    test_survey["timestamp"] = f"test-{test['label']}"
    data["surveys"].append(test_survey)
    print(f"Added test survey: {test['label']}")

# Save back
with open(surveys_path, "w") as f:
    json.dump(data, f, indent=2)

print("\nTest surveys added. Ready to test!")
