# 🔍 ANÁLISE DETALHADA: Interação Natálya x Agente IA

## 📊 **DADOS DO BANCO (REALIDADE):**

```sql
ID: 15
Cliente: Natálya Araujo
Telefone: 5527995228798
Serviço: Criolipólise
Data/Hora: 30/11/2025 14:00 (horário de Brasília)
Funcionário: Carla Souza
Status: confirmado
Criado em: 23/11/2025 19:27:11

ID: 14
Cliente: Natálya Araujo
Telefone: 5527995228798
Serviço: Brow lamination
Data/Hora: 30/11/2025 17:00 (horário de Brasília)
Funcionário: Liz Martins
Status: confirmado
Criado em: 23/11/2025 19:24:56
```

---

## 🗣️ **ANÁLISE DA CONVERSA (LINHA POR LINHA):**

### **🔴 PROBLEMA 1: Agente não reconheceu histórico**

**[16:47] Natálya:** "gostaria de marcar um preenchimento labial dia 30.11 as 14:00"

**[16:47] Agente:** "Vi que não consegui encontrar histórico do último profissional que te atendeu com esse número."

**❌ ERRO:**
- Natálya JÁ tem 2 agendamentos no sistema (ID 14 e 15)
- O agente deveria ter chamado `obter_ultimo_funcionario_cliente(5527995228798)`
- **Causa:** Agente não está identificando o telefone da sessão automaticamente

---

### **🟡 PROBLEMA 2: Informação de disponibilidade INCORRETA**

**[16:48] Natálya:** "gostaria de marcar com a carla"

**[16:48] Agente:** "A Carla já tem um compromisso nesse horário 😕"

**✅ CORRETO!**
- Banco mostra: Carla TEM agendamento às 14:00 (ID 15 - Criolipólise com Natálya)
- Agente detectou o conflito corretamente via `verificar_disponibilidade_por_funcionario`

**PARADOXO:**
- O agente **detectou** que Carla está ocupada às 14:00
- Mas **não percebeu** que é com a própria Natálya!
- **Esperado:** "Você já tem um agendamento com a Carla às 14:00 (Criolipólise). Quer marcar outro serviço ou outro horário?"

---

### **🔴 PROBLEMA 3: Agente não listou agendamentos corretos**

**[16:49] Natálya:** "gostaria de desmarcar meu horario com a liz"

**[16:50] Agente:** 
```
📅 30/11 às 17:00 - Criolipólise  
📅 30/11 às 20:00 - Brow lamination
```

**❌ ERRO CRÍTICO:**
- **Banco:** Criolipólise às **14:00** (não 17:00)
- **Banco:** Brow lamination às **17:00** (não 20:00)
- **Diferença:** 3 horas a menos!

**Causa:** Problema de TIMEZONE!
- UTC no banco: `17:00:00+00` e `20:00:00+00`
- Horário de Brasília (UTC-3): `14:00` e `17:00`
- Agente está mostrando UTC em vez de Brasília

---

### **🔴 PROBLEMA 4: Múltiplas tentativas de telefone**

**[16:49] Natálya:** "+5527995228798"
**[16:49] Agente:** "Aparentemente, não encontrei nenhum agendamento"

**[16:49] Natálya:** "+55027995228798" (com zero extra)
**[16:49] Agente:** "Seu número parece estar com um dígito a mais"

**[16:49] Natálya:** "27995228798" (sem código país)
**[16:50] Agente:** ✅ Funcionou

**❌ PROBLEMA:**
- Banco tem: `5527995228798`
- Agente deveria normalizar TODAS as variações:
  - `+5527995228798` → `5527995228798`
  - `+55027995228798` → `5527995228798`
  - `27995228798` → `5527995228798`
  - `5527995228798` → `5527995228798`

---

### **🟡 PROBLEMA 5: Agente não informou funcionário espontaneamente**

**[16:50] Natálya:** "com quem eu tenho agendado o blow"

**[16:50] Agente:** "Para ajudar certinho, vou precisar do seu número de telefone..."

**❌ ERRO:**
- O agente JÁ havia buscado os agendamentos no passo anterior
- Ele deveria ter guardado essa informação na memória da conversa
- **Esperado:** "Seu Brow lamination às 17:00 está com a Liz Martins"

---

### **🔴 PROBLEMA 6: Agente não detectou discrepância de horários**

**[16:52] Natálya:** "eu havia marcado para as 14:00"

**[16:52] Agente:** "O único horário que encontrei para você em 30/11 é às 17:00 para Criolipólise e às 20:00 para Brow lamination..."

**❌ ERRO CRÍTICO:**
- Natálya está **CERTA!** Ela marcou às 14:00 (banco confirma)
- Agente está mostrando horários **ERRADOS** (UTC em vez de Brasília)
- Cliente fica confusa, pensando que o agendamento está errado

---

## 🚨 **PROBLEMAS IDENTIFICADOS (PRIORIZADO):**

### **CRÍTICO 🔴:**

1. **Timezone UTC vs Brasília:**
   - RPC `listar_agendamentos_por_telefone` está retornando UTC
   - Agente mostra "17:00" quando deveria ser "14:00"
   - **Impacto:** Cliente vê horários errados

2. **Normalização de Telefone:**
   - Agente não aceita `+55`, `+5527`, ou sem código
   - Cliente precisa tentar múltiplas vezes
   - **Impacto:** Frustração, perda de tempo

3. **Contexto de Agendamentos:**
   - Agente não percebeu que Carla já está ocupada **com a própria Natálya**
   - **Impacto:** Confusão, tentativa de remarcar sem necessidade

### **IMPORTANTE 🟡:**

4. **Memória de Conversa:**
   - Agente esquece informações já buscadas
   - Cliente precisa informar telefone múltiplas vezes
   - **Impacto:** Experiência ruim, parece robotizado

5. **Histórico de Cliente:**
   - Agente não usou `obter_ultimo_funcionario_cliente` no início
   - Deveria ter reconhecido Natálya automaticamente
   - **Impacto:** Falta de personalização

---

## ✅ **SOLUÇÕES PROPOSTAS:**

### **1. CORRIGIR RPC `listar_agendamentos_por_telefone`**

**Problema:** Retorna datas em UTC

**Solução:** Formatar para horário de Brasília no retorno

```sql
CREATE OR REPLACE FUNCTION listar_agendamentos_por_telefone(p_telefone TEXT)
RETURNS TABLE (
  id BIGINT,
  cliente_id BIGINT,
  servico_id TEXT,
  servico_nome TEXT,
  funcionario_id UUID,
  funcionario_nome TEXT,
  data_brasilia TEXT, -- NOVO: horário formatado
  duracao_minutos INTEGER,
  preco NUMERIC,
  status TEXT,
  observacoes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.cliente_id,
    a.servico_id,
    s.nome as servico_nome,
    a.funcionario_id,
    p.nome as funcionario_nome,
    TO_CHAR(a.data AT TIME ZONE 'America/Sao_Paulo', 'DD/MM às HH24:MI') as data_brasilia, -- CORRIGIDO
    a.duracao_minutos,
    a.preco,
    a.status,
    a.observacoes
  FROM agendamentos a
  JOIN servicos s ON a.servico_id = s.id
  LEFT JOIN profiles p ON a.funcionario_id = p.id
  JOIN clientes c ON a.cliente_id = c.id
  WHERE normalizar_telefone_busca(c.telefone) = normalizar_telefone_busca(p_telefone)
    AND a.status != 'cancelado'
    AND a.data >= NOW() -- apenas futuros
  ORDER BY a.data ASC;
END;
$$ LANGUAGE plpgsql;
```

---

### **2. MELHORAR NORMALIZAÇÃO NO n8n**

**No node "Extrair Dados" ou em um Code Node antes de chamar RPCs:**

```javascript
// Normalizar telefone para TODAS as variações
const telefoneRaw = $json.telefone || '';

let telefone = telefoneRaw
  .replace(/\D/g, '') // Remove tudo que não é número
  .replace(/^0+/, ''); // Remove zeros à esquerda

// Se começar com 55, manter
// Se não começar com 55 mas tem 11 ou 10 dígitos, adicionar 55
if (!telefone.startsWith('55') && (telefone.length === 11 || telefone.length === 10)) {
  telefone = '55' + telefone;
}

return { telefone };
```

---

### **3. ADICIONAR CONTEXTO DE AGENDAMENTOS EXISTENTES**

**No System Prompt, adicionar:**

```markdown
## 🔍 VERIFICAÇÃO DE CONFLITOS INTELIGENTE

Quando um cliente solicitar um novo agendamento:

1. SEMPRE chame `listar_agendamentos_por_telefone` PRIMEIRO
2. Se o cliente JÁ TEM um agendamento no mesmo dia/horário:
   - Informe: "Você já tem um agendamento às [HORA] nesse dia ([SERVIÇO] com [FUNCIONÁRIO]). Quer remarcar esse ou agendar outro?"
3. Se tentar marcar com funcionário que já está ocupado **COM ELE MESMO**:
   - Informe: "Você já tem um agendamento com [FUNCIONÁRIO] às [HORA] ([SERVIÇO]). Quer mudar de horário ou de profissional?"

⚠️ NUNCA tente criar agendamento duplicado no mesmo horário!
```

---

### **4. MELHORAR MEMÓRIA DE SESSÃO**

**No System Prompt, adicionar:**

```markdown
## 💾 MEMÓRIA DE CONVERSA

Quando buscar agendamentos do cliente, LEMBRE-SE:
- Guarde o telefone na memória (não peça novamente)
- Guarde os agendamentos listados (não busque novamente)
- Guarde o último funcionário (para sugerir)

Se o cliente perguntar "com quem está marcado?", use os dados JÁ BUSCADOS, não peça telefone de novo.
```

---

### **5. AUTO-DETECÇÃO DE TELEFONE**

**No n8n, node "Extrair Dados":**

Garantir que o `session_id` SEMPRE use o telefone normalizado:

```javascript
{
  "session_id": "{{ ($json.body.data.key.remoteJidAlt || $json.body.data.key.remoteJid || $json.sender)
    .replace('@s.whatsapp.net', '')
    .replace('@c.us', '')
    .replace('@lid', '')
    .replace(/\\D/g, '') }}",
  "telefone": "{{ ... }}" // mesmo formato
}
```

---

## 🧪 **TESTES PARA VALIDAR CORREÇÕES:**

### **Teste 1: Timezone**
```
Cliente: "Quero ver meus agendamentos"
Agente: [lista com horários de Brasília]
Validar: Horários batem com o banco (14:00, não 17:00)
```

### **Teste 2: Normalização**
```
Cliente: "+5527995228798"
Agente: [encontra agendamentos]
Cliente: "27995228798"
Agente: [encontra os mesmos agendamentos]
```

### **Teste 3: Contexto**
```
Cliente: "Quero marcar às 14:00 dia 30"
Agente: "Você já tem um agendamento às 14:00 nesse dia (Criolipólise com Carla). Quer remarcar?"
```

### **Teste 4: Memória**
```
Cliente: "Quais meus agendamentos?" [agente busca]
Cliente: "Com quem está o Brow?"
Agente: "Está com a Liz Martins" [não pede telefone de novo]
```

---

## 📊 **RESUMO DOS ERROS:**

| # | Problema | Severidade | Causa | Solução |
|---|----------|------------|-------|---------|
| 1 | Horários errados (UTC) | 🔴 CRÍTICO | RPC retorna UTC | Formatar para Brasília |
| 2 | Telefone não aceito | 🔴 CRÍTICO | Sem normalização | Normalizar todas variações |
| 3 | Não detecta próprio cliente | 🟡 IMPORTANTE | Falta validação | Checar agendamentos primeiro |
| 4 | Pede telefone múltiplas vezes | 🟡 IMPORTANTE | Sem memória | Guardar na sessão |
| 5 | Não usa histórico | 🟢 MENOR | Não chama RPC | Chamar no início |

---

## 🎯 **PRIORIDADE DE CORREÇÃO:**

1. **URGENTE:** Corrigir timezone (clientes veem horários errados!)
2. **URGENTE:** Normalizar telefone (clientes não conseguem acessar)
3. **IMPORTANTE:** Adicionar contexto de agendamentos
4. **IMPORTANTE:** Melhorar memória de sessão
5. **BOM TER:** Auto-detecção e histórico

---

## ❓ **PERGUNTAS PARA O USUÁRIO:**

1. Quer que eu corrija **AGORA** o problema de timezone (mais urgente)?
2. Quer que eu atualize o System Prompt para melhorar contexto?
3. Quer que eu crie um Code Node no n8n para normalização de telefone?

**Qual correção prefere começar primeiro?** 🚀


