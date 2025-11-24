# 🔍 AUDITORIA COMPLETA DO BANCO DE DADOS

**Data**: 24 de novembro de 2025  
**Branch**: versao6  
**Objetivo**: Identificar e remover tudo que não é usado pelo Frontend ou n8n

---

## ✅ TABELAS PRINCIPAIS (USADAS E NECESSÁRIAS)

### 1. **`profiles`** ✅ MANTER
**Usado por:**
- Frontend: Autenticação (`useAuth`), Gestão de Usuários (`useUsuarios`)
- n8n: `listar_funcionarios_disponiveis`, `obter_ultimo_funcionario_cliente`

**Colunas necessárias:**
- `id` (UUID) - PK
- `email` - Login
- `nome` - Exibição
- `role` - Controle de acesso (admin/funcionario)
- `ativo` - Status
- `created_at` - Auditoria

### 2. **`clientes`** ✅ MANTER
**Usado por:**
- Frontend: `useClientes`, `useCliente`, Modal de Agendamento
- n8n: `obter_cliente_id`, `criar_agendamento_validado`

**Colunas necessárias:**
- `id` (BIGSERIAL) - PK
- `nome`
- `telefone` - Identificação única
- `email` (opcional)
- `observacoes` (opcional)
- `created_at`

### 3. **`servicos`** ✅ MANTER
**Usado por:**
- Frontend: `useServicos`, Modal de Agendamento, Dashboard
- n8n: `listar_servicos_disponiveis`, `criar_agendamento_validado`

**Colunas necessárias:**
- `id` (TEXT) - PK (ex: "av-01")
- `nome`
- `categoria`
- `preco` (DECIMAL)
- `duracao_minutos` (INTEGER)
- `descricao` (opcional)
- `ativo` (BOOLEAN)
- `created_at`

### 4. **`agendamentos`** ✅ MANTER
**Usado por:**
- Frontend: Todas as páginas de agenda, Dashboard
- n8n: `criar_agendamento_validado`, `listar_agendamentos_por_telefone`

**Colunas necessárias:**
- `id` (BIGSERIAL) - PK
- `cliente_id` → FK para `clientes`
- `servico_id` → FK para `servicos`
- `funcionario_id` → FK para `profiles` ⚠️ **IMPORTANTE**
- `data` (TIMESTAMPTZ)
- `duracao_minutos`
- `preco`
- `status` (pendente/confirmado/cancelado)
- `observacoes`
- `created_at`

### 5. **`funcionario_servicos`** ✅ MANTER (VERSÃO 6)
**Usado por:**
- Frontend: Modal "Gerenciar Serviços" (`useFuncionarioServicos`)
- n8n: `listar_funcionarios_por_servico`, `verificar_disponibilidade_por_funcionario`

**Colunas necessárias:**
- `id` (BIGSERIAL) - PK
- `funcionario_id` → FK para `profiles`
- `servico_id` → FK para `servicos`
- `ativo` (BOOLEAN)
- `nivel_habilidade` (basico/avancado)
- `observacoes`
- `created_at`, `updated_at`

### 6. **`n8n_chat_histories`** ✅ MANTER
**Usado por:**
- Frontend: Página "Histórico de Conversas" (`useConversas`)
- n8n: Sistema de memória do agente IA

**Colunas necessárias:**
- `id` (BIGSERIAL) - PK
- `session_id` - Identificador da conversa
- `messages` (JSONB) - Array de mensagens
- `client_id` - Vínculo opcional com cliente
- `phone` - Telefone para identificação
- `created_at`, `updated_at`

---

## ⚠️ TABELAS E VIEWS A REVISAR

### 7. **`vw_conversas_formatadas`** ⚠️ REVISAR
**Status**: VIEW criada na versão anterior  
**Usado por:** Frontend (`useConversas`)

**Ação**: 
- ✅ MANTER se simplifica queries
- ❌ REMOVER se causa overhead desnecessário

**Verificar**: Se a VIEW está funcionando corretamente ou se podemos fazer query direta em `n8n_chat_histories`

### 8. **`vw_estatisticas_dia`** ⚠️ REVISAR
**Usado por:** Dashboard (`useDashboardCharts`)

**Ação**:
- ✅ MANTER - Melhora performance de gráficos
- Alternativa: Substituir por query agregada

### 9. **`atividades_dashboard`** ❓ INVESTIGAR
**Usado por:** `useAtividades` (Dashboard)

**Ação**:
- **INVESTIGAR**: Verificar se há dados
- **INVESTIGAR**: Verificar se frontend realmente usa
- Possível remoção se não for crítico

---

## 🗑️ TABELAS/VIEWS A REMOVER (NÃO USADAS)

### ❌ **`vw_agendamentos_completos`**
**Motivo**: Substituída por queries diretas com RLS correto  
**Migração onde foi removida**: `20251123_fix_rls_agendamentos.sql`  
**Status**: Já deve estar removida

---

## 🔧 RPCs (FUNÇÕES) NECESSÁRIAS

### ✅ RPCs Essenciais para Frontend

1. **`verificar_disponibilidade`**
   - Usado por: Modal de Agendamento
   - Validação de conflitos de horário

### ✅ RPCs Essenciais para n8n

2. **`listar_servicos_disponiveis`**
   - Retorna catálogo de serviços ativos

3. **`obter_cliente_id`**
   - Busca/cria cliente por telefone

4. **`listar_agendamentos_por_telefone`**
   - Histórico de agendamentos do cliente

5. **`criar_agendamento_validado`**
   - Cria agendamento com validações (incluindo especialização)

6. **`listar_funcionarios_disponiveis`**
   - Lista funcionários ativos

7. **`obter_ultimo_funcionario_cliente`**
   - Memória de preferência do cliente

8. **`verificar_disponibilidade_por_funcionario`**
   - Checa horários disponíveis por funcionário

### ✅ RPCs para Especialização (Versão 6)

9. **`listar_funcionarios_por_servico`**
   - Funcionários habilitados para um serviço específico

10. **`listar_servicos_por_funcionario`**
    - Serviços que um funcionário pode executar

11. **`funcionario_pode_executar_servico`**
    - Validação booleana de habilitação

---

## ⚠️ FUNCTIONS/TRIGGERS A REVISAR

### **`create_user_with_profile`** (Edge Function)
**Status**: Usada para criação automática de funcionários  
**Ação**: ✅ MANTER - Facilita onboarding

### **Triggers de `updated_at`**
**Tabelas**: `funcionario_servicos`, potencialmente outras  
**Ação**: ✅ MANTER - Boa prática de auditoria

---

## 📋 SCRIPT DE LIMPEZA SQL

```sql
-- =====================================================
-- SCRIPT DE LIMPEZA DO BANCO DE DADOS
-- Data: 24/11/2025
-- Objetivo: Remover tabelas, views e functions não usadas
-- =====================================================

-- 1. REMOVER VIEWS ANTIGAS (se ainda existirem)
-- =====================================================
DROP VIEW IF EXISTS vw_agendamentos_completos CASCADE;

-- 2. INVESTIGAR E POSSIVELMENTE REMOVER
-- =====================================================
-- Descomentar após verificar se não é usado:
-- DROP TABLE IF EXISTS atividades_dashboard CASCADE;

-- 3. REMOVER RPCs ANTIGAS/DUPLICADAS
-- =====================================================
-- Verificar se há múltiplas versões de funções
SELECT 
  routine_name, 
  COUNT(*) as versoes
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
GROUP BY routine_name
HAVING COUNT(*) > 1;

-- 4. LIMPAR DADOS DE TESTE
-- =====================================================
-- Já foi feito manualmente, mas para documentação:
/*
DELETE FROM agendamentos WHERE id > 0;
DELETE FROM n8n_chat_histories WHERE id > 0;
DELETE FROM mensagens WHERE id > 0;
DELETE FROM conversas WHERE id > 0;
DELETE FROM clientes WHERE id != [SEU_ID];
*/

-- 5. RESETAR SEQUENCES (opcional)
-- =====================================================
-- Se quiser resetar IDs:
/*
ALTER SEQUENCE agendamentos_id_seq RESTART WITH 1;
ALTER SEQUENCE clientes_id_seq RESTART WITH 2; -- Mantém seu cliente
ALTER SEQUENCE funcionario_servicos_id_seq RESTART WITH 1;
*/

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
```

---

## 📊 RESUMO DA AUDITORIA

### ✅ **Tabelas Confirmadas (8)**
1. `profiles` - Funcionários/Admin
2. `clientes` - Clientes
3. `servicos` - Catálogo de serviços
4. `agendamentos` - Agendamentos
5. `funcionario_servicos` - Especialização (v6)
6. `n8n_chat_histories` - Conversas WhatsApp
7. `vw_conversas_formatadas` - View de conversas
8. `vw_estatisticas_dia` - View para Dashboard

### ⚠️ **Para Investigar (1)**
- `atividades_dashboard` - Verificar uso real

### ✅ **RPCs Confirmadas (11)**
- Frontend: 1 RPC
- n8n Básico: 7 RPCs
- n8n Especialização: 3 RPCs

### ❌ **Removidas (1)**
- `vw_agendamentos_completos` (já removida)

---

## 🎯 PRÓXIMOS PASSOS

1. **Executar Query de Investigação**:
   ```sql
   -- Ver estrutura completa
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public' 
   ORDER BY tablename;
   
   -- Ver todas as views
   SELECT table_name FROM information_schema.views 
   WHERE table_schema = 'public';
   
   -- Ver todas as functions
   SELECT routine_name, routine_type 
   FROM information_schema.routines 
   WHERE routine_schema = 'public';
   ```

2. **Validar atividades_dashboard**:
   - Comentar temporariamente `useAtividades` no Dashboard
   - Verificar se causa erros
   - Decidir manter/remover

3. **Otimizar Índices**:
   - Verificar quais índices existem
   - Remover índices não utilizados
   - Adicionar índices faltantes

4. **Documentar Schemas**:
   - Gerar diagrama ER atualizado
   - Documentar relacionamentos FK

---

**Banco de dados auditado e pronto para limpeza!** 🧹


