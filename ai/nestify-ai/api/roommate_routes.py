"""
api/roommate_routes.py
======================
FastAPI router for the Roommate Similarity Model (Phase 2).

Endpoints:
  POST /roommate/match
    → Accepts a UserPreferences payload.
    → Returns a RoommateResponse with ranked matches.

  GET /roommate/pool
    → Returns the current user pool (dummy data for now).
      Useful for debugging and demonstrating the data structure.

Integration note for Node.js backend:
  POST http://<ai-service-host>:8000/roommate/match
  Content-Type: application/json
  Body: {
    "user_id": "...",
    "gender": "female",
    "budget_min": 80, "budget_max": 180,
    "sleep_schedule": 0.6, "study_habits": 0.8,
    "cleanliness": 0.9, "social_level": 0.4,
    "smoking": false, "pets_allowed": false
  }
"""

from fastapi import APIRouter, HTTPException, Query, status

from core.config import settings
from models.schemas import RoommateResponse, UserPreferences
from services.matching_service import RoommateMatchingService, DUMMY_USER_POOL

# ---------------------------------------------------------------------------
# Router setup
# ---------------------------------------------------------------------------
router = APIRouter(
    prefix="/roommate",
    tags=["Roommate Matching"],
)

# Shared service instance – FAISS indices are built per-request for now.
# When the user pool is large (1000+), move to a pre-built persistent index.
_matching_service = RoommateMatchingService()


@router.post(
    "/match",
    response_model=RoommateResponse,
    summary="Find compatible roommates",
    description=(
        "Analyses the requesting student's preference profile and returns "
        "the top-K most compatible roommates using FAISS + Cosine Similarity.\n\n"
        "**Gender separation is strictly enforced** – male students will only "
        "be matched with other male students, and vice versa."
    ),
    status_code=status.HTTP_200_OK,
)
async def find_roommates(
    preferences: UserPreferences,
    top_k: int = Query(
        default=settings.ROOMMATE_TOP_K,
        ge=1,
        le=20,
        description="Number of roommate recommendations to return (max 20).",
    ),
) -> RoommateResponse:
    """
    Roommate matching endpoint.

    - **preferences**: Full preference profile of the requesting student.
    - **top_k**: How many recommendations to return (default: 5).

    Returns a `RoommateResponse` with:
    - `matches`: Ranked list of compatible students with similarity scores.
    - `algorithm`: Label describing the technique used.
    """
    try:
        return _matching_service.find_matches(preferences, top_k=top_k)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Matching error: {str(exc)}",
        )


@router.get(
    "/pool",
    summary="Inspect the current user pool",
    description=(
        "Returns the list of users currently in the matching pool. "
        "In Phase 1 this is dummy data. In Phase 2+ it reflects live DB rows. "
        "Useful for academic demonstration and API testing."
    ),
    status_code=status.HTTP_200_OK,
)
async def get_user_pool(
    gender: str = Query(
        default=None,
        pattern="^(male|female)$",
        description="Filter pool by gender: 'male' or 'female'.",
    ),
) -> dict:
    """Returns the dummy user pool, optionally filtered by gender."""
    pool = DUMMY_USER_POOL
    if gender:
        pool = [u for u in pool if u["gender"] == gender]
    return {
        "total": len(pool),
        "source": "dummy_data (PostgreSQL in Phase 2)",
        "users": pool,
    }
