# Nestify AI Microservice

## Overview

Nestify AI is a Python-based microservice suite developed for the Nestify student housing platform at Al-Hussein Bin Talal University (AHU).

This service provides the intelligent backbone of the platform, including a semantic chatbot, a roommate matching system, and automated property tagging. It is architected as a set of modular microservices managed by a central **API Gateway**.

---

## 🏗️ Architecture

The system consists of four main components running on dedicated ports:

1.  **API Gateway** (Port 8000): The central entry point that routes requests to the appropriate service.
2.  **Chatbot Service** (Port 8001): Handles natural language inquiries using Google Gemini.
3.  **Matching Service** (Port 8002): Calculates roommate compatibility using vector similarity (FAISS).
4.  **Tagging Service** (Port 8003): Generates property tags using a multimodal semantic model (DistilBERT + ResNet18).

---

## 🛠️ Technology Stack

*   **Language:** Python 3.10
*   **Web Framework:** FastAPI + Uvicorn
*   **AI Reasoning:** Google Gemini 3 Flash (via Generative Language API)
*   **Vector Search:** FAISS (Facebook AI Similarity Search)
*   **Deep Learning:** PyTorch + HuggingFace Transformers (DistilBERT)
*   **Computer Vision:** Torchvision (ResNet18)
*   **Data Validation:** Pydantic

---

## 🚀 Getting Started

### 1. Prerequisites
*   Python 3.10+
*   Virtual Environment (`venv`)

### 2. Installation
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Setup
Create a `.env` file in the project root based on `.env.example`:
```env
GEMINI_API_KEY=your_google_gemini_key
GEMINI_MODEL=gemini-flash-latest
DATABASE_URL=postgresql://user:pass@localhost:5432/nestify_db
```

### 4. Running the Services
You can start all services at once using the manager script:
```bash
python run_all.py
```
This will launch the Gateway and all three AI microservices.

---

## 🧠 AI Modules

### 1. Semantic Chatbot
Powered by **Google Gemini 3 Flash**, the chatbot acts as a professional housing expert for AHU students. It is grounded with real-time listing data to provide accurate recommendations.
*   **Endpoint:** `POST /ai/chat` (via Gateway)
*   **Features:** Intent recognition, housing search, and platform explanation.

### 2. Roommate Matching
Uses **FAISS** to perform high-speed vector similarity matching based on student preferences (sleep, smoking, cleanliness, etc.).
*   **Endpoint:** `POST /ai/match` (via Gateway)
*   **Logic:** Normalizes preference vectors and calculates compatibility scores.

### 3. Automated Tagging
A hybrid multimodal model that analyzes listing titles, descriptions, and images to predict tags like `wifi`, `near_uni`, or `furnished`.
*   **Endpoint:** `POST /ai/tag` (via Gateway)
*   **Logic:** Combines DistilBERT semantic similarity with a rule-based booster layer.

---

## 📖 API Documentation

Once the services are running, you can access the interactive Swagger documentation at:
*   **Gateway UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Example Request (Matching)
```json
{
  "id": 1,
  "gender": "male",
  "prefs": {
    "sleep": "early",
    "smoke": "no",
    "clean": 5,
    "noise": 2,
    "social": 3
  }
}
```

---

## 🎓 Academic Context
This project is part of a graduation project for the Computer Science department at **Al-Hussein Bin Talal University (AHU)**, Ma'an, Jordan.