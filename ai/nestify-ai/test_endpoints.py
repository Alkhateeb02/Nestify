import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    print("\n--- Testing Health Check ---")
    try:
        response = requests.get(f"{BASE_URL}/ai/health")
        print(f"Status: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

def test_chat():
    print("\n--- Testing Chat API ---")
    payload = {"message": "I need a room near AHU for 150 JOD"}
    try:
        response = requests.post(f"{BASE_URL}/ai/chat", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        if data["success"]:
            print(f"Bot: {data['data']['response'][:100]}...")
        else:
            print(f"Failed: {data}")
    except Exception as e:
        print(f"Error: {e}")

def test_matching():
    print("\n--- Testing Matching API ---")
    payload = {
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
    try:
        response = requests.post(f"{BASE_URL}/ai/match", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        if data["success"]:
            print(f"Matches found: {len(data['data']['matches'])}")
            for m in data['data']['matches']:
                print(f" - Student {m['student_id']}: {m['similarity_score']}%")
        else:
            print(f"Failed: {data}")
    except Exception as e:
        print(f"Error: {e}")

def test_tagging():
    print("\n--- Testing Tagging API ---")
    payload = {
        "title": "Cozy studio near AHU",
        "description": "A beautiful studio with high-speed wifi and air conditioning included."
    }
    try:
        response = requests.post(f"{BASE_URL}/ai/tag", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        if data["success"]:
            print(f"Tags: {data['data']['tags']}")
        else:
            print(f"Failed: {data}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Starting Endpoint Tests (make sure run_all.py is running)...")
    test_health()
    test_chat()
    test_matching()
    test_tagging()
