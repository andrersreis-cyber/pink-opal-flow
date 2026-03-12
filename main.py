"""
Estudo Científico: Camadas de Segurança em LLMs
================================================
Testa o mesmo prompt nos 4 níveis de segurança e registra os resultados.

Uso:
    python main.py                     # modo interativo
    python main.py --nivel 0           # testa apenas o nível 0
    python main.py --todos             # roda todos os níveis com o mesmo prompt
"""

import argparse
import time
from camadas import nivel0, nivel1, nivel2, nivel3

NIVEIS = {
    0: nivel0,
    1: nivel1,
    2: nivel2,
    3: nivel3,
}

DESCRICOES = {
    0: "Sem camada de segurança (modelo bruto)",
    1: "Camada leve (system prompt básico)",
    2: "Camada média (system prompt + filtro léxico)",
    3: "Camada alta (system prompt + filtro léxico + validação semântica)",
}


def executar_nivel(nivel: int, prompt: str):
    print(f"\n{'='*60}")
    print(f"NÍVEL {nivel}: {DESCRICOES[nivel]}")
    print(f"{'='*60}")
    print(f"PROMPT: {prompt}\n")

    inicio = time.time()
    resposta = NIVEIS[nivel].executar(prompt)
    duracao = time.time() - inicio

    print(f"RESPOSTA:\n{resposta}")
    print(f"\nLatência: {duracao:.2f}s")


def modo_interativo():
    print("\n=== ESTUDO CIENTÍFICO: CAMADAS DE SEGURANÇA EM LLMs ===\n")
    print("Níveis disponíveis:")
    for n, desc in DESCRICOES.items():
        print(f"  [{n}] {desc}")

    print("\nDigite 'sair' para encerrar.\n")

    while True:
        try:
            nivel_input = input("Escolha o nível (0-3): ").strip()
            if nivel_input.lower() == "sair":
                break

            nivel = int(nivel_input)
            if nivel not in NIVEIS:
                print("Nível inválido. Escolha entre 0 e 3.")
                continue

            prompt = input("Digite o prompt: ").strip()
            if not prompt:
                continue

            executar_nivel(nivel, prompt)

        except (KeyboardInterrupt, EOFError):
            break

    print("\nEstudo encerrado.")


def modo_todos(prompt: str):
    print(f"\n=== TESTANDO TODOS OS NÍVEIS ===")
    print(f"Prompt: {prompt}\n")
    for nivel in range(4):
        executar_nivel(nivel, prompt)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Estudo Científico: Camadas de Segurança em LLMs")
    parser.add_argument("--nivel", type=int, choices=[0, 1, 2, 3], help="Executar apenas um nível específico")
    parser.add_argument("--todos", action="store_true", help="Executar todos os níveis com o mesmo prompt")
    parser.add_argument("--prompt", type=str, help="Prompt a ser testado")
    args = parser.parse_args()

    if args.todos:
        prompt = args.prompt or input("Digite o prompt: ").strip()
        modo_todos(prompt)
    elif args.nivel is not None:
        prompt = args.prompt or input("Digite o prompt: ").strip()
        executar_nivel(args.nivel, prompt)
    else:
        modo_interativo()
