from pprint import pprint

from services.chatbot_service import ChatbotService
from services.matching_service import MatchingService
from services.tagging_service import AutoTaggingService


def print_section(title: str) -> None:
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)


def test_chatbot() -> None:
    print_section("CHATBOT TESTS")

    bot = ChatbotService()

    messages = [
        "hello",
        "how this website works",
        "i need room near university",
        "what is the price of rooms",
        "cheap room in maan",
    ]

    for i, msg in enumerate(messages, start=1):
        print(f"\n--- Chat Test {i} ---")
        print("User:", msg)
        response = bot.get_response(msg)
        print("Bot :", response)


def test_matching() -> None:
    print_section("ROOMMATE MATCHING TEST")

    matcher = MatchingService()

    current_user = {
        "id": 10,
        "gender": "male",
        "prefs": {
            "sleep": "late",
            "smoke": "no",
            "clean": 4,
            "noise": 2,
            "social": 3
        }
    }

    print("\nCurrent user:")
    pprint(current_user)

    results = matcher.find_matches(current_user, k=2)

    print("\nMatches:")
    pprint(results)


def test_tagging() -> None:
    print_section("AUTO-TAGGING TESTS")

    tagger = AutoTaggingService()

    samples = [
        {
            "title": "Private furnished room near AHU",
            "description": (
                "Fully furnished private room with WiFi, AC, and utilities included. "
                "5 minutes from AHU, near shops and transportation. Parking available."
            ),
            "image_path": None,
        },
        {
            "title": "Shared student room in Ma'an center",
            "description": (
                "Shared room with two beds in city center. Internet included. "
                "Near services and easy transport. Smoking allowed."
            ),
            "image_path": None,
        },
        {
            "title": "Apartment for students",
            "description": (
                "Safe building with security cameras. Pet friendly apartment near university. "
                "Includes parking and air conditioning."
            ),
            "image_path": None,
        },
    ]

    for i, sample in enumerate(samples, start=1):
        print("\n" + "-" * 60)
        print(f"--- Listing {i} ---")
        print("Title:", sample["title"])
        print("Description:", sample["description"])

        result = tagger.predict_tags(
            title=sample["title"],
            description=sample["description"],
            image_path=sample["image_path"],
            top_k=8,
        )

        print("\nPredicted tags:")
        pprint(result["tags"])

        print("\nScores:")
        pprint(result["scores"])

        print("\nBooster scores:")
        pprint(result["components"]["booster"])


if __name__ == "__main__":
    test_chatbot()
    test_matching()
    test_tagging()