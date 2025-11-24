# 🧹 PLANO DE LIMPEZA DEFINITIVO DO BANCO

**Baseado na auditoria real do banco de dados**

---

## 🔍 DESCOBERTAS DA AUDITORIA

### ✅ **Tabelas que DEVEM existir:**
- `profiles` (3 registros)
- `clientes` 
- `servicos`
- `agendamentos`
- `n8n_chat_histories` (conversas do WhatsApp)

### ⚠️ **Tabela descoberta:**
- **`historico_conversas`** - Tem triggers ativos!

### ❌ **Versão 6 NÃO APLICADA:**
- `funcionario_servicos` - **NÃO EXISTE**
- RPCs de especialização - **NÃO EXISTEM**

### 🔧 **Triggers Encontrados (14 total):**

#### ✅ Necessários (4):
1. `trigger_normalizar_telefone_clientes` (clientes) - **MANTER**
2. `trigger_agendamentos_updated_at` (agendamentos) - **MANTER**
3. `set_updated_at` (profiles) - **MANTER**

#### ⚠️ Investigar (10):
4. `trigger_log_agendamento_operations` (agendamentos) x3 - **INVESTIGAR**
5. `trigger_update_cliente_stats` (agendamentos) x3 - **INVESTIGAR**
6. `sync_chats_trigger` (clientes) - **INVESTIGAR**
7. `sync_dados_cliente_trigger` (clientes) - **INVESTIGAR**
8. `trigger_validate_mensagem` (historico_conversas) x2 - **INVESTIGAR**

---

## 🎯 DECISÕES NECESSÁRIAS

### 1. **`historico_conversas` vs `n8n_chat_histories`**

**Pergunta crítica**: São tabelas diferentes ou duplicadas?

**Ações para descobrir:**
```sql
-- Ver estrutura de historico_conversas
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'historico_conversas'
ORDER BY ordinal_position;

-- Ver estrutura de n8n_chat_histories
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'n8n_chat_histories'
ORDER BY ordinal_position;

-- Contar registros
SELECT 
  (SELECT COUNT(*) FROM historico_conversas) as historico_count,
  (SELECT COUNT(*) FROM n8n_chat_histories) as n8n_count;
```

**Decisão:**
- Se forem duplicatas → Migrar dados + Remover `historico_conversas`
- Se forem diferentes → Manter ambas (raro)

---

### 2. **Triggers de Log (`trigger_log_agendamento_operations`)**

**O que faz**: Grava logs de operações em agendamentos

**Investigar:**
```sql
-- Ver se tabela agendamento_logs existe
SELECT EXISTS(
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'agendamento_logs'
);

-- Ver função do trigger
SELECT routine_definition
FROM information_schema.routines
WHERE routine_name = 'log_agendamento_operations';
```

**Decisão:**
- ❓ Você usa esses logs? 
- **SE NÃO** → Remover trigger (melhora performance)
- **SE SIM** → Manter

---

### 3. **Triggers de Stats (`trigger_update_cliente_stats`)**

**O que faz**: Atualiza estatísticas de clientes

**Investigar:**
```sql
-- Ver se tabela cliente_stats existe
SELECT EXISTS(
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'cliente_stats'
);

-- Ver função do trigger
SELECT routine_definition
FROM information_schema.routines
WHERE routine_name = 'update_cliente_stats';
```

**Decisão:**
- ❓ Dashboard usa essas stats?
- **SE NÃO** → Remover trigger
- **SE SIM** → Verificar se melhora performance

---

### 4. **Triggers de Sync (`sync_chats_trigger`, `sync_dados_cliente_trigger`)**

**O que faz**: Sincroniza dados entre tabelas

**Investigar:**
```sql
-- Ver funções
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name IN ('sync_chats', 'sync_dados_cliente');
```

**Decisão:**
- Se sincroniza com `historico_conversas` → Pode remover se remover a tabela
- Verificar código da função primeiro

---

## 📋 SCRIPT DE INVESTIGAÇÃO COMPLETO

```sql
-- =====================================================
-- INVESTIGAÇÃO PROFUNDA
-- =====================================================

-- 1. Comparar estruturas de conversas
SELECT 
  'historico_conversas' as tabela,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'historico_conversas'
UNION ALL
SELECT 
  'n8n_chat_histories',
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'n8n_chat_histories'
ORDER BY tabela, column_name;

-- 2. Contar registros em cada tabela
SELECT 
  (SELECT COUNT(*) FROM historico_conversas) as historico,
  (SELECT COUNT(*) FROM n8n_chat_histories) as n8n,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM clientes) as clientes,
  (SELECT COUNT(*) FROM servicos) as servicos,
  (SELECT COUNT(*) FROM agendamentos) as agendamentos;

-- 3. Ver código de TODOS os triggers
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'log_agendamento_operations',
    'update_cliente_stats',
    'sync_chats',
    'sync_dados_cliente',
    'validate_mensagem'
  );

-- 4. Verificar tabelas órfãs
SELECT 
  'agendamento_logs' as tabela,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamento_logs') as existe
UNION ALL
SELECT 
  'cliente_stats',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cliente_stats');
```

---

## 🚀 PLANO DE AÇÃO (APÓS INVESTIGAÇÃO)

### **FASE 1: Aplicar Versão 6**
```sql
-- Executar no SQL Editor:
-- 1. supabase/migrations/20251123_funcionario_servicos.sql
-- 2. supabase/migrations/20251123_rpc_funcionario_servicos.sql
```

### **FASE 2: Resolver Duplicatas**
Se `historico_conversas` for duplicata:
```sql
-- Migrar dados (se necessário)
-- Remover triggers
DROP TRIGGER IF EXISTS trigger_validate_mensagem ON historico_conversas;

-- Remover tabela
DROP TABLE IF EXISTS historico_conversas CASCADE;
```

### **FASE 3: Remover Triggers Órfãos**
Se tabelas não existem:
```sql
-- Remover triggers de log
DROP TRIGGER IF EXISTS trigger_log_agendamento_operations ON agendamentos;

-- Remover triggers de stats
DROP TRIGGER IF EXISTS trigger_update_cliente_stats ON agendamentos;

-- Remover triggers de sync (se não forem necessários)
DROP TRIGGER IF EXISTS sync_chats_trigger ON clientes;
DROP TRIGGER IF EXISTS sync_dados_cliente_trigger ON clientes;
```

### **FASE 4: Remover Funções Não Usadas**
```sql
-- Remover funções órfãs
DROP FUNCTION IF EXISTS log_agendamento_operations();
DROP FUNCTION IF EXISTS update_cliente_stats();
DROP FUNCTION IF EXISTS sync_chats();
DROP FUNCTION IF EXISTS sync_dados_cliente();
DROP FUNCTION IF EXISTS validate_mensagem();
```

### **FASE 5: VACUUM e Otimização**
```sql
VACUUM ANALYZE;
```

---

## 📊 RESULTADO ESPERADO

### **Antes:**
- 6-8 tabelas
- 14 triggers (10 possivelmente desnecessários)
- Duplicatas de conversas?
- Versão 5 (sem especialização)

### **Depois:**
- 6-7 tabelas (apenas necessárias)
- 4 triggers (apenas essenciais)
- 1 tabela de conversas (`n8n_chat_histories`)
- Versão 6 (com especialização)
- Banco otimizado

---

## 🎯 PRÓXIMO PASSO IMEDIATO

**Execute este script de investigação** e me mostre os resultados:

```sql
-- Cole no SQL Editor
supabase/scripts/investigation.sql
```

(Vou criar esse script agora!)

---

**Com essas informações, saberemos EXATAMENTE o que remover!** 🔍


