-- ================================================
-- AUDITORIA FINAL - VERIFICAÃ‡ÃƒO COMPLETA DO SISTEMA
-- ================================================
-- Executar antes de merge para dev
-- Data: 24/11/2025

-- '\n========================================='
-- 'AUDITORIA FINAL - SISTEMA COMPLETO'
-- '=========================================\n'

-- ================================================
-- 1. INTEGRIDADE DOS AGENDAMENTOS
-- ================================================
-- '\n[1] VERIFICAÃ‡ÃƒO DE AGENDAMENTOS\n'

-- 1.1 Ãšltimos 5 agendamentos criados
-- '1.1 - Ãšltimos 5 agendamentos (ordenados por data de criaÃ§Ã£o):'
SELECT 
  a.id,
  a.cliente_id,
  c.nome as cliente_nome,
  c.telefone as cliente_telefone,
  a.servico_id,
  s.nome as servico_nome,
  s.duracao_minutos as servico_duracao,
  a.funcionario_id,
  u.nome as funcionario_nome,
  to_char(a.data_hora AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') as data_hora_brasilia,
  a.duracao_minutos,
  a.status,
  a.observacoes,
  to_char(a.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS') as criado_em
FROM agendamentos a
LEFT JOIN clientes c ON a.cliente_id = c.id
LEFT JOIN servicos s ON a.servico_id = s.id
LEFT JOIN usuarios u ON a.funcionario_id = u.id
ORDER BY a.created_at DESC
LIMIT 5;

-- 1.2 Verificar agendamentos sem funcionÃ¡rio
-- '\n1.2 - Agendamentos SEM funcionÃ¡rio (deveria estar vazio):'
SELECT 
  COUNT(*) as total_sem_funcionario,
  STRING_AGG(a.id::text, ', ') as ids_afetados
FROM agendamentos a
WHERE a.funcionario_id IS NULL;

-- 1.3 Verificar agendamentos com funcionÃ¡rio nÃ£o habilitado
-- '\n1.3 - Agendamentos com funcionÃ¡rio NÃƒO HABILITADO para o serviÃ§o:'
SELECT 
  a.id,
  c.nome as cliente,
  s.nome as servico,
  u.nome as funcionario,
  CASE 
    WHEN fs.funcionario_id IS NULL THEN 'âŒ NÃƒO HABILITADO'
    WHEN fs.ativo = false THEN 'âš ï¸ VÃNCULO INATIVO'
    ELSE 'âœ… OK'
  END as status_habilitacao
FROM agendamentos a
JOIN clientes c ON a.cliente_id = c.id
JOIN servicos s ON a.servico_id = s.id
JOIN usuarios u ON a.funcionario_id = u.id
LEFT JOIN funcionario_servicos fs ON fs.funcionario_id = a.funcionario_id 
  AND fs.servico_id = a.servico_id 
  AND fs.ativo = true
WHERE fs.funcionario_id IS NULL OR fs.ativo = false;

-- 1.4 Verificar consistÃªncia de duraÃ§Ã£o
-- '\n1.4 - Verificar se duraÃ§Ã£o do agendamento corresponde ao serviÃ§o:'
SELECT 
  a.id,
  s.nome as servico,
  s.duracao_minutos as duracao_servico,
  a.duracao_minutos as duracao_agendamento,
  CASE 
    WHEN a.duracao_minutos = s.duracao_minutos THEN 'âœ… OK'
    ELSE 'âš ï¸ DIVERGENTE'
  END as status
FROM agendamentos a
JOIN servicos s ON a.servico_id = s.id
WHERE a.duracao_minutos != s.duracao_minutos;

-- ================================================
-- 2. INTEGRIDADE DOS CLIENTES
-- ================================================
-- '\n[2] VERIFICAÃ‡ÃƒO DE CLIENTES\n'

-- 2.1 Clientes criados recentemente
-- '2.1 - Ãšltimos 5 clientes cadastrados:'
SELECT 
  id,
  nome,
  telefone,
  email,
  cpf,
  to_char(created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS') as cadastrado_em,
  to_char(updated_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS') as atualizado_em
FROM clientes
ORDER BY created_at DESC
LIMIT 5;

-- 2.2 Clientes com telefone duplicado
-- '\n2.2 - Telefones DUPLICADOS (deveria estar vazio):'
SELECT 
  telefone,
  COUNT(*) as total,
  STRING_AGG(nome, ', ') as clientes_afetados
FROM clientes
GROUP BY telefone
HAVING COUNT(*) > 1;

-- 2.3 Clientes sem telefone normalizado
-- '\n2.3 - Telefones NÃƒO normalizados (formato esperado: 55DDNNNNNNNNN):'
SELECT 
  id,
  nome,
  telefone,
  LENGTH(telefone) as tamanho,
  CASE 
    WHEN telefone ~ '^55[0-9]{10,11}$' THEN 'âœ… OK'
    ELSE 'âš ï¸ FORMATO INCORRETO'
  END as status
FROM clientes
WHERE telefone !~ '^55[0-9]{10,11}$';

-- 2.4 Clientes com agendamentos
-- '\n2.4 - EstatÃ­sticas de agendamentos por cliente:'
SELECT 
  c.nome,
  c.telefone,
  COUNT(a.id) as total_agendamentos,
  COUNT(CASE WHEN a.status = 'confirmado' THEN 1 END) as confirmados,
  COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as concluidos,
  COUNT(CASE WHEN a.status = 'cancelado' THEN 1 END) as cancelados,
  to_char(MAX(a.data_hora) AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') as ultimo_agendamento
FROM clientes c
LEFT JOIN agendamentos a ON a.cliente_id = c.id
GROUP BY c.id, c.nome, c.telefone
ORDER BY total_agendamentos DESC
LIMIT 10;

-- ================================================
-- 3. ESPECIALIZAÃ‡ÃƒO FUNCIONÃRIO x SERVIÃ‡OS
-- ================================================
-- '\n[3] VERIFICAÃ‡ÃƒO DE ESPECIALIZAÃ‡Ã•ES\n'

-- 3.1 Mapa completo de especializaÃ§Ãµes
-- '3.1 - Mapa de especializaÃ§Ãµes por funcionÃ¡rio:'
SELECT 
  u.nome as funcionario,
  u.tipo as tipo_usuario,
  COUNT(fs.servico_id) as total_servicos,
  COUNT(CASE WHEN fs.nivel_habilidade = 'avancado' THEN 1 END) as avancados,
  COUNT(CASE WHEN fs.nivel_habilidade = 'basico' THEN 1 END) as basicos,
  COUNT(CASE WHEN fs.ativo = true THEN 1 END) as ativos,
  COUNT(CASE WHEN fs.ativo = false THEN 1 END) as inativos
FROM usuarios u
LEFT JOIN funcionario_servicos fs ON fs.funcionario_id = u.id
WHERE u.tipo IN ('funcionario', 'admin')
GROUP BY u.id, u.nome, u.tipo
ORDER BY u.nome;

-- 3.2 ServiÃ§os sem nenhum funcionÃ¡rio habilitado
-- '\n3.2 - ServiÃ§os SEM funcionÃ¡rio habilitado (problema potencial):'
SELECT 
  s.id,
  s.nome,
  s.categoria,
  COUNT(fs.funcionario_id) as total_funcionarios_habilitados
FROM servicos s
LEFT JOIN funcionario_servicos fs ON fs.servico_id = s.id AND fs.ativo = true
GROUP BY s.id, s.nome, s.categoria
HAVING COUNT(fs.funcionario_id) = 0;

-- 3.3 Detalhamento de especializaÃ§Ãµes por serviÃ§o
-- '\n3.3 - FuncionÃ¡rios habilitados por serviÃ§o (amostra dos 10 primeiros):'
SELECT 
  s.nome as servico,
  s.categoria,
  u.nome as funcionario,
  fs.nivel_habilidade,
  CASE WHEN fs.ativo THEN 'âœ… Ativo' ELSE 'âŒ Inativo' END as status,
  fs.observacoes
FROM servicos s
JOIN funcionario_servicos fs ON fs.servico_id = s.id
JOIN usuarios u ON u.id = fs.funcionario_id
WHERE fs.ativo = true
ORDER BY s.nome, 
  CASE fs.nivel_habilidade WHEN 'avancado' THEN 1 ELSE 2 END,
  u.nome
LIMIT 10;

-- ================================================
-- 4. HISTÃ“RICO DE CONVERSAS (N8N)
-- ================================================
-- '\n[4] VERIFICAÃ‡ÃƒO DE CONVERSAS N8N\n'

-- 4.1 Ãšltimas conversas registradas
-- '4.1 - Ãšltimas 5 conversas do N8N:'
SELECT 
  hc.id,
  c.nome as cliente,
  c.telefone,
  hc.mensagem_usuario,
  LEFT(hc.resposta_agente, 100) as resposta_preview,
  to_char(hc.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS') as data_hora
FROM historico_conversas hc
JOIN clientes c ON c.id = hc.cliente_id
ORDER BY hc.created_at DESC
LIMIT 5;

-- 4.2 EstatÃ­sticas de conversas por cliente
-- '\n4.2 - EstatÃ­sticas de conversas por cliente:'
SELECT 
  c.nome,
  c.telefone,
  COUNT(hc.id) as total_conversas,
  to_char(MIN(hc.created_at) AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') as primeira_conversa,
  to_char(MAX(hc.created_at) AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') as ultima_conversa
FROM clientes c
LEFT JOIN historico_conversas hc ON hc.cliente_id = c.id
GROUP BY c.id, c.nome, c.telefone
HAVING COUNT(hc.id) > 0
ORDER BY total_conversas DESC
LIMIT 10;

-- ================================================
-- 5. FUNÃ‡Ã•ES RPC - TESTES FUNCIONAIS
-- ================================================
-- '\n[5] TESTE DE RPCs CRÃTICAS\n'

-- 5.1 Teste: listar_funcionarios_por_servico
-- '5.1 - Teste RPC: listar_funcionarios_por_servico (exemplo: plas-06):'
SELECT * FROM listar_funcionarios_por_servico('plas-06');

-- 5.2 Teste: obter_ultimo_funcionario_cliente (usar telefone real do banco)
-- '\n5.2 - Teste RPC: obter_ultimo_funcionario_cliente:'
DO $$
DECLARE
  v_telefone TEXT;
BEGIN
  -- Pegar telefone do Ãºltimo cliente com agendamento
  SELECT c.telefone INTO v_telefone
  FROM agendamentos a
  JOIN clientes c ON c.id = a.cliente_id
  ORDER BY a.created_at DESC
  LIMIT 1;
  
  IF v_telefone IS NOT NULL THEN
    RAISE NOTICE 'Testando com telefone: %', v_telefone;
    PERFORM * FROM obter_ultimo_funcionario_cliente(v_telefone);
  ELSE
    RAISE NOTICE 'Nenhum agendamento encontrado para teste';
  END IF;
END $$;

-- 5.3 Teste: funcionario_pode_executar_servico
-- '\n5.3 - Teste RPC: funcionario_pode_executar_servico:'
DO $$
DECLARE
  v_funcionario_id UUID;
  v_servico_id TEXT;
  v_pode BOOLEAN;
BEGIN
  -- Pegar primeiro funcionÃ¡rio e serviÃ§o vinculado
  SELECT fs.funcionario_id, fs.servico_id
  INTO v_funcionario_id, v_servico_id
  FROM funcionario_servicos fs
  WHERE fs.ativo = true
  LIMIT 1;
  
  IF v_funcionario_id IS NOT NULL THEN
    SELECT funcionario_pode_executar_servico(v_funcionario_id, v_servico_id) INTO v_pode;
    RAISE NOTICE 'FuncionÃ¡rio % pode executar serviÃ§o %: %', v_funcionario_id, v_servico_id, v_pode;
  END IF;
END $$;

-- ================================================
-- 6. CONSISTÃŠNCIA DE TIMESTAMPS
-- ================================================
-- '\n[6] VERIFICAÃ‡ÃƒO DE TIMESTAMPS\n'

-- 6.1 Registros com created_at futuro (erro de timezone)
-- '6.1 - Registros com created_at no FUTURO (deveria estar vazio):'
SELECT 
  'agendamentos' as tabela,
  COUNT(*) as total_futuros
FROM agendamentos
WHERE created_at > NOW()
UNION ALL
SELECT 
  'clientes' as tabela,
  COUNT(*) as total_futuros
FROM clientes
WHERE created_at > NOW()
UNION ALL
SELECT 
  'historico_conversas' as tabela,
  COUNT(*) as total_futuros
FROM historico_conversas
WHERE created_at > NOW();

-- 6.2 Agendamentos com data_hora no passado e status ainda pendente
-- '\n6.2 - Agendamentos PASSADOS com status nÃ£o concluÃ­do:'
SELECT 
  a.id,
  c.nome as cliente,
  s.nome as servico,
  u.nome as funcionario,
  to_char(a.data_hora AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') as data_hora,
  a.status,
  EXTRACT(EPOCH FROM (NOW() - a.data_hora))/3600 as horas_atrasadas
FROM agendamentos a
JOIN clientes c ON c.id = a.cliente_id
JOIN servicos s ON s.id = a.servico_id
JOIN usuarios u ON u.id = a.funcionario_id
WHERE a.data_hora < NOW()
  AND a.status NOT IN ('concluido', 'cancelado')
ORDER BY a.data_hora DESC;

-- ================================================
-- 7. RESUMO GERAL DO SISTEMA
-- ================================================
-- '\n[7] RESUMO GERAL\n'

-- '7.1 - EstatÃ­sticas gerais do sistema:'
SELECT 
  (SELECT COUNT(*) FROM usuarios WHERE tipo IN ('funcionario', 'admin')) as total_funcionarios,
  (SELECT COUNT(*) FROM clientes) as total_clientes,
  (SELECT COUNT(*) FROM servicos) as total_servicos,
  (SELECT COUNT(*) FROM agendamentos) as total_agendamentos,
  (SELECT COUNT(*) FROM agendamentos WHERE status = 'confirmado') as agendamentos_confirmados,
  (SELECT COUNT(*) FROM agendamentos WHERE status = 'concluido') as agendamentos_concluidos,
  (SELECT COUNT(*) FROM agendamentos WHERE status = 'cancelado') as agendamentos_cancelados,
  (SELECT COUNT(*) FROM funcionario_servicos WHERE ativo = true) as vinculos_ativos,
  (SELECT COUNT(*) FROM historico_conversas) as total_conversas;

-- ================================================
-- 8. VERIFICAÃ‡Ã•ES DE SEGURANÃ‡A (RLS)
-- ================================================
-- '\n[8] VERIFICAÃ‡ÃƒO DE POLÃTICAS RLS\n'

-- '8.1 - Tabelas com RLS HABILITADO:'
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('usuarios', 'clientes', 'agendamentos', 'servicos', 'funcionario_servicos', 'historico_conversas')
ORDER BY tablename;

-- '\n8.2 - Total de polÃ­ticas RLS por tabela:'
SELECT 
  tablename,
  COUNT(*) as total_politicas,
  STRING_AGG(policyname, ', ') as politicas
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ================================================
-- FIM DA AUDITORIA
-- ================================================
-- '\n========================================='
-- 'AUDITORIA FINALIZADA'
-- '========================================='
-- '\nPrÃ³ximos passos:'
-- '1. Revisar resultados acima'
-- '2. Corrigir inconsistÃªncias encontradas'
-- '3. Re-executar auditoria'
-- '4. Merge para branch dev'
-- '=========================================\n'

