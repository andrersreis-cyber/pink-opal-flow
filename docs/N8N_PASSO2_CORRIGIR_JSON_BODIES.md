# 🔧 PASSO 2: Corrigir JSON Bodies em Todas as Tools

## 📋 **OBJETIVO:**
Corrigir formatação JSON em todas as tools para evitar o erro "JSON parameter needs to be valid JSON"

---

## 🚨 **PROBLEMA:**
JSON Bodies malformados causam erro quando o agente IA tenta chamar as ferramentas.

---

## ✅ **REGRAS DE FORMATAÇÃO:**

### **REGRA 1: Sempre usar `=` antes de `{{`**
```json
// ❌ ERRADO
{
  "p_telefone": {{ $fromAI(...) }}
}

// ✅ CORRETO
{
  "p_telefone": "={{ $fromAI(...) }}"
}
```

### **REGRA 2: Envolver expressões em aspas duplas**
```json
// ❌ ERRADO
{
  "p_telefone": ={{ $fromAI(...) }}
}

// ✅ CORRETO
{
  "p_telefone": "={{ $fromAI(...) }}"
}
```

### **REGRA 3: Não duplicar símbolos**
```json
// ❌ ERRADO
={
  "p_telefone": "={{ $fromAI(...) }}"
}

// ✅ CORRETO
{
  "p_telefone": "={{ $fromAI(...) }}"
}
```

---

## 🔧 **CORREÇÕES POR TOOL:**

### **TOOL 1: `verificar_disponibilidade`**

**ANTES (Errado):**
```json
={
  "p_data_inicio": "{{ $fromAI('data_inicio', 'Data/hora início ISO 8601 FUTURA', 'string') }}",
  "p_data_fim": "{{ $fromAI('data_fim', 'Data/hora fim ISO 8601 FUTURA', 'string') }}"
}
```

**DEPOIS (Correto):**
```json
{
  "p_data_inicio": "={{ $fromAI('data_inicio', 'Data/hora início ISO 8601 FUTURA (ex: 2025-12-05T14:00:00-03:00)', 'string') }}",
  "p_data_fim": "={{ $fromAI('data_fim', 'Data/hora fim ISO 8601 FUTURA, POSTERIOR a data_inicio. Calcule baseado na duração do serviço', 'string') }}"
}
```

**⚠️ MUDANÇAS:**
- Removido `={` no início
- Adicionado `=` antes de cada `{{`
- Melhorado description com exemplo

---

### **TOOL 2: `criar_agendamento_validado`**

**ANTES (Errado):**
```json
={
  "p_cliente_id": {{ $fromAI('cliente_id', 'ID numérico do cliente', 'number') }},
  "p_servico_id": "={{ $fromAI('servico_id', 'ID do serviço', 'string') }}",
  "p_data": "={{ $fromAI('data', 'Data ISO 8601 com timezone', 'string') }}",
  "p_observacoes": "={{ $fromAI('observacoes', 'Observações opcionais', 'string', '', false) }}"
}
```

**DEPOIS (Correto):**
```json
{
  "p_cliente_id": "={{ $fromAI('cliente_id', 'ID numérico do cliente obtido de obter_cliente_id_por_telefone', 'number') }}",
  "p_servico_id": "={{ $fromAI('servico_id', 'ID do serviço (código, ex: av-01, bl-01, hf-01)', 'string') }}",
  "p_data": "={{ $fromAI('data', 'Data e hora ISO 8601 com timezone Brasil (ex: 2025-12-05T14:00:00-03:00)', 'string') }}",
  "p_observacoes": "={{ $fromAI('observacoes', 'Observações opcionais do agendamento', 'string', '', false) }}",
  "p_funcionario_id": "={{ $fromAI('funcionario_id', 'UUID do funcionário escolhido (obtido de listar_funcionarios_por_servico)', 'string', '', false) }}"
}
```

**⚠️ MUDANÇAS:**
- Removido `={` no início
- Adicionado `=` antes de `$fromAI('cliente_id'...)`
- Adicionado aspas em `cliente_id` (mesmo sendo number, envolver em string funciona melhor)
- **ADICIONADO** `p_funcionario_id` (NOVO PARÂMETRO!)
- Melhorados descriptions com exemplos

---

### **TOOL 3: `obter_cliente_id_por_telefone`**

**ANTES (Errado):**
```json
{
  "p_telefone": "{{ ($('Extrair Dados').item.json.telefone || '').replace('@s.whatsapp.net', '').replace('@c.us', '').replace('@lid', '').replace(/\\D/g, '') }}"
}
```

**DEPOIS (Correto):**
```json
{
  "p_telefone": "={{ $('Normalizar Telefone').item.json.telefone_normalizado }}"
}
```

**⚠️ MUDANÇAS:**
- Agora usa saída do node "Normalizar Telefone"
- Mais simples e robusto
- Garante formato correto

---

### **TOOL 4: `listar_agendamentos_por_telefone`**

**ANTES (Errado):**
```json
{
  "p_telefone": "{{ $fromAI('telefone', 'Telefone do cliente', 'string') }}"
}
```

**DEPOIS (Correto):**
```json
{
  "p_telefone": "={{ $('Normalizar Telefone').item.json.telefone_normalizado }}"
}
```

**⚠️ MUDANÇAS:**
- Usa telefone normalizado
- Remove dependência do $fromAI (mais confiável)

---

### **TOOL 5: `obter_ultimo_funcionario_cliente`**

**ANTES (Errado):**
```json
{
  "telefone": "{{ $('Extrair Dados').item.json.telefone }}"
}
```

**DEPOIS (Correto):**
```json
{
  "p_telefone": "={{ $('Normalizar Telefone').item.json.telefone_normalizado }}"
}
```

**⚠️ MUDANÇAS:**
- Corrigido nome do parâmetro: `telefone` → `p_telefone`
- Usa telefone normalizado
- Adicionado `=` antes de `{{`

---

### **TOOL 6: `verificar_disponibilidade_por_funcionario`**

**ANTES (se existe):**
```json
{
  "p_data_inicio": "{{ $fromAI(...) }}",
  "p_data_fim": "{{ $fromAI(...) }}",
  "p_servico_id": "{{ $fromAI(...) }}"
}
```

**DEPOIS (Correto):**
```json
{
  "p_data_inicio": "={{ $fromAI('data_inicio', 'Data/hora início ISO 8601 (ex: 2025-12-05T14:00:00-03:00)', 'string') }}",
  "p_data_fim": "={{ $fromAI('data_fim', 'Data/hora fim ISO 8601, posterior a data_inicio', 'string') }}",
  "p_servico_id": "={{ $fromAI('servico_id', 'ID do serviço (opcional, para filtrar por serviço)', 'string', '', false) }}"
}
```

**⚠️ MUDANÇAS:**
- Adicionado `=` antes de cada `{{`
- Melhorados descriptions

---

### **TOOL 7: `upsert_cliente_completo`**

**ANTES (Errado):**
```json
{
  "p_telefone": "{{ $fromAI(...) }}",
  "p_nome": "{{ $fromAI(...) }}",
  ...
}
```

**DEPOIS (Correto):**
```json
{
  "p_telefone": "={{ $('Normalizar Telefone').item.json.telefone_normalizado }}",
  "p_nome": "={{ $fromAI('nome_cliente', 'Nome completo do cliente', 'string') }}",
  "p_email": "={{ $fromAI('email_cliente', 'Email do cliente (opcional)', 'string', '', false) }}",
  "p_data_nascimento": "={{ $fromAI('data_nascimento', 'Data de nascimento (opcional, formato: YYYY-MM-DD)', 'string', '', false) }}"
}
```

**⚠️ MUDANÇAS:**
- Telefone usa normalizado
- Adicionado `=` antes de cada `{{`
- Melhorados descriptions

---

## 📋 **CHECKLIST DE CORREÇÃO:**

Para CADA tool, verificar:
- [ ] Não tem `={` no início do JSON
- [ ] Cada expressão `$fromAI` tem `=` antes de `{{`
- [ ] Cada expressão está envolvida em aspas duplas `"=..."`
- [ ] Descriptions são claras e com exemplos
- [ ] Nomes de parâmetros começam com `p_` (ex: `p_telefone`)
- [ ] Telefones usam `$('Normalizar Telefone').item.json.telefone_normalizado`

---

## ✅ **VALIDAÇÃO:**

Após corrigir todas as tools:
1. Salvar workflow
2. Fazer teste manual:
   - Enviar mensagem teste no WhatsApp
   - Ver logs do n8n
   - Verificar se nenhum erro de JSON aparece

---

## 🎯 **PRÓXIMO PASSO:**

Após concluir este passo, vá para:
**PASSO 3: Corrigir Expression de Telefone**

---

**Status:** ⏳ Aguardando execução  
**Prioridade:** 🚨 CRÍTICA

