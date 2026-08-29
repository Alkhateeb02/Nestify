import json
import logging
import requests
import re
from typing import List, Dict, Any, Optional

from sqlalchemy import create_engine, text
from core.config import settings

logger = logging.getLogger("chatbot")

class ChatbotService:
    """
    Nestify AI Chatbot (LLM Decision-Based)
    --------------------------------------
    Uses Google Gemini for intelligent reasoning, combined with
    PostgreSQL listing data for grounded responses.
    """

    def __init__(self):
        # 1. Config from Settings
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self.db_url = settings.DATABASE_URL
        
        # 2. Database Engine
        self.engine = create_engine(self.db_url, pool_pre_ping=True)
        
        # 3. Gemini API Endpoint
        self.api_url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model}:generateContent"
        )

    # ---------------------------------------------------------
    # UTILITY METHODS FOR INTENT DETECTION
    # ---------------------------------------------------------
    def is_greeting(self, message: str) -> bool:
        """Detect if the user's message is a greeting in English or Arabic."""
        msg = message.strip().lower()
        greetings = [
            "hi", "hello", "hey", "greetings", "marhaban", "welcome", "hola",
            "مرحبا", "سلام", "هلا", "اهلين", "أهلاً", "صباح الخير", "مساء الخير",
            "مرحباً", "السلام عليكم", "السام عليكم"
        ]
        words = [w.strip("?,.!") for w in msg.split()]
        if not words:
            return False
        return words[0] in greetings or any(g in msg for g in ["مرحبا", "السلام عليكم", "صباح الخير", "مساء الخير"])

    def asks_for_details(self, message: str) -> bool:
        """Detect if the user is explicitly asking for deep details/information."""
        msg = message.lower()
        detail_keywords = [
            "detail", "depth", "more info", "information", "explain in detail",
            "show all", "full details", "تفاصيل", "بالتفصيل", "معلومات أكثر",
            "اشرح لي", "تفصيل"
        ]
        return any(kw in msg for kw in detail_keywords)

    # ---------------------------------------------------------
    # DATABASE ACCESS
    # ---------------------------------------------------------
    def fetch_listings_from_db(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch listings from PostgreSQL properties and units tables, with defensive fallback."""
        # Try production schema first (properties + units join)
        try:
            query = text("""
                SELECT 
                    p.property_id,
                    p.title,
                    p.description,
                    p.address as location,
                    p.ai_tags,
                    u.price,
                    u.type as room_type,
                    u.availability_status
                FROM properties p
                JOIN units u ON p.property_id = u.property_id
                WHERE u.availability_status = 'available'
                LIMIT :limit
            """)
            with self.engine.connect() as conn:
                rows = conn.execute(query, {"limit": limit})
                results = []
                for row in rows:
                    mapping = dict(row._mapping)
                    mapping["property_id"] = int(mapping["property_id"])
                    mapping["price"] = float(mapping["price"])
                    
                    # Parse ai_tags to enrich properties context (gender, features, rules, etc.)
                    if mapping.get("ai_tags"):
                        try:
                            tags = json.loads(mapping["ai_tags"]) if isinstance(mapping["ai_tags"], str) else mapping["ai_tags"]
                            if isinstance(tags, dict):
                                mapping["gender"] = tags.get("gender", "Mixed")
                                mapping["features"] = tags.get("features", [])
                                mapping["rules"] = tags.get("rules", [])
                                mapping["rental_period"] = tags.get("rentalPeriod", "monthly")
                                mapping["currency"] = tags.get("currency", "JOD")
                        except Exception:
                            pass
                    mapping.pop("ai_tags", None) # Clean up raw tags string
                    results.append(mapping)
                return results
        except Exception as exc:
            logger.warning(f"Production schema query failed, trying fallback: {exc}")
            
        # Fallback query for simpler/legacy properties table schema
        try:
            query = text("""
                SELECT 
                    property_id,
                    title,
                    description,
                    address as location
                FROM properties
                LIMIT :limit
            """)
            with self.engine.connect() as conn:
                rows = conn.execute(query, {"limit": limit})
                results = []
                for row in rows:
                    mapping = dict(row._mapping)
                    mapping["property_id"] = int(mapping["property_id"])
                    mapping["price"] = 0.0  # fallback price
                    mapping["room_type"] = "Unknown"
                    mapping["availability_status"] = "available"
                    results.append(mapping)
                return results
        except Exception as exc:
            logger.error(f"Fallback database fetch failed: {exc}")
            return []

    # ---------------------------------------------------------
    # INTELLIGENT SEARCH
    # ---------------------------------------------------------
    def search_listings_context(self, listings: List[Dict], user_query: str) -> List[Dict]:
        """Filter and score listings based on user query keywords, features, gender, and price."""
        query = user_query.lower()
        results = []
        
        for item in listings:
            features_str = " ".join(item.get("features", [])) if isinstance(item.get("features"), list) else ""
            content = f"{item.get('title', '')} {item.get('description', '')} {item.get('location', '')} {item.get('room_type', '')} {item.get('gender', '')} {features_str}".lower()
            
            # Calculate simple overlap score
            score = sum(1 for word in query.split() if word in content)
            
            # Boost score if price matches user budget request (e.g. "150 JOD" or "under 200")
            numbers = [int(n) for n in re.findall(r'\b\d+\b', query)]
            for num in numbers:
                price = item.get("price", 0)
                if price <= num:
                    score += 1
            
            if score > 0:
                item["_relevance"] = score
                results.append(item)
        
        # Sort by relevance and take top 5 for Gemini context
        results.sort(key=lambda x: x.get("_relevance", 0), reverse=True)
        
        # If no keyword matched, return top 5 general listings so the bot can suggest general options
        if not results:
            return listings[:5]
            
        return results[:5]

    # ---------------------------------------------------------
    # PROMPT ENGINEERING
    # ---------------------------------------------------------
    def _build_system_instruction(self, context_listings: List[Dict], is_greet: bool, wants_details: bool) -> str:
        """Create a powerful system prompt for Gemini."""
        listings_json = json.dumps(context_listings, indent=2, default=str)
        
        greeting_instruction = (
            "The user has greeted you (e.g. 'hi', 'hello', 'مرحبا'). Respond with a warm, polite greeting in their language and ask how you can help."
            if is_greet else
            "CRITICAL: The user did NOT greet you. Do NOT include any greetings, welcomes, introduction phrases, or pleasantries (e.g. do NOT say 'Hi', 'Hello', 'مرحباً', 'كيف يمكنني مساعدتك اليوم؟', 'How can I help you?'). Answer the user's question directly and immediately."
        )
        
        detail_instruction = (
            "The user has asked for details. Provide an in-depth, detailed answer with all available features, rules, and specifications."
            if wants_details else
            "Provide a suitable, medium-length answer (neither too long/wordy nor too short/incomplete). Keep it direct and do not give excessive details, rules, or extra lists unless specifically asked."
        )

        return f"""
You are the official Nestify AI Assistant, a professional housing expert for AHU (Al-Hussein Bin Talal University) students in Jordan.

Your Role:
1. Help students find accommodation in Ma'an.
2. Explain Nestify features (Matching, Booking, Tagging, Maintenance).
3. Recommend specific properties from the "AVAILABLE DATA" below.

Operational Rules:
- STRICT SCOPE: Only answer questions about Nestify or Housing. Politely decline other topics.
- LANGUAGE: Detect the language of the user's message. If it is in Arabic, reply in Arabic. If it is in English, reply in English.
- GREETINGS RULE: {greeting_instruction}
- DETAIL LEVEL RULE: {detail_instruction}
- NO HALLUCINATIONS: Return the true, exact answer based strictly on the provided AVAILABLE DATA. Do NOT invent, hallucinate, or add any properties, features, prices, or information that is not explicitly present in the data. If the information requested is not present in the context, do NOT say there is a connection problem or a database error. Instead, politely answer by asking the user to clarify or ask again.
- FORMATTING: Use clean bullet points for listing results if multiple matches exist. Mention Price (JOD), Location, and Type.

AVAILABLE DATA (Real-time from Database):
{listings_json if context_listings else "No listings available right now."}
"""

    # ---------------------------------------------------------
    # AI REASONING (GEMINI)
    # ---------------------------------------------------------
    def ask_gemini(self, system_instruction: str, user_message: str) -> str:
        """Send request to Gemini API."""
        if not self.api_key:
            return "CONNECTION_LIMIT_ERROR"

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key,
        }

        # Gemini 1.5 format (System Instruction + User Message)
        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [
                {
                    "parts": [{"text": user_message}]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        }

        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=20
            )
            
            if response.status_code != 200:
                logger.error(f"Gemini API Error {response.status_code}: {response.text}")
                return "CONNECTION_LIMIT_ERROR"

            data = response.json()
            return data['candidates'][0]['content']['parts'][0]['text']
            
        except Exception as exc:
            logger.exception("Gemini request failed")
            return "CONNECTION_LIMIT_ERROR"

    def get_local_fallback_response(self, message: str) -> str:
        """Simple rule-based fallback responses when Gemini API is offline or rate-limited."""
        is_ar = any(char in message for char in "أبتثجحخدذرزسشصضطظعغفقكلمنهوي")
        is_greet = self.is_greeting(message)
        
        if is_ar:
            if is_greet:
                return "مرحباً! أواجه حالياً مشكلة في الاتصال بالخدمة الذكية. كيف يمكنني مساعدتك بشكل عام؟"
            else:
                return "عذراً، أواجه مشكلة في الاتصال بالخادم أو تم الوصول للحد الأقصى للطلبات حالياً. يرجى المحاولة مرة أخرى لاحقاً أو إعادة صياغة سؤالك."
        else:
            if is_greet:
                return "Hello! I am currently experiencing a connection issue with my AI service. How can I help you generally?"
            else:
                return "Sorry, I am experiencing a connection issue or API limit right now. Please try again later or ask again."

    # ---------------------------------------------------------
    # MAIN ENTRY POINT
    # ---------------------------------------------------------
    def get_response(self, message: str, listings: Optional[List[Any]] = None) -> Dict[str, Any]:
        """Main method called by the API."""
        
        # 1. Fetch data if not provided or empty (RAG pattern)
        if not listings or len(listings) == 0:
            listings = self.fetch_listings_from_db()
            
        # 2. Narrow down the context (to avoid token overflow and stay relevant)
        relevant_context = self.search_listings_context(listings, message)
        
        # 3. Detect if user is greeting
        is_greet = self.is_greeting(message)
        
        # 4. Detect details request
        wants_details = self.asks_for_details(message)
        
        # 5. Build the instruction with grounded context
        system_prompt = self._build_system_instruction(relevant_context, is_greet, wants_details)
        
        # 6. Get the AI to decide and respond
        ai_reply = self.ask_gemini(system_prompt, message)
        
        method_used = "gemini_decision_based"
        # If Gemini fails, fall back to local database-grounded response
        if not ai_reply or ai_reply == "CONNECTION_LIMIT_ERROR":
            ai_reply = self.get_local_fallback_response(message)
            method_used = "local_database_fallback"
            
        return {
            "intent": "llm_chat",
            "method": method_used,
            "response": ai_reply,
            "results": relevant_context,
            "context_size": len(relevant_context)
        }