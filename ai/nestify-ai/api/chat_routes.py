"""
api/chat_routes.py
==================
FastAPI router for the Chatbot module (Phase 1).

Endpoint:
  POST /chat/message
    → Accepts a ChatRequest (session_id + message).
    → Returns a ChatResponse (reply, intent, filters, results).

The router delegates ALL business logic to ChatbotService.
It is intentionally thin – only handling HTTP concerns (validation,
status codes, error handling).

Integration note for Node.js backend:
  POST http://<ai-service-host>:8000/chat/message
  Content-Type: application/json
  Body: { "session_id": "...", "message": "...", "user_id": "..." }
"""

from fastapi import APIRouter, HTTPException, status
from models.schemas import ChatRequest, ChatResponse, ExtractedFilters
from services.chatbot_service import ChatbotService

# ---------------------------------------------------------------------------
# Router setup
# Router prefix (/chat) is applied in main.py.
# ---------------------------------------------------------------------------
router = APIRouter(
    prefix="/chat",
    tags=["Chatbot"],
)

# A single shared service instance.
# ChatbotService holds the in-memory session dict, so it must be a singleton
# within the process lifetime.
_chatbot_service = ChatbotService()


@router.post(
    "/message",
    response_model=ChatResponse,
    summary="Send a message to the Nestify chatbot",
    description=(
        "Processes a user message and returns a domain-restricted chatbot reply. "
        "Handles intents: greeting, search, how_to, farewell, and unknown. "
        "Extracts structured housing filters (price, location, type) from natural language. "
        "Maintains per-session conversation context using the `session_id` field."
    ),
    status_code=status.HTTP_200_OK,
)
async def send_message(payload: ChatRequest) -> ChatResponse:
    """
    Main chatbot endpoint.

    - **session_id**: Unique conversation session identifier.
      The client (React frontend or Node.js backend) must generate and
      keep this ID for the duration of the conversation to preserve context.
    - **message**: Raw text typed by the user.
    - **user_id**: Optional authenticated user ID from the Node.js backend.
    """
    try:
        result = _chatbot_service.process(
            session_id=payload.session_id,
            message=payload.message,
        )
        return ChatResponse(**result)
    except Exception as exc:
        # Surface internal errors as a 500 with a safe message.
        # Do not leak internal details to the client.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chatbot processing error: {str(exc)}",
        )


@router.delete(
    "/session/{session_id}",
    summary="Clear a conversation session",
    description="Removes the in-memory context for a given session ID. "
                "Call this when the user logs out or starts a fresh conversation.",
    status_code=status.HTTP_200_OK,
)
async def clear_session(session_id: str) -> dict:
    """Evict a session from the in-memory context store."""
    _chatbot_service._sessions.pop(session_id, None)
    return {"message": f"Session '{session_id}' cleared.", "session_id": session_id}
