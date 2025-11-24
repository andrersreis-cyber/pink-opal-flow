# 🚨 CORREÇÃO FINAL: JSON Body para verificar_disponibilidade_por_funcionario

## 📋 **COPIE E COLE NO N8N AGORA:**

Abra a tool `verificar_disponibilidade_por_funcionario` e cole EXATAMENTE este JSON no campo "JSON Body":

```json
{
  "p_data_inicio": "={{ $fromAI('data_inicio', 'Data/hora início ISO 8601 com timezone (ex: 2025-11-26T10:00:00-03:00)', 'string') }}",
  "p_data_fim": "={{ $fromAI('data_fim', 'Data/hora fim ISO 8601 com timezone (ex: 2025-11-26T12:00:00-03:00). Calcule baseado na duração do serviço.', 'string') }}",
  "p_servico_id": "={{ $fromAI('servico_id', 'ID do serviço (ex: plas-06) ou Nome do Serviço (ex: Harmonização facial)', 'string', '', false) }}"
}
```

---

## 🧐 **POR QUE ISSO É CRÍTICO?**

1. **Nomes dos Parâmetros:** Devem ter `p_` (ex: `p_data_inicio`). Se faltar, o banco ignora e retorna erro.
2. **Ordem:** Embora JSON não tenha ordem, é bom manter padronizado.
3. **Formato da Data:** O prompt do `$fromAI` deve instruir explicitamente o timezone `-03:00`.

---

## 🧪 **TESTE DE FOGO:**

Após colar e salvar, faça o mesmo teste:
`"Quero harmonização facial com a Liz dia 26/11 às 10h"`

Se o banco está retornando `true` (como provamos via SQL), com esse JSON correto o n8n **TEM** que entender que está livre.

