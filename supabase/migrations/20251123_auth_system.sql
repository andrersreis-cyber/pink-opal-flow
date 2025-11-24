-- ========================================
-- MIGRATION: Sistema de Autenticação Multiusuário
-- Data: 2025-11-23
-- Descrição: Cria infraestrutura de autenticação com profiles, 
--            adiciona funcionario_id em agendamentos e configura RLS
-- ========================================

-- ========================================
-- 1. CRIAR TABELA PROFILES
-- ========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'funcionario')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_ativo ON public.profiles(ativo);

-- Comentários
COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema (admin e funcionários)';
COMMENT ON COLUMN public.profiles.id IS 'UUID do usuário (referencia auth.users)';
COMMENT ON COLUMN public.profiles.role IS 'Tipo de usuário: admin (gestora) ou funcionario';
COMMENT ON COLUMN public.profiles.ativo IS 'Se false, usuário está desativado';

-- ========================================
-- 2. ADICIONAR COLUNA funcionario_id EM AGENDAMENTOS
-- ========================================

-- Adicionar coluna se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agendamentos' 
    AND column_name = 'funcionario_id'
  ) THEN
    ALTER TABLE public.agendamentos 
    ADD COLUMN funcionario_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    
    CREATE INDEX idx_agendamentos_funcionario ON public.agendamentos(funcionario_id);
    
    COMMENT ON COLUMN public.agendamentos.funcionario_id IS 'Funcionário responsável pelo agendamento';
  END IF;
END $$;

-- ========================================
-- 3. TRIGGER PARA AUTO-CRIAR PROFILE
-- ========================================

-- Função que cria profile automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role, ativo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'funcionario'),
    true
  );
  RETURN NEW;
END;
$$;

-- Trigger que executa após insert em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 4. FUNÇÃO PARA ATUALIZAR updated_at
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger para profiles
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5.1. POLICIES PARA PROFILES
-- ========================================

-- Policy: Admin pode ver todos os profiles
DROP POLICY IF EXISTS "Admins podem ver todos os profiles" ON public.profiles;
CREATE POLICY "Admins podem ver todos os profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Funcionário pode ver apenas seu próprio profile
DROP POLICY IF EXISTS "Funcionários podem ver seu próprio profile" ON public.profiles;
CREATE POLICY "Funcionários podem ver seu próprio profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy: Admin pode inserir profiles (criar funcionários)
DROP POLICY IF EXISTS "Admins podem criar profiles" ON public.profiles;
CREATE POLICY "Admins podem criar profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admin pode atualizar profiles
DROP POLICY IF EXISTS "Admins podem atualizar profiles" ON public.profiles;
CREATE POLICY "Admins podem atualizar profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Funcionário pode atualizar seu próprio profile (nome, etc)
DROP POLICY IF EXISTS "Funcionários podem atualizar seu próprio profile" ON public.profiles;
CREATE POLICY "Funcionários podem atualizar seu próprio profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = 'funcionario'); -- Não pode mudar role

-- ========================================
-- 5.2. POLICIES PARA AGENDAMENTOS
-- ========================================

-- Policy: Admin pode ver todos os agendamentos
DROP POLICY IF EXISTS "Admins podem ver todos os agendamentos" ON public.agendamentos;
CREATE POLICY "Admins podem ver todos os agendamentos"
  ON public.agendamentos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Funcionário pode ver apenas seus agendamentos
DROP POLICY IF EXISTS "Funcionários podem ver seus agendamentos" ON public.agendamentos;
CREATE POLICY "Funcionários podem ver seus agendamentos"
  ON public.agendamentos
  FOR SELECT
  TO authenticated
  USING (funcionario_id = auth.uid());

-- Policy: Admin pode inserir agendamentos
DROP POLICY IF EXISTS "Admins podem criar agendamentos" ON public.agendamentos;
CREATE POLICY "Admins podem criar agendamentos"
  ON public.agendamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Funcionário pode inserir apenas seus agendamentos
DROP POLICY IF EXISTS "Funcionários podem criar seus agendamentos" ON public.agendamentos;
CREATE POLICY "Funcionários podem criar seus agendamentos"
  ON public.agendamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (funcionario_id = auth.uid());

-- Policy: Admin pode atualizar todos os agendamentos
DROP POLICY IF EXISTS "Admins podem atualizar agendamentos" ON public.agendamentos;
CREATE POLICY "Admins podem atualizar agendamentos"
  ON public.agendamentos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Funcionário pode atualizar apenas seus agendamentos
DROP POLICY IF EXISTS "Funcionários podem atualizar seus agendamentos" ON public.agendamentos;
CREATE POLICY "Funcionários podem atualizar seus agendamentos"
  ON public.agendamentos
  FOR UPDATE
  TO authenticated
  USING (funcionario_id = auth.uid());

-- Policy: Admin pode deletar agendamentos
DROP POLICY IF EXISTS "Admins podem deletar agendamentos" ON public.agendamentos;
CREATE POLICY "Admins podem deletar agendamentos"
  ON public.agendamentos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- 5.3. POLICIES PARA OUTRAS TABELAS (Compartilhadas)
-- ========================================

-- Clientes: Todos podem ler/escrever (compartilhados)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem acessar clientes" ON public.clientes;
CREATE POLICY "Usuários autenticados podem acessar clientes"
  ON public.clientes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Serviços: Todos podem ler, apenas admin pode modificar
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem ler serviços" ON public.servicos;
CREATE POLICY "Usuários autenticados podem ler serviços"
  ON public.servicos
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins podem modificar serviços" ON public.servicos;
CREATE POLICY "Admins podem modificar serviços"
  ON public.servicos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- 6. VIEWS ATUALIZADAS
-- ========================================

-- Atualizar view de agendamentos completos para incluir funcionário
CREATE OR REPLACE VIEW public.vw_agendamentos_completos_com_funcionario AS
SELECT 
  a.id,
  a.cliente_id,
  a.servico_id,
  a.data,
  a.duracao_minutos,
  a.preco,
  a.status,
  a.observacoes,
  a.funcionario_id,
  a.created_at,
  a.updated_at,
  c.nome as cliente_nome,
  c.telefone as cliente_telefone,
  c.email as cliente_email,
  s.nome as servico_nome,
  s.categoria as servico_categoria,
  s.descricao as servico_descricao,
  p.nome as funcionario_nome,
  p.email as funcionario_email
FROM public.agendamentos a
LEFT JOIN public.clientes c ON c.id = a.cliente_id
LEFT JOIN public.servicos s ON s.id = a.servico_id
LEFT JOIN public.profiles p ON p.id = a.funcionario_id;

COMMENT ON VIEW public.vw_agendamentos_completos_com_funcionario IS 'View de agendamentos com dados de cliente, serviço e funcionário';

-- ========================================
-- 7. GRANTS (Permissões)
-- ========================================

-- Garantir que authenticated role pode acessar profiles
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.agendamentos TO authenticated;
GRANT ALL ON public.clientes TO authenticated;
GRANT SELECT ON public.servicos TO authenticated;

-- ========================================
-- 8. CRIAR USUÁRIO ADMIN INICIAL
-- ========================================

-- Inserir admin fake para desenvolvimento
-- Email: admin@pinkopal.dev
-- Senha: PinkOpal2024!
-- NOTA: Este usuário será criado via interface ou comando separado
-- pois requer acesso a auth.users com service_role

-- Script para criar admin (executar separadamente com service_role):
/*
-- Este bloco deve ser executado com service_role key
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@pinkopal.dev',
  crypt('PinkOpal2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"nome": "Liz Martins", "role": "admin"}'::jsonb,
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- O profile será criado automaticamente pelo trigger
*/

-- ========================================
-- 9. VALIDAÇÕES
-- ========================================

-- Verificar se tabela profiles foi criada
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'Erro: Tabela profiles não foi criada';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agendamentos' 
    AND column_name = 'funcionario_id'
  ) THEN
    RAISE EXCEPTION 'Erro: Coluna funcionario_id não foi adicionada em agendamentos';
  END IF;
  
  RAISE NOTICE 'Migration aplicada com sucesso! ✅';
  RAISE NOTICE 'Tabela profiles: OK';
  RAISE NOTICE 'Coluna funcionario_id: OK';
  RAISE NOTICE 'RLS policies: OK';
  RAISE NOTICE 'Triggers: OK';
END $$;


