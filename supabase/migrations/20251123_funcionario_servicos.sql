-- =====================================================
-- MIGRATION: Sistema de Especialização Funcionário x Serviços
-- Data: 23/11/2025
-- Descrição: Implementa vínculo entre funcionários e serviços
--            para garantir que apenas profissionais qualificados
--            sejam agendados para serviços específicos
-- =====================================================

-- 1. CRIAR TABELA funcionario_servicos
-- =====================================================
CREATE TABLE IF NOT EXISTS funcionario_servicos (
  id BIGSERIAL PRIMARY KEY,
  funcionario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  servico_id TEXT NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  
  -- Atributos
  ativo BOOLEAN DEFAULT true NOT NULL,
  nivel_habilidade TEXT CHECK (nivel_habilidade IN ('basico', 'avancado')) DEFAULT 'basico',
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Constraints
  UNIQUE(funcionario_id, servico_id)
);

-- 2. CRIAR ÍNDICES para performance
-- =====================================================
CREATE INDEX idx_funcionario_servicos_funcionario 
  ON funcionario_servicos(funcionario_id) 
  WHERE ativo = true;

CREATE INDEX idx_funcionario_servicos_servico 
  ON funcionario_servicos(servico_id) 
  WHERE ativo = true;

CREATE INDEX idx_funcionario_servicos_ativo 
  ON funcionario_servicos(ativo) 
  WHERE ativo = true;

-- 3. TRIGGER para updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp_funcionario_servicos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_funcionario_servicos
  BEFORE UPDATE ON funcionario_servicos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp_funcionario_servicos();

-- 4. RLS POLICIES
-- =====================================================
ALTER TABLE funcionario_servicos ENABLE ROW LEVEL SECURITY;

-- Admin pode tudo
CREATE POLICY "admin_full_access_funcionario_servicos"
  ON funcionario_servicos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Funcionários podem ver suas próprias especializações
CREATE POLICY "funcionario_read_own_funcionario_servicos"
  ON funcionario_servicos
  FOR SELECT
  USING (funcionario_id = auth.uid());

-- Service role (n8n) pode ler tudo
CREATE POLICY "service_role_read_funcionario_servicos"
  ON funcionario_servicos
  FOR SELECT
  USING (true);

-- 5. POPULAR DADOS INICIAIS
-- =====================================================
-- Nota: Execute este bloco após criar os usuários
-- Este é um exemplo, ajuste conforme seus dados reais

-- Buscar IDs dos funcionários existentes
DO $$
DECLARE
  v_liz_id UUID;
  v_carla_id UUID;
BEGIN
  -- Buscar ID da Liz (admin)
  SELECT id INTO v_liz_id
  FROM profiles
  WHERE email = 'admin@pinkopal.dev'
  LIMIT 1;

  -- Buscar ID da Carla (se existir)
  SELECT id INTO v_carla_id
  FROM profiles
  WHERE role = 'funcionario'
    AND nome ILIKE '%carla%'
  LIMIT 1;

  -- Se Liz existe, ela faz TODOS os serviços (nível avançado)
  IF v_liz_id IS NOT NULL THEN
    INSERT INTO funcionario_servicos (funcionario_id, servico_id, nivel_habilidade, ativo)
    SELECT v_liz_id, id, 'avancado', true
    FROM servicos
    WHERE ativo = true
    ON CONFLICT (funcionario_id, servico_id) DO NOTHING;
    
    RAISE NOTICE 'Serviços vinculados para Liz (admin) - nível avançado';
  END IF;

  -- Se Carla existe, vincular apenas serviços básicos
  IF v_carla_id IS NOT NULL THEN
    INSERT INTO funcionario_servicos (funcionario_id, servico_id, nivel_habilidade, ativo)
    SELECT v_carla_id, id, 'basico', true
    FROM servicos
    WHERE ativo = true
      AND id IN (
        'av-01',  -- Avaliação
        'bl-01',  -- Brow Lamination
        'lp-01'   -- Limpeza de Pele (ajuste conforme seus IDs)
      )
    ON CONFLICT (funcionario_id, servico_id) DO NOTHING;
    
    RAISE NOTICE 'Serviços básicos vinculados para Carla';
  END IF;

  -- Se nenhum funcionário foi encontrado
  IF v_liz_id IS NULL AND v_carla_id IS NULL THEN
    RAISE NOTICE 'Nenhum funcionário encontrado. Execute os INSERTs manualmente após criar usuários.';
  END IF;
END $$;

-- 6. COMENTÁRIOS para documentação
-- =====================================================
COMMENT ON TABLE funcionario_servicos IS 'Vínculo entre funcionários e serviços que eles podem executar';
COMMENT ON COLUMN funcionario_servicos.nivel_habilidade IS 'Nível de habilidade: basico ou avancado';
COMMENT ON COLUMN funcionario_servicos.ativo IS 'Se false, funcionário não pode mais executar este serviço';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

