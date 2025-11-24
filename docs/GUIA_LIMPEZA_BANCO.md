# 🧹 GUIA DE LIMPEZA DO BANCO DE DADOS

**Data**: 24 de novembro de 2025  
**Branch**: versao6  
**Tempo estimado**: 10-15 minutos

---

## 📋 PRÉ-REQUISITOS

1. ✅ Frontend testado e funcionando (concluído)
2. ✅ Acesso ao Supabase Dashboard
3. ✅ Backup opcional (recomendado para produção)

---

## 🎯 OBJETIVO

Garantir que o banco tenha APENAS:
- Tabelas usadas pelo Frontend OU n8n
- RPCs necessárias
- Views otimizadas
- Índices relevantes
- **SEM** código morto ou duplicado

---

## 📝 PASSO A PASSO

### **PASSO 1: Abrir SQL Editor no Supabase**

1. Acesse: https://supabase.com/dashboard/project/uyffrwuerhwrpkyiydvd
2. Menu lateral → **SQL Editor**
3. Clique em **"New Query"**

---

### **PASSO 2: AUDITORIA INICIAL**

Cole e execute o script **`supabase/scripts/audit-database.sql`**

**O que vai mostrar:**
- ✅ Todas as tabelas e seus tamanhos
- ✅ Todas as views
- ✅ Todas as functions (RPCs)
- ✅ Functions duplicadas
- ✅ Colunas de cada tabela
- ✅ Foreign Keys
- ✅ Índices
- ✅ Policies (RLS)
- ✅ Quantidade de registros
- ✅ Triggers

**Ação**: Copie os resultados para um arquivo de texto (para referência)

---

### **PASSO 3: ANÁLISE DOS RESULTADOS**

Verifique nos resultados:

#### 📊 **Tabelas Esperadas (devem existir):**
- [x] `profiles`
- [x] `clientes`
- [x] `servicos`
- [x] `agendamentos`
- [x] `funcionario_servicos`
- [x] `n8n_chat_histories`

#### 📊 **Views Esperadas:**
- [x] `vw_conversas_formatadas`
- [x] `vw_estatisticas_dia`
- [ ] `vw_agendamentos_completos` ← **NÃO DEVE EXISTIR** (já foi removida)

#### 📊 **RPCs Esperadas (11 no total):**

**Frontend (1):**
- [x] `verificar_disponibilidade`

**n8n Básico (7):**
- [x] `listar_servicos_disponiveis`
- [x] `obter_cliente_id`
- [x] `listar_agendamentos_por_telefone`
- [x] `criar_agendamento_validado`
- [x] `listar_funcionarios_disponiveis`
- [x] `obter_ultimo_funcionario_cliente`
- [x] `verificar_disponibilidade_por_funcionario`

**n8n Especialização (3):**
- [x] `listar_funcionarios_por_servico`
- [x] `listar_servicos_por_funcionario`
- [x] `funcionario_pode_executar_servico`

#### ⚠️ **Verificar Functions Duplicadas:**

Se o script mostrar **functions com COUNT > 1**, temos duplicatas!

**Exemplo de problema:**
```
criar_agendamento_validado | 2 versoes
```

**Ação necessária:** Remover versões antigas

---

### **PASSO 4: DECISÃO SOBRE `atividades_dashboard`**

O script deve ter mostrado se a tabela existe:

```sql
SELECT 
  EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'atividades_dashboard'
  ) as existe;
```

**Se EXISTE:**
1. Verifique quantos registros tem:
   ```sql
   SELECT COUNT(*) FROM atividades_dashboard;
   ```

2. **DECISÃO:**
   - Se tem 0 registros → **REMOVER**
   - Se tem dados mas não usa no Frontend → **REMOVER**
   - Se é usado no Dashboard → **MANTER**

**Para remover:**
```sql
DROP TABLE IF EXISTS atividades_dashboard CASCADE;
```

---

### **PASSO 5: EXECUTAR LIMPEZA**

Cole e execute o script **`supabase/scripts/cleanup-database.sql`**

**O que vai fazer:**

1. ✅ Remover `vw_agendamentos_completos` (se ainda existir)
2. ✅ Verificar functions duplicadas (você decide remover)
3. ✅ Verificar `atividades_dashboard`
4. ✅ Remover tabelas de teste/backup antigas
5. ✅ Limpar índices duplicados
6. ✅ VACUUM e ANALYZE (otimização)
7. ✅ Verificar integridade (FKs quebradas)
8. ✅ Mostrar resumo final

**⚠️ CUIDADO:**
- Algumas linhas estão comentadas (iniciadas com `--`)
- Descomente APENAS se tiver certeza do que está fazendo
- **NÃO** resetar sequences se quiser manter IDs atuais

---

### **PASSO 6: REMOVER FUNCTIONS DUPLICADAS (SE HOUVER)**

Se o PASSO 2 mostrou functions duplicadas:

1. Execute esta query para ver detalhes:
```sql
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.oid
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'criar_agendamento_validado';
```

2. Identifique a **versão ANTIGA** (sem `p_funcionario_id`)

3. Remova a versão antiga:
```sql
-- Exemplo (ajuste os parâmetros):
DROP FUNCTION IF EXISTS criar_agendamento_validado(BIGINT, TEXT, TEXT, TEXT) CASCADE;
```

4. Confirme que só restou 1 versão:
```sql
SELECT COUNT(*) 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'criar_agendamento_validado';
-- Deve retornar: 1
```

---

### **PASSO 7: VALIDAÇÃO FINAL**

Execute novamente **`audit-database.sql`** e compare com a primeira execução:

**Checklist:**
- [ ] Apenas 6-7 tabelas (profiles, clientes, servicos, agendamentos, funcionario_servicos, n8n_chat_histories, +1 opcional)
- [ ] 2 views (vw_conversas_formatadas, vw_estatisticas_dia)
- [ ] 11 RPCs (sem duplicatas)
- [ ] Sem functions com COUNT > 1
- [ ] Todas as FKs integras (sem warnings)
- [ ] Tamanho do banco reduzido (opcional)

---

## 📊 RESULTADO ESPERADO

### **Antes da Limpeza:**
- 🟡 Tabelas: 8-10+
- 🟡 Views: 3-5+
- 🟡 RPCs: 15+ (com duplicatas)
- 🟡 Warnings de integridade

### **Depois da Limpeza:**
- ✅ Tabelas: 6-7 (apenas necessárias)
- ✅ Views: 2 (otimizadas)
- ✅ RPCs: 11 (sem duplicatas)
- ✅ 0 warnings de integridade
- ✅ Banco otimizado (VACUUM)

---

## 🚨 TROUBLESHOOTING

### **Erro: "cannot drop because other objects depend on it"**
**Solução:** Use `CASCADE` na query de DROP:
```sql
DROP TABLE nome_tabela CASCADE;
DROP VIEW nome_view CASCADE;
```

### **Erro: "permission denied"**
**Causa:** RLS ou permissões
**Solução:** Execute via SQL Editor do Supabase (tem permissões de admin)

### **Erro: "function does not exist"**
**Causa:** Já foi removida antes
**Solução:** Ignorar, continuar script

### **Dúvida: "Devo remover esta tabela/view/function?"**
**Regra de ouro:**
1. Está listada em `AUDITORIA_BANCO_DADOS.md` como ✅ MANTER? → **NÃO REMOVER**
2. Não está listada? → Buscar no código:
   ```bash
   grep -r "nome_da_tabela" src/
   ```
3. Se não encontrar nenhuma referência → **PODE REMOVER**

---

## ✅ CHECKLIST FINAL

Após concluir todos os passos:

- [ ] Executei `audit-database.sql` (antes)
- [ ] Analisei os resultados
- [ ] Decidi sobre `atividades_dashboard`
- [ ] Executei `cleanup-database.sql`
- [ ] Removi functions duplicadas (se houver)
- [ ] Executei `audit-database.sql` (depois)
- [ ] Comparei resultados (antes vs depois)
- [ ] Banco limpo e otimizado ✨

---

## 📝 DOCUMENTAÇÃO

Após a limpeza, documente o que foi removido:

```markdown
## Itens Removidos em [DATA]

### Tabelas:
- atividades_dashboard (não utilizada)

### Views:
- vw_agendamentos_completos (substituída por queries diretas)

### Functions:
- criar_agendamento_validado (versão antiga sem p_funcionario_id)

### Resultado:
- Banco reduzido de [X GB] para [Y GB]
- 0 warnings de integridade
- 11 RPCs ativas e funcionais
```

---

**Banco de dados limpo e pronto para produção!** 🎉

