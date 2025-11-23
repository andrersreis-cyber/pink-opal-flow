-- =====================================================
-- RPCs: Funções para Gestão de Funcionário x Serviços
-- Data: 23/11/2025
-- =====================================================

-- 1. LISTAR FUNCIONÁRIOS QUE EXECUTAM UM SERVIÇO ESPECÍFICO
-- =====================================================
CREATE OR REPLACE FUNCTION listar_funcionarios_por_servico(
  p_servico_id TEXT
)
RETURNS TABLE(
  funcionario_id UUID,
  funcionario_nome TEXT,
  funcionario_email TEXT,
  nivel_habilidade TEXT,
  observacoes TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS funcionario_id,
    p.nome AS funcionario_nome,
    p.email AS funcionario_email,
    COALESCE(fs.nivel_habilidade, 'basico') AS nivel_habilidade,
    fs.observacoes
  FROM profiles p
  INNER JOIN funcionario_servicos fs 
    ON fs.funcionario_id = p.id
  WHERE fs.servico_id = p_servico_id
    AND fs.ativo = true
    AND p.ativo = true
    AND p.role IN ('admin', 'funcionario')
  ORDER BY 
    -- Priorizar nível avançado
    CASE fs.nivel_habilidade 
      WHEN 'avancado' THEN 1 
      ELSE 2 
    END,
    p.nome;
END;
$$;

-- 2. LISTAR SERVIÇOS QUE UM FUNCIONÁRIO PODE EXECUTAR
-- =====================================================
CREATE OR REPLACE FUNCTION listar_servicos_por_funcionario(
  p_funcionario_id UUID
)
RETURNS TABLE(
  servico_id TEXT,
  servico_nome TEXT,
  servico_preco DECIMAL,
  servico_duracao INTEGER,
  nivel_habilidade TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS servico_id,
    s.nome AS servico_nome,
    s.preco AS servico_preco,
    s.duracao_minutos AS servico_duracao,
    COALESCE(fs.nivel_habilidade, 'basico') AS nivel_habilidade
  FROM servicos s
  INNER JOIN funcionario_servicos fs 
    ON fs.servico_id = s.id
  WHERE fs.funcionario_id = p_funcionario_id
    AND fs.ativo = true
    AND s.ativo = true
  ORDER BY s.nome;
END;
$$;

-- 3. VERIFICAR SE FUNCIONÁRIO PODE EXECUTAR UM SERVIÇO
-- =====================================================
CREATE OR REPLACE FUNCTION funcionario_pode_executar_servico(
  p_funcionario_id UUID,
  p_servico_id TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_pode_executar BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM funcionario_servicos fs
    INNER JOIN profiles p ON p.id = fs.funcionario_id
    INNER JOIN servicos s ON s.id = fs.servico_id
    WHERE fs.funcionario_id = p_funcionario_id
      AND fs.servico_id = p_servico_id
      AND fs.ativo = true
      AND p.ativo = true
      AND s.ativo = true
  ) INTO v_pode_executar;
  
  RETURN v_pode_executar;
END;
$$;

-- 4. ATUALIZAR criar_agendamento_validado COM VALIDAÇÃO DE ESPECIALIZAÇÃO
-- =====================================================
CREATE OR REPLACE FUNCTION criar_agendamento_validado(
  p_cliente_id BIGINT,
  p_servico_id TEXT,
  p_data TEXT,
  p_observacoes TEXT DEFAULT '',
  p_funcionario_id UUID DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_servico RECORD;
  v_data_inicio TIMESTAMPTZ;
  v_data_fim TIMESTAMPTZ;
  v_disponivel BOOLEAN;
  v_conflitos JSON;
  v_agendamento_id BIGINT;
  v_funcionario_id UUID;
  v_funcionario_pode_executar BOOLEAN;
BEGIN
  -- 1. Validar entrada
  IF p_cliente_id IS NULL OR p_servico_id IS NULL OR p_data IS NULL THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Parâmetros obrigatórios: cliente_id, servico_id, data'
    );
  END IF;

  -- 2. Buscar serviço
  SELECT * INTO v_servico
  FROM servicos
  WHERE id = p_servico_id AND ativo = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Serviço não encontrado ou inativo'
    );
  END IF;

  -- 3. Converter data de texto para TIMESTAMPTZ
  BEGIN
    v_data_inicio := p_data::TIMESTAMPTZ;
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Formato de data inválido. Use ISO 8601 com timezone (ex: 2025-11-24T14:00:00-03:00)'
    );
  END;

  -- 4. Calcular data fim
  v_data_fim := v_data_inicio + (v_servico.duracao_minutos || ' minutes')::INTERVAL;

  -- 5. Determinar funcionário
  IF p_funcionario_id IS NULL THEN
    -- Se não foi especificado, pegar o primeiro disponível que pode executar o serviço
    SELECT f.funcionario_id INTO v_funcionario_id
    FROM listar_funcionarios_por_servico(p_servico_id) f
    WHERE NOT EXISTS (
      SELECT 1 FROM agendamentos a
      WHERE a.funcionario_id = f.funcionario_id
        AND a.status != 'cancelado'
        AND (
          (a.data, a.data + (a.duracao_minutos || ' minutes')::INTERVAL) 
          OVERLAPS 
          (v_data_inicio, v_data_fim)
        )
    )
    ORDER BY 
      CASE f.nivel_habilidade WHEN 'avancado' THEN 1 ELSE 2 END,
      f.funcionario_nome
    LIMIT 1;
    
    IF v_funcionario_id IS NULL THEN
      RETURN json_build_object(
        'sucesso', false,
        'agendamento_id', null,
        'erro', 'Nenhum profissional disponível para este serviço no horário solicitado'
      );
    END IF;
  ELSE
    v_funcionario_id := p_funcionario_id;
  END IF;

  -- 6. VALIDAÇÃO CRÍTICA: Verificar se funcionário pode executar o serviço
  v_funcionario_pode_executar := funcionario_pode_executar_servico(v_funcionario_id, p_servico_id);
  
  IF NOT v_funcionario_pode_executar THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Este profissional não está habilitado para executar este serviço'
    );
  END IF;

  -- 7. Verificar disponibilidade do funcionário específico
  SELECT 
    NOT EXISTS(
      SELECT 1 FROM agendamentos
      WHERE funcionario_id = v_funcionario_id
        AND status != 'cancelado'
        AND (data, data + (duracao_minutos || ' minutes')::INTERVAL) 
            OVERLAPS (v_data_inicio, v_data_fim)
    ) INTO v_disponivel;

  IF NOT v_disponivel THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Profissional já possui agendamento neste horário'
    );
  END IF;

  -- 8. Criar agendamento
  INSERT INTO agendamentos (
    cliente_id,
    servico_id,
    funcionario_id,
    data,
    duracao_minutos,
    preco,
    status,
    observacoes
  ) VALUES (
    p_cliente_id,
    p_servico_id,
    v_funcionario_id,
    v_data_inicio,
    v_servico.duracao_minutos,
    v_servico.preco,
    'pendente',
    p_observacoes
  )
  RETURNING id INTO v_agendamento_id;

  -- 9. Retornar sucesso
  RETURN json_build_object(
    'sucesso', true,
    'agendamento_id', v_agendamento_id,
    'erro', null,
    'funcionario_id', v_funcionario_id,
    'data_inicio', v_data_inicio,
    'data_fim', v_data_fim
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', SQLERRM
    );
END;
$$;

-- 5. ATUALIZAR verificar_disponibilidade_por_funcionario
-- =====================================================
CREATE OR REPLACE FUNCTION verificar_disponibilidade_por_funcionario(
  p_data_inicio TEXT,
  p_data_fim TEXT,
  p_servico_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  funcionario_id UUID,
  funcionario_nome TEXT,
  disponivel BOOLEAN,
  nivel_habilidade TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_data_inicio TIMESTAMPTZ;
  v_data_fim TIMESTAMPTZ;
BEGIN
  -- Converter datas
  v_data_inicio := p_data_inicio::TIMESTAMPTZ;
  v_data_fim := p_data_fim::TIMESTAMPTZ;

  -- Se serviço foi especificado, filtrar apenas funcionários que executam esse serviço
  IF p_servico_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      f.funcionario_id,
      f.funcionario_nome,
      NOT EXISTS(
        SELECT 1 FROM agendamentos a
        WHERE a.funcionario_id = f.funcionario_id
          AND a.status != 'cancelado'
          AND (a.data, a.data + (a.duracao_minutos || ' minutes')::INTERVAL) 
              OVERLAPS (v_data_inicio, v_data_fim)
      ) AS disponivel,
      f.nivel_habilidade
    FROM listar_funcionarios_por_servico(p_servico_id) f
    ORDER BY 
      CASE f.nivel_habilidade WHEN 'avancado' THEN 1 ELSE 2 END,
      f.funcionario_nome;
  ELSE
    -- Listar todos os funcionários ativos
    RETURN QUERY
    SELECT 
      p.id AS funcionario_id,
      p.nome AS funcionario_nome,
      NOT EXISTS(
        SELECT 1 FROM agendamentos a
        WHERE a.funcionario_id = p.id
          AND a.status != 'cancelado'
          AND (a.data, a.data + (a.duracao_minutos || ' minutes')::INTERVAL) 
              OVERLAPS (v_data_inicio, v_data_fim)
      ) AS disponivel,
      'basico'::TEXT AS nivel_habilidade
    FROM profiles p
    WHERE p.ativo = true
      AND p.role IN ('admin', 'funcionario')
    ORDER BY p.nome;
  END IF;
END;
$$;

-- 6. COMENTÁRIOS
-- =====================================================
COMMENT ON FUNCTION listar_funcionarios_por_servico IS 'Retorna funcionários habilitados para executar um serviço específico';
COMMENT ON FUNCTION listar_servicos_por_funcionario IS 'Retorna serviços que um funcionário pode executar';
COMMENT ON FUNCTION funcionario_pode_executar_servico IS 'Verifica se um funcionário específico pode executar um serviço';
COMMENT ON FUNCTION verificar_disponibilidade_por_funcionario IS 'Verifica disponibilidade de funcionários, opcionalmente filtrado por serviço';

-- =====================================================
-- FIM DAS RPCs
-- =====================================================

