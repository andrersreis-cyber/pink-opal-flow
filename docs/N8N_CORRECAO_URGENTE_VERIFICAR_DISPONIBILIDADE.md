# 🚨 CORREÇÃO URGENTE: verificar_disponibilidade_por_funcionario

## 📋 **PROBLEMA IDENTIFICADO:**

**Erro:**
```
Could not find the function public.verificar_disponibilidade_por_funcionario(p_data_fim, p_data_inicio)
```

**Causa:** Parâmetros na ordem errada no JSON Body

---

## 🔧 **CORREÇÃO:**

### **Localizar no n8n:**
Node: `verificar_disponibilidade_por_funcionario` (HTTP Request Tool)

### **Seção: JSON Body**

**ANTES (Errado):**
```json
{
  "p_data_fim": "={{ $fromAI('data_fim', '...', 'string') }}",
  "p_data_inicio": "={{ $fromAI('data_inicio', '...', 'string') }}"
}
```

**DEPOIS (Correto):**
```json
{
  "p_data_inicio": "={{ $fromAI('data_inicio', 'Data/hora início ISO 8601 (ex: 2025-11-26T10:00:00-03:00)', 'string') }}",
  "p_data_fim": "={{ $fromAI('data_fim', 'Data/hora fim ISO 8601, posterior a data_inicio', 'string') }}",
  "p_servico_id": "={{ $fromAI('servico_id', 'ID do serviço para filtrar (opcional)', 'string', '', false) }}"
}
```

**⚠️ MUDANÇAS:**
1. **`p_data_inicio` PRIMEIRO**
2. **`p_data_fim` DEPOIS**
3. **Adicionado `p_servico_id`** (opcional, mas importante)

---

## ✅ **PASSOS:**

1. Abrir n8n
2. Editar workflow
3. Clicar no node `verificar_disponibilidade_por_funcionario`
4. Aba "HTTP Request Settings"
5. Seção "Body" → "JSON Body"
6. **SUBSTITUIR** pelo JSON correto acima
7. Salvar workflow
8. Testar novamente

---

## 🧪 **TESTE:**

Enviar no WhatsApp:
```
"Quero harmonização facial com a Liz dia 26/11 às 10h"
```

**Resultado Esperado:**
```
Agente: "A Liz Martins está disponível no dia 26/11 às 10:00 
         para Harmonização Facial (R$ 1500, 120 minutos).
         
         Quer que eu faça o agendamento para você?"
```

---

## 📊 **ANÁLISE DA INTERAÇÃO:**

### **✅ O QUE JÁ FUNCIONA:**
1. ✅ Agente identificou que Carla não faz Harmonização
2. ✅ Ofereceu Liz e Maria
3. ✅ Aceitou escolha do cliente (Liz)

### **❌ O QUE PRECISA CORRIGIR:**
1. ❌ Ordem dos parâmetros em `verificar_disponibilidade_por_funcionario`

### **⚠️ OBSERVAÇÃO:**
Agente mencionou "Maria Silva", mas no banco só temos Liz e Carla. 
Provavelmente está "alucinando" ou pegando de cache antigo.

---

## 🎯 **PRÓXIMA AÇÃO:**

Após corrigir, testar novamente e validar que:
- [ ] Verifica disponibilidade corretamente
- [ ] Cria agendamento com `funcionario_id` da Liz
- [ ] Não menciona funcionários inexistentes

---

**Prioridade:** 🚨 CRÍTICA  
**Tempo:** 2 minutos

