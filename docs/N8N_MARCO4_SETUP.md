# 🤖 Marco 4 - Configuração n8n para Escolha de Funcionário

## 📋 FUNÇÕES CRIADAS NO BANCO

Foram criadas 4 novas RPC Functions:

### 1. `listar_funcionarios_disponiveis()`
**O que faz:** Lista todos os funcionários ativos da clínica

**Retorno:**
```json
[
  {
    "id": "uuid-do-funcionario",
    "nome": "Liz Martins",
    "email": "liz@clinica.com",
    "role": "admin"
  },
  {
    "id": "uuid-do-funcionario-2",
    "nome": "Maria Silva",
    "email": "maria@clinica.com",
    "role": "funcionario"
  }
]
```

### 2. `obter_ultimo_funcionario_cliente(p_telefone)`
**O que faz:** Retorna o último funcionário que atendeu este cliente

**Parâmetros:**
- `p_telefone`: Telefone do cliente (formato: 5527996205115)

**Retorno:**
```json
[
  {
    "funcionario_id": "uuid",
    "funcionario_nome": "Liz Martins",
    "ultimo_agendamento": "2025-11-23T10:00:00Z"
  }
]
```

### 3. `verificar_disponibilidade_por_funcionario(p_data_inicio, p_data_fim)`
**O que faz:** Lista todos os funcionários e indica quais estão livres no horário

**Parâmetros:**
- `p_data_inicio`: ISO 8601 (ex: "2025-11-24T10:00:00-03:00")
- `p_data_fim`: ISO 8601 (ex: "2025-11-24T11:00:00-03:00")

**Retorno:**
```json
[
  {
    "funcionario_id": "uuid",
    "funcionario_nome": "Liz Martins",
    "disponivel": true
  },
  {
    "funcionario_id": "uuid2",
    "funcionario_nome": "Maria Silva",
    "disponivel": false
  }
]
```

### 4. `criar_agendamento_validado()` - ATUALIZADO
**Mudança:** Agora aceita `p_funcionario_id` opcional

**Parâmetros:**
```json
{
  "p_cliente_id": 1,
  "p_servico_id": "av-01",
  "p_data": "2025-11-24T10:00:00-03:00",
  "p_funcionario_id": "uuid-do-funcionario",  // ← NOVO!
  "p_observacoes": "Observações opcionais"
}
```

---

## 🔧 CONFIGURAÇÃO DO N8N

### **Passo 1: Adicionar Novos HTTP Request Tools**

Adicione 3 novos nodes no workflow:

#### **Node 1: listar_funcionarios_disponiveis**

```json
{
  "toolDescription": "Lista todos os funcionários disponíveis na clínica.\n\nNÃO requer parâmetros.\n\nRETORNA:\n- Lista de funcionários com id, nome, email e role",
  "method": "POST",
  "url": "https://uyffrwuerhwrpkyiydvd.supabase.co/rest/v1/rpc/listar_funcionarios_disponiveis",
  "authentication": "predefinedCredentialType",
  "nodeCredentialType": "supabaseApi",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "application/json"
      }
    ]
  },
  "sendBody": true,
  "specifyBody": "json",
  "jsonBody": "{}",
  "options": {}
}
```

#### **Node 2: obter_ultimo_funcionario_cliente**

```json
{
  "toolDescription": "Retorna o último funcionário que atendeu este cliente.\n\nPARÂMETROS:\n- telefone: Telefone do cliente normalizado (ex: 5527996205115)\n\nRETORNA:\n- funcionario_id: UUID do funcionário\n- funcionario_nome: Nome do funcionário\n- ultimo_agendamento: Data do último atendimento",
  "method": "POST",
  "url": "https://uyffrwuerhwrpkyiydvd.supabase.co/rest/v1/rpc/obter_ultimo_funcionario_cliente",
  "authentication": "predefinedCredentialType",
  "nodeCredentialType": "supabaseApi",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "application/json"
      }
    ]
  },
  "sendBody": true,
  "specifyBody": "json",
  "jsonBody": "={\n  \"p_telefone\": \"{{ $fromAI('telefone', 'Telefone do cliente normalizado', 'string') }}\"\n}",
  "options": {}
}
```

#### **Node 3: verificar_disponibilidade_por_funcionario**

```json
{
  "toolDescription": "Verifica quais funcionários estão livres em um horário específico.\n\nPARÂMETROS:\n- data_inicio: Data/hora início ISO 8601 (ex: 2025-11-24T10:00:00-03:00)\n- data_fim: Data/hora fim ISO 8601 (ex: 2025-11-24T11:00:00-03:00)\n\nRETORNA:\n- Lista de funcionários com status de disponibilidade (true/false)",
  "method": "POST",
  "url": "https://uyffrwuerhwrpkyiydvd.supabase.co/rest/v1/rpc/verificar_disponibilidade_por_funcionario",
  "authentication": "predefinedCredentialType",
  "nodeCredentialType": "supabaseApi",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "application/json"
      }
    ]
  },
  "sendBody": true,
  "specifyBody": "json",
  "jsonBody": "{\n  \"p_data_inicio\": \"{{ $fromAI('data_inicio', 'Data/hora início ISO 8601', 'string') }}\",\n  \"p_data_fim\": \"{{ $fromAI('data_fim', 'Data/hora fim ISO 8601', 'string') }}\"\n}",
  "options": {}
}
```

### **Passo 2: Atualizar Node criar_agendamento_validado**

Modifique o JSON Body para incluir `p_funcionario_id`:

```json
{
  "p_cliente_id": {{ $fromAI('cliente_id', 'ID numérico do cliente', 'number') }},
  "p_servico_id": "{{ $fromAI('servico_id', 'ID do serviço', 'string') }}",
  "p_data": "{{ $fromAI('data', 'Data ISO 8601 com timezone', 'string') }}",
  "p_funcionario_id": "{{ $fromAI('funcionario_id', 'UUID do funcionário escolhido', 'string', '', false) }}",
  "p_observacoes": "{{ $fromAI('observacoes', 'Observações opcionais', 'string', '', false) }}"
}
```

### **Passo 3: Atualizar System Prompt do Agente IA**

Adicione estas instruções ao system prompt:

```markdown
## ESCOLHA DE FUNCIONÁRIO

### Para CLIENTES NOVOS (primeira vez):
1. Use `listar_funcionarios_disponiveis` para ver opções
2. Apresente: "Temos [Nome1] e [Nome2] disponíveis. Tem preferência por algum(a)?"
3. Cliente escolhe ou você sugere baseado em disponibilidade

### Para CLIENTES RECORRENTES (já tem histórico):
1. Use `obter_ultimo_funcionario_cliente` com telefone do cliente
2. Se retornar resultado: "Vi que você foi atendido(a) pela [Nome]. Quer agendar com ela novamente?"
3. Se cliente confirmar: use o funcionario_id retornado
4. Se cliente preferir outro: liste opções com `listar_funcionarios_disponiveis`

### Se FUNCIONÁRIO ESCOLHIDO ESTIVER OCUPADO:
1. Use `verificar_disponibilidade_por_funcionario` para o horário desejado
2. Informe: "[Nome] já tem compromisso neste horário."
3. Sugira: "Temos [Nome2] disponível às [hora]. Prefere com ele(a) ou outro horário com [Nome1]?"
4. Cliente escolhe funcionário alternativo ou horário diferente

### REGRAS:
- SEMPRE pergunte sobre preferência de funcionário
- SEMPRE valide disponibilidade antes de confirmar
- Se não informado, escolha o primeiro disponível
- Seja natural e humanizado ao oferecer opções
- Lembre sempre o nome do funcionário escolhido

### IMPORTANTE:
Ao chamar `criar_agendamento_validado`, SEMPRE inclua o `funcionario_id` escolhido!
```

---

## ✅ VALIDAÇÃO

### Teste 1: Cliente Novo
```
Cliente: "Quero marcar uma limpeza de pele"
Agente: "Temos Liz Martins e Maria Silva disponíveis. Tem preferência?"
Cliente: "Quero com a Maria"
Agente: [cria agendamento com funcionario_id da Maria]
```

### Teste 2: Cliente Recorrente
```
Cliente: "Quero agendar novamente"
Agente: [busca último funcionário] "Vi que foi atendida pela Maria. Quer agendar com ela?"
Cliente: "Sim"
Agente: [cria agendamento com funcionario_id da Maria]
```

### Teste 3: Funcionário Ocupado
```
Cliente: "Quero às 10h com a Maria"
Agente: [verifica disponibilidade] "Maria já tem compromisso às 10h. Temos Liz disponível. Prefere?"
Cliente: "Sim, pode ser"
Agente: [cria agendamento com funcionario_id da Liz]
```

---

## 🎯 RESULTADO ESPERADO

Após configurar:
- ✅ Agente pergunta sobre funcionário
- ✅ Agente lembra funcionário anterior
- ✅ Agente sugere alternativas se ocupado
- ✅ Agendamentos incluem funcionario_id
- ✅ Frontend mostra funcionário responsável

---

**Configuração completa para n8n Marco 4!** 🚀

