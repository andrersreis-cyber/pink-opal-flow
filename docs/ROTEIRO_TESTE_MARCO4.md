# 🧪 ROTEIRO DE TESTE COMPLETO - MARCO 4

## ✅ PRÉ-REQUISITOS

- [x] Banco de dados limpo (clientes, agendamentos, conversas)
- [ ] 2 funcionários ativos no sistema (Liz + 1 novo)
- [ ] System Prompt atualizado no n8n
- [ ] Workflow n8n salvo com as 4 tools configuradas
- [ ] Evolution API conectada e ativa

---

## 👥 PREPARAÇÃO: CRIAR SEGUNDO FUNCIONÁRIO

### Via Frontend (Admin - Liz):

1. Fazer login como admin (liz@pinkopal.dev)
2. Ir em "Equipe"
3. Criar novo funcionário:
   - **Nome:** Maria Silva
   - **Email:** maria@pinkopal.dev
   - **Senha:** maria123
   - **Role:** Funcionário

✅ **Validação:** Verificar que Maria aparece na lista de funcionários ativos

---

## 🧪 CENÁRIOS DE TESTE

---

### 📋 **TESTE 1: Cliente Novo - Escolha de Profissional**

**Objetivo:** Validar que o agente lista funcionários e permite escolha

**Passos:**

1. **Enviar no WhatsApp:**
   ```
   Olá! Quero marcar uma massagem relaxante
   ```

2. **Comportamento Esperado do Agente:**
   - ✅ Chama `buscar_servicos_disponiveis` com "massagem"
   - ✅ Lista as opções de massagem com preços
   - ✅ Pergunta qual massagem o cliente prefere
   - ✅ Cliente escolhe (ex: "massagem relaxante")
   - ✅ Agente pergunta: "Temos a Liz Martins e a Maria Silva disponíveis. Prefere alguma delas?"

3. **Responder:**
   ```
   Quero com a Maria
   ```

4. **Comportamento Esperado:**
   - ✅ Agente pergunta data/hora: "Ótimo! Qual dia e horário prefere?"

5. **Responder:**
   ```
   Dia 25/11 às 10:00
   ```

6. **Comportamento Esperado:**
   - ✅ Chama `verificar_disponibilidade_por_funcionario` para esse horário
   - ✅ Se Maria estiver livre, confirma: "Perfeito! Vou precisar de algumas informações..."
   - ✅ Pede nome e telefone
   - ✅ Chama `criar_agendamento_validado` com `funcionario_id` da Maria
   - ✅ Confirma: "Pronto! Marquei sua massagem relaxante com a Maria para dia 25/11 às 10:00"

7. **Validações no Sistema:**

   **Frontend (como Admin - Liz):**
   - [ ] Acessar "Agenda" → Ver agendamento criado
   - [ ] Verificar que o agendamento mostra "Maria Silva" como responsável
   - [ ] No dropdown de funcionários, filtrar por "Maria" → Ver o agendamento

   **Frontend (como Funcionário - Maria):**
   - [ ] Fazer logout e login como maria@pinkopal.dev
   - [ ] Acessar "Agenda" → Ver APENAS o agendamento dela
   - [ ] Verificar que NÃO vê menu "Equipe"

   **Banco de Dados:**
   ```sql
   SELECT 
     a.id, 
     c.nome as cliente,
     c.telefone,
     s.nome as servico,
     a.data_inicio,
     p.nome as funcionario
   FROM agendamentos a
   JOIN clientes c ON a.cliente_id = c.id
   JOIN servicos s ON a.servico_id = s.id
   JOIN profiles p ON a.funcionario_id = p.id
   ORDER BY a.data_inicio;
   ```
   - [ ] Verificar que `funcionario_id` aponta para Maria
   - [ ] Verificar que telefone está no formato correto (5527...)

   **Histórico de Conversas (Frontend - Admin):**
   - [ ] Acessar "Histórico"
   - [ ] Ver toda a conversa registrada com o cliente

✅ **CRITÉRIO DE SUCESSO:**
- Agendamento criado com profissional correto
- Cliente vê agendamento no WhatsApp
- Admin vê agendamento no frontend (com nome da Maria)
- Maria vê APENAS seu agendamento
- Histórico completo registrado

---

### 📋 **TESTE 2: Cliente Recorrente - Lembrar Último Profissional**

**Objetivo:** Validar que o agente lembra o último profissional que atendeu o cliente

**Passos:**

1. **Mesmo cliente do Teste 1 envia:**
   ```
   Oi! Quero agendar de novo
   ```

2. **Comportamento Esperado do Agente:**
   - ✅ Chama `obter_ultimo_funcionario_cliente` com o telefone do cliente
   - ✅ Recebe dados da Maria (último atendimento)
   - ✅ Confirma: "Oi! Que bom te ver de novo! Vi que você foi atendida pela Maria. Quer agendar com ela novamente?"

3. **Responder:**
   ```
   Sim, com ela mesmo
   ```

4. **Comportamento Esperado:**
   - ✅ Agente pergunta qual serviço
   - ✅ Cliente escolhe serviço
   - ✅ Agente pergunta data/hora
   - ✅ Continua fluxo normal usando `funcionario_id` da Maria

5. **Responder:**
   ```
   Quero uma limpeza de pele dia 26/11 às 14:00
   ```

6. **Comportamento Esperado:**
   - ✅ Chama `buscar_servicos_disponiveis` com "limpeza"
   - ✅ Apresenta opções de limpeza
   - ✅ Cliente confirma
   - ✅ Verifica disponibilidade da Maria para esse horário
   - ✅ Cria agendamento com Maria
   - ✅ Confirma: "Pronto! Marquei sua limpeza de pele com a Maria para dia 26/11 às 14:00"

7. **Validações:**
   - [ ] Frontend: Cliente tem 2 agendamentos (25/11 e 26/11), ambos com Maria
   - [ ] Maria vê seus 2 agendamentos
   - [ ] Liz NÃO vê nenhum agendamento (ainda não foi escolhida)

✅ **CRITÉRIO DE SUCESSO:**
- Agente lembrou do último profissional
- Agente usou tom personalizado ("de novo", "vi que você foi atendida...")
- 2 agendamentos do mesmo cliente com mesmo profissional

---

### 📋 **TESTE 3: Cliente Escolhe Outro Profissional**

**Objetivo:** Validar que cliente pode mudar de profissional

**Passos:**

1. **Mesmo cliente envia:**
   ```
   Quero marcar outra massagem
   ```

2. **Comportamento Esperado:**
   - ✅ Agente lembra: "Quer agendar com a Maria de novo ou prefere outra profissional?"

3. **Responder:**
   ```
   Dessa vez quero conhecer a Liz
   ```

4. **Comportamento Esperado:**
   - ✅ Agente aceita: "Claro! A Liz é ótima também. Qual dia e horário?"

5. **Responder:**
   ```
   27/11 às 16:00
   ```

6. **Comportamento Esperado:**
   - ✅ Verifica disponibilidade da Liz
   - ✅ Cria agendamento com `funcionario_id` da Liz
   - ✅ Confirma: "Pronto! Marquei sua massagem relaxante com a Liz para dia 27/11 às 16:00"

7. **Validações:**
   - [ ] Frontend: Cliente tem 3 agendamentos (2 com Maria, 1 com Liz)
   - [ ] Maria vê apenas seus 2 agendamentos
   - [ ] Liz agora vê 1 agendamento (o novo)
   - [ ] Admin vê todos os 3 agendamentos

✅ **CRITÉRIO DE SUCESSO:**
- Agente permitiu mudança de profissional
- Agendamentos corretos por funcionário

---

### 📋 **TESTE 4: Profissional Ocupado - Sugerir Alternativa**

**Objetivo:** Validar que o agente oferece alternativas quando profissional está ocupado

**Preparação:**

1. **Como Admin (Liz), criar agendamento manual no Frontend:**
   - Cliente: Criar novo cliente "Teste Bloqueio"
   - Serviço: Qualquer
   - Data: 28/11 às 10:00 até 11:00
   - Funcionário: Maria Silva

**Passos:**

2. **Novo cliente envia no WhatsApp:**
   ```
   Olá! Quero marcar uma drenagem facial
   ```

3. **Agente lista serviços, cliente escolhe.**

4. **Cliente diz:**
   ```
   Quero com a Maria dia 28/11 às 10:00
   ```

5. **Comportamento Esperado:**
   - ✅ Chama `verificar_disponibilidade_por_funcionario` para 28/11 10:00-11:00
   - ✅ Maria NÃO está na lista de disponíveis (está ocupada)
   - ✅ Liz está na lista de disponíveis
   - ✅ Agente responde: "A Maria já tem um compromisso nesse horário 😕 Mas a Liz está livre! Quer agendar com ela ou prefere outro horário com a Maria?"

6. **Responder:**
   ```
   Então pode ser com a Liz no mesmo horário
   ```

7. **Comportamento Esperado:**
   - ✅ Cria agendamento com `funcionario_id` da Liz
   - ✅ Confirma: "Pronto! Marquei sua drenagem facial com a Liz para dia 28/11 às 10:00"

8. **Validações:**
   - [ ] Frontend: 28/11 às 10:00 tem 2 agendamentos (Maria com "Teste Bloqueio", Liz com novo cliente)
   - [ ] Maria vê apenas o dela
   - [ ] Liz vê apenas o dela
   - [ ] Admin vê ambos

✅ **CRITÉRIO DE SUCESSO:**
- Agente detectou conflito
- Agente ofereceu alternativa (Liz)
- Cliente conseguiu agendar com profissional disponível

---

### 📋 **TESTE 5: Sem Profissional Disponível - Sugerir Outro Horário**

**Objetivo:** Validar que o agente sugere horários alternativos quando ninguém está livre

**Preparação:**

1. **Como Admin, criar 2 agendamentos no Frontend:**
   - 29/11 às 15:00 → Maria (com qualquer cliente)
   - 29/11 às 15:00 → Liz (com qualquer cliente)

**Passos:**

2. **Novo cliente envia:**
   ```
   Quero marcar uma avaliação dia 29/11 às 15:00
   ```

3. **Comportamento Esperado:**
   - ✅ Chama `verificar_disponibilidade_por_funcionario` para 29/11 15:00
   - ✅ Array retorna VAZIO (nenhum funcionário disponível)
   - ✅ Agente responde: "Puxa, esse horário está bem cheio... Tenho 14:00 e 16:00 disponíveis. Algum desses funciona?"

4. **Responder:**
   ```
   Pode ser às 16:00
   ```

5. **Comportamento Esperado:**
   - ✅ Pergunta: "Prefere a Liz ou a Maria?"
   - ✅ Cliente escolhe
   - ✅ Verifica disponibilidade para 16:00
   - ✅ Cria agendamento
   - ✅ Confirma com profissional e novo horário

6. **Validações:**
   - [ ] Agendamento criado no horário alternativo (16:00)
   - [ ] Profissional escolhido está correto

✅ **CRITÉRIO DE SUCESSO:**
- Agente detectou que ninguém estava livre
- Agente sugeriu horários alternativos
- Cliente conseguiu agendar em horário diferente

---

### 📋 **TESTE 6: Listar Agendamentos de Cliente com Múltiplos Profissionais**

**Objetivo:** Validar que o agente lista corretamente todos os agendamentos do cliente

**Passos:**

1. **Cliente que já tem 3 agendamentos (2 com Maria, 1 com Liz) envia:**
   ```
   Quero ver meus agendamentos
   ```

2. **Comportamento Esperado:**
   - ✅ Chama `listar_agendamentos_por_telefone`
   - ✅ Lista TODOS os agendamentos no formato correto:
   ```
   Você tem os seguintes agendamentos:

   📅 25/11 às 10:00 - Massagem relaxante
   📅 26/11 às 14:00 - Limpeza de pele
   📅 27/11 às 16:00 - Massagem relaxante
   ```
   - ✅ NUNCA menciona qual profissional (a menos que cliente pergunte)

3. **Validações:**
   - [ ] Todos os 3 agendamentos foram listados
   - [ ] Formato de data/hora está correto (DD/MM às HH:MM)
   - [ ] Cada agendamento em uma linha

✅ **CRITÉRIO DE SUCESSO:**
- Listagem correta de múltiplos agendamentos
- Formato humanizado e legível

---

### 📋 **TESTE 7: Cancelar Agendamento (Com Confirmação)**

**Objetivo:** Validar que o agente confirma antes de cancelar

**Passos:**

1. **Cliente envia:**
   ```
   Preciso cancelar meu agendamento do dia 27/11
   ```

2. **Comportamento Esperado:**
   - ✅ Chama `listar_agendamentos_por_telefone`
   - ✅ Identifica o agendamento de 27/11
   - ✅ SEMPRE confirma antes: "Confirma o cancelamento da massagem relaxante do dia 27/11 às 16:00?"

3. **Responder:**
   ```
   Sim, confirmo
   ```

4. **Comportamento Esperado:**
   - ✅ Chama `cancelar_agendamento` com o ID correto
   - ✅ Responde com empatia: "Cancelado! Aconteceu algum imprevisto? Quer reagendar pra outra data?"

5. **Validações:**
   - [ ] Agendamento de 27/11 foi removido do banco
   - [ ] Frontend: Cliente agora tem apenas 2 agendamentos (25/11 e 26/11)
   - [ ] Liz NÃO vê mais aquele agendamento
   - [ ] Histórico registra o cancelamento

✅ **CRITÉRIO DE SUCESSO:**
- Agente confirmou antes de cancelar
- Cancelamento foi executado corretamente
- Agente ofereceu reagendamento

---

### 📋 **TESTE 8: Cliente Diz "Tanto Faz" - Escolha Automática**

**Objetivo:** Validar que o agente escolhe automaticamente quando cliente não tem preferência

**Passos:**

1. **Novo cliente envia:**
   ```
   Quero marcar uma avaliação
   ```

2. **Agente pergunta:**
   ```
   Temos a Liz Martins e a Maria Silva disponíveis. Prefere alguma delas?
   ```

3. **Cliente responde:**
   ```
   Tanto faz, qualquer uma
   ```

4. **Comportamento Esperado:**
   - ✅ Agente escolhe automaticamente o primeiro disponível (geralmente Liz ou Maria)
   - ✅ Informa de forma natural: "Perfeito! Vou agendar com a Liz, ok?"
   - ✅ Continua fluxo normal

5. **Validações:**
   - [ ] Agendamento criado com um dos funcionários
   - [ ] `funcionario_id` está preenchido no banco

✅ **CRITÉRIO DE SUCESSO:**
- Agente não travou esperando escolha explícita
- Escolha automática funcionou
- Comunicação foi natural

---

## 📊 RESUMO DE VALIDAÇÕES GERAIS

Após TODOS os testes, validar:

### **Banco de Dados:**

```sql
-- Ver todos os agendamentos com funcionários
SELECT 
  a.id,
  c.nome as cliente,
  c.telefone,
  s.nome as servico,
  TO_CHAR(a.data_inicio AT TIME ZONE 'America/Sao_Paulo', 'DD/MM às HH24:MI') as data_hora,
  p.nome as funcionario
FROM agendamentos a
JOIN clientes c ON a.cliente_id = c.id
JOIN servicos s ON a.servico_id = s.id
JOIN profiles p ON a.funcionario_id = p.id
ORDER BY a.data_inicio;
```

**Validações:**
- [ ] Todos os agendamentos têm `funcionario_id` preenchido
- [ ] Todos os telefones estão no formato correto (55DDNNNNNNNNN)
- [ ] Todos os agendamentos têm timezone -03:00

---

### **Frontend (como Admin - Liz):**

- [ ] Dashboard mostra total de agendamentos
- [ ] Agenda mostra TODOS os agendamentos (de ambos funcionários)
- [ ] Dropdown de funcionários funciona (filtra corretamente)
- [ ] "Equipe" está visível no menu
- [ ] Consegue criar agendamentos e escolher funcionário responsável
- [ ] Histórico mostra todas as conversas

---

### **Frontend (como Funcionário - Maria):**

- [ ] Dashboard mostra apenas métricas dela
- [ ] Agenda mostra APENAS agendamentos dela
- [ ] "Equipe" NÃO está visível no menu
- [ ] Consegue criar agendamentos (apenas com seu próprio ID)
- [ ] NÃO consegue ver agendamentos da Liz

---

### **n8n / WhatsApp:**

- [ ] Agente lista funcionários corretamente
- [ ] Agente lembra último profissional para clientes recorrentes
- [ ] Agente oferece alternativas quando profissional ocupado
- [ ] Agente confirma antes de cancelar
- [ ] Agente usa tom humanizado e natural
- [ ] Todas as conversas são registradas no banco

---

## 🎯 CHECKLIST FINAL - MARCO 4 COMPLETO

- [ ] TESTE 1: Cliente novo escolhe profissional ✅
- [ ] TESTE 2: Cliente recorrente - lembrar último profissional ✅
- [ ] TESTE 3: Cliente muda de profissional ✅
- [ ] TESTE 4: Profissional ocupado - sugerir alternativa ✅
- [ ] TESTE 5: Nenhum profissional livre - sugerir horário ✅
- [ ] TESTE 6: Listar múltiplos agendamentos ✅
- [ ] TESTE 7: Cancelar com confirmação ✅
- [ ] TESTE 8: "Tanto faz" - escolha automática ✅

---

## ✅ CRITÉRIO DE SUCESSO GERAL

**MARCO 4 está COMPLETO quando:**
- ✅ Todos os 8 testes passaram
- ✅ RLS funciona (funcionários veem apenas sua agenda)
- ✅ Admin vê todos os agendamentos
- ✅ Agente n8n usa tom humanizado
- ✅ Histórico completo registrado
- ✅ Todos os agendamentos têm `funcionario_id`

---

## 🚀 APÓS VALIDAÇÃO COMPLETA

1. Commit das alterações para a branch `versao5`
2. Merge para `main` (versão estável)
3. Celebrar! 🎉

---

**BOA SORTE NOS TESTES!** 🧪✨

