from fastapi import FastAPI, HTTPException

from shared.schemas import TagRequest
from shared.responses import response, error_response
from shared.logging_config import setup_logging
from services.tagging_service import AutoTaggingService

app = FastAPI(title="Nestify Tagging API", version="2.0.0")

logger = setup_logging("tagging")
tagger = AutoTaggingService()


@app.get("/health")
def health():
    return {"status": "ok", "service": "tagging"}


@app.post("/tag")
def tag(payload: TagRequest):
    try:
        result = tagger.predict_tags(
            title=payload.title,
            description=payload.description,
            image_path=payload.image_path,
            top_k=payload.top_k,
        )

        return response(
            "tagging",
            {
                "property_id": payload.property_id,
                **result,
            },
        )

    except Exception:
        logger.exception("Tagging failed")

        raise HTTPException(
            status_code=500,
            detail=error_response(
                service="tagging",
                message="Tagging service temporarily unavailable",
                error_code="TAGGING_ERROR",
            ),
        )