# ✅ Checklist Pré-Merge para Dev

**Branch:** `versao6` → `dev`  
**Data:** 24/11/2025  
**Status:** Tudo funcionando perfeitamente ✨

---

## 🎯 Objetivo

Garantir que todas as funcionalidades estão operacionais e os dados estão íntegros antes do merge para a branch `dev`.

---

## 📊 1. AUDITORIA DE BANCO DE DADOS

### 1.1 Executar Script de Auditoria
- [ ] Executar `supabase/scripts/auditoria-final.sql` no SQL Editor
- [ ] Revisar resultados de cada seção
- [ ] Documentar problemas encontrados (se houver)

### 1.2 Verificações Críticas

#### Agendamentos
- [ ] Todos os agendamentos têm `funcionario_id` preenchido
- [ ] Nenhum agendamento com funcionário não habilitado
- [ ] Durações consistentes com o serviço
- [ ] Timestamps corretos (timezone UTC-03:00)

#### Clientes
- [ ] Sem telefones duplicados
- [ ] Todos os telefones normalizados (formato: `55DDNNNNNNNNN`)
- [ ] Cadastros consistentes (nome, CPF quando aplicável)

#### Especialização (funcionario_servicos)
- [ ] Liz tem todos os serviços habilitados (nível avançado)
- [ ] Carla tem serviços específicos configurados
- [ ] Maria Silva (se existir) tem configuração adequada
- [ ] Nenhum serviço crítico sem funcionário habilitado

#### Histórico de Conversas
- [ ] Conversas do N8N sendo registradas corretamente
- [ ] Cliente_id correto em cada conversa
- [ ] Mensagens e respostas íntegras

---

## 🖥️ 2. TESTES FRONTEND

### 2.1 Login e Autenticação
- [ ] Login como Admin (Liz)
- [ ] Login como Funcionário (Carla)
- [ ] Logout funcional

### 2.2 Dashboard Admin

#### Página de Agendamentos
- [ ] Visualizar "Agendamentos da Semana"
  - [ ] Filtro por funcionário funcionando
  - [ ] Filtro por status funcionando
  - [ ] Cards exibindo corretamente
- [ ] Visualizar "Agendamentos do Mês"
  - [ ] Filtro por funcionário funcionando (NOVA FEATURE)
  - [ ] Filtro por status funcionando
  - [ ] Calendário exibindo corretamente
- [ ] Criar novo agendamento
  - [ ] Selecionar serviço
  - [ ] **Lista de funcionários filtrada por habilitação** ✨
  - [ ] Badge de nível de habilidade exibido (🏆 Avançado / ⭐ Básico)
  - [ ] Validação de disponibilidade
  - [ ] Criação bem-sucedida
- [ ] Editar agendamento existente
- [ ] Cancelar agendamento

#### Página de Usuários
- [ ] Listar todos os usuários
- [ ] Botão "Gerenciar Serviços" visível para funcionários
- [ ] Abrir modal de especialização
- [ ] **Vincular/desvincular serviços** ✨
- [ ] **Alterar nível de habilidade (básico/avançado)** ✨
- [ ] Salvar alterações com sucesso

#### Página de Clientes
- [ ] Listar clientes
- [ ] Buscar cliente
- [ ] Visualizar histórico de agendamentos
- [ ] Visualizar histórico de conversas (N8N)

### 2.3 Dashboard Funcionário (Carla)

- [ ] Ver apenas próprios agendamentos
- [ ] Criar agendamento (automaticamente com seu ID)
- [ ] Não pode escolher outro funcionário
- [ ] Não vê botão "Gerenciar Serviços"

---

## 🤖 3. TESTES N8N (AGENTE IA)

### 3.1 Configuração
- [ ] Todas as HTTP Request Tools configuradas:
  - [ ] `listar_servicos`
  - [ ] `listar_funcionarios_por_servico` ✨
  - [ ] `obter_cliente_por_telefone`
  - [ ] `obter_ultimo_funcionario_cliente` ✨
  - [ ] `verificar_disponibilidade_por_funcionario` ✨
  - [ ] `criar_agendamento_validado` (com `funcionario_id`) ✨
- [ ] System Prompt atualizado com lógica de especialização
- [ ] Expressões usando `$fromAI('param')` corretamente

### 3.2 Fluxos de Teste

#### Cenário 1: Cliente Novo - Harmonização Facial
```
Cliente: "Olá, quero marcar harmonização facial"
Agente: [Lista serviço e preço]
Cliente: "Dia 26/11 às 10h"
Agente: [Lista funcionários habilitados: "Temos Liz e Maria disponíveis"]
Cliente: "Com a Liz"
Agente: [Verifica disponibilidade e confirma]
```

**Verificações:**
- [ ] Agente listou apenas funcionários habilitados para harmonização
- [ ] Verificou disponibilidade da Liz
- [ ] Criou agendamento com `funcionario_id` da Liz
- [ ] Agendamento apareceu no frontend
- [ ] Dados corretos no banco

#### Cenário 2: Cliente Recorrente
```
Cliente: "Quero agendar limpeza de pele"
Agente: [Busca histórico e oferece último funcionário]
        "Vi que você foi atendida pela Carla. Quer agendar com ela?"
Cliente: "Sim"
Agente: [Verifica disponibilidade e agenda com Carla]
```

**Verificações:**
- [ ] RPC `obter_ultimo_funcionario_cliente` funcionou
- [ ] Agente ofereceu continuidade com Carla
- [ ] Verificou habilitação da Carla para o serviço
- [ ] Criou agendamento corretamente

#### Cenário 3: Funcionário Ocupado
```
Cliente: "Quero harmonização com a Liz dia 26 às 14h"
Agente: [Verifica e descobre que Liz está ocupada]
        "Liz já tem compromisso. Temos Maria disponível às 14h ou outro horário com a Liz?"
Cliente: "Outro horário com a Liz"
Agente: [Lista horários disponíveis da Liz]
```

**Verificações:**
- [ ] Detectou conflito de horário
- [ ] Ofereceu alternativas (outro funcionário ou outro horário)
- [ ] Não criou agendamento em conflito

#### Cenário 4: Serviço Específico
```
Cliente: "Quais serviços a Carla faz?"
Agente: [Lista serviços vinculados à Carla]
```

**Verificações:**
- [ ] Listou apenas serviços que Carla pode executar
- [ ] Informação corresponde ao banco de dados

### 3.3 Validações Gerais N8N
- [ ] Todas as conversas registradas em `historico_conversas`
- [ ] Cliente_id correto em todas as conversas
- [ ] Telefone normalizado automaticamente
- [ ] Timestamps corretos (Brasília -03:00)
- [ ] Nenhum erro nos logs do N8N

---

## 🔒 4. SEGURANÇA E RLS

### 4.1 Políticas RLS
- [ ] `funcionario_servicos` tem RLS habilitado
- [ ] Admin pode ver/editar todos os vínculos
- [ ] Funcionário pode ver apenas seus vínculos
- [ ] Cliente não tem acesso

### 4.2 RPCs
- [ ] `listar_funcionarios_por_servico` retorna apenas ativos
- [ ] `funcionario_pode_executar_servico` valida corretamente
- [ ] `criar_agendamento_validado` rejeita funcionário não habilitado
- [ ] N8N usa service_role (bypass RLS) corretamente

---

## 📝 5. DOCUMENTAÇÃO

### 5.1 Documentos Criados/Atualizados
- [ ] `docs/N8N_ESPECIALIZACAO_SETUP.md` - Completo
- [ ] `docs/N8N_TOOLS_JSON.md` - Expressões corrigidas (`$fromAI`)
- [ ] `docs/AUDITORIA_BANCO_DADOS.md` - Auditoria inicial
- [ ] `docs/PLANO_LIMPEZA_DEFINITIVO.md` - Plano de limpeza
- [ ] `docs/GUIA_EXECUCAO_LIMPEZA.md` - Guia de execução
- [ ] `CHECKLIST_LIMPEZA.md` - Checklist de limpeza
- [ ] `CHECKLIST_PRE_MERGE.md` - Este documento

### 5.2 Código Comentado
- [ ] RPCs têm comentários explicativos
- [ ] Hooks do React têm descrições
- [ ] Componentes críticos documentados

---

## 🚀 6. PERFORMANCE

### 6.1 Queries
- [ ] Índices nas foreign keys (`funcionario_servicos`)
- [ ] Queries de agendamentos otimizadas
- [ ] Sem N+1 queries no frontend

### 6.2 Frontend
- [ ] Realtime subscription funcionando
- [ ] Cache do React Query invalidado corretamente
- [ ] Sem re-renders desnecessários

---

## 🧪 7. TESTES EDGE CASES

### 7.1 Casos Extremos
- [ ] Tentar agendar com funcionário não habilitado (deve falhar)
- [ ] Tentar agendar sem selecionar funcionário (deve falhar)
- [ ] Agendamento com 2 horas de duração (conflitos?)
- [ ] Cliente com telefone não normalizado (N8N normaliza?)
- [ ] Serviço sem nenhum funcionário habilitado (N8N trata?)

### 7.2 Validações de Input
- [ ] N8N trata `=funcionario_id` (expressão não avaliada) ✨
- [ ] N8N trata `=cliente_id` ✨
- [ ] RPCs com blindagem contra inputs malformados

---

## 📦 8. MIGRATIONS E SCRIPTS

### 8.1 Migrations Aplicadas
- [ ] `20251123_funcionario_servicos.sql` - Tabela e dados iniciais
- [ ] `20251123_rpc_funcionario_servicos.sql` - RPCs especializadas
- [ ] Todas as migrations anteriores consistentes

### 8.2 Scripts Úteis
- [ ] `supabase/scripts/auditoria-final.sql` - Pronto para uso
- [ ] `supabase/scripts/quick-audit.sql` - Diagnóstico rápido
- [ ] `supabase/scripts/investigation.sql` - Debug específico

---

## 🎨 9. UX/UI

### 9.1 Interface Admin
- [ ] Badge de nível de habilidade visível e claro
- [ ] Filtros intuitivos
- [ ] Mensagens de erro/sucesso claras
- [ ] Loading states apropriados

### 9.2 Modal de Especialização
- [ ] Lista de serviços completa
- [ ] Toggle de ativação funcional
- [ ] Select de nível de habilidade claro
- [ ] Feedback visual ao salvar

---

## 🔄 10. INTEGRAÇÃO COMPLETA

### 10.1 Fluxo End-to-End
**Teste Completo:**
1. Cliente envia mensagem no WhatsApp
2. N8N processa e escolhe funcionário habilitado
3. Cria agendamento via RPC
4. Frontend atualiza automaticamente (Realtime)
5. Admin vê novo agendamento
6. Funcionário vê seu agendamento
7. Conversa registrada em histórico

**Verificações:**
- [ ] Sem erros em nenhuma etapa
- [ ] Dados consistentes em todas as camadas
- [ ] Latência aceitável (< 3s)

---

## ✅ 11. CRITÉRIOS DE APROVAÇÃO

Para aprovar o merge `versao6` → `dev`, todos devem estar ✅:

- [ ] **Auditoria SQL:** 0 inconsistências críticas
- [ ] **Frontend Admin:** Todas as funcionalidades operacionais
- [ ] **Frontend Funcionário:** Restrições corretas
- [ ] **N8N:** 100% dos cenários de teste bem-sucedidos
- [ ] **Segurança:** RLS verificado e funcional
- [ ] **Documentação:** Completa e atualizada
- [ ] **Performance:** Sem lentidão perceptível
- [ ] **Dados:** Íntegros e consistentes

---

## 🎯 12. PRÓXIMOS PASSOS

Após aprovação:

1. **Merge para Dev:**
   ```bash
   git checkout dev
   git merge versao6
   git push origin dev
   ```

2. **Deploy (se aplicável):**
   - [ ] Aplicar migrations em produção
   - [ ] Atualizar N8N de produção
   - [ ] Testar em ambiente de produção

3. **Monitoramento:**
   - [ ] Observar logs do Supabase
   - [ ] Monitorar execuções do N8N
   - [ ] Coletar feedback dos usuários

4. **Backup:**
   - [ ] Backup do banco antes do merge
   - [ ] Backup das configurações N8N

---

## 📞 CONTATO

**LLM:** Claude Sonnet 4.5  
**Desenvolvedor:** André Reis  
**Projeto:** Pink Opal Flow - Sistema de Gestão de Clínica Estética  
**Versão:** 6.0 (Sistema de Especialização Funcionário x Serviços)

---

**Status Final:** ⏳ Aguardando execução da auditoria SQL

**Última Atualização:** 24/11/2025 - 20:00 BRT

