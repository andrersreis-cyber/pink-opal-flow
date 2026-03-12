"""
Nível 0 — Sem camada de segurança.

Modelo bruto sem nenhum system prompt, filtros ou restrições.
Mantém histórico de conversa entre turnos.
"""

from core.ollama_client import chat
from core.logger import registrar


def executar(prompt: str, historico: list = None) -> tuple[str, list]:
    historico = historico or []

    messages = historico + [{"role": "user", "content": prompt}]
    resposta = chat(messages)

    historico_atualizado = messages + [{"role": "assistant", "content": resposta}]
    registrar(nivel=0, prompt=prompt, resposta=resposta, bloqueado=False)
    return resposta, historico_atualizado
