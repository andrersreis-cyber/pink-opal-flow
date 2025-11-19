-- Atualizar view vw_conversas para normalizar telefones (remover @lid e similares)
-- Isso permite agrupar conversas do WhatsApp com histórico do cliente

CREATE OR REPLACE VIEW vw_conversas AS
SELECT 
  hc.id,
  hc.cliente_id,
  REGEXP_REPLACE(c.telefone, '@.*$', '') AS telefone,  -- Remove @lid e sufixos similares
  c.nome AS cliente_nome,
  CASE 
    WHEN hc.tipo = 'cliente' THEN hc.mensagem
    ELSE NULL
  END AS mensagem_usuario,
  CASE 
    WHEN hc.tipo = 'sistema' THEN NULLIF(hc.mensagem, 'undefined')
    ELSE ''
  END AS mensagem_bot,
  hc.tipo,
  CASE 
    WHEN hc.tipo = 'cliente' THEN 'incoming'
    ELSE 'outgoing'
  END AS direcao,
  hc.created_at
FROM historico_conversas hc
JOIN clientes c ON hc.cliente_id = c.id

UNION ALL

SELECT 
  cm.id + 1000000 AS id,
  NULL::bigint AS cliente_id,
  REGEXP_REPLACE(cm.phone, '@.*$', '') AS telefone,  -- Remove @lid e sufixos similares
  cm.nomewpp AS cliente_nome,
  cm.user_message AS mensagem_usuario,
  COALESCE(cm.bot_message, '') AS mensagem_bot,
  COALESCE(cm.message_type, 'text') AS tipo,
  CASE 
    WHEN cm.user_message IS NOT NULL THEN 'incoming'
    ELSE 'outgoing'
  END AS direcao,
  COALESCE(cm.created_at, NOW()) AS created_at
FROM chat_messages cm
WHERE cm.active = true;