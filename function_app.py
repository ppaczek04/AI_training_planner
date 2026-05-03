import json
import logging
import os
from datetime import datetime

import azure.functions as func
from azure.data.tables import TableServiceClient
from azure.storage.blob import BlobServiceClient

from backend.recommendation_system import generate_workout_plan_from_survey
from backend.openai_service import describe_workout_plan


def get_storage_connection_string() -> str:
    conn = os.environ.get("AZURE_STORAGE_CONNECTION_STRING") or os.environ.get(
        "AzureWebJobsStorage"
    )
    if not conn:
        raise RuntimeError("Missing storage connection string")
    return conn


BLOB_SURVEYS_CONTAINER = os.environ.get("BLOB_SURVEYS_CONTAINER", "surveys")
BLOB_PLANS_CONTAINER = os.environ.get("BLOB_PLANS_CONTAINER", "plansgenerated")
BLOB_AI_CONTAINER = os.environ.get("BLOB_AI_CONTAINER", "aioutput")
TABLE_NAME = os.environ.get("TABLE_NAME", "plansmetadata")


def get_blob_service_client() -> BlobServiceClient:
    return BlobServiceClient.from_connection_string(get_storage_connection_string())


def get_table_service_client() -> TableServiceClient:
    return TableServiceClient.from_connection_string(get_storage_connection_string())


def upload_json_blob(container_name: str, blob_name: str, payload: dict) -> None:
    blob_service = get_blob_service_client()
    container = blob_service.get_container_client(container_name)
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    container.upload_blob(name=blob_name, data=data, overwrite=True, content_type="application/json")


def upload_text_blob(container_name: str, blob_name: str, text: str) -> None:
    blob_service = get_blob_service_client()
    container = blob_service.get_container_client(container_name)
    container.upload_blob(name=blob_name, data=text.encode("utf-8"), overwrite=True, content_type="text/plain")


def list_surveys() -> list[dict]:
    blob_service = get_blob_service_client()
    container = blob_service.get_container_client(BLOB_SURVEYS_CONTAINER)
    surveys: list[dict] = []
    for blob in container.list_blobs():
        blob_client = container.get_blob_client(blob.name)
        content = blob_client.download_blob().readall()
        surveys.append(json.loads(content))
    return surveys


def save_metadata(user_id: str, survey_id: int, payload: dict) -> None:
    table_service = get_table_service_client()
    table_client = table_service.get_table_client(TABLE_NAME)
    entity = {
        "PartitionKey": user_id,
        "RowKey": str(survey_id),
        **payload,
    }
    table_client.upsert_entity(entity)


def generate_and_save_plan(survey: dict) -> dict | None:
    training_plan = generate_workout_plan_from_survey(survey=survey)
    if not training_plan:
        return None

    plan_dict = training_plan.model_dump()
    survey_id = survey.get("id")
    plan_blob_name = f"{survey_id}.json"
    ai_blob_name = f"{survey_id}.txt"

    upload_json_blob(BLOB_PLANS_CONTAINER, plan_blob_name, plan_dict)
    description = describe_workout_plan(plan_dict)
    upload_text_blob(BLOB_AI_CONTAINER, ai_blob_name, description)

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

    survey_blob_name = f"{new_survey['id']}.json"
    upload_json_blob(BLOB_SURVEYS_CONTAINER, survey_blob_name, new_survey)

    metadata_payload = {
        "surveyId": str(new_survey["id"]),
        "timestamp": new_survey["timestamp"],
        "experienceLevel": new_survey["experienceLevel"],
        "daysPerWeek": new_survey["daysPerWeek"],
    }
    save_metadata("anonymous", new_survey["id"], metadata_payload)

    generate_plan = bool(body.get("generatePlan"))
    result_payload = {
        "message": "Survey saved successfully",
        "survey": new_survey,
    }

    if generate_plan:
        plan_result = generate_and_save_plan(new_survey)
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
        data = {"surveys": list_surveys()}
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