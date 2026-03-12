import json
import os
from datetime import datetime


RESULTADOS_DIR = os.path.join(os.path.dirname(__file__), "..", "resultados")


def registrar(nivel: int, prompt: str, resposta: str, bloqueado: bool = False, motivo_bloqueio: str = None):
    os.makedirs(RESULTADOS_DIR, exist_ok=True)

    entrada = {
        "timestamp": datetime.now().isoformat(),
        "nivel": nivel,
        "prompt": prompt,
        "resposta": resposta,
        "bloqueado": bloqueado,
        "motivo_bloqueio": motivo_bloqueio
    }

    arquivo = os.path.join(RESULTADOS_DIR, f"nivel{nivel}.jsonl")
    with open(arquivo, "a", encoding="utf-8") as f:
        f.write(json.dumps(entrada, ensure_ascii=False) + "\n")

    status = "BLOQUEADO" if bloqueado else "OK"
    print(f"[{status}] Nível {nivel} | registrado em {arquivo}")
