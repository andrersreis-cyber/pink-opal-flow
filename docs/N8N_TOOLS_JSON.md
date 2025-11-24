# 🔧 N8N - JSON dos Tools HTTP Request

**Copie e cole estes JSONs diretamente no N8N**

---

## TOOL 1: listar_funcionarios_por_servico

### Tool Description (campo de texto):
```
Lista funcionários habilitados para executar um serviço específico. SEMPRE use esta tool antes de criar agendamento. Parâmetros: servico_id (obrigatório). Retorna: lista de funcionários com nome, email e nível de habilidade.
```

### HTTP Request Configuration:

**URL:**
```
{{$env.SUPABASE_URL}}/rest/v1/rpc/listar_funcionarios_por_servico
```

**Method:** `POST`

**Authentication:** `Header Auth`

**Headers:**
| Name | Value |
|------|-------|
| apikey | `{{$env.SUPABASE_ANON_KEY}}` |
| Authorization | `Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}` |
| Content-Type | `application/json` |

**Body (Send Body):** ✅ Enabled

**Body Type:** `JSON`

**JSON Body:**
```json
{
  "p_servico_id": "={{ $parameter.servico_id }}"
}
```

---

## TOOL 2: obter_ultimo_funcionario_cliente

### Tool Description:
```
Busca o último funcionário que atendeu um cliente. Use para oferecer continuidade. Parâmetros: telefone (normalizado 55DDNNNNNNNNN). Retorna: funcionario_id, nome, data.
```

### HTTP Request Configuration:

**URL:**
```
{{$env.SUPABASE_URL}}/rest/v1/rpc/obter_ultimo_funcionario_cliente
```

**Method:** `POST`

**Headers:**
| Name | Value |
|------|-------|
| apikey | `{{$env.SUPABASE_ANON_KEY}}` |
| Authorization | `Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}` |
| Content-Type | `application/json` |

**JSON Body:**
```json
{
  "p_telefone": "={{ $parameter.telefone }}"
}
```

---

## TOOL 3: verificar_disponibilidade_por_funcionario (ATUALIZAR)

### Tool Description (ATUALIZAR):
```
Verifica disponibilidade de funcionários. OPCIONALMENTE filtra por serviço (recomendado). Parâmetros: data_inicio, data_fim, servico_id (opcional). Retorna: lista com status disponível.
```

### JSON Body (ATUALIZAR - adicionar servico_id):
```json
{
  "p_data_inicio": "={{ $parameter.data_inicio }}",
  "p_data_fim": "={{ $parameter.data_fim }}",
  "p_servico_id": "={{ $parameter.servico_id || null }}"
}
```

---

## TOOL 4: criar_agendamento_validado (ATUALIZAR)

### JSON Body (ATUALIZAR - adicionar funcionario_id):
```json
{
  "p_cliente_id": "={{ $parameter.cliente_id }}",
  "p_servico_id": "={{ $parameter.servico_id }}",
  "p_data": "={{ $parameter.data }}",
  "p_observacoes": "={{ $parameter.observacoes || '' }}",
  "p_funcionario_id": "={{ $parameter.funcionario_id }}"
}
```

---

## 📋 ORDEM DE CRIAÇÃO

1. ✅ Criar Tool 1: `listar_funcionarios_por_servico`
2. ✅ Criar Tool 2: `obter_ultimo_funcionario_cliente`
3. ✅ Atualizar Tool 3: Adicionar `p_servico_id`
4. ✅ Atualizar Tool 4: Adicionar `p_funcionario_id`
5. ✅ Atualizar System Prompt (ver N8N_ESPECIALIZACAO_SETUP.md)

---

## 🧪 TESTE RÁPIDO

Após configurar, teste cada tool individualmente:

### Teste Tool 1:
**Input:**
```json
{
  "servico_id": "plas-06"
}
```

**Output Esperado:**
```json
[
  {
    "funcionario_id": "uuid...",
    "funcionario_nome": "Liz Martins",
    "nivel_habilidade": "avancado"
  }
]
```

### Teste Tool 2:
**Input:**
```json
{
  "telefone": "5527995228798"
}
```

**Output Esperado:**
```json
{
  "funcionario_id": "uuid...",
  "funcionario_nome": "Liz Martins",
  "ultimo_atendimento": "2025-11-20T14:00:00-03:00"
}
```

---

## ⚠️ TROUBLESHOOTING

### Erro: "function does not exist"
- Verificar se migrations da versão 6 foram aplicadas
- Confirmar nome da função no Supabase

### Erro: "permission denied"
- Verificar se está usando `SERVICE_ROLE_KEY` (não ANON_KEY)
- Confirmar headers corretos

### Retorna lista vazia
- Verificar se existem vínculos em `funcionario_servicos`
- Confirmar que `ativo = true`

---

**Pronto para configurar! 🚀**

