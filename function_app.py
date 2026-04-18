import json
import logging
import os
from datetime import datetime
from pathlib import Path

import azure.functions as func

from backend.recommendation_system import generate_workout_plan_from_survey
from backend.openai_service import describe_workout_plan


ROOT_DIR = Path(__file__).resolve().parent


def is_writable(path: Path) -> bool:
    try:
        return os.access(path, os.W_OK)
    except OSError:
        return False


def resolve_data_dir() -> Path:
    env_dir = os.environ.get("DATA_DIR")
    if env_dir:
        env_path = Path(env_dir)
        if is_writable(env_path):
            return env_path

    temp_root = Path(os.environ.get("TEMP") or "/tmp")
    temp_dir = temp_root / "ai_training_planner"

    if os.environ.get("WEBSITE_INSTANCE_ID") or os.environ.get("WEBSITE_SITE_NAME"):
        return temp_dir

    if os.name != "nt" and is_writable(temp_root):
        return temp_dir

    return ROOT_DIR


DATA_DIR = resolve_data_dir()
DATA_DIR.mkdir(parents=True, exist_ok=True)

SURVEYS_PATH = Path(os.environ.get("SURVEYS_PATH", str(DATA_DIR / "surveys.json")))
PLANNER_OUTPUT_PATH = Path(
    os.environ.get("PLANNER_OUTPUT_PATH", str(DATA_DIR / "planner_output.txt"))
)
AI_OUTPUT_PATH = Path(
    os.environ.get("AI_OUTPUT_PATH", str(DATA_DIR / "AI_output.txt"))
)

os.environ.setdefault("SURVEYS_PATH", str(SURVEYS_PATH))


def load_surveys() -> dict:
    if not SURVEYS_PATH.exists():
        return {"surveys": []}
    data = SURVEYS_PATH.read_text(encoding="utf-8").strip()
    if not data:
        return {"surveys": []}
    return json.loads(data)


def save_surveys(data: dict) -> None:
    SURVEYS_PATH.write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def generate_and_save_plan() -> dict | None:
    training_plan = generate_workout_plan_from_survey()
    if not training_plan:
        return None

    plan_dict = training_plan.model_dump()
    PLANNER_OUTPUT_PATH.write_text(
        json.dumps(plan_dict, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    description = describe_workout_plan(plan_dict)
    AI_OUTPUT_PATH.write_text(description, encoding="utf-8")

    return {
        "plan": plan_dict,
        "description": description,
    }


app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)


@app.route(route="save-survey", methods=["POST"])
def save_survey(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except ValueError:
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON body"}),
            status_code=400,
            mimetype="application/json",
        )

    required = ["daysPerWeek", "weight", "sex", "height", "age", "experienceLevel"]
    if any(field not in body or body[field] in (None, "") for field in required):
        return func.HttpResponse(
            json.dumps({"error": "Missing required fields"}),
            status_code=400,
            mimetype="application/json",
        )

    if body.get("experienceLevel") not in {"beginner", "intermediate", "advanced"}:
        return func.HttpResponse(
            json.dumps({"error": "Invalid experience level"}),
            status_code=400,
            mimetype="application/json",
        )

    sex_value = str(body.get("sex", "")).lower()
    if sex_value not in {"male", "female", "other"}:
        return func.HttpResponse(
            json.dumps({"error": "Invalid sex value"}),
            status_code=400,
            mimetype="application/json",
        )

    days_per_week = int(body.get("daysPerWeek"))
    if days_per_week < 1 or days_per_week > 5:
        return func.HttpResponse(
            json.dumps({"error": "Days per week must be between 1 and 5"}),
            status_code=400,
            mimetype="application/json",
        )

    surveys_data = load_surveys()

    new_survey = {
        "id": int(datetime.utcnow().timestamp() * 1000),
        "daysPerWeek": days_per_week,
        "weight": float(body.get("weight")),
        "sex": sex_value,
        "height": float(body.get("height")),
        "age": int(body.get("age")),
        "experienceLevel": str(body.get("experienceLevel")),
        "availableEquipment": body.get("availableEquipment", []),
        "timestamp": body.get("timestamp") or datetime.utcnow().isoformat() + "Z",
    }

    surveys_data.setdefault("surveys", []).append(new_survey)
    save_surveys(surveys_data)

    generate_plan = bool(body.get("generatePlan"))
    result_payload = {
        "message": "Survey saved successfully",
        "survey": new_survey,
    }

    if generate_plan:
        plan_result = generate_and_save_plan()
        if not plan_result:
            return func.HttpResponse(
                json.dumps({"error": "Failed to generate workout plan"}),
                status_code=500,
                mimetype="application/json",
            )
        result_payload.update(plan_result)

    return func.HttpResponse(
        json.dumps(result_payload, ensure_ascii=False),
        status_code=200,
        mimetype="application/json",
    )


@app.route(route="surveys", methods=["GET"])
def get_surveys(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = load_surveys()
        return func.HttpResponse(
            json.dumps(data, ensure_ascii=False),
            status_code=200,
            mimetype="application/json",
        )
    except Exception as exc:
        logging.exception("Failed to load surveys")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            status_code=500,
            mimetype="application/json",
        )


@app.route(route="generate-plan", methods=["POST"])
def generate_plan(req: func.HttpRequest) -> func.HttpResponse:
    plan_result = generate_and_save_plan()
    if not plan_result:
        return func.HttpResponse(
            json.dumps({"error": "Failed to generate workout plan"}),
            status_code=500,
            mimetype="application/json",
        )

    return func.HttpResponse(
        json.dumps(plan_result, ensure_ascii=False),
        status_code=200,
        mimetype="application/json",
    )