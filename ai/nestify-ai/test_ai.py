import sys
import os

# Set encoding for console output to handle emojis
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add the current directory to sys.path to import services
sys.path.append(os.getcwd())

from services.chatbot_service import ChatbotService
from services.matching_service import MatchingService
from services.tagging_service import AutoTaggingService

def test_chatbot():
    print("\n--- Testing Chatbot ---")
    bot = ChatbotService()
    
    queries = [
        "hello",
        "I need a room near university for 200 JOD",
        "how does this website work?",
        "how much is the average rent?"
    ]
    
    # Mock listings for testing
    listings = [
        {"id": 1, "title": "Great Studio near AHU", "price": 180, "location": "Near AHU", "room_type": "studio", "availability_status": "available"},
        {"id": 2, "title": "Private Room Center", "price": 220, "location": "Ma'an Center", "room_type": "single", "availability_status": "available"},
    ]
    
    for q in queries:
        print(f"User: {q}")
        response = bot.get_response(q, listings)
        print(f"Bot: {response['response']}")
        print(f"Intent: {response['intent']} | Method: {response['method']}")
        print("-" * 20)

def test_matching():
    print("\n--- Testing Roommate Matching ---")
    matcher = MatchingService()
    
    current_user = {
        "id": 101,
        "gender": "male",
        "prefs": {
            "sleep_schedule": "early",
            "smoking_preference": "no",
            "cleanliness_level": 5,
            "noise_tolerance": 2,
            "social_level": 3,
            "study_level": 5,
            "guest_preference": "sometimes",
            "lifestyle_type": "quiet",
            "personality_type": "introvert"
        }
    }
    
    candidates = [
        {
            "id": 201,
            "gender": "male",
            "prefs": {
                "sleep_schedule": "early",
                "smoking_preference": "no",
                "cleanliness_level": 4,
                "noise_tolerance": 3,
                "social_level": 2,
                "study_level": 4,
                "guest_preference": "no",
                "lifestyle_type": "quiet",
                "personality_type": "introvert"
            }
        },
        {
            "id": 202,
            "gender": "male",
            "prefs": {
                "sleep_schedule": "late",
                "smoking_preference": "yes",
                "cleanliness_level": 2,
                "noise_tolerance": 5,
                "social_level": 5,
                "study_level": 1,
                "guest_preference": "yes",
                "lifestyle_type": "social",
                "personality_type": "extrovert"
            }
        }
    ]
    
    matches = matcher.find_matches(current_user, candidates)
    print(f"Matching for User {current_user['id']} ({current_user['gender']})")
    for m in matches:
        print(f"Match with Student {m['student_id']}: {m['similarity_score']}% compatible")

def test_tagging():
    print("\n--- Testing Auto Tagging (Multimodal) ---")
    tagger = AutoTaggingService()
    
    listing = {
        "title": "Comfortable room with wifi and AC near AHU",
        "description": "I have a furnished single room near the university. It includes high speed wifi, electricity and water. There is a private parking and security guard. Smoking allowed."
    }
    
    print(f"Listing: {listing['title']}")
    result = tagger.predict_tags(listing['title'], listing['description'])
    print(f"Generated Tags: {result['tags']}")
    
    print("\nScore Details:")
    for tag in result['tags']:
        score = result['scores'][tag]
        print(f"- {tag}: {score}")

if __name__ == "__main__":
    test_chatbot()
    test_matching()
    test_tagging()
