"""
models/schemas.py
=================
Pydantic v2 schemas for:
- Chatbot
- Roommate AI Matching
- Automated Tagging
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


# ===========================================================================
# ─── CHATBOT SCHEMAS ────────────────────────────────────────────────────────
# ===========================================================================


class ChatRequest(BaseModel):

    session_id: str = Field(..., description="Unique conversation session ID")

    message: str = Field(
        ...,
        min_length=1,
        description="User message"
    )

    user_id: Optional[str] = Field(
        None,
        description="Authenticated user ID"
    )


class ExtractedFilters(BaseModel):

    min_price: Optional[float] = None
    max_price: Optional[float] = None

    location: Optional[str] = None

    listing_type: Optional[str] = None


class ChatResponse(BaseModel):

    reply: str

    intent: str

    filters: ExtractedFilters

    results: list[dict[str, Any]] = Field(default_factory=list)

    session_id: str


# ===========================================================================
# ─── ROOMMATE MATCHING SCHEMAS ─────────────────────────────────────────────
# ===========================================================================


class UserPreferences(BaseModel):

    user_id: str

    gender: str = Field(
        ...,
        pattern="^(male|female)$"
    )

    sleep_schedule: str = Field(
        ...,
        description="early | late"
    )

    smoking_preference: str = Field(
        ...,
        description="yes | no"
    )

    cleanliness_level: int = Field(
        ...,
        ge=1,
        le=5
    )

    noise_tolerance: int = Field(
        ...,
        ge=1,
        le=5
    )

    social_level: int = Field(
        ...,
        ge=1,
        le=5
    )

    study_level: int = Field(
        ...,
        ge=1,
        le=5
    )

    guest_preference: str = Field(
        ...,
        description="yes | sometimes | no"
    )

    lifestyle_type: str = Field(
        ...,
        description="quiet | balanced | social"
    )

    personality_type: str = Field(
        ...,
        description="introvert | ambivert | extrovert"
    )


class RoommateMatch(BaseModel):

    user_id: str

    similarity_score: float = Field(
        ...,
        ge=0.0,
        le=100.0
    )

    gender: str

    sleep_schedule: str

    smoking_preference: str

    cleanliness_level: int

    noise_tolerance: int

    social_level: int

    study_level: int

    guest_preference: str

    lifestyle_type: str

    personality_type: str


class RoommateResponse(BaseModel):

    requesting_user_id: str

    matches: list[RoommateMatch]

    algorithm: str = "FAISS + Cosine Similarity"


# ===========================================================================
# ─── AUTOMATED TAGGING SCHEMAS ─────────────────────────────────────────────
# ===========================================================================


class TaggingRequest(BaseModel):

    listing_id: str

    title: str = Field(
        ...,
        min_length=3
    )

    description: str = Field(
        ...,
        min_length=10
    )

    price: Optional[float] = Field(
        None,
        ge=0
    )

    location: Optional[str] = None


class TaggingResponse(BaseModel):

    listing_id: str

    amenity_tags: list[str]

    price_tier: Optional[str]

    location_tag: Optional[str]

    listing_type: Optional[str]

    all_tags: list[str]