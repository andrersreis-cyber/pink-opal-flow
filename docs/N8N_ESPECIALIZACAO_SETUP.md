# 🤖 N8N - Configuração de Especialização Funcionário x Serviços

**Data**: 24/11/2025  
**Versão**: 6.0  
**Objetivo**: Agente IA escolhe funcionários baseado em especialização e disponibilidade

---

## 📋 OVERVIEW

O agente IA agora precisa:
1. Listar funcionários habilitados para um serviço
2. Lembrar do último funcionário que atendeu o cliente
3. Verificar disponibilidade considerando especialização
4. Criar agendamento com funcionário correto

---

## 🔧 TOOLS HTTP REQUEST - CONFIGURAÇÃO

### **TOOL 1: Listar Funcionários por Serviço** ⭐ NOVO

**Nome:** `listar_funcionarios_por_servico`

**Description:**
```
Lista funcionários habilitados para executar um serviço específico. 
SEMPRE use esta tool antes de criar agendamento para garantir que o funcionário pode fazer o serviço. 

Parâmetros:
- servico_id (obrigatório, string): ID do serviço (ex: "plas-06", "av-01")
  NUNCA invente IDs. Use o ID exato do serviço listado.

Retorna: 
- Lista de funcionários com nome, email e nível de habilidade (basico/avancado)
- Lista vazia se nenhum funcionário estiver habilitado
```

**URL:**
```
{{$env.SUPABASE_URL}}/rest/v1/rpc/listar_funcionarios_por_servico
```

**Method:** `POST`

**Authentication:** `Header Auth`

**Headers:**
```json
{
  "apikey": "{{$env.SUPABASE_ANON_KEY}}",
  "Authorization": "Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}",
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "p_servico_id": "={{ $parameter.servico_id }}"
}
```

**Exemplo de Uso:**
```
Input: { "servico_id": "plas-06" }
Output: [
  {
    "funcionario_id": "uuid-123",
    "funcionario_nome": "Liz Martins",
    "funcionario_email": "admin@pinkopal.dev",
    "nivel_habilidade": "avancado",
    "observacoes": null
  },
  {
    "funcionario_id": "uuid-456",
    "funcionario_nome": "Carla Souza",
    "funcionario_email": "carla@clinica.com",
    "nivel_habilidade": "basico",
    "observacoes": null
  }
]
```

---

### **TOOL 2: Obter Último Funcionário do Cliente** ⭐ NOVO

**Nome:** `obter_ultimo_funcionario_cliente`

**Description:**
```
Busca o último funcionário que atendeu um cliente específico. 
Use para oferecer continuidade no atendimento.

Parâmetros:
- telefone (obrigatório, string): Telefone normalizado no formato 55DDNNNNNNNNN

Retorna:
- funcionario_id, nome do funcionário, data do último atendimento
- null se cliente nunca foi atendido
```

**URL:**
```
{{$env.SUPABASE_URL}}/rest/v1/rpc/obter_ultimo_funcionario_cliente
```

**Method:** `POST`

**Headers:**
```json
{
  "apikey": "{{$env.SUPABASE_ANON_KEY}}",
  "Authorization": "Bearer {{$env.SUPABASE_SERVICE_ROLE_KEY}}",
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "p_telefone": "={{ $parameter.telefone }}"
}
```

**Exemplo de Uso:**
```
Input: { "telefone": "5527995228798" }
Output: {
  "funcionario_id": "uuid-123",
  "funcionario_nome": "Liz Martins",
  "ultimo_atendimento": "2025-11-20T14:00:00-03:00"
}
```

---

### **TOOL 3: Verificar Disponibilidade (ATUALIZADA)**

**Nome:** `verificar_disponibilidade_por_funcionario`

**Description:** (ATUALIZAR)
```
Verifica disponibilidade de funcionários em um período específico.
OPCIONALMENTE filtra por serviço (recomendado).

Parâmetros:
- data_inicio (obrigatório, string ISO): Data/hora início (ex: "2025-11-24T10:00:00-03:00")
- data_fim (obrigatório, string ISO): Data/hora fim
- servico_id (OPCIONAL, string): Se informado, lista APENAS funcionários habilitados para esse serviço

Retorna:
- Lista de funcionários com status disponível (true/false)
- Se servico_id informado, já vem filtrado por especialização
```

**Body (JSON):** (ATUALIZAR)
```json
{
  "p_data_inicio": "={{ $parameter.data_inicio }}",
  "p_data_fim": "={{ $parameter.data_fim }}",
  "p_servico_id": "={{ $parameter.servico_id || null }}"
}
```

---

### **TOOL 4: Criar Agendamento (ATUALIZADA)**

**Nome:** `criar_agendamento_validado`

**Body (JSON):** (ATUALIZAR - adicionar funcionario_id)
```json
{
  "p_cliente_id": "={{ $parameter.cliente_id }}",
  "p_servico_id": "={{ $parameter.servico_id }}",
  "p_data": "={{ $parameter.data }}",
  "p_observacoes": "={{ $parameter.observacoes || '' }}",
  "p_funcionario_id": "={{ $parameter.funcionario_id }}"
}
```

**IMPORTANTE:** 
- `p_funcionario_id` agora é OBRIGATÓRIO
- A RPC valida se funcionário pode executar o serviço
- Retorna erro se funcionário não estiver habilitado

---

## 🧠 SYSTEM PROMPT - ATUALIZAÇÃO

**Adicione esta seção ao System Prompt do Agente IA:**

```markdown
## ESCOLHA DE FUNCIONÁRIO

Ao criar agendamento, você DEVE seguir este fluxo:

### PASSO 1: Listar Funcionários Habilitados
Sempre que o cliente escolher um serviço, chame:
```
listar_funcionarios_por_servico(servico_id)
```

**Importante:**
- Use o ID EXATO do serviço (ex: "plas-06", não invente)
- Se retornar lista vazia → "Desculpe, este serviço não está disponível no momento"
- Se retornar funcionários → Continue para Passo 2

### PASSO 2: Verificar Histórico (Cliente Recorrente)
Se cliente já foi atendido antes, chame:
```
obter_ultimo_funcionario_cliente(telefone_normalizado)
```

**Se retornar funcionário:**
- Ofereça continuidade: "Vi que você foi atendido(a) pela [Nome]. Quer agendar com ela novamente?"
- Se cliente aceitar → Use esse funcionário
- Se cliente recusar ou quiser outro → Continue para Passo 3

**Se retornar null (cliente novo):**
- Continue para Passo 3

### PASSO 3: Apresentar Opções
Liste os funcionários disponíveis de forma natural:

**Se houver níveis diferentes:**
```
"Temos [Nome1] (especialista avançado) e [Nome2] disponíveis. 
Com quem você gostaria de agendar?"
```

**Se todos forem mesmo nível:**
```
"Temos [Nome1], [Nome2] e [Nome3] disponíveis. 
Qual você prefere?"
```

**Dica:** Priorize funcionários com nível "avancado" na descrição

### PASSO 4: Validar Disponibilidade
Após cliente escolher, verifique disponibilidade:
```
verificar_disponibilidade_por_funcionario(
  data_inicio, 
  data_fim, 
  servico_id  // ← IMPORTANTE: sempre passe o serviço
)
```

**Se funcionário escolhido estiver ocupado:**
```
"[Nome] já tem um compromisso nesse horário. 
Posso oferecer:
1. Outro horário com [Nome]
2. Mesmo horário com [outro funcionário disponível]"
```

### PASSO 5: Criar Agendamento
Ao criar, SEMPRE passe o funcionario_id:
```
criar_agendamento_validado(
  cliente_id,
  servico_id,
  data,
  observacoes,
  funcionario_id  // ← OBRIGATÓRIO
)
```

**Se a RPC retornar erro de habilitação:**
- Isso indica bug no sistema
- Desculpe-se e sugira outro funcionário da lista

---

## REGRAS IMPORTANTES

1. **NUNCA** crie agendamento sem funcionário
2. **NUNCA** invente IDs de serviço
3. **SEMPRE** use listar_funcionarios_por_servico antes de agendar
4. **SEMPRE** passe servico_id no verificar_disponibilidade
5. **PRIORIZE** continuidade (mesmo funcionário)
6. **SEJA NATURAL**: Não mencione "níveis" ou "habilitação" ao cliente

---

## EXEMPLOS DE DIÁLOGOS

### Exemplo 1: Cliente Novo
```
Cliente: "Quero harmonização facial dia 26/11 às 10h"

Agente:
1. [Chama listar_funcionarios_por_servico("plas-06")]
2. "Para harmonização facial temos a Liz Martins e a Maria Silva. 
   Com quem você gostaria de agendar?"

Cliente: "Com a Liz"

Agente:
3. [Chama verificar_disponibilidade_por_funcionario(..., servico_id="plas-06")]
4. [Verifica que Liz está disponível]
5. [Chama criar_agendamento_validado(..., funcionario_id="uuid-liz")]
6. "Perfeito! Agendamento confirmado com a Liz para dia 26/11 às 10h."
```

### Exemplo 2: Cliente Recorrente
```
Cliente: "Quero agendar limpeza de pele"

Agente:
1. [Chama listar_funcionarios_por_servico("lp-01")]
2. [Chama obter_ultimo_funcionario_cliente("5527995228798")]
3. "Vi que você foi atendida pela Carla na última vez. 
   Quer agendar com ela novamente?"

Cliente: "Sim, por favor"

Agente:
4. "Qual dia e horário você prefere?"
[... resto do fluxo]
```

### Exemplo 3: Funcionário Ocupado
```
Cliente: "Quero com a Liz dia 24/11 às 14h"

Agente:
1. [Chama verificar_disponibilidade_por_funcionario(...)]
2. [Verifica que Liz está ocupada]
3. "A Liz já tem um compromisso às 14h. 
   Posso oferecer:
   - 15h30 com a Liz
   - 14h com a Maria Silva
   Qual você prefere?"
```

---

## TRATAMENTO DE ERROS

### Erro: "Nenhum profissional disponível"
```
Resposta: "No momento este serviço não está disponível. 
Posso sugerir outro serviço similar ou outra data?"
```

### Erro: "Profissional não habilitado" (da RPC)
```
Resposta: "Desculpe, houve um problema. 
Vou verificar outra opção para você."
[Tenta com outro funcionário da lista]
```

### Lista vazia de listar_funcionarios_por_servico
```
Resposta: "Este serviço ainda não está disponível. 
Posso te ajudar com outro procedimento?"
```

---

## FLUXOGRAMA SIMPLIFICADO

```
Cliente solicita serviço
        ↓
listar_funcionarios_por_servico()
        ↓
    Tem funcionários?
      ↙          ↘
    NÃO          SIM
     ↓            ↓
  Desculpar   Cliente recorrente?
               ↙          ↘
             SIM          NÃO
              ↓            ↓
   obter_ultimo_func   Listar opções
              ↓            ↓
        Oferecer     Cliente escolhe
        continuidade       ↓
              ↓            ↓
        verificar_disponibilidade
                ↓
           Disponível?
          ↙          ↘
        SIM          NÃO
         ↓            ↓
    Criar         Sugerir
  agendamento   alternativas
```
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

- [ ] Tool `listar_funcionarios_por_servico` criada
- [ ] Tool `obter_ultimo_funcionario_cliente` criada
- [ ] Tool `verificar_disponibilidade_por_funcionario` atualizada (com servico_id)
- [ ] Tool `criar_agendamento_validado` atualizada (com funcionario_id)
- [ ] System Prompt atualizado com seção "ESCOLHA DE FUNCIONÁRIO"
- [ ] Testado com cliente novo
- [ ] Testado com cliente recorrente
- [ ] Testado com funcionário ocupado
- [ ] Testado com serviço sem funcionários

---

## 🧪 TESTES RECOMENDADOS

### Teste 1: Serviço com múltiplos funcionários
```
Entrada: "Quero criolipólise"
Esperado: Lista Liz (avançado) e Maria (avançado)
```

### Teste 2: Serviço de um funcionário específico
```
Entrada: "Quero bioestimulador de colágeno"
Esperado: Lista apenas Liz e Carla (únicos habilitados)
```

### Teste 3: Cliente recorrente
```
Entrada: Cliente que já agendou antes
Esperado: Oferece último funcionário primeiro
```

### Teste 4: Validação de habilitação
```
Entrada: Tentar agendar serviço X com funcionário não habilitado
Esperado: RPC retorna erro, agente sugere alternativa
```

---

## 📝 NOTAS IMPORTANTES

1. **Telefone Normalizado**: Sempre use o output do node "Normalizar Telefone"
2. **Timezone**: Sempre use UTC-03:00 (Brasília)
3. **IDs de Serviço**: Use os IDs exatos, nunca invente
4. **Service Role Key**: Use para bypass de RLS
5. **Fallback**: Se algo falhar, desculpe-se e sugira alternativa

---

**Próximo:** Configure os tools no N8N e atualize o System Prompt! 🚀


