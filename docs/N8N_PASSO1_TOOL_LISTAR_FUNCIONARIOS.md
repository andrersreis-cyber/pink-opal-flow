# 🔧 PASSO 1: Adicionar Tool `listar_funcionarios_por_servico`

## 📋 **OBJETIVO:**
Adicionar uma nova ferramenta HTTP Request Tool para o agente IA consultar quais funcionários podem executar um serviço específico.

---

## 🛠️ **INSTRUÇÕES:**

### **1. Abrir Workflow no n8n**
1. Acesse seu n8n
2. Abra o workflow "Agente Estética"
3. Entre em modo de edição

---

### **2. Adicionar Novo Node**

**Tipo:** `HTTP Request Tool`  
**Nome:** `listar_funcionarios_por_servico`  
**Posição:** Ao lado dos outros HTTP Request Tools

---

### **3. Configuração do Node:**

#### **3.1 - Aba "Tool Settings"**

**Tool Name:**
```
listar_funcionarios_por_servico
```

**Tool Description:**
```
Retorna a lista de funcionários habilitados para executar um serviço específico.

USE ESTA FERRAMENTA QUANDO:
- Cliente escolher um serviço e um profissional específico
- Precisar validar se profissional pode fazer o serviço
- Precisar oferecer opções de profissionais para um serviço

PARÂMETROS OBRIGATÓRIOS:
- servico_id (string): ID do serviço (ex: "av-01", "bl-01", "hf-01")

RETORNA:
Lista de funcionários com:
- funcionario_id: UUID do funcionário
- funcionario_nome: Nome do profissional
- funcionario_email: Email do profissional
- nivel_habilidade: "basico" ou "avancado"
- observacoes: Informações adicionais (opcional)

IMPORTANTE:
- Se retornar lista VAZIA: nenhum profissional habilitado
- Lista ordenada por nível (avançado primeiro)
- Use para validar ANTES de verificar disponibilidade
```

---

#### **3.2 - Aba "HTTP Request Settings"**

**URL:**
```
https://uyffrwuerhwrpkyiydvd.supabase.co/rest/v1/rpc/listar_funcionarios_por_servico
```

**Method:**
```
POST
```

**Authentication:**
```
Predefined Credential Type
```

**Credential Type:**
```
Supabase API
```

**Selecionar Credential:**
```
Supabase estetica
```

---

#### **3.3 - Headers**

**Enable:** `Send Headers` ✓

**Headers Parameters:**

| Name | Value |
|------|-------|
| `Content-Type` | `application/json` |
| `Prefer` | `return=representation` |

---

#### **3.4 - Body**

**Enable:** `Send Body` ✓

**Body Content Type:**
```
JSON
```

**Specify Body:**
```
JSON
```

**JSON Body:**
```json
{
  "p_servico_id": "={{ $fromAI('servico_id', 'ID do serviço escolhido pelo cliente (ex: av-01, bl-01, hf-01)', 'string') }}"
}
```

**⚠️ IMPORTANTE:**
- Note o `=` antes de `{{`
- Aspas duplas ao redor de toda a expressão
- ID do serviço deve ser o código (ex: "av-01"), não o nome

---

### **4. Conectar ao AI Agent**

1. Arraste uma conexão do output `listar_funcionarios_por_servico` para o input `Tools` do `AI Agent`
2. Verifique se a linha está conectada

---

### **5. Testar a Tool (Opcional)**

**Input de Teste:**
```json
{
  "p_servico_id": "hf-01"
}
```

**Output Esperado:**
```json
[
  {
    "funcionario_id": "ff301f27-7d2d-4ac5-9c39-682b4b13d55b",
    "funcionario_nome": "Liz Martins",
    "funcionario_email": "admin@pinkopal.dev",
    "nivel_habilidade": "avancado",
    "observacoes": null
  }
]
```

---

## ✅ **VALIDAÇÃO:**

Após adicionar, verificar:
- ✓ Node aparece na lista de Tools do AI Agent
- ✓ Headers configurados corretamente
- ✓ JSON Body com `=` antes de `{{`
- ✓ Credential selecionada

---

## 🎯 **PRÓXIMO PASSO:**

Após concluir este passo, vá para:
**PASSO 2: Corrigir JSON Bodies nas Tools Existentes**

---

**Status:** ⏳ Aguardando execução  
**Prioridade:** 🚨 CRÍTICA

