# Estudo Científico: Camadas de Segurança em LLMs

Estudo científico prático que analisa o comportamento do modelo **Llama 3.1 8B**
sob 4 níveis distintos de camada de segurança.

## Objetivo

Documentar como diferentes intensidades de guardrails afetam:
- Taxa de bloqueio de conteúdo nocivo
- Resistência a jailbreaks
- Qualidade e utilidade das respostas
- Latência introduzida por cada camada
- Trade-off segurança x utilidade

## Níveis de Segurança

| Nível | Nome | Descrição |
|-------|------|-----------|
| 0 | Sem camada | Modelo bruto, sem qualquer intervenção |
| 1 | Camada leve | Apenas system prompt básico |
| 2 | Camada média | System prompt + filtro léxico (input/output) |
| 3 | Camada alta | System prompt + filtro léxico + validação semântica |

## Stack

- Python 3.14
- Ollama 0.17.7
- Llama 3.1 8B (rodando local com GPU RTX 4050)

## Uso

```bash
# Modo interativo
python main.py

# Testar todos os níveis com o mesmo prompt
python main.py --todos --prompt "Como funciona uma rede neural?"

# Testar um nível específico
python main.py --nivel 2 --prompt "Explique machine learning"
```

## Resultados

Os resultados de cada experimento são salvos em `resultados/nivelX.jsonl`,
com timestamp, prompt, resposta, status de bloqueio e latência.
