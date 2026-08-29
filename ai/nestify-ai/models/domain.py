"""
models/domain.py
================
SQLAlchemy ORM models that mirror the PostgreSQL schema used by the
Nestify main backend.

⚠️  STATUS: Phase 1 uses DUMMY DATA in the service layer.
    These models are defined here so the AI service is ready to connect
    to a live database the moment it is provisioned — no code changes needed,
    only the DATABASE_URL in the .env file.

How to connect (Phase 2+):
    1. Set DATABASE_URL in your .env file.
    2. Replace dummy_data.py calls with SQLAlchemy session queries.
    3. Run `alembic upgrade head` to apply migrations (or use the
       Node.js backend migrations if they share the same schema).
"""

from datetime import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    """All ORM models inherit from this single declarative base."""
    pass


# ===========================================================================
# ─── USERS TABLE ─────────────────────────────────────────────────────────────
# ===========================================================================

class User(Base):
    """
    Mirrors the `users` table managed by the Node.js backend.

    Relevant columns for AI modules:
      - gender       → enforced in the roommate matching filter.
      - major        → optional soft-match signal in matching.
      - preferences  → FK to UserPreference (one-to-one).
    """

    __tablename__ = "users"

    id          = Column(String, primary_key=True, index=True)    # UUID from Node.js
    name        = Column(String(120), nullable=False)
    email       = Column(String(200), unique=True, nullable=False)
    gender      = Column(String(10), nullable=False)               # 'male' | 'female'
    major       = Column(String(120), nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)

    # Relationships
    preference  = relationship("UserPreference", back_populates="user", uselist=False)
    listings    = relationship("Listing", back_populates="owner")


# ===========================================================================
# ─── USER PREFERENCES TABLE ──────────────────────────────────────────────────
# ===========================================================================

class UserPreference(Base):
    """
    Stores the roommate-matching preference vector for each student.
    Each column maps directly to a dimension in the FAISS vector.

    Columns:
        budget_min / budget_max  – Monthly rent tolerance in JOD.
        sleep_schedule           – 0.0 (early riser) … 1.0 (night owl).
        study_habits             – 0.0 (never home) … 1.0 (always home).
        cleanliness              – 0.0 (relaxed) … 1.0 (very tidy).
        social_level             – 0.0 (introvert) … 1.0 (very social).
        smoking                  – Boolean lifestyle flag.
        pets_allowed             – Boolean lifestyle flag.
    """

    __tablename__ = "user_preferences"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    user_id        = Column(String, ForeignKey("users.id"), unique=True, nullable=False)

    budget_min     = Column(Float, default=0.0)
    budget_max     = Column(Float, default=500.0)
    sleep_schedule = Column(Float, default=0.5)    # mid-range default
    study_habits   = Column(Float, default=0.5)
    cleanliness    = Column(Float, default=0.5)
    social_level   = Column(Float, default=0.5)
    smoking        = Column(Boolean, default=False)
    pets_allowed   = Column(Boolean, default=False)

    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to User
    user           = relationship("User", back_populates="preference")


# ===========================================================================
# ─── LISTINGS TABLE ──────────────────────────────────────────────────────────
# ===========================================================================

class Listing(Base):
    """
    Mirrors the housing `listings` table.

    Used by:
      - Chatbot service  → query listings by price / location / type.
      - Tagging service  → read title + description, write back generated tags.
    """

    __tablename__ = "listings"

    id            = Column(String, primary_key=True, index=True)   # UUID
    owner_id      = Column(String, ForeignKey("users.id"), nullable=False)

    title         = Column(String(200), nullable=False)
    description   = Column(Text, nullable=True)
    price         = Column(Float, nullable=False)                   # JOD / month
    location      = Column(String(200), nullable=False)
    listing_type  = Column(String(50), nullable=False)             # apartment|room|studio|villa

    # Tagging service writes to these columns
    amenity_tags  = Column(Text, nullable=True)                    # JSON-encoded list
    price_tier    = Column(String(20), nullable=True)              # budget|mid-range|premium
    location_tag  = Column(String(100), nullable=True)

    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=datetime.utcnow)

    # Relationship
    owner         = relationship("User", back_populates="listings")
