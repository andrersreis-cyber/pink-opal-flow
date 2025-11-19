-- Alterar coluna mensagem para permitir NULL
ALTER TABLE historico_conversas 
ALTER COLUMN mensagem DROP NOT NULL;

-- Limpar dados existentes com mensagens "undefined"
UPDATE historico_conversas 
SET mensagem = NULL 
WHERE mensagem = 'undefined' OR mensagem = '' OR LOWER(mensagem) = 'null';

-- Criar função para validar mensagens antes de inserir/atualizar
CREATE OR REPLACE FUNCTION validate_mensagem()
RETURNS TRIGGER AS $$
BEGIN
  -- Converter "undefined", "null" ou vazio para NULL
  IF NEW.mensagem IN ('undefined', 'null', '') THEN
    NEW.mensagem := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validar antes de inserir/atualizar
DROP TRIGGER IF EXISTS trigger_validate_mensagem ON historico_conversas;
CREATE TRIGGER trigger_validate_mensagem
  BEFORE INSERT OR UPDATE ON historico_conversas
  FOR EACH ROW
  EXECUTE FUNCTION validate_mensagem();

-- Atualizar view vw_conversas para tratar "undefined" e NULL
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
  cm.phone AS telefone,
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