# 🔍 DESCOBERTAS: Análise de Triggers

## 📊 TRIGGERS ENCONTRADOS

Ao analisar os triggers, descobrimos **tabelas ocultas** que não estavam sendo usadas no frontend!

---

## 🚨 TABELAS DESCOBERTAS

### 1. **`historico_conversas`** ⚠️
**Evidência**: Trigger `trigger_validate_mensagem`

**Suspeita**: Pode ser uma tabela antiga/duplicada de `n8n_chat_histories`

**Investigar**:
- É usada pelo frontend? (Não encontrei referências)
- É diferente de `n8n_chat_histories`?
- Pode ser removida?

---

### 2. **`agendamento_logs`** (possível)
**Evidência**: Trigger `trigger_log_agendamento_operations`

**Suspeita**: Tabela de auditoria que grava operações em agendamentos

**Investigar**:
- Essa tabela existe mesmo?
- Quantos registros tem?
- É usada para algum relatório?

**Possível ação**: Se não for usada, remover trigger e tabela

---

### 3. **`cliente_stats`** (possível)
**Evidência**: Trigger `trigger_update_cliente_stats`

**Suspeita**: Tabela de estatísticas calculadas de clientes

**Investigar**:
- Essa tabela existe?
- É usada no Dashboard?
- Pode ser substituída por query agregada?

**Possível ação**: Se não melhorar performance, remover

---

## 🔧 TRIGGERS ANALISADOS

### ✅ **TRIGGERS NECESSÁRIOS (MANTER)**

#### `trigger_normalizar_telefone_clientes`
- **Tabela**: `clientes`
- **Função**: Normaliza telefone ao inserir/atualizar
- **Status**: ✅ **MANTER** - Essencial para n8n

#### `trigger_agendamentos_updated_at`
- **Tabela**: `agendamentos`
- **Função**: Atualiza campo `updated_at` automaticamente
- **Status**: ✅ **MANTER** - Boa prática de auditoria

#### `set_updated_at` (profiles)
- **Tabela**: `profiles`
- **Função**: Atualiza campo `updated_at` automaticamente
- **Status**: ✅ **MANTER** - Boa prática de auditoria

---

### ⚠️ **TRIGGERS A INVESTIGAR**

#### `trigger_log_agendamento_operations`
- **Tabela**: `agendamentos`
- **Eventos**: INSERT, UPDATE, DELETE
- **Suspeita**: Grava logs em tabela `agendamento_logs`
- **Pergunta**: Esses logs são consultados em algum lugar?
- **Ação**: Se não for usado → **REMOVER trigger e tabela**

#### `trigger_update_cliente_stats`
- **Tabela**: `agendamentos`
- **Eventos**: INSERT, UPDATE, DELETE
- **Suspeita**: Atualiza estatísticas em `cliente_stats`
- **Pergunta**: Essas stats melhoram performance?
- **Ação**: Se não for usado → **REMOVER trigger e tabela**

#### `sync_chats_trigger`
- **Tabela**: `clientes`
- **Evento**: INSERT
- **Suspeita**: Sincroniza com `historico_conversas` ou similar
- **Pergunta**: Para que serve essa sincronia?
- **Ação**: Investigar função `sync_chats`

#### `sync_dados_cliente_trigger`
- **Tabela**: `clientes`
- **Evento**: INSERT
- **Suspeita**: Sincroniza dados com outra tabela
- **Pergunta**: Qual tabela? Para quê?
- **Ação**: Investigar função `sync_dados_cliente`

#### `trigger_validate_mensagem`
- **Tabela**: `historico_conversas`
- **Eventos**: INSERT, UPDATE
- **Suspeita**: Valida formato de mensagens
- **Pergunta**: Tabela `historico_conversas` é usada?
- **Ação**: Se tabela não for usada → **REMOVER tudo**

---

## 🔍 TABELAS DE CONVERSAS - CONFUSÃO DETECTADA

Temos **múltiplas tabelas** relacionadas a conversas:

1. **`n8n_chat_histories`** ← Usada pelo frontend (`useConversas`)
2. **`historico_conversas`** ← Tem trigger, mas frontend não usa?
3. **`conversas`** ← Possivelmente antiga
4. **`mensagens`** ← Possivelmente antiga

**SUSPEITA**: Houve migração de estrutura e tabelas antigas não foram removidas.

**Ação necessária**:
1. Confirmar qual é a tabela ATUAL
2. Verificar se outras têm dados
3. Migrar dados se necessário
4. Remover tabelas antigas

---

## 📋 SCRIPT PARA INVESTIGAÇÃO

Criado: `supabase/scripts/complete-audit.sql`

Esse script vai:
1. ✅ Listar TODAS as tabelas (incluindo escondidas)
2. ✅ Verificar se `historico_conversas`, `agendamento_logs`, `cliente_stats` existem
3. ✅ Contar registros em cada uma
4. ✅ Mostrar código dos triggers
5. ✅ Comparar tabelas de conversas (n8n_chat_histories vs outras)
6. ✅ Sugerir o que pode ser removido

---

## 🎯 PRÓXIMOS PASSOS

### 1. Executar `complete-audit.sql`
Vai revelar:
- Todas as tabelas ocultas
- Quantos registros cada uma tem
- Código das funções de trigger

### 2. Decidir o que remover

**CANDIDATOS PARA REMOÇÃO:**

| Item | Motivo | Ação |
|------|--------|------|
| `historico_conversas` | Duplicata de `n8n_chat_histories`? | Investigar → Remover |
| `conversas` | Tabela antiga? | Verificar → Remover |
| `mensagens` | Tabela antiga? | Verificar → Remover |
| `agendamento_logs` | Logs não consultados | Verificar → Remover trigger e tabela |
| `cliente_stats` | Stats não usadas | Verificar → Remover trigger e tabela |
| `trigger_log_agendamento_operations` | Grava logs desnecessários | Remover |
| `trigger_update_cliente_stats` | Calcula stats não usadas | Remover |
| `sync_chats_trigger` | Sincronia desnecessária? | Investigar → Remover |
| `sync_dados_cliente_trigger` | Sincronia desnecessária? | Investigar → Remover |

### 3. Criar migration de limpeza

Após confirmar o que não é usado, criar:
```sql
-- DROP triggers desnecessários
DROP TRIGGER IF EXISTS trigger_log_agendamento_operations ON agendamentos;
DROP TRIGGER IF EXISTS trigger_update_cliente_stats ON agendamentos;
-- etc...

-- DROP tabelas não usadas
DROP TABLE IF EXISTS historico_conversas CASCADE;
DROP TABLE IF EXISTS conversas CASCADE;
DROP TABLE IF EXISTS mensagens CASCADE;
-- etc...
```

---

## ⚠️ IMPACTO POTENCIAL

**Remoção de triggers de log/stats:**
- ✅ Reduz overhead em INSERTs/UPDATEs
- ✅ Melhora performance
- ✅ Reduz tamanho do banco
- ⚠️ Perde histórico (se for importante)

**Remoção de tabelas antigas de conversas:**
- ✅ Limpa código morto
- ✅ Evita confusão
- ⚠️ Verificar se há dados importantes antes

---

## 📊 ESTIMATIVA DE LIMPEZA

**Antes:**
- 10-15 tabelas
- 14+ triggers
- Múltiplas tabelas de conversas

**Depois (estimado):**
- 6-8 tabelas (apenas necessárias)
- 4-6 triggers (apenas essenciais)
- 1 tabela de conversas (`n8n_chat_histories`)

**Benefícios:**
- 🚀 Performance melhorada
- 🧹 Código mais limpo
- 📉 Tamanho reduzido
- 🔧 Manutenção facilitada

---

**Execute `complete-audit.sql` para revelar toda a verdade!** 🔍


