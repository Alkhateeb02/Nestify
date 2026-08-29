from typing import Optional, List
from pydantic import BaseModel, Field


class ListingSummary(BaseModel):
    property_id: int
    title: str
    description: str
    price: float
    location: str
    room_type: str
    availability_status: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    listings: Optional[List[ListingSummary]] = []


class Preferences(BaseModel):
    sleep: str = Field(..., pattern="^(early|late)$")
    smoke: str = Field(..., pattern="^(yes|no)$")
    clean: int = Field(..., ge=1, le=5)
    noise: int = Field(..., ge=1, le=5)
    social: int = Field(..., ge=1, le=5)
    budget: int = Field(default=150, ge=50, le=500)
    pets_allowed: bool = False
    study: int = Field(default=3, ge=1, le=5)


class Candidate(BaseModel):
    id: int
    gender: str = Field(..., pattern="^(male|female)$")
    prefs: Preferences

class MatchRequest(BaseModel):
    id: int
    gender: str = Field(..., pattern="^(male|female)$")
    prefs: Preferences
    candidates: Optional[List[Candidate]] = None


class TagRequest(BaseModel):
    property_id: Optional[int] = None
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=5)
    image_path: Optional[str] = None
    top_k: int = Field(default=8, ge=1, le=15)