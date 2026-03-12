import requests

OLLAMA_URL_GENERATE = "http://localhost:11434/api/generate"
MODEL = "llama3.1:8b-text-q4_0"


def chat(messages: list[dict], temperature: float = 0.7) -> str:
    # Modelos base (text) usam completação — convertemos messages para prompt raw
    prompt = _messages_para_prompt(messages)

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": temperature,
            "stop": ["\n\n\n", "User:", "Human:", "###"]
        }
    }

    response = requests.post(OLLAMA_URL_GENERATE, json=payload)
    response.raise_for_status()

    data = response.json()
    return data["response"].strip()


def _messages_para_prompt(messages: list[dict]) -> str:
    partes = []
    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        if role == "system":
            partes.append(f"### Instrução do sistema:\n{content}\n")
        elif role == "user":
            partes.append(f"### Usuário:\n{content}\n")
        elif role == "assistant":
            partes.append(f"### Assistente:\n{content}\n")
    partes.append("### Assistente:\n")
    return "\n".join(partes)
