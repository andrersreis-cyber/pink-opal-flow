# 🧪 PASSO 5: Roteiro de Testes Completo

## 📋 **OBJETIVO:**
Validar que TODAS as correções estão funcionando corretamente.

---

## ✅ **PRÉ-REQUISITOS:**

Antes de testar, confirmar que:
- [ ] Tool `listar_funcionarios_por_servico` foi adicionada
- [ ] JSON Bodies de todas as tools foram corrigidos
- [ ] Telefone usa `Normalizar Telefone` em todas as tools
- [ ] System Prompt foi atualizado com validação
- [ ] Workflow foi salvo

---

## 🧪 **TESTE 1: Harmonização com Carla (Validação de Especialização)**

### **Cenário:**
Cliente solicita Harmonização Facial com Carla (que NÃO faz este serviço)

### **Passos:**
1. Enviar no WhatsApp:
   ```
   "Oi, quero fazer harmonização facial com a Carla dia 5/12 às 14h"
   ```

### **Resultado Esperado:**
```
Agente: "A Harmonização Facial é um procedimento avançado 
         realizado pela nossa especialista Liz Martins.
         
         A Carla é excelente em outros procedimentos como:
         • Brow Lamination
         • Limpeza de Pele
         • Design de Sobrancelhas
         • Avaliação
         
         Gostaria de agendar a Harmonização Facial com a Liz, 
         ou prefere um desses outros procedimentos com a Carla?"
```

### **Validações:**
- [ ] Agente identificou que Carla não faz Harmonização
- [ ] Agente ofereceu Liz (única habilitada)
- [ ] Agente listou serviços que Carla pode fazer
- [ ] Nenhum erro de JSON apareceu
- [ ] Telefone correto foi usado

---

## 🧪 **TESTE 2: Avaliação com Carla (Sucesso)**

### **Cenário:**
Cliente solicita Avaliação com Carla (que FAZ este serviço)

### **Passos:**
1. Continuar conversa anterior ou iniciar nova:
   ```
   "Ok, então quero fazer uma avaliação com a Carla dia 5/12 às 14h"
   ```

### **Resultado Esperado:**
```
Agente: "A Carla Souza está disponível no dia 05/12 às 14:00 
         para a avaliação (R$ 50, 30 minutos).
         
         Quer que eu faça o agendamento para você?"
         
Cliente: "Sim"

Agente: "Perfeito! Seu agendamento para Avaliação com a Carla 
         no dia 05/12 às 14:00 está confirmado! 😊
         
         Te enviarei um lembrete próximo ao horário.
         Qualquer dúvida, estou por aqui!"
```

### **Validações:**
- [ ] Agente validou que Carla faz Avaliação
- [ ] Agente verificou disponibilidade
- [ ] Agendamento foi criado com sucesso
- [ ] Telefone correto foi salvo no banco
- [ ] `funcionario_id` da Carla foi salvo corretamente

---

## 🧪 **TESTE 3: Brow Lamination sem Especificar Profissional**

### **Cenário:**
Cliente solicita serviço sem especificar profissional

### **Passos:**
1. Novo cliente envia:
   ```
   "Oi, quero fazer Brow Lamination"
   ```

### **Resultado Esperado:**
```
Agente: "Para Brow Lamination, temos duas profissionais disponíveis:
         
         • Liz Martins ⭐ - Nível avançado, especialista
         • Carla Souza - Profissional qualificada
         
         Com qual delas você prefere agendar?"
         
Cliente: "Com a Liz"

Agente: "Perfeito! Qual dia e horário você prefere para fazer 
         Brow Lamination com a Liz?"
```

### **Validações:**
- [ ] Agente listou ambas as profissionais habilitadas
- [ ] Destacou Liz como nível avançado (⭐)
- [ ] Aguardou escolha do cliente
- [ ] Prosseguiu com profissional escolhido

---

## 🧪 **TESTE 4: Cliente Recorrente (Memória de Profissional)**

### **Cenário:**
Cliente que já foi atendido antes

### **Passos:**
1. Cliente com histórico envia:
   ```
   "Oi, quero agendar uma limpeza de pele"
   ```

### **Resultado Esperado:**
```
Agente: "Vi aqui que você já foi atendido pela Carla Souza 
         anteriormente. Quer agendar a Limpeza de Pele com 
         ela novamente?"
         
Cliente: "Sim, pode ser"

Agente: "Ótimo! Qual dia e horário você prefere?"
```

### **Validações:**
- [ ] Agente consultou histórico (`obter_ultimo_funcionario_cliente`)
- [ ] Ofereceu o mesmo profissional
- [ ] Validou que profissional faz o serviço
- [ ] Prosseguiu normalmente

---

## 🧪 **TESTE 5: Profissional Ocupado (Oferecer Alternativa)**

### **Cenário:**
Cliente quer profissional específico em horário ocupado

### **Passos:**
1. Criar agendamento manual para Liz às 15h do dia X
2. Cliente solicita:
   ```
   "Quero Brow Lamination com a Liz dia [X] às 15h"
   ```

### **Resultado Esperado:**
```
Agente: "A Liz está ocupada no dia [X] às 15:00. 😔
         
         Posso te oferecer:
         
         1. Outro horário com a Liz no mesmo dia:
            • 10:00
            • 14:00
            • 16:00
         
         2. Ou agendar às 15:00 com a Carla Souza, 
            que também realiza Brow Lamination.
         
         O que você prefere?"
```

### **Validações:**
- [ ] Agente detectou ocupação
- [ ] Ofereceu outros horários do mesmo profissional
- [ ] Ofereceu outros profissionais habilitados
- [ ] Cliente pode escolher

---

## 🧪 **TESTE 6: Telefone Correto em Todas as Tools**

### **Cenário:**
Verificar que telefone normalizado está sendo usado

### **Passos:**
1. Enviar mensagem de um número conhecido
2. Verificar logs do n8n:
   - Output do "Normalizar Telefone"
   - Input de cada tool chamada
   - Session ID do AI Agent

### **Validações:**
- [ ] `Normalizar Telefone` retorna `telefone_normalizado`
- [ ] Formato é `55DDNNNNNNNNN` (ex: 5527995228798)
- [ ] `obter_cliente_id_por_telefone` recebe telefone correto
- [ ] `listar_agendamentos_por_telefone` recebe telefone correto
- [ ] `obter_ultimo_funcionario_cliente` recebe telefone correto
- [ ] Session ID usa telefone normalizado

---

## 🧪 **TESTE 7: JSON Bodies Válidos**

### **Cenário:**
Verificar que nenhum erro de JSON aparece

### **Passos:**
1. Executar qualquer teste acima
2. Monitorar execução no n8n
3. Ver output de cada tool

### **Validações:**
- [ ] Nenhum erro "JSON parameter needs to be valid JSON"
- [ ] Todas as tools retornam dados ou erro esperado
- [ ] Expressões `$fromAI` funcionam corretamente

---

## 🧪 **TESTE 8: Banco de Dados (Validação Final)**

### **Cenário:**
Verificar que dados estão sendo salvos corretamente

### **Passos:**
1. Após criar um agendamento via WhatsApp
2. Consultar no Supabase:

```sql
-- Ver último agendamento criado
SELECT 
  a.id,
  c.nome as cliente_nome,
  c.telefone,
  s.nome as servico_nome,
  p.nome as funcionario_nome,
  a.data,
  a.status
FROM agendamentos a
INNER JOIN clientes c ON c.id = a.cliente_id
INNER JOIN servicos s ON s.id = a.servico_id
INNER JOIN profiles p ON p.id = a.funcionario_id
ORDER BY a.created_at DESC
LIMIT 1;
```

### **Validações:**
- [ ] Telefone está no formato `55DDNNNNNNNNN`
- [ ] `funcionario_id` está preenchido
- [ ] `funcionario_id` corresponde ao profissional correto
- [ ] Horário está em timezone Brasília
- [ ] Status é "pendente"

---

## 📊 **CHECKLIST GERAL:**

### **Antes dos Testes:**
- [ ] Todas as 5 correções foram aplicadas
- [ ] Workflow foi salvo
- [ ] Nenhum erro aparece ao salvar

### **Durante os Testes:**
- [ ] Monitorar logs do n8n em tempo real
- [ ] Verificar output de cada node
- [ ] Anotar qualquer erro ou comportamento inesperado

### **Após os Testes:**
- [ ] Todos os 8 testes passaram
- [ ] Nenhum erro de JSON apareceu
- [ ] Telefones estão corretos no banco
- [ ] Agendamentos têm `funcionario_id`
- [ ] Validação de especialização funciona

---

## 🚨 **SE ALGO FALHAR:**

1. **Erro de JSON:**
   - Revisar JSON Body da tool que falhou
   - Verificar se tem `=` antes de `{{`
   - Verificar se tem aspas ao redor

2. **Erro de Telefone:**
   - Verificar output do "Normalizar Telefone"
   - Confirmar que Session ID usa telefone normalizado
   - Verificar expression em cada tool

3. **Validação não funciona:**
   - Confirmar que tool `listar_funcionarios_por_servico` foi adicionada
   - Verificar System Prompt foi atualizado
   - Testar tool manualmente

4. **Agendamento falha:**
   - Verificar `criar_agendamento_validado` tem `p_funcionario_id`
   - Confirmar que funcionário está habilitado no banco
   - Ver logs de erro no n8n

---

## ✅ **SUCESSO TOTAL:**

Quando TODOS os testes passarem:
- ✅ Sistema 100% funcional
- ✅ Validação de especialização ativa
- ✅ Telefones normalizados
- ✅ JSON Bodies corretos
- ✅ Pronto para produção!

---

## 🎯 **PRÓXIMO PASSO:**

Após validar tudo:
- Commit das documentações
- Atualizar README com instruções de n8n
- Celebrar! 🎉

---

**Status:** ⏳ Aguardando execução  
**Prioridade:** 🚨 VALIDAÇÃO FINAL

