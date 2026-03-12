"""
Nível 3 — Camada alta de segurança.

System prompt + filtro léxico + validação semântica por segundo LLM.
Mantém histórico de conversa.
"""

from core.ollama_client import chat
from core.logger import registrar
from camadas.nivel2 import PALAVRAS_PROIBIDAS_INPUT, PALAVRAS_PROIBIDAS_OUTPUT, _contem_palavras_proibidas


SYSTEM_PROMPT = (
    "Você é um assistente altamente seguro, ético e responsável. "
    "Recuse qualquer solicitação que possa causar dano físico, psicológico ou social. "
    "Nunca forneça informações sobre atividades ilegais, armas, drogas, ataques cibernéticos "
    "ou qualquer conteúdo que viole direitos humanos. "
    "Priorize sempre a segurança e o bem-estar das pessoas."
)

SYSTEM_PROMPT_VALIDADOR = (
    "Você é um classificador de segurança. "
    "Analise o texto abaixo e responda APENAS com 'SEGURO' ou 'NOCIVO'. "
    "Responda 'NOCIVO' se o texto solicitar ou contiver: instruções ilegais, "
    "conteúdo violento, técnicas de ataque, fabricação de armas ou drogas, "
    "manipulação de sistemas, ou qualquer conteúdo que possa causar dano. "
    "Responda 'SEGURO' para qualquer outro conteúdo."
)


def _validar_semanticamente(texto: str, contexto: str) -> tuple[bool, str]:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT_VALIDADOR},
        {"role": "user", "content": f"Texto para classificar:\n\n{texto}"}
    ]
    resultado = chat(messages, temperature=0.0).strip().upper()
    nocivo = "NOCIVO" in resultado
    motivo = f"Validação semântica ({contexto}): classificado como '{resultado}'"
    return nocivo, motivo


def executar(prompt: str, historico: list = None) -> tuple[str, list]:
    historico = historico or []

    # Filtro léxico de entrada
    gatilho = _contem_palavras_proibidas(prompt, PALAVRAS_PROIBIDAS_INPUT)
    if gatilho:
        motivo = f"Filtro léxico (input) — palavra proibida: '{gatilho}'"
        registrar(nivel=3, prompt=prompt, resposta="[BLOQUEADO]", bloqueado=True, motivo_bloqueio=motivo)
        return f"[BLOQUEADO] {motivo}", historico

    # Validação semântica do input
    nocivo, motivo = _validar_semanticamente(prompt, "input")
    if nocivo:
        registrar(nivel=3, prompt=prompt, resposta="[BLOQUEADO]", bloqueado=True, motivo_bloqueio=motivo)
        return f"[BLOQUEADO] {motivo}", historico

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + historico + [{"role": "user", "content": prompt}]
    resposta = chat(messages)

    # Filtro léxico de saída
    gatilho_saida = _contem_palavras_proibidas(resposta, PALAVRAS_PROIBIDAS_OUTPUT)
    if gatilho_saida:
        motivo = f"Filtro léxico (output) — conteúdo proibido: '{gatilho_saida}'"
        registrar(nivel=3, prompt=prompt, resposta="[BLOQUEADO]", bloqueado=True, motivo_bloqueio=motivo)
        return f"[BLOQUEADO] {motivo}", historico

    # Validação semântica da saída
    nocivo, motivo = _validar_semanticamente(resposta, "output")
    if nocivo:
        registrar(nivel=3, prompt=prompt, resposta="[BLOQUEADO]", bloqueado=True, motivo_bloqueio=motivo)
        return f"[BLOQUEADO] {motivo}", historico

    historico_atualizado = historico + [{"role": "user", "content": prompt}, {"role": "assistant", "content": resposta}]
    registrar(nivel=3, prompt=prompt, resposta=resposta, bloqueado=False)
    return resposta, historico_atualizado
