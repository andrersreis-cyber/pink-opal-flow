-- Recriar view vw_conversas_formatadas com JOIN corrigido
DROP VIEW IF EXISTS vw_conversas_formatadas;

CREATE VIEW vw_conversas_formatadas AS
WITH mensagens_formatadas AS (
  -- Mensagens do cliente (user_message)
  SELECT 
    cm.id * 2 - 1 AS id_mensagem,
    cm.phone,
    COALESCE(c.nome, cm.nomewpp, cm.phone) AS cliente_nome,
    c.id AS cliente_id,
    'client' AS sender,
    cm.user_message AS content,
    cm.created_at AS timestamp,
    cm.created_at
  FROM chat_messages cm
  LEFT JOIN clientes c ON normalizar_telefone_busca(c.telefone) = normalizar_telefone_busca(cm.phone)
  WHERE cm.active = true 
    AND cm.user_message IS NOT NULL 
    AND cm.user_message <> ''
  
  UNION ALL
  
  -- Mensagens do bot (bot_message)
  SELECT 
    cm.id * 2 AS id_mensagem,
    cm.phone,
    COALESCE(c.nome, cm.nomewpp, cm.phone) AS cliente_nome,
    c.id AS cliente_id,
    'bot' AS sender,
    cm.bot_message AS content,
    cm.created_at AS timestamp,
    cm.created_at
  FROM chat_messages cm
  LEFT JOIN clientes c ON normalizar_telefone_busca(c.telefone) = normalizar_telefone_busca(cm.phone)
  WHERE cm.active = true 
    AND cm.bot_message IS NOT NULL 
    AND cm.bot_message <> ''
),
conversas_agrupadas AS (
  SELECT 
    phone,
    cliente_nome,
    cliente_id,
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', id_mensagem::text,
        'sender', sender,
        'content', content,
        'timestamp', TO_CHAR(timestamp, 'DD/MM/YYYY HH24:MI')
      ) ORDER BY timestamp, id_mensagem
    ) AS messages,
    MAX(timestamp) AS last_message_date
  FROM mensagens_formatadas
  GROUP BY phone, cliente_nome, cliente_id
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY last_message_date DESC)::text AS id,
  COALESCE(cliente_id::text, phone) AS client_id,
  cliente_nome AS client_name,
  phone,
  messages,
  (
    SELECT value->>'content' AS text
    FROM JSON_ARRAY_ELEMENTS(messages)
    ORDER BY value->>'timestamp' DESC
    LIMIT 1
  ) AS last_message,
  TO_CHAR(last_message_date, 'YYYY-MM-DD HH24:MI') AS last_message_date,
  'ativo' AS status
FROM conversas_agrupadas
WHERE cliente_nome IS NOT NULL;