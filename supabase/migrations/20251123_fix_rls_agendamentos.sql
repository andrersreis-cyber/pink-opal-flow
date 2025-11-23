-- ====================================================================
-- CORREÇÃO CRÍTICA: RLS de Agendamentos
-- Problema: Funcionários conseguem ver/editar agendamentos de outros
-- Solução: Remover policies permissivas e criar policies restritivas
-- ====================================================================

-- 1. REMOVER TODAS as policies existentes de agendamentos
DROP POLICY IF EXISTS "Anon full access on agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Service role full access on agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Admins podem ver todos os agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Admins podem criar agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Admins podem atualizar agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Admins podem deletar agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Funcionários podem ver seus agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Funcionários podem criar seus agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Funcionários podem atualizar seus agendamentos" ON agendamentos;

-- 2. GARANTIR que RLS está ATIVO
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLICIES RESTRITIVAS E SEGURAS

-- ============================================
-- POLÍTICAS PARA SERVICE_ROLE (n8n, backend)
-- ============================================
-- Service role precisa de acesso total para criar agendamentos via n8n
CREATE POLICY "service_role_full_access"
  ON agendamentos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA ANON (webhooks públicos)
-- ============================================
-- Anon precisa apenas INSERT para webhooks (sem SELECT/UPDATE/DELETE)
CREATE POLICY "anon_can_insert"
  ON agendamentos
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA ADMIN (authenticated)
-- ============================================
-- Admin vê TODOS os agendamentos
CREATE POLICY "admin_can_select_all"
  ON agendamentos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Admin pode criar QUALQUER agendamento
CREATE POLICY "admin_can_insert_all"
  ON agendamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Admin pode atualizar QUALQUER agendamento
CREATE POLICY "admin_can_update_all"
  ON agendamentos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Admin pode deletar QUALQUER agendamento
CREATE POLICY "admin_can_delete_all"
  ON agendamentos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS PARA FUNCIONÁRIO (authenticated)
-- ============================================
-- Funcionário vê APENAS seus próprios agendamentos
CREATE POLICY "funcionario_can_select_own"
  ON agendamentos
  FOR SELECT
  TO authenticated
  USING (
    funcionario_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'funcionario'
    )
  );

-- Funcionário pode criar agendamentos APENAS para si mesmo
CREATE POLICY "funcionario_can_insert_own"
  ON agendamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    funcionario_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'funcionario'
    )
  );

-- Funcionário pode atualizar APENAS seus próprios agendamentos
CREATE POLICY "funcionario_can_update_own"
  ON agendamentos
  FOR UPDATE
  TO authenticated
  USING (
    funcionario_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'funcionario'
    )
  )
  WITH CHECK (
    funcionario_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'funcionario'
    )
  );

-- Funcionário pode deletar APENAS seus próprios agendamentos
CREATE POLICY "funcionario_can_delete_own"
  ON agendamentos
  FOR DELETE
  TO authenticated
  USING (
    funcionario_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'funcionario'
    )
  );

-- ====================================================================
-- VERIFICAÇÃO: Listar todas as policies criadas
-- ====================================================================
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'agendamentos'
ORDER BY roles, cmd, policyname;

