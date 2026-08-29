"""
core/config.py
==============
Central configuration for the Nestify AI microservice.
Reads settings from a .env file (or system environment variables).
Uses python-dotenv so developers can override values locally without
changing source code.

Usage:
    from core.config import settings
    print(settings.APP_NAME)
"""

import os
from dotenv import load_dotenv

# Load variables from a .env file in the project root (if it exists).
# Variables already set in the OS environment take precedence.
load_dotenv()


class Settings:
    """
    Central settings class.
    All configurable values are read once at startup.
    """

    # ------------------------------------------------------------------
    # General application metadata
    # ------------------------------------------------------------------
    APP_NAME: str = os.getenv("APP_NAME", "Nestify AI Service")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # ------------------------------------------------------------------
    # Server configuration
    # ------------------------------------------------------------------
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # ------------------------------------------------------------------
    # CORS – which origins (frontends / Node.js backend) are allowed
    # to call this service.  Defaults to allow all during development.
    # ------------------------------------------------------------------
    ALLOWED_ORIGINS: list[str] = os.getenv(
        "ALLOWED_ORIGINS", "*"
    ).split(",")

    # ------------------------------------------------------------------
    # PostgreSQL – not used yet (Phase 1 uses dummy data).
    # Fill in your real values in the .env file when the DB is ready.
    # ------------------------------------------------------------------
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://nestify_user:password@localhost:5432/nestify_db",
    )

    # ------------------------------------------------------------------
    # Roommate matching (Phase 2)
    # ------------------------------------------------------------------
    # Number of nearest neighbours to return per query
    ROOMMATE_TOP_K: int = int(os.getenv("ROOMMATE_TOP_K", "5"))

    # ------------------------------------------------------------------
    # Tagging model (Phase 3)
    # ------------------------------------------------------------------
    # Minimum TF-IDF confidence score to assign a tag
    TAGGING_CONFIDENCE_THRESHOLD: float = float(
        os.getenv("TAGGING_CONFIDENCE_THRESHOLD", "0.3")
    )

    # ------------------------------------------------------------------
    # Gemini AI
    # ------------------------------------------------------------------
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")


# A single shared instance imported everywhere in the project.
settings = Settings()
