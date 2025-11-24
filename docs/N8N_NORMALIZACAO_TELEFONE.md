# 📞 NORMALIZAÇÃO DE TELEFONE NO N8N

## 🚨 **PROBLEMA:**

Cliente tentou usar vários formatos de telefone:
- `+5527995228798` ❌ Não funcionou
- `+55027995228798` ❌ Não funcionou (zero extra)
- `27995228798` ✅ Funcionou (sem código país)
- `5527995228798` ✅ Funciona (formato do banco)

**Resultado:** Cliente frustrado, múltiplas tentativas.

---

## ✅ **SOLUÇÃO:**

Adicionar um **Code Node** no n8n que normaliza TODAS as variações de telefone para o formato padrão: `55DDNNNNNNNNN`

---

## 🛠️ **IMPLEMENTAÇÃO:**

### **PASSO 1: Localizar o Node "Extrair Dados"**

No workflow n8n, encontre o node chamado **"Extrair Dados"** (ou similar) que extrai o telefone do webhook da Evolution API.

---

### **PASSO 2: Adicionar Code Node ANTES de Chamar RPCs**

1. **Criar novo node:**
   - Tipo: **Code**
   - Nome: **Normalizar Telefone**
   - Posição: Logo APÓS "Extrair Dados" e ANTES de qualquer RPC

2. **Colar este código JavaScript:**

```javascript
// ================================================================
// NORMALIZAÇÃO DE TELEFONE PARA PADRÃO BRASILEIRO
// Formato de saída: 55DDNNNNNNNNN (55 + DDD + Número)
// ================================================================

// Pegar telefone de diferentes possíveis fontes
const telefoneRaw = 
  $input.item.json.telefone || 
  $input.item.json.body?.data?.key?.remoteJidAlt || 
  $input.item.json.body?.data?.key?.remoteJid || 
  $input.item.json.sender || 
  '';

console.log('Telefone original:', telefoneRaw);

// Remover tudo que não é número
let telefone = telefoneRaw
  .toString()
  .replace(/@s.whatsapp.net/g, '')
  .replace(/@c.us/g, '')
  .replace(/@lid/g, '')
  .replace(/\D/g, ''); // Remove tudo que não é dígito

console.log('Após remover não-dígitos:', telefone);

// Remover zeros à esquerda
telefone = telefone.replace(/^0+/, '');

console.log('Após remover zeros:', telefone);

// CASOS:
// 1. Já está no formato correto: 5527995228798 (13 dígitos com 55)
// 2. Sem código país: 27995228798 (11 dígitos) ou 2799522879 (10 dígitos)
// 3. Com código errado: 055... (começa com 0)

if (telefone.startsWith('55') && telefone.length >= 12) {
  // Já está no formato correto ou próximo
  telefone = telefone.substring(0, 13); // Limitar a 13 dígitos
} else if (telefone.length === 11 || telefone.length === 10) {
  // Sem código país, adicionar 55
  telefone = '55' + telefone;
} else if (telefone.length > 13) {
  // Muito grande, tentar extrair últimos 11 dígitos e adicionar 55
  telefone = '55' + telefone.substring(telefone.length - 11);
}

console.log('Telefone normalizado final:', telefone);

// Validação final
if (telefone.length < 12 || telefone.length > 13 || !telefone.startsWith('55')) {
  console.error('Telefone inválido após normalização:', telefone);
  return [{
    json: {
      telefone_normalizado: telefone,
      telefone_original: telefoneRaw,
      erro: 'Telefone inválido',
      valido: false
    }
  }];
}

// Retornar telefone normalizado
return [{
  json: {
    ...$input.item.json, // Manter todos os dados originais
    telefone_normalizado: telefone,
    telefone_original: telefoneRaw,
    valido: true
  }
}];
```

---

### **PASSO 3: Atualizar Nodes que Usam Telefone**

Agora, em **TODOS** os nodes HTTP Request Tool que usam telefone, trocar a referência:

#### **ANTES:**
```javascript
{{ $('Extrair Dados').item.json.telefone }}
```

#### **DEPOIS:**
```javascript
{{ $('Normalizar Telefone').item.json.telefone_normalizado }}
```

---

### **NODES QUE PRECISAM SER ATUALIZADOS:**

1. **obter_cliente_id_por_telefone**
   - Campo: `jsonBody` → `p_telefone`
   - Trocar para: `{{ $('Normalizar Telefone').item.json.telefone_normalizado }}`

2. **listar_agendamentos_por_telefone**
   - Campo: `jsonBody` → `p_telefone`
   - Trocar para: `{{ $('Normalizar Telefone').item.json.telefone_normalizado }}`

3. **obter_ultimo_funcionario_cliente**
   - Campo: `jsonBody` → `p_telefone`
   - Trocar para: `{{ $('Normalizar Telefone').item.json.telefone_normalizado }}`

4. **Qualquer outro node que use telefone**

---

### **PASSO 4: Atualizar Session ID (Opcional mas Recomendado)**

Para garantir que a sessão do chat use o telefone normalizado:

No node **AI Agent** (ou onde a sessão é definida):

#### **ANTES:**
```javascript
{{ $('Webhook Evolution').item.json.body.data.key.remoteJid }}
```

#### **DEPOIS:**
```javascript
{{ $('Normalizar Telefone').item.json.telefone_normalizado }}
```

---

## 🧪 **TESTES DE VALIDAÇÃO:**

### **Caso 1: Telefone com +55**
```
Input: +5527995228798
Output: 5527995228798 ✅
```

### **Caso 2: Telefone com zero extra**
```
Input: +55027995228798
Output: 5527995228798 ✅
```

### **Caso 3: Telefone sem código país**
```
Input: 27995228798
Output: 5527995228798 ✅
```

### **Caso 4: Telefone só com número**
```
Input: 5527995228798
Output: 5527995228798 ✅
```

### **Caso 5: Telefone com símbolos**
```
Input: (27) 99522-8798
Output: 5527995228798 ✅
```

---

## 📊 **FLUXO COMPLETO (ANTES E DEPOIS):**

### **❌ ANTES (Problemático):**

```
Webhook Evolution
    ↓
Extrair Dados
    ↓ (telefone: +5527995228798)
obter_cliente_id_por_telefone
    ❌ Não encontrou (formato diferente do banco)
```

### **✅ DEPOIS (Correto):**

```
Webhook Evolution
    ↓
Extrair Dados
    ↓ (telefone: +5527995228798)
Normalizar Telefone
    ↓ (telefone_normalizado: 5527995228798)
obter_cliente_id_por_telefone
    ✅ Encontrou!
```

---

## 🎯 **BENEFÍCIOS:**

- ✅ Cliente pode usar QUALQUER formato de telefone
- ✅ Funciona com `+55`, `+5527`, `27`, etc.
- ✅ Remove símbolos automaticamente: `()`, `-`, espaços
- ✅ Compatível com WhatsApp `@s.whatsapp.net`, `@c.us`, `@lid`
- ✅ Log detalhado para debugging

---

## ⚠️ **IMPORTANTE:**

1. **Sempre** normalize o telefone ANTES de chamar qualquer RPC
2. **Sempre** use `telefone_normalizado` nas RPCs, nunca `telefone` direto
3. **Teste** com múltiplos formatos antes de dar como finalizado

---

## 📝 **CHECKLIST DE IMPLEMENTAÇÃO:**

- [ ] Criar Code Node "Normalizar Telefone"
- [ ] Colar código JavaScript
- [ ] Conectar APÓS "Extrair Dados"
- [ ] Atualizar `obter_cliente_id_por_telefone`
- [ ] Atualizar `listar_agendamentos_por_telefone`
- [ ] Atualizar `obter_ultimo_funcionario_cliente`
- [ ] Atualizar Session ID do AI Agent (opcional)
- [ ] Testar com `+5527995228798`
- [ ] Testar com `27995228798`
- [ ] Testar com `(27) 99522-8798`
- [ ] Salvar workflow

---

**Pronto! Agora o n8n aceita QUALQUER formato de telefone!** 📞✅


