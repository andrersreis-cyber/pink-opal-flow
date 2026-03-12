import requests
import json

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "llama3.1:8b"


def chat(messages: list[dict], temperature: float = 0.7) -> str:
    payload = {
        "model": MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": temperature
        }
    }

    response = requests.post(OLLAMA_URL, json=payload)
    response.raise_for_status()

    data = response.json()
    return data["message"]["content"]
