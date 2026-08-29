import subprocess
import sys
import time


services = [
    {
        "name": "chatbot",
        "cmd": [sys.executable, "-m", "uvicorn", "chatbot_api.chatmain:app", "--host", "127.0.0.1", "--port", "8001"],
    },
    {
        "name": "matching",
        "cmd": [sys.executable, "-m", "uvicorn", "matching_api.Matchingmain:app", "--host", "127.0.0.1", "--port", "8002"],
    },
    {
        "name": "tagging",
        "cmd": [sys.executable, "-m", "uvicorn", "tagging_api.taggmain:app", "--host", "127.0.0.1", "--port", "8003"],
    },
    {
        "name": "gateway",
        "cmd": [sys.executable, "-m", "uvicorn", "gateway_api.gatewaymain:app", "--host", "127.0.0.1", "--port", "8000"],
    },
]


processes = []


try:
    print("Starting Nestify AI services...\n")

    for service in services:
        print(f"Starting {service['name']} service...")
        process = subprocess.Popen(service["cmd"])
        processes.append(process)
        time.sleep(1)

    print("\nAll services started.")
    print("Gateway:  http://127.0.0.1:8000/docs")
    print("Chatbot:  http://127.0.0.1:8001/docs")
    print("Matching: http://127.0.0.1:8002/docs")
    print("Tagging:  http://127.0.0.1:8003/docs")
    print("\nPress CTRL+C to stop all services.\n")

    for process in processes:
        process.wait()

except KeyboardInterrupt:
    print("\nStopping all services...")

    for process in processes:
        process.terminate()

    print("All services stopped.")
    sys.exit(0)