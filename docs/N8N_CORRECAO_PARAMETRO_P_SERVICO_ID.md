# 🚨 CORREÇÃO CRÍTICA: Tool listar_funcionarios_por_servico

## 📋 **PROBLEMA IDENTIFICADO:**

**Input no n8n:**
```json
{
  "servico_id": "plas-06"
}
```

**Erro:** A função no banco espera `p_servico_id`. Como recebeu `servico_id`, o parâmetro correto ficou NULL e a função retornou lista vazia `[]`.

---

## 🔧 **CORREÇÃO:**

### **1. Abrir n8n**
- Editar node `listar_funcionarios_por_servico`

### **2. Corrigir JSON Body**

**ANTES (Errado):**
```json
{
  "servico_id": "={{ $fromAI(...) }}"
}
```

**DEPOIS (Correto):**
```json
{
  "p_servico_id": "={{ $fromAI('servico_id', 'ID do serviço', 'string') }}"
}
```

**⚠️ O `p_` no início é OBRIGATÓRIO!**

---

## 🧪 **TESTE:**

Após corrigir, o output deve ser:
```json
[
  {
    "funcionario_id": "...",
    "funcionario_nome": "Liz Martins",
    "nivel_habilidade": "avancado"
  }
]
```

---

## 🎯 **IMPORTANTE:**

Verifique se as outras tools também estão com o `p_` correto:
- `obter_cliente_id_por_telefone` -> `p_telefone`
- `listar_agendamentos_por_telefone` -> `p_telefone`
- `obter_ultimo_funcionario_cliente` -> `p_telefone`
- `verificar_disponibilidade_por_funcionario` -> `p_data_inicio`, `p_data_fim`, `p_servico_id`
- `criar_agendamento_validado` -> `p_cliente_id`, `p_servico_id`, etc.

O Supabase exige que o nome da chave no JSON seja **IDÊNTICO** ao nome do parâmetro na função SQL.

