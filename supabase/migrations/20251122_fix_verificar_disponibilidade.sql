
-- Função robusta para verificar disponibilidade de agendamento
-- Recebe datas em formato ISO 8601 (com timezone)
CREATE OR REPLACE FUNCTION public.verificar_disponibilidade(
  p_data_inicio text,
  p_data_fim text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_inicio timestamptz;
  v_fim timestamptz;
  v_conflitos json;
  v_disponivel boolean;
BEGIN
  -- Converter strings ISO para timestamptz
  v_inicio := p_data_inicio::timestamptz;
  v_fim := p_data_fim::timestamptz;

  -- Buscar agendamentos conflitantes
  -- Lógica de Overlap: (StartA < EndB) AND (EndA > StartB)
  SELECT json_agg(row_to_json(a))
  INTO v_conflitos
  FROM (
    SELECT 
      ag.id,
      ag.data,
      ag.duracao_minutos,
      c.nome as cliente_nome,
      s.nome as servico_nome
    FROM agendamentos ag
    JOIN clientes c ON ag.cliente_id = c.id
    JOIN servicos s ON ag.servico_id = s.id
    WHERE ag.status != 'cancelado'
      AND (
        v_inicio < (ag.data + (ag.duracao_minutos || ' minutes')::interval)
        AND
        v_fim > ag.data
      )
  ) a;

  -- Se v_conflitos for null, não houve conflito
  IF v_conflitos IS NULL THEN
    v_conflitos := '[]'::json;
    v_disponivel := true;
  ELSE
    v_disponivel := false;
  END IF;

  RETURN json_build_object(
    'disponivel', v_disponivel,
    'conflitos', v_conflitos
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro de conversão ou outro, retorna indisponível por segurança
    RETURN json_build_object(
      'disponivel', false,
      'conflitos', '[]'::json,
      'erro', SQLERRM
    );
END;
$$;


