-- Corrigir view vw_conversas_formatadas para incluir historico_conversas (n8n)
-- Anteriormente só lia de chat_messages

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

  -- 2. Dados da tabela chat_messages (Legado/Webhooks diretos)
  -- Mensagens do usuário
  SELECT 
    cm.id + 1000000 as id, -- Offset para evitar colisão de ID
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

  -- Mensagens do bot
  SELECT 
    cm.id + 2000000 as id, -- Offset diferente
    cm.phone,
    COALESCE(c.nome, cm.nomewpp, cm.phone) as cliente_nome,
    c.id as cliente_id,
    'system' as sender, -- Padronizando como 'system' em vez de 'bot'
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
        'timestamp', TO_CHAR(timestamp, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') -- ISO 8601
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

