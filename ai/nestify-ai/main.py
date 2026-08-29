from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from services.chatbot_service import ChatbotService
from services.matching_service import MatchingService
from services.tagging_service import AutoTaggingService


app = FastAPI(
    title="Nestify AI Service",
    version="1.0.0",
    description="AI microservice for chatbot, roommate matching, and auto-tagging.",
)

# Shared service instances
bot = ChatbotService()
matcher = MatchingService()
tagger = AutoTaggingService()


# =========================================================
# Request Schemas
# =========================================================
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)


class Preferences(BaseModel):
    sleep: str = Field(..., pattern="^(early|late)$")
    smoke: str = Field(..., pattern="^(yes|no)$")
    clean: int = Field(..., ge=1, le=5)
    noise: int = Field(..., ge=1, le=5)
    social: int = Field(..., ge=1, le=5)
    budget: int = Field(default=150, ge=50, le=500)
    pets_allowed: bool = False
    study: int = Field(default=3, ge=1, le=5)


class MatchRequest(BaseModel):
    id: int
    gender: str = Field(..., pattern="^(male|female)$")
    prefs: Preferences


class TagRequest(BaseModel):
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=5)
    image_path: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=10)


# =========================================================
# Root / Health Check
# =========================================================
@app.get("/")
def home():
    return {
        "message": "Nestify AI API is running",
        "modules": ["chatbot", "roommate_matching", "auto_tagging"],
    }


# =========================================================
# Chatbot
# =========================================================
@app.get("/chat")
def chat_get(message: str):
    try:
        return {
            "message": message,
            "response": bot.get_response(message),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(exc)}")


@app.post("/chat")
def chat_post(payload: ChatRequest):
    try:
        return {
            "message": payload.message,
            "response": bot.get_response(payload.message),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(exc)}")


# =========================================================
# Roommate Matching
# =========================================================
@app.post("/match")
def match(payload: MatchRequest):
    try:
        from shared.dummy_data import DUMMY_STUDENTS
        result = matcher.find_matches(
            current_user=payload.model_dump(),
            candidates=DUMMY_STUDENTS,
            k=2
        )
        return {
            "request_user": payload.model_dump(),
            "matches": result,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Matching error: {str(exc)}")


# =========================================================
# Auto Tagging
# =========================================================
@app.post("/tag")
def tag(payload: TagRequest):
    try:
        result = tagger.predict_tags(
            title=payload.title,
            description=payload.description,
            image_path=payload.image_path,
            top_k=payload.top_k,
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Tagging error: {str(exc)}")