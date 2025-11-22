# Instruções para Correção do Banco de Dados (Supabase)

Para corrigir os bugs encontrados (agendamento duplicado e histórico vazio), execute os seguintes comandos SQL no **SQL Editor** do seu projeto Supabase.

## 1. Corrigir Validação de Conflito (Para o n8n/IA)

Esta função garante que a IA não marque horário em cima de outro.

```sql
-- Função robusta para verificar disponibilidade de agendamento
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
    RETURN json_build_object(
      'disponivel', false,
      'conflitos', '[]'::json,
      'erro', SQLERRM
    );
END;
$$;
```

## 2. Corrigir Histórico de Conversas (Frontend)

Esta view unifica as mensagens do n8n com as antigas, permitindo que apareçam na tela de Histórico.

```sql
CREATE OR REPLACE VIEW vw_conversas_formatadas AS
WITH todas_mensagens AS (
  -- 1. Dados da tabela historico_conversas (n8n)
  SELECT 
    hc.id,
    c.telefone as phone,
    c.nome as cliente_nome,
    c.id as cliente_id,
    CASE WHEN hc.tipo = 'cliente' THEN 'client' ELSE 'system' END as sender,
    hc.mensagem as content,
    hc.created_at as timestamp
  FROM historico_conversas hc
  JOIN clientes c ON hc.cliente_id = c.id
  WHERE hc.mensagem IS NOT NULL AND hc.mensagem <> ''

  UNION ALL

  -- 2. Dados da tabela chat_messages (Legado)
  SELECT 
    cm.id + 1000000 as id,
    cm.phone,
    COALESCE(c.nome, cm.nomewpp, cm.phone) as cliente_nome,
    c.id as cliente_id,
    'client' as sender,
    cm.user_message as content,
    cm.created_at as timestamp
  FROM chat_messages cm
  LEFT JOIN clientes c ON normalizar_telefone_busca(c.telefone) = normalizar_telefone_busca(cm.phone)
  WHERE cm.active = true AND cm.user_message IS NOT NULL AND cm.user_message <> ''

  UNION ALL

  SELECT 
    cm.id + 2000000 as id,
    cm.phone,
    COALESCE(c.nome, cm.nomewpp, cm.phone) as cliente_nome,
    c.id as cliente_id,
    'system' as sender,
    cm.bot_message as content,
    cm.created_at as timestamp
  FROM chat_messages cm
  LEFT JOIN clientes c ON normalizar_telefone_busca(c.telefone) = normalizar_telefone_busca(cm.phone)
  WHERE cm.active = true AND cm.bot_message IS NOT NULL AND cm.bot_message <> ''
),
conversas_agrupadas AS (
  SELECT 
    phone,
    cliente_nome,
    cliente_id,
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', id::text,
        'sender', sender,
        'content', content,
        'timestamp', TO_CHAR(timestamp, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
      ) ORDER BY timestamp ASC
    ) AS messages,
    MAX(timestamp) AS last_message_date
  FROM todas_mensagens
  GROUP BY phone, cliente_nome, cliente_id
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY last_message_date DESC)::text AS id,
  COALESCE(cliente_id::text, phone) AS client_id,
  cliente_nome AS client_name,
  phone,
  messages,
  (
    SELECT value->>'content'
    FROM JSON_ARRAY_ELEMENTS(messages)
    ORDER BY value->>'timestamp' DESC
    LIMIT 1
  ) AS last_message,
  TO_CHAR(last_message_date, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS last_message_date,
  'ativo' AS status
FROM conversas_agrupadas;
```

