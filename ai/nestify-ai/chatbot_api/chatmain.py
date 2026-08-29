from fastapi import FastAPI, HTTPException

from shared.schemas import ChatRequest
from shared.responses import response, error_response
from shared.logging_config import setup_logging
from shared.dummy_data import DUMMY_LISTINGS
from services.chatbot_service import ChatbotService

app = FastAPI(title="Nestify Chatbot API", version="2.0.0")

logger = setup_logging("chatbot")
bot = ChatbotService()


@app.get("/health")
def health():
    return {"status": "ok", "service": "chatbot"}


@app.post("/chat")
def chat(payload: ChatRequest):
    try:
        # Pass payload.listings directly (will be None or empty list if not provided)
        # This allows the chatbot service to fetch listings from the database.
        listings = payload.listings if payload.listings else None

        result = bot.get_response(
            message=payload.message,
            listings=listings,
        )

        return response("chatbot", result)

    except Exception:
        logger.exception("Chatbot failed")

        raise HTTPException(
            status_code=500,
            detail=error_response(
                service="chatbot",
                message="Chatbot temporarily unavailable",
                error_code="CHATBOT_ERROR",
            ),
        )