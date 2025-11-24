# 🔧 DIAGNÓSTICO: Tabela funcionario_servicos Não Existe

## ❌ PROBLEMA IDENTIFICADO

```
Error: relation "funcionario_servicos" does not exist
```

**Causa**: A migration que cria a tabela `funcionario_servicos` não foi aplicada no banco de dados.

---

## 🔍 VERIFICAÇÃO RÁPIDA

Execute este script simples no Supabase SQL Editor:

**File**: `supabase/scripts/quick-audit.sql`

Ele vai te mostrar:
1. ✅ Quais tabelas existem
2. ✅ Quais views existem  
3. ✅ Quais functions existem
4. ✅ Se `funcionario_servicos` existe (esperado: **false**)
5. ✅ Se coluna `funcionario_id` existe em `agendamentos`

---

## 📊 CENÁRIOS POSSÍVEIS

### **Cenário A: Você está na VERSÃO 5 (sem especialização)**

**Sintomas:**
- ❌ Tabela `funcionario_servicos` não existe
- ❌ RPCs de especialização não existem:
  - `listar_funcionarios_por_servico`
  - `listar_servicos_por_funcionario`
  - `funcionario_pode_executar_servico`
- ✅ Frontend carrega normalmente
- ⚠️ Modal "Gerenciar Serviços" vai dar erro ao abrir

**O que fazer:**
1. Aplicar migrations da versão 6
2. Popular dados iniciais

---

### **Cenário B: Migrations não foram aplicadas**

**Sintomas:**
- Branch do Git: `versao6`
- Código frontend: tem `funcionario_servicos`
- Banco: não tem `funcionario_servicos`

**O que fazer:**
1. Aplicar as migrations manualmente

---

## 🚀 SOLUÇÃO: Aplicar Migrations da Versão 6

### **PASSO 1: Verificar Estado Atual**

Execute: `supabase/scripts/quick-audit.sql`

Anote os resultados:
- [ ] `funcionario_servicos` existe? 
- [ ] Coluna `funcionario_id` existe em `agendamentos`?
- [ ] RPCs de especialização existem?

---

### **PASSO 2: Aplicar Migration - Tabela funcionario_servicos**

**Arquivo**: `supabase/migrations/20251123_funcionario_servicos.sql`

Execute no SQL Editor do Supabase.

**O que cria:**
- ✅ Tabela `funcionario_servicos` com colunas:
  - `id`, `funcionario_id`, `servico_id`
  - `ativo`, `nivel_habilidade`, `observacoes`
  - `created_at`, `updated_at`
- ✅ Índices para performance
- ✅ Trigger para `updated_at`
- ✅ RLS Policies (Admin full, Funcionário read own)
- ✅ Dados iniciais (Liz com todos os serviços avançado)

**Tempo estimado**: 2 minutos

---

### **PASSO 3: Aplicar Migration - RPCs de Especialização**

**Arquivo**: `supabase/migrations/20251123_rpc_funcionario_servicos.sql`

Execute no SQL Editor do Supabase.

**O que cria:**
- ✅ `listar_funcionarios_por_servico(p_servico_id)`
- ✅ `listar_servicos_por_funcionario(p_funcionario_id)`
- ✅ `funcionario_pode_executar_servico(p_funcionario_id, p_servico_id)`
- ✅ Atualiza `criar_agendamento_validado` com validação de especialização
- ✅ Atualiza `verificar_disponibilidade_por_funcionario` com filtro por serviço

**Tempo estimado**: 3 minutos

---

### **PASSO 4: Validar Criação**

Execute novamente: `supabase/scripts/quick-audit.sql`

**Checklist de validação:**
- [ ] `funcionario_servicos` agora existe?
- [ ] RPCs de especialização aparecem na lista?
- [ ] Não há erros de sintaxe?

---

### **PASSO 5: Verificar Dados Iniciais**

Execute:

```sql
-- Ver funcionários
SELECT 
  p.nome,
  p.role,
  COUNT(fs.id) as total_servicos
FROM profiles p
LEFT JOIN funcionario_servicos fs ON fs.funcionario_id = p.id
WHERE p.ativo = true
GROUP BY p.id, p.nome, p.role
ORDER BY p.nome;

-- Ver serviços por funcionário
SELECT 
  p.nome as funcionario,
  s.nome as servico,
  fs.nivel_habilidade,
  fs.ativo
FROM funcionario_servicos fs
JOIN profiles p ON p.id = fs.funcionario_id
JOIN servicos s ON s.id = fs.servico_id
ORDER BY p.nome, s.nome;
```

**Resultado esperado:**
- **Liz Martins**: Todos os serviços com nível "avançado"
- **Carla Souza**: Alguns serviços básicos (se foi populada)
- **Maria Silva**: Nenhum serviço (precisa configurar)

---

## 🧪 TESTAR FRONTEND

Após aplicar as migrations:

1. **Abrir página "Equipe"**:
   - Deve carregar sem erros
   - Cada funcionário tem botão "Gerenciar Serviços"

2. **Clicar em "Gerenciar Serviços" para Liz**:
   - Modal abre sem erro
   - Mostra serviços vinculados
   - Contador mostra "X de Y serviços habilitados"

3. **Clicar em "Gerenciar Serviços" para Maria**:
   - Modal abre
   - Mostra "0 de Y serviços habilitados"
   - Pode marcar checkboxes para vincular

---

## 🔄 SE ALGO DER ERRADO

### **Erro: "duplicate key value violates unique constraint"**
**Causa**: Dados já existem  
**Solução**: 
```sql
DELETE FROM funcionario_servicos WHERE id > 0;
-- Depois execute a migration novamente
```

### **Erro: "foreign key constraint fails"**
**Causa**: Funcionários ou serviços não existem  
**Solução**: 
```sql
-- Verificar funcionários
SELECT id, nome, email FROM profiles WHERE ativo = true;

-- Verificar serviços
SELECT id, nome FROM servicos WHERE ativo = true;
```

### **Frontend continua com erro**
**Causa**: Cache do navegador  
**Solução**:
1. Hard refresh: `Ctrl + Shift + R` (ou `Cmd + Shift + R` no Mac)
2. Limpar cache do navegador
3. Reiniciar servidor: `Ctrl + C` e `pnpm run dev` novamente

---

## 📋 RESUMO DA SOLUÇÃO

1. ✅ Executar `quick-audit.sql` → Confirmar que falta `funcionario_servicos`
2. ✅ Executar `20251123_funcionario_servicos.sql` → Criar tabela
3. ✅ Executar `20251123_rpc_funcionario_servicos.sql` → Criar RPCs
4. ✅ Executar `quick-audit.sql` novamente → Validar criação
5. ✅ Testar frontend → Modal "Gerenciar Serviços" deve funcionar

---

## ✅ APÓS RESOLVER

Quando tudo estiver funcionando:

1. Voltar para o script original de auditoria:
   ```bash
   supabase/scripts/audit-database.sql
   ```
   (Agora vai funcionar sem erros!)

2. Prosseguir com limpeza do banco conforme documentado

---

**Problema diagnosticado e solução documentada!** 🔧


