-- RPC Functions para integração n8n com escolha de funcionário
-- Marco 4: Integração n8n Inteligente

-- ============================================================================
-- 1. LISTAR FUNCIONÁRIOS DISPONÍVEIS
-- ============================================================================
CREATE OR REPLACE FUNCTION listar_funcionarios_disponiveis()
RETURNS TABLE (
  id UUID,
  nome TEXT,
  email TEXT,
  role TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    id,
    nome,
    email,
    role
  FROM profiles
  WHERE ativo = true
  ORDER BY 
    CASE WHEN role = 'admin' THEN 0 ELSE 1 END,
    nome;
$$;

COMMENT ON FUNCTION listar_funcionarios_disponiveis IS 
'Lista todos os funcionários ativos ordenados por role (admin primeiro) e nome';

-- ============================================================================
-- 2. OBTER ÚLTIMO FUNCIONÁRIO DO CLIENTE
-- ============================================================================
CREATE OR REPLACE FUNCTION obter_ultimo_funcionario_cliente(
  p_telefone TEXT
)
RETURNS TABLE (
  funcionario_id UUID,
  funcionario_nome TEXT,
  ultimo_agendamento TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    a.funcionario_id,
    p.nome as funcionario_nome,
    MAX(a.data) as ultimo_agendamento
  FROM agendamentos a
  INNER JOIN clientes c ON c.id = a.cliente_id
  INNER JOIN profiles p ON p.id = a.funcionario_id
  WHERE c.telefone = p_telefone
    AND a.funcionario_id IS NOT NULL
    AND a.status != 'cancelado'
  GROUP BY a.funcionario_id, p.nome
  ORDER BY ultimo_agendamento DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION obter_ultimo_funcionario_cliente IS 
'Retorna o último funcionário que atendeu o cliente (baseado no telefone)';

-- ============================================================================
-- 3. VERIFICAR DISPONIBILIDADE POR FUNCIONÁRIO
-- ============================================================================
CREATE OR REPLACE FUNCTION verificar_disponibilidade_por_funcionario(
  p_data_inicio TEXT,
  p_data_fim TEXT
)
RETURNS TABLE (
  funcionario_id UUID,
  funcionario_nome TEXT,
  disponivel BOOLEAN
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_data_inicio TIMESTAMPTZ;
  v_data_fim TIMESTAMPTZ;
BEGIN
  -- Converter strings para timestamptz
  v_data_inicio := p_data_inicio::TIMESTAMPTZ;
  v_data_fim := p_data_fim::TIMESTAMPTZ;

  -- Retornar todos os funcionários com status de disponibilidade
  RETURN QUERY
  SELECT 
    p.id as funcionario_id,
    p.nome as funcionario_nome,
    NOT EXISTS (
      SELECT 1
      FROM agendamentos a
      WHERE a.funcionario_id = p.id
        AND a.status != 'cancelado'
        AND (
          -- Lógica de overlap: (StartA < EndB) AND (EndA > StartB)
          a.data < v_data_fim
          AND (a.data + (a.duracao_minutos || ' minutes')::INTERVAL) > v_data_inicio
        )
    ) as disponivel
  FROM profiles p
  WHERE p.ativo = true
  ORDER BY disponivel DESC, p.nome;
END;
$$;

COMMENT ON FUNCTION verificar_disponibilidade_por_funcionario IS 
'Verifica quais funcionários estão disponíveis no horário especificado';

-- ============================================================================
-- 4. ATUALIZAR criar_agendamento_validado PARA SUPORTAR FUNCIONARIO_ID
-- ============================================================================
CREATE OR REPLACE FUNCTION criar_agendamento_validado(
  p_cliente_id INTEGER,
  p_servico_id TEXT,
  p_data TEXT,
  p_funcionario_id UUID DEFAULT NULL,
  p_observacoes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_data_inicio TIMESTAMPTZ;
  v_data_fim TIMESTAMPTZ;
  v_duracao_minutos INTEGER;
  v_preco NUMERIC;
  v_servico_ativo BOOLEAN;
  v_tem_conflito BOOLEAN;
  v_agendamento_id BIGINT;
  v_resultado JSON;
BEGIN
  -- 1. Validar e buscar informações do serviço
  SELECT duracao_minutos, preco, ativo
  INTO v_duracao_minutos, v_preco, v_servico_ativo
  FROM servicos
  WHERE id = p_servico_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Serviço não encontrado'
    );
  END IF;

  IF NOT v_servico_ativo THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Serviço não encontrado ou inativo'
    );
  END IF;

  -- 2. Converter data de texto para timestamptz
  BEGIN
    v_data_inicio := p_data::TIMESTAMPTZ;
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Formato de data inválido. Use ISO 8601 com timezone (ex: 2025-11-24T10:00:00-03:00)'
    );
  END;

  -- 3. Calcular data_fim baseado na duração
  v_data_fim := v_data_inicio + (v_duracao_minutos || ' minutes')::INTERVAL;

  -- 4. Validar se a data está no futuro
  IF v_data_inicio < NOW() THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Data/hora deve ser futura'
    );
  END IF;

  -- 5. Verificar conflitos (considerando funcionário se fornecido)
  SELECT EXISTS (
    SELECT 1
    FROM agendamentos a
    WHERE a.status != 'cancelado'
      AND (p_funcionario_id IS NULL OR a.funcionario_id = p_funcionario_id)
      AND (
        a.data < v_data_fim
        AND (a.data + (a.duracao_minutos || ' minutes')::INTERVAL) > v_data_inicio
      )
  ) INTO v_tem_conflito;

  IF v_tem_conflito THEN
    IF p_funcionario_id IS NOT NULL THEN
      RETURN json_build_object(
        'sucesso', false,
        'agendamento_id', null,
        'erro', 'Este funcionário já tem um agendamento neste horário'
      );
    ELSE
      RETURN json_build_object(
        'sucesso', false,
        'agendamento_id', null,
        'erro', 'Já existe um agendamento neste horário'
      );
    END IF;
  END IF;

  -- 6. Criar o agendamento
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
    p_funcionario_id,
    v_data_inicio,
    v_duracao_minutos,
    v_preco,
    'confirmado',
    p_observacoes
  )
  RETURNING id INTO v_agendamento_id;

  -- 7. Retornar sucesso
  RETURN json_build_object(
    'sucesso', true,
    'agendamento_id', v_agendamento_id,
    'erro', null,
    'funcionario_id', p_funcionario_id,
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

COMMENT ON FUNCTION criar_agendamento_validado IS 
'Cria agendamento validado com suporte a funcionario_id opcional';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Garantir que as funções podem ser executadas via API
GRANT EXECUTE ON FUNCTION listar_funcionarios_disponiveis TO anon, authenticated;
GRANT EXECUTE ON FUNCTION obter_ultimo_funcionario_cliente TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verificar_disponibilidade_por_funcionario TO anon, authenticated;
GRANT EXECUTE ON FUNCTION criar_agendamento_validado TO anon, authenticated;


