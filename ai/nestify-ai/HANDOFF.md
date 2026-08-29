# 🚀 Nestify AI Integration & Handoff Guide

This document is for the **Backend Developer** responsible for connecting the Nestify AI microservices to the main database and production environment.

## 1. System Overview
The AI layer is a FastAPI-based microservice suite. It uses a **Gateway** pattern to simplify integration.
*   **Gateway URL:** `http://localhost:8000`
*   **Entry Points:** `/ai/chat`, `/ai/match`, `/ai/tag`

## 2. Database Integration (Action Required)
Currently, the services use **Dummy Data** for demonstration. To make the system live, you need to connect it to the PostgreSQL database.

### Step A: Update Connection String
Edit the `.env` file and provide the real PostgreSQL URL:
```env
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname>
```

### Step B: Connect Chatbot to Real Listings
The `ChatbotService` is already set up with SQLAlchemy but currently defaults to dummy data if the DB is empty.
*   **File:** `services/chatbot_service.py`
*   **Task:** Verify the `fetch_listings_from_db` method matches your table schema (currently expects a `properties` table).

### Step C: Connect Matching to Real Students
The Matching service currently uses `DUMMY_STUDENTS`.
*   **File:** `matching_api/Matchingmain.py`
*   **Task:** Replace the `DUMMY_STUDENTS` import with a database query that fetches student profiles and their preferences.
*   **Requirement:** The matching engine expects a list of dictionaries where each student has a `prefs` object matching the `Preferences` schema in `shared/schemas.py`.

## 3. Environment Variables
Ensure the following are set in the production environment:
1.  `GEMINI_API_KEY`: Required for the Chatbot.
2.  `GEMINI_MODEL`: Set to `gemini-flash-latest`.
3.  `DATABASE_URL`: Your PostgreSQL connection string.

## 4. How to Run & Test
1.  **Install:** `pip install -r requirements.txt`
2.  **Start:** `python run_all.py`
3.  **Verify:** Run `python test_endpoints.py` to ensure all routes are responding.
4.  **Swagger Docs:** Visit `http://localhost:8000/docs` for the full API specification.

## 5. Coding Standards
*   **Logic vs API:** Keep AI logic in `services/` and HTTP concerns in `*_api/` folders.
*   **Shared Schemas:** Always update `shared/schemas.py` if the data structure between the Node.js backend and Python AI changes.

---
**Note:** The models (DistilBERT/ResNet) will download automatically on the first run. Ensure the server has internet access and enough disk space (~500MB) for the model weights.
