from fastapi import FastAPI, HTTPException

from shared.schemas import MatchRequest, Preferences
from shared.dummy_data import DUMMY_STUDENTS
from shared.responses import success_response, error_response
from shared.logging_config import setup_logging
from services.matching_service import MatchingService

app = FastAPI(title="Nestify Matching API", version="2.0.0")

logger = setup_logging("matching")
matcher = MatchingService()


@app.get("/health")
def health():
    return {"status": "ok", "service": "matching"}


@app.post("/vector")
def get_vector(prefs: Preferences):
    try:
        vector = matcher.encode(prefs.model_dump())
        return success_response(
            "matching",
            {
                "vector": vector
            }
        )
    except Exception as e:
        logger.exception("Vector generation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/match")
def match(payload: MatchRequest):
    try:
        candidates = [c.model_dump() for c in payload.candidates] if payload.candidates is not None else DUMMY_STUDENTS
        result = matcher.find_matches(
            current_user=payload.model_dump(),
            candidates=candidates,
            k=3
        )

        return success_response(
            "matching",
            {
                "request_user": payload.model_dump(),
                "matches": result,
            },
        )

    except Exception:
        logger.exception("Matching failed")

        raise HTTPException(
            status_code=500,
            detail=error_response(
                service="matching",
                message="Matching service temporarily unavailable",
                error_code="MATCHING_ERROR",
            ),
        )