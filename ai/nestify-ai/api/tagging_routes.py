"""
api/tagging_routes.py
=====================
FastAPI router for the Automated Tagging Model (Phase 3).

Endpoints:
  POST /tags/listing
    → Tag a single listing.

  POST /tags/batch
    → Tag multiple listings in one request (bulk processing).

Integration note for Node.js backend:
  POST http://<ai-service-host>:8000/tags/listing
  Content-Type: application/json
  Body: {
    "listing_id": "L007",
    "title": "Cozy Studio Near AHU",
    "description": "Fully furnished studio with WiFi, AC, and private parking.",
    "price": 130.0,
    "location": "ma'an"
  }
"""

from fastapi import APIRouter, HTTPException, status

from models.schemas import TaggingRequest, TaggingResponse
from services.tagging_service import AutoTaggingService

# ---------------------------------------------------------------------------
# Router setup
# ---------------------------------------------------------------------------
router = APIRouter(
    prefix="/tags",
    tags=["Automated Tagging"],
)

# Shared stateless service instance
_tagging_service = AutoTaggingService()


@router.post(
    "/listing",
    response_model=TaggingResponse,
    summary="Auto-tag a housing listing",
    description=(
        "Automatically extracts amenities, price tier, location label, and "
        "listing type from a housing listing's title and description.\n\n"
        "All tags are returned both as categorised fields and as a flat "
        "`all_tags` list for easy full-text search indexing."
    ),
    status_code=status.HTTP_200_OK,
)
async def tag_listing(payload: TaggingRequest) -> TaggingResponse:
    """
    Single-listing tagging endpoint.

    - **listing_id**: Unique ID of the listing (echoed in the response).
    - **title**: Listing headline.
    - **description**: Full text description.
    - **price**: Monthly rent in JOD (used for price tier classification).
    - **location**: Raw location string from the listing form.
    """
    try:
        return _tagging_service.tag_listing(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Tagging error: {str(exc)}",
        )


@router.post(
    "/batch",
    response_model=list[TaggingResponse],
    summary="Bulk-tag multiple listings",
    description=(
        "Process multiple listings in a single request. "
        "Returns a list of TaggingResponse objects in the same order as the input. "
        "Useful for back-filling tags on existing listings when the service is first deployed."
    ),
    status_code=status.HTTP_200_OK,
)
async def tag_listings_batch(payloads: list[TaggingRequest]) -> list[TaggingResponse]:
    """
    Batch tagging endpoint.

    Accepts a JSON array of TaggingRequest objects and returns a
    corresponding array of TaggingResponse objects.
    """
    if not payloads:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Payload list is empty. Provide at least one listing.",
        )
    if len(payloads) > 100:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Batch size exceeds maximum of 100 listings per request.",
        )

    try:
        return [_tagging_service.tag_listing(p) for p in payloads]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch tagging error: {str(exc)}",
        )
