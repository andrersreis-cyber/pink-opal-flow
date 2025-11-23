# 🔒 CORREÇÃO CRÍTICA: RLS para Funcionários

## 🚨 **PROBLEMA DETECTADO:**

Carla (funcionário) conseguia ver e editar agendamentos de outros funcionários (Liz).

## 🔍 **CAUSA RAIZ:**

1. **VIEWs não suportam RLS diretamente** no PostgreSQL
2. O frontend estava buscando dados de `vw_agendamentos_completos` (VIEW)
3. As políticas RLS foram aplicadas apenas na tabela `agendamentos`
4. As VIEWs ignoravam as políticas, retornando todos os dados

## ✅ **SOLUÇÃO IMPLEMENTADA:**

### 1. **Corrigir RLS na tabela `agendamentos`**

Arquivo: `supabase/migrations/20251123_fix_rls_agendamentos.sql`

**O que foi feito:**
- Removidas policies permissivas (`Anon full access`)
- Criadas policies restritivas por role:
  - **Admin:** Acesso total a todos os agendamentos
  - **Funcionário:** Acesso APENAS aos seus agendamentos (`funcionario_id = auth.uid()`)
  - **Service Role (n8n):** Acesso total (para criar agendamentos via WhatsApp)
  - **Anon:** Apenas INSERT (para webhooks)

**Policies criadas:**
- `service_role_full_access` - Service role → Tudo
- `anon_can_insert` - Anon → Apenas INSERT
- `admin_can_select_all` - Admin → SELECT todos
- `admin_can_insert_all` - Admin → INSERT todos
- `admin_can_update_all` - Admin → UPDATE todos
- `admin_can_delete_all` - Admin → DELETE todos
- `funcionario_can_select_own` - Funcionário → SELECT apenas seus
- `funcionario_can_insert_own` - Funcionário → INSERT apenas seus
- `funcionario_can_update_own` - Funcionário → UPDATE apenas seus
- `funcionario_can_delete_own` - Funcionário → DELETE apenas seus

### 2. **Migrar frontend de VIEWs para tabela `agendamentos`**

**Problema:**
- VIEWs (`vw_agendamentos_completos`) não herdam RLS da tabela base
- Tentativa de aplicar RLS em VIEWs falhou (PostgreSQL não suporta)

**Solução:**
- Criar função helper `buildAgendamentosQuery()` que busca direto da tabela `agendamentos`
- Usar JOINs para trazer dados relacionados (clientes, serviços, funcionários)
- Transformar dados para formato compatível com o esperado pelo frontend

**Arquivo criado:**
- `src/lib/agendamentosQuery.ts` - Helper para queries com RLS

**Arquivos modificados:**
- `src/hooks/useAgendamentos.ts`
- `src/hooks/useDashboardAgendamentos.ts`
- `src/hooks/useAgendamentosSemana.ts`
- `src/hooks/useAgendamentosMes.ts`
- `src/hooks/useDashboardCharts.ts`
- `src/hooks/useCliente.ts`
- `src/components/agendamentos/AgendamentoModal.tsx`

---

## 🧪 **COMO TESTAR:**

### **Teste 1: Como Funcionário (Carla)**

1. Fazer logout
2. Login como: `carla@gmail.com`
3. Acessar "Agenda"
4. **Resultado esperado:**
   - ✅ Ver APENAS agendamentos onde `funcionario_id` = ID da Carla
   - ❌ NÃO ver agendamentos da Liz ou outros

### **Teste 2: Como Admin (Liz)**

1. Fazer logout
2. Login como: `admin@pinkopal.dev`
3. Acessar "Agenda"
4. **Resultado esperado:**
   - ✅ Ver TODOS os agendamentos (de todos os funcionários)
   - ✅ Conseguir editar/deletar qualquer agendamento

### **Teste 3: Tentativa de Edição**

1. Login como Carla
2. Tentar editar um agendamento da Liz (se ainda aparecer no cache)
3. **Resultado esperado:**
   - ❌ Erro ao salvar (RLS bloqueia UPDATE)
   - Toast de erro no frontend

---

## 📊 **VERIFICAÇÃO NO BANCO DE DADOS:**

```sql
-- 1. Verificar policies aplicadas
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'agendamentos'
ORDER BY roles, cmd, policyname;

-- 2. Testar como funcionário (simular auth.uid())
SET LOCAL role authenticated;
SET LOCAL request.jwt.claim.sub = '3eb7a0f2-e8a6-4562-beb0-a99163a527be'; -- ID da Carla

SELECT * FROM agendamentos;
-- Deve retornar APENAS agendamentos da Carla

-- 3. Resetar role
RESET role;
```

---

## 🎯 **RESULTADO ESPERADO:**

| Usuário | Vê na Agenda | Pode Editar | Pode Deletar |
|---------|--------------|-------------|--------------|
| **Liz (Admin)** | Todos os agendamentos | Todos | Todos |
| **Carla (Funcionário)** | Apenas seus agendamentos | Apenas seus | Apenas seus |
| **Maria (Funcionário)** | Apenas seus agendamentos | Apenas seus | Apenas seus |
| **n8n (Service Role)** | Todos | Todos | Todos |
| **Anon (Webhooks)** | Nenhum | Nenhum | Nenhum |

---

## 🔧 **COMANDOS DE ROLLBACK (se necessário):**

Se algo der errado, execute:

```sql
-- Voltar para policies permissivas (NÃO RECOMENDADO)
DROP POLICY IF EXISTS "service_role_full_access" ON agendamentos;
DROP POLICY IF EXISTS "anon_can_insert" ON agendamentos;
DROP POLICY IF EXISTS "admin_can_select_all" ON agendamentos;
DROP POLICY IF EXISTS "admin_can_insert_all" ON agendamentos;
DROP POLICY IF EXISTS "admin_can_update_all" ON agendamentos;
DROP POLICY IF EXISTS "admin_can_delete_all" ON agendamentos;
DROP POLICY IF EXISTS "funcionario_can_select_own" ON agendamentos;
DROP POLICY IF EXISTS "funcionario_can_insert_own" ON agendamentos;
DROP POLICY IF EXISTS "funcionario_can_update_own" ON agendamentos;
DROP POLICY IF EXISTS "funcionario_can_delete_own" ON agendamentos;

-- Criar policy permissiva temporária (APENAS PARA DEBUG)
CREATE POLICY "temp_full_access"
  ON agendamentos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

---

## 📝 **NOTAS IMPORTANTES:**

1. **VIEWs não suportam RLS diretamente:**
   - PostgreSQL não permite `ALTER TABLE view_name ENABLE ROW LEVEL SECURITY`
   - A solução é sempre buscar direto da tabela base com JOINs

2. **Performance:**
   - Queries com JOINs são ligeiramente mais lentas que VIEWs
   - Mas a diferença é mínima e a segurança é crítica

3. **Cache do Frontend:**
   - Após o deploy, limpar cache do browser (Ctrl+F5)
   - React Query pode ter dados em cache - recarregar página

4. **Realtime:**
   - Subscriptions do Supabase Realtime respeitam RLS automaticamente
   - Funcionários só receberão updates de seus agendamentos

---

## ✅ **STATUS:**

- [x] RLS aplicado na tabela `agendamentos`
- [x] Frontend migrado de VIEWs para tabela base
- [x] Função helper criada (`agendamentosQuery.ts`)
- [x] Todos os hooks atualizados
- [ ] **AGUARDANDO TESTE DO USUÁRIO**

---

**Data:** 23/11/2025  
**Branch:** versao5  
**Marco:** Marco 4 - Integração n8n Inteligente

