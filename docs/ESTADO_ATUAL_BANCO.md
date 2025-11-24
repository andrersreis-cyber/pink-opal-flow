# 📊 ESTADO ATUAL DO BANCO DE DADOS

**Data da Auditoria**: 24/11/2025  
**Branch**: versao6 (código) vs versao5 (banco)

---

## 🔍 RESUMO EXECUTIVO

| Item | Status | Ação Necessária |
|------|--------|-----------------|
| Versão 6 (funcionario_servicos) | ❌ Não aplicada | Aplicar migrations |
| Triggers duplicados | ⚠️ 10 duplicatas | Limpar duplicatas |
| historico_conversas | ⚠️ Existe mas não é usado | Investigar + Remover |
| Triggers órfãos | ⚠️ Possível | Investigar + Remover |

---

## 📋 TRIGGERS ENCONTRADOS (14 total)

### ✅ **Necessários** (4 triggers)
1. `trigger_normalizar_telefone_clientes` (clientes) - **MANTER 1**
2. `trigger_agendamentos_updated_at` (agendamentos) - **MANTER**
3. `set_updated_at` (profiles) - **MANTER**
4. `sync_dados_cliente_trigger` (clientes) - **INVESTIGAR**

### ⚠️ **Duplicados** (10 triggers)
- `trigger_log_agendamento_operations` (agendamentos) - **3 DUPLICATAS**
- `trigger_update_cliente_stats` (agendamentos) - **3 DUPLICATAS**
- `trigger_normalizar_telefone_clientes` (clientes) - **2 DUPLICATAS**
- `trigger_validate_mensagem` (historico_conversas) - **2 DUPLICATAS**

### ❓ **Suspeitos** (2 triggers)
- `sync_chats_trigger` (clientes) - **INVESTIGAR**
- `sync_dados_cliente_trigger` (clientes) - **INVESTIGAR**

---

## 🎯 PLANO DE AÇÃO - 4 PASSOS

### **PASSO 1: Investigar** 🔍
```bash
# Execute no Supabase SQL Editor:
supabase/scripts/investigation.sql
```

**O que faz:**
- ✅ Compara `historico_conversas` vs `n8n_chat_histories`
- ✅ Mostra código dos triggers suspeitos
- ✅ Identifica tabelas órfãs
- ✅ Conta registros

**Tempo**: 2 minutos

---

### **PASSO 2: Remover Duplicatas** 🧹
```bash
# Execute no Supabase SQL Editor:
supabase/scripts/remove-duplicates.sql
```

**O que faz:**
- ✅ Remove triggers duplicados
- ✅ Mantém apenas 1 de cada
- ✅ Recria `trigger_normalizar_telefone_clientes` (necessário)

**Tempo**: 1 minuto

---

### **PASSO 3: Aplicar Versão 6** 🚀
```bash
# Execute no Supabase SQL Editor (NESTA ORDEM):
1. supabase/migrations/20251123_funcionario_servicos.sql
2. supabase/migrations/20251123_rpc_funcionario_servicos.sql
```

**O que faz:**
- ✅ Cria tabela `funcionario_servicos`
- ✅ Cria RPCs de especialização
- ✅ Insere dados iniciais (Liz admin + Carla funcionário)

**Tempo**: 2 minutos

---

### **PASSO 4: Limpar Triggers Órfãos** 🗑️
```bash
# Execute SOMENTE após investigar (Passo 1)
# Script será criado baseado no resultado da investigação
supabase/scripts/cleanup-orphan-triggers.sql
```

**O que faz:**
- ✅ Remove triggers que apontam para tabelas inexistentes
- ✅ Remove funções não usadas
- ✅ Remove `historico_conversas` (se for duplicata)

**Tempo**: 2 minutos

---

## 📊 RESULTADO ESPERADO

### **Antes:**
```
❌ 14 triggers (10 duplicados/órfãos)
❌ Versão 5 (sem funcionario_servicos)
⚠️  historico_conversas (duplicata?)
⚠️  Possíveis tabelas órfãs
```

### **Depois:**
```
✅ 4-6 triggers (apenas necessários)
✅ Versão 6 (com funcionario_servicos)
✅ n8n_chat_histories (única tabela de conversas)
✅ Banco otimizado e limpo
```

---

## 🚦 STATUS ATUAL

### ✅ **Pronto para executar:**
- [x] Script de investigação criado
- [x] Script de remoção de duplicatas criado
- [x] Migrations v6 existem e estão prontas

### ⏳ **Aguardando:**
- [ ] Executar investigação
- [ ] Análise dos resultados
- [ ] Decisão sobre `historico_conversas`
- [ ] Criação do script de cleanup final

---

## 📝 PRÓXIMOS PASSOS

1. **Execute `investigation.sql`** no Supabase SQL Editor
2. **Me mostre os NOTICES** que aparecem
3. **Analisaremos juntos** os resultados
4. **Decidiremos** o que remover
5. **Executaremos** a limpeza completa

---

## 🔗 ARQUIVOS RELACIONADOS

- `supabase/scripts/safe-audit.sql` - Auditoria segura
- `supabase/scripts/investigation.sql` - Investigação profunda
- `supabase/scripts/remove-duplicates.sql` - Remover duplicatas
- `supabase/migrations/20251123_funcionario_servicos.sql` - Criar tabela v6
- `supabase/migrations/20251123_rpc_funcionario_servicos.sql` - Criar RPCs v6
- `docs/PLANO_LIMPEZA_DEFINITIVO.md` - Plano detalhado

---

**🎯 Pronto para começar? Execute `investigation.sql` e me mostre os resultados!**


