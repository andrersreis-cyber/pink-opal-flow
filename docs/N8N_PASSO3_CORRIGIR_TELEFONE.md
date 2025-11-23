# 🔧 PASSO 3: Corrigir Expression de Telefone

## 📋 **OBJETIVO:**
Garantir que TODAS as tools recebam o telefone correto (do cliente atual, não de outro contexto)

---

## 🚨 **PROBLEMA IDENTIFICADO:**

### **Input do Agente:**
```json
{
  "cliente_id": 66,
  "mensagem_usuario": "gostaria de fazer com a carla dia 5.12",
  "telefone_cliente": "5527995228798"  // ← NATÁLYA (correto)
}
```

### **Input da Tool `obter_ultimo_funcionario_cliente`:**
```json
{
  "telefone": "5527996205115"  // ← ANDRÉ (errado!!!)
}
```

**CAUSA:** Expression está pegando telefone de outro node/contexto

---

## ✅ **SOLUÇÃO: Usar Node "Normalizar Telefone"**

Todos os telefones devem vir do output do node `Normalizar Telefone`, que já faz:
1. Pega telefone do webhook correto
2. Remove sufixos (@s.whatsapp.net, @lid, etc)
3. Normaliza formato
4. Retorna `telefone_normalizado`

---

## 🔧 **CORREÇÕES:**

### **1. Verificar se Node "Normalizar Telefone" Existe**

Se NÃO existir, criar um Code Node:

**Nome:** `Normalizar Telefone`  
**Type:** Code  
**Language:** JavaScript

**Código:**
```javascript
// Normalizar Telefone - Garantir formato consistente
const items = $input.all();

return items.map(item => {
  let telefone = '';
  
  // Tentar pegar telefone de diferentes fontes
  const webhookData = item.json?.body?.data;
  
  if (webhookData?.key?.remoteJidAlt?.includes('@s.whatsapp.net')) {
    telefone = webhookData.key.remoteJidAlt;
  } else if (webhookData?.key?.remoteJid?.includes('@s.whatsapp.net')) {
    telefone = webhookData.key.remoteJid;
  } else if (webhookData?.sender) {
    telefone = webhookData.sender;
  } else if (item.json?.telefone) {
    telefone = item.json.telefone;
  } else if (item.json?.telefone_cliente) {
    telefone = item.json.telefone_cliente;
  }
  
  // Limpar telefone
  const telefoneLimpo = (telefone || '')
    .replace('@s.whatsapp.net', '')
    .replace('@c.us', '')
    .replace('@lid', '')
    .replace(/\D/g, '');  // Remove tudo que não é dígito
  
  // Garantir que começa com 55 (Brasil)
  let telefoneNormalizado = telefoneLimpo;
  if (telefoneLimpo.length === 11 && !telefoneLimpo.startsWith('55')) {
    telefoneNormalizado = '55' + telefoneLimpo;
  } else if (telefoneLimpo.length === 10 && !telefoneLimpo.startsWith('55')) {
    telefoneNormalizado = '55' + telefoneLimpo;
  }
  
  return {
    json: {
      ...item.json,
      telefone_normalizado: telefoneNormalizado,
      telefone_original: telefone
    }
  };
});
```

**Conectar:**
- Input: `Webhook Evolution` → `Normalizar Telefone`
- Output: `Normalizar Telefone` → `Extrair Dados`

---

### **2. Atualizar TODAS as Tools para Usar Telefone Normalizado**

#### **Tool: `obter_cliente_id_por_telefone`**
```json
{
  "p_telefone": "={{ $('Normalizar Telefone').item.json.telefone_normalizado }}"
}
```

#### **Tool: `listar_agendamentos_por_telefone`**
```json
{
  "p_telefone": "={{ $('Normalizar Telefone').item.json.telefone_normalizado }}"
}
```

#### **Tool: `obter_ultimo_funcionario_cliente`**
```json
{
  "p_telefone": "={{ $('Normalizar Telefone').item.json.telefone_normalizado }}"
}
```

#### **Tool: `upsert_cliente_completo`**
```json
{
  "p_telefone": "={{ $('Normalizar Telefone').item.json.telefone_normalizado }}",
  "p_nome": "={{ $fromAI('nome_cliente', 'Nome completo do cliente', 'string') }}",
  ...
}
```

---

### **3. Atualizar AI Agent - Session ID**

**Localizar:** Node `AI Agent` → Settings → Session ID

**ANTES (Errado):**
```
={{ $('Webhook Evolution').item.json.body.data.key.remoteJid }}
```

**DEPOIS (Correto):**
```
={{ $('Normalizar Telefone').item.json.telefone_normalizado }}
```

**IMPORTÂNCIA:**
- Session ID identifica a conversa
- Se usar telefone errado, mistura conversas de clientes diferentes!

---

### **4. Atualizar Node "Extrair Dados" (se existir)**

Se houver um node "Extrair Dados" que extrai telefone:

**Campo: telefone**

**ANTES:**
```
={{ $json.body.data.key.remoteJid }}
```

**DEPOIS:**
```
={{ $('Normalizar Telefone').item.json.telefone_normalizado }}
```

---

### **5. Atualizar Node "Enviar WhatsApp"**

**Campo: Number**

**ANTES:**
```
={{ $('Webhook Evolution').item.json.body.data.key.remoteJid }}
```

**DEPOIS:**
```
={{ $('Normalizar Telefone').item.json.telefone_normalizado }}@s.whatsapp.net
```

**⚠️ IMPORTANTE:** Adicionar `@s.whatsapp.net` no final para o WhatsApp aceitar!

---

## 📋 **CHECKLIST DE VERIFICAÇÃO:**

- [ ] Node "Normalizar Telefone" existe
- [ ] Webhook → Normalizar Telefone → Extrair Dados (ordem correta)
- [ ] AI Agent usa `telefone_normalizado` como Session ID
- [ ] `obter_cliente_id_por_telefone` usa `telefone_normalizado`
- [ ] `listar_agendamentos_por_telefone` usa `telefone_normalizado`
- [ ] `obter_ultimo_funcionario_cliente` usa `telefone_normalizado`
- [ ] `upsert_cliente_completo` usa `telefone_normalizado`
- [ ] Node "Enviar WhatsApp" usa `telefone_normalizado` + sufixo

---

## ✅ **TESTE:**

Após fazer as correções:
1. Salvar workflow
2. Enviar mensagem teste no WhatsApp de um cliente conhecido
3. Ver logs do n8n:
   - Verificar `telefone_normalizado` no output de "Normalizar Telefone"
   - Verificar que Session ID está correto
   - Verificar que tools recebem telefone correto

---

## 🎯 **PRÓXIMO PASSO:**

Após concluir este passo, vá para:
**PASSO 4: Atualizar System Prompt com Validação de Especialização**

---

**Status:** ⏳ Aguardando execução  
**Prioridade:** 🚨 CRÍTICA

