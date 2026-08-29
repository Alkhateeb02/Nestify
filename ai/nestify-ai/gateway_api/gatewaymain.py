from fastapi import FastAPI, HTTPException
import requests

from shared.schemas import ChatRequest, MatchRequest, TagRequest, Preferences
from shared.logging_config import setup_logging
from shared.responses import response, error_response

app = FastAPI(title="Nestify AI Gateway API", version="1.0.0")

logger = setup_logging("gateway")

CHATBOT_URL = "http://127.0.0.1:8001"
MATCHING_URL = "http://127.0.0.1:8002"
TAGGING_URL = "http://127.0.0.1:8003"

TIMEOUT = 60


def call_service(service_name: str, url: str, payload: dict):
    try:
        logger.info(f"Forwarding request to {service_name}: {url}")

        request_response = requests.post(url, json=payload, timeout=TIMEOUT)

        if request_response.status_code >= 400:
            logger.error(f"{service_name} returned error: {request_response.text}")
            raise HTTPException(
                status_code=request_response.status_code,
                detail=error_response(
                    service=service_name,
                    message=f"{service_name} returned an error",
                    error_code="DOWNSTREAM_ERROR",
                ),
            )

        return request_response.json()

    except requests.exceptions.Timeout:
        logger.exception(f"{service_name} timeout")

        raise HTTPException(
            status_code=504,
            detail=error_response(
                service=service_name,
                message=f"{service_name} service timeout",
                error_code="SERVICE_TIMEOUT",
            ),
        )

    except requests.exceptions.ConnectionError:
        logger.exception(f"{service_name} connection failed")

        raise HTTPException(
            status_code=503,
            detail=error_response(
                service=service_name,
                message=f"{service_name} service is down",
                error_code="SERVICE_DOWN",
            ),
        )

    except HTTPException:
        raise

    except Exception:
        logger.exception(f"Unexpected gateway error while calling {service_name}")

        raise HTTPException(
            status_code=500,
            detail=error_response(
                service="gateway",
                message="Unexpected gateway error",
                error_code="GATEWAY_ERROR",
            ),
        )


@app.get("/")
def home():
    return {
        "message": "Nestify AI Gateway is running",
        "services": ["chatbot", "matching", "tagging"],
    }


@app.get("/ai/health")
def health_check():
    services = {
        "chatbot": f"{CHATBOT_URL}/health",
        "matching": f"{MATCHING_URL}/health",
        "tagging": f"{TAGGING_URL}/health",
    }

    results = {}

    for name, url in services.items():
        try:
            response = requests.get(url, timeout=TIMEOUT)
            results[name] = response.json()
        except Exception:
            logger.exception(f"{name} health check failed")
            results[name] = {
                "status": "down",
                "service": name,
                "message": f"{name} temporarily unavailable",
            }

    return {
        "gateway": "ok",
        "services": results,
    }


@app.post("/ai/chat")
def ai_chat(payload: ChatRequest):
    return call_service(
        service_name="chatbot",
        url=f"{CHATBOT_URL}/chat",
        payload=payload.model_dump(),
    )


@app.post("/ai/match")
def ai_match(payload: MatchRequest):
    return call_service(
        service_name="matching",
        url=f"{MATCHING_URL}/match",
        payload=payload.model_dump(),
    )


@app.post("/ai/vector")
def ai_vector(payload: Preferences):
    return call_service(
        service_name="matching",
        url=f"{MATCHING_URL}/vector",
        payload=payload.model_dump(),
    )


@app.post("/ai/tag")
def ai_tag(payload: TagRequest):
    return call_service(
        service_name="tagging",
        url=f"{TAGGING_URL}/tag",
        payload=payload.model_dump(),
    )