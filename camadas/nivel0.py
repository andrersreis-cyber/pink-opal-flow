"""
Nível 0 — Sem camada de segurança.

O modelo recebe o prompt diretamente, sem nenhum system prompt,
sem filtros de entrada ou saída. Comportamento bruto do LLM.

Objetivo científico: observar o comportamento base do modelo
sem qualquer intervenção externa de segurança.
"""

from core.ollama_client import chat
from core.logger import registrar


def executar(prompt: str) -> str:
    messages = [
        {"role": "user", "content": prompt}
    ]

    resposta = chat(messages)
    registrar(nivel=0, prompt=prompt, resposta=resposta, bloqueado=False)
    return resposta
