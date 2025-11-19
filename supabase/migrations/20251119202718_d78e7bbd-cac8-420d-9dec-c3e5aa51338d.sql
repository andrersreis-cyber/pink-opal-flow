-- Inserir mensagens de teste para validar histórico
-- Telefone: 27996205115 (normalizado: 5527996205115)

INSERT INTO chat_messages (phone, user_message, bot_message, nomewpp, active, created_at)
VALUES 
  -- Mensagem 1: Cliente inicia conversa
  ('5527996205115@lid', 'Oi, gostaria de agendar um horário', NULL, 'André Reis', true, NOW() - INTERVAL '10 minutes'),
  
  -- Mensagem 2: Bot responde
  ('5527996205115@lid', NULL, 'Olá André! Claro, ficarei feliz em ajudar. Qual serviço você gostaria de agendar?', 'André Reis', true, NOW() - INTERVAL '9 minutes'),
  
  -- Mensagem 3: Cliente responde
  ('5527996205115@lid', 'Quero fazer um corte de cabelo', NULL, 'André Reis', true, NOW() - INTERVAL '8 minutes'),
  
  -- Mensagem 4: Bot responde
  ('5527996205115@lid', NULL, 'Perfeito! Temos disponibilidade para corte de cabelo. Qual data e horário você prefere?', 'André Reis', true, NOW() - INTERVAL '7 minutes'),
  
  -- Mensagem 5: Cliente responde
  ('5527996205115@lid', 'Amanhã às 14h pode ser?', NULL, 'André Reis', true, NOW() - INTERVAL '6 minutes'),
  
  -- Mensagem 6: Bot responde
  ('5527996205115@lid', NULL, 'Ótimo! Agendamento confirmado para amanhã às 14h. Você receberá uma confirmação em breve. Algo mais que posso ajudar?', 'André Reis', true, NOW() - INTERVAL '5 minutes'),
  
  -- Mensagem 7: Cliente finaliza
  ('5527996205115@lid', 'Não, obrigado! Até amanhã', NULL, 'André Reis', true, NOW() - INTERVAL '4 minutes'),
  
  -- Mensagem 8: Bot finaliza
  ('5527996205115@lid', NULL, 'Por nada! Até amanhã às 14h. Tenha um ótimo dia! 😊', 'André Reis', true, NOW() - INTERVAL '3 minutes');