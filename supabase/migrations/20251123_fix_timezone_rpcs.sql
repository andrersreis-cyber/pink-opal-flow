-- ====================================================================
-- CORREÇÃO: RPCs retornando horários de Brasília (UTC-3)
-- Problema: Agente mostrava horários em UTC, confundindo clientes
-- Solução: Retornar datas formatadas em horário de Brasília
-- ====================================================================

-- 1. RECRIAR: listar_agendamentos_por_telefone
-- Retorna agendamentos formatados com horário de Brasília
DROP FUNCTION IF EXISTS listar_agendamentos_por_telefone(TEXT);

CREATE OR REPLACE FUNCTION listar_agendamentos_por_telefone(p_telefone TEXT)
RETURNS TABLE(
  id BIGINT,
  cliente_id BIGINT,
  servico_id TEXT,
  servico_nome TEXT,
  servico_categoria TEXT,
  funcionario_id UUID,
  funcionario_nome TEXT,
  data_hora_brasilia TEXT, -- NOVO: horário formatado DD/MM às HH:MI
  data TIMESTAMPTZ, -- Mantém original para compatibilidade
  duracao_minutos INTEGER,
  preco NUMERIC,
  status TEXT,
  observacoes TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_telefone_normalizado TEXT;
BEGIN
  -- Normalizar telefone de entrada
  v_telefone_normalizado := normalizar_telefone_busca(p_telefone);
  
  RETURN QUERY
  SELECT 
    a.id,
    a.cliente_id,
    a.servico_id,
    s.nome as servico_nome,
    s.categoria as servico_categoria,
    a.funcionario_id,
    p.nome as funcionario_nome,
    TO_CHAR(a.data AT TIME ZONE 'America/Sao_Paulo', 'DD/MM "às" HH24:MI') as data_hora_brasilia,
    a.data,
    a.duracao_minutos,
    a.preco,
    a.status,
    a.observacoes
  FROM agendamentos a
  JOIN clientes c ON c.id = a.cliente_id
  JOIN servicos s ON s.id = a.servico_id
  LEFT JOIN profiles p ON p.id = a.funcionario_id
  WHERE normalizar_telefone_busca(c.telefone) = v_telefone_normalizado
    AND a.status != 'cancelado' -- Não mostrar cancelados
    AND a.data >= NOW() - INTERVAL '1 day' -- Agendamentos de ontem pra frente
  ORDER BY a.data ASC; -- Mais próximos primeiro
  
  -- Se não encontrou, tentar busca sem normalização (fallback)
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      a.id,
      a.cliente_id,
      a.servico_id,
      s.nome as servico_nome,
      s.categoria as servico_categoria,
      a.funcionario_id,
      p.nome as funcionario_nome,
      TO_CHAR(a.data AT TIME ZONE 'America/Sao_Paulo', 'DD/MM "às" HH24:MI') as data_hora_brasilia,
      a.data,
      a.duracao_minutos,
      a.preco,
      a.status,
      a.observacoes
    FROM agendamentos a
    JOIN clientes c ON c.id = a.cliente_id
    JOIN servicos s ON s.id = a.servico_id
    LEFT JOIN profiles p ON p.id = a.funcionario_id
    WHERE c.telefone = p_telefone
      AND a.status != 'cancelado'
      AND a.data >= NOW() - INTERVAL '1 day'
    ORDER BY a.data ASC;
  END IF;
END;
$$;

COMMENT ON FUNCTION listar_agendamentos_por_telefone IS 'Lista agendamentos futuros de um cliente por telefone, retornando horários em Brasília (UTC-3)';

-- ====================================================================

-- 2. ATUALIZAR: criar_agendamento_validado
-- Garantir que aceita datas em timezone de Brasília
DROP FUNCTION IF EXISTS criar_agendamento_validado(BIGINT, TEXT, TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION criar_agendamento_validado(
  p_cliente_id BIGINT,
  p_servico_id TEXT,
  p_data TEXT, -- Aceita ISO 8601 com timezone: 2025-11-24T10:00:00-03:00
  p_observacoes TEXT DEFAULT NULL,
  p_funcionario_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_servico RECORD;
  v_data_inicio TIMESTAMPTZ;
  v_data_fim TIMESTAMPTZ;
  v_conflitos JSON;
  v_agendamento_id BIGINT;
  v_funcionario_final UUID;
BEGIN
  -- 1. Converter string para TIMESTAMPTZ (preserva timezone)
  BEGIN
    v_data_inicio := p_data::TIMESTAMPTZ;
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Data inválida. Use formato ISO 8601 com timezone (ex: 2025-11-24T10:00:00-03:00)'
    );
  END;

  -- 2. Buscar serviço
  SELECT id, nome, duracao_minutos, preco, ativo
  INTO v_servico
  FROM servicos
  WHERE id = p_servico_id;

  IF NOT FOUND OR NOT v_servico.ativo THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Serviço não encontrado ou inativo'
    );
  END IF;

  -- 3. Calcular data_fim
  v_data_fim := v_data_inicio + (v_servico.duracao_minutos || ' minutes')::INTERVAL;

  -- 4. Determinar funcionário (usar fornecido ou primeiro disponível)
  IF p_funcionario_id IS NOT NULL THEN
    v_funcionario_final := p_funcionario_id;
  ELSE
    -- Pegar primeiro funcionário ativo
    SELECT id INTO v_funcionario_final
    FROM profiles
    WHERE role = 'funcionario' AND ativo = true
    LIMIT 1;
    
    -- Se não houver funcionário, usar admin
    IF v_funcionario_final IS NULL THEN
      SELECT id INTO v_funcionario_final
      FROM profiles
      WHERE role = 'admin' AND ativo = true
      LIMIT 1;
    END IF;
  END IF;

  -- 5. Verificar disponibilidade do funcionário específico
  SELECT json_agg(
    json_build_object(
      'id', a.id,
      'data_inicio', a.data,
      'data_fim', a.data + (a.duracao_minutos || ' minutes')::INTERVAL,
      'servico', s.nome
    )
  )
  INTO v_conflitos
  FROM agendamentos a
  JOIN servicos s ON s.id = a.servico_id
  WHERE a.funcionario_id = v_funcionario_final
    AND a.status != 'cancelado'
    AND (
      (v_data_inicio >= a.data AND v_data_inicio < a.data + (a.duracao_minutos || ' minutes')::INTERVAL)
      OR
      (v_data_fim > a.data AND v_data_fim <= a.data + (a.duracao_minutos || ' minutes')::INTERVAL)
      OR
      (v_data_inicio <= a.data AND v_data_fim >= a.data + (a.duracao_minutos || ' minutes')::INTERVAL)
    );

  IF v_conflitos IS NOT NULL THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Funcionário não disponível nesse horário',
      'conflitos', v_conflitos
    );
  END IF;

  -- 6. Criar agendamento
  INSERT INTO agendamentos (
    cliente_id,
    servico_id,
    funcionario_id,
    data,
    duracao_minutos,
    preco,
    status,
    observacoes
  )
  VALUES (
    p_cliente_id,
    p_servico_id,
    v_funcionario_final,
    v_data_inicio,
    v_servico.duracao_minutos,
    v_servico.preco,
    'confirmado',
    p_observacoes
  )
  RETURNING id INTO v_agendamento_id;

  RETURN json_build_object(
    'sucesso', true,
    'agendamento_id', v_agendamento_id,
    'erro', null,
    'data_hora_brasilia', TO_CHAR(v_data_inicio AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY "às" HH24:MI')
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'sucesso', false,
    'agendamento_id', null,
    'erro', SQLERRM
  );
END;
$$;

COMMENT ON FUNCTION criar_agendamento_validado IS 'Cria agendamento validando disponibilidade do funcionário. Aceita datas com timezone de Brasília.';

-- ====================================================================

-- 3. TESTAR: Verificar se funções estão retornando corretamente
DO $$
DECLARE
  v_result RECORD;
BEGIN
  RAISE NOTICE '=== TESTANDO listar_agendamentos_por_telefone ===';
  
  FOR v_result IN 
    SELECT data_hora_brasilia, servico_nome, funcionario_nome
    FROM listar_agendamentos_por_telefone('5527995228798')
    LIMIT 3
  LOOP
    RAISE NOTICE 'Agendamento: % - % com %', 
      v_result.data_hora_brasilia, 
      v_result.servico_nome, 
      v_result.funcionario_nome;
  END LOOP;
END $$;

