-- Corrigir view vw_conversas para mostrar mensagens do bot corretamente
CREATE OR REPLACE VIEW vw_conversas AS
SELECT 
  hc.id,
  hc.cliente_id,
  c.telefone,
  c.nome AS cliente_nome,
  CASE 
    WHEN hc.tipo = 'cliente' THEN hc.mensagem
    ELSE NULL
  END AS mensagem_usuario,
  CASE 
    WHEN hc.tipo = 'sistema' THEN hc.mensagem
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
  cm.phone AS telefone,
  cm.nomewpp AS cliente_nome,
  cm.user_message AS mensagem_usuario,
  cm.bot_message AS mensagem_bot,
  COALESCE(cm.message_type, 'text') AS tipo,
  CASE 
    WHEN cm.user_message IS NOT NULL THEN 'incoming'
    ELSE 'outgoing'
  END AS direcao,
  COALESCE(cm.created_at, NOW()) AS created_at
FROM chat_messages cm
WHERE cm.active = true;