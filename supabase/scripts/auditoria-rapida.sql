-- ================================================
-- AUDITORIA RÁPIDA - Versão 6
-- ================================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/zkluzbjhufpfpjzrjimu/sql

-- ================================================
-- 1. ÚLTIMOS 5 AGENDAMENTOS CRIADOS
-- ================================================
SELECT 
  '🎯 ÚLTIMOS AGENDAMENTOS' as secao,
  a.id,
  c.nome as cliente,
  c.telefone,
  s.nome as servico,
  u.nome as funcionario,
  fs.nivel_habilidade,
  to_char(a.data_hora AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') as data_hora,
  a.status,
  to_char(a.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS') as criado_em
FROM agendamentos a
JOIN clientes c ON a.cliente_id = c.id
JOIN servicos s ON a.servico_id = s.id
JOIN usuarios u ON a.funcionario_id = u.id
LEFT JOIN funcionario_servicos fs ON fs.funcionario_id = a.funcionario_id 
  AND fs.servico_id = a.servico_id
ORDER BY a.created_at DESC
LIMIT 5;

-- ================================================
-- 2. VALIDAÇÕES CRÍTICAS
-- ================================================

-- Agendamentos sem funcionário (DEVE ESTAR VAZIO)
SELECT 
  '❌ AGENDAMENTOS SEM FUNCIONÁRIO' as problema,
  COUNT(*) as total,
  STRING_AGG(id::text, ', ') as ids
FROM agendamentos
WHERE funcionario_id IS NULL;

-- Agendamentos com funcionário não habilitado (DEVE ESTAR VAZIO)
SELECT 
  '⚠️ FUNCIONÁRIO NÃO HABILITADO' as problema,
  COUNT(*) as total,
  STRING_AGG(a.id::text, ', ') as ids
FROM agendamentos a
LEFT JOIN funcionario_servicos fs ON fs.funcionario_id = a.funcionario_id 
  AND fs.servico_id = a.servico_id 
  AND fs.ativo = true
WHERE fs.funcionario_id IS NULL;

-- Telefones não normalizados (DEVE ESTAR VAZIO)
SELECT 
  '📱 TELEFONES MAL FORMATADOS' as problema,
  COUNT(*) as total,
  STRING_AGG(nome || ' (' || telefone || ')', ', ') as clientes
FROM clientes
WHERE telefone !~ '^55[0-9]{10,11}$';

-- ================================================
-- 3. ESTATÍSTICAS GERAIS
-- ================================================
SELECT 
  '📊 ESTATÍSTICAS GERAIS' as secao,
  (SELECT COUNT(*) FROM usuarios WHERE tipo IN ('funcionario', 'admin')) as total_funcionarios,
  (SELECT COUNT(*) FROM clientes) as total_clientes,
  (SELECT COUNT(*) FROM servicos) as total_servicos,
  (SELECT COUNT(*) FROM agendamentos) as total_agendamentos,
  (SELECT COUNT(*) FROM funcionario_servicos WHERE ativo = true) as vinculos_ativos,
  (SELECT COUNT(*) FROM historico_conversas) as conversas_n8n;

-- ================================================
-- 4. MAPA DE ESPECIALIZAÇÕES
-- ================================================
SELECT 
  '👥 ESPECIALIZAÇÕES POR FUNCIONÁRIO' as secao,
  u.nome as funcionario,
  COUNT(fs.servico_id) as total_servicos,
  COUNT(CASE WHEN fs.nivel_habilidade = 'avancado' THEN 1 END) as avancados,
  COUNT(CASE WHEN fs.nivel_habilidade = 'basico' THEN 1 END) as basicos
FROM usuarios u
LEFT JOIN funcionario_servicos fs ON fs.funcionario_id = u.id AND fs.ativo = true
WHERE u.tipo IN ('funcionario', 'admin')
GROUP BY u.id, u.nome
ORDER BY u.nome;

-- ================================================
-- 5. ÚLTIMAS CONVERSAS N8N
-- ================================================
SELECT 
  '💬 ÚLTIMAS CONVERSAS N8N' as secao,
  c.nome as cliente,
  c.telefone,
  LEFT(hc.mensagem_usuario, 50) as mensagem,
  LEFT(hc.resposta_agente, 50) as resposta,
  to_char(hc.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI') as quando
FROM historico_conversas hc
JOIN clientes c ON c.id = hc.cliente_id
ORDER BY hc.created_at DESC
LIMIT 5;

-- ================================================
-- 6. SERVIÇOS POR STATUS DE COBERTURA
-- ================================================
SELECT 
  '🎨 COBERTURA DE SERVIÇOS' as secao,
  s.nome as servico,
  s.categoria,
  COUNT(fs.funcionario_id) as profissionais_habilitados,
  STRING_AGG(u.nome || ' (' || fs.nivel_habilidade || ')', ', ') as funcionarios
FROM servicos s
LEFT JOIN funcionario_servicos fs ON fs.servico_id = s.id AND fs.ativo = true
LEFT JOIN usuarios u ON u.id = fs.funcionario_id
GROUP BY s.id, s.nome, s.categoria
ORDER BY COUNT(fs.funcionario_id) ASC, s.nome
LIMIT 10;

-- ================================================
-- 7. AGENDAMENTOS POR STATUS
-- ================================================
SELECT 
  '📅 AGENDAMENTOS POR STATUS' as secao,
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM agendamentos
GROUP BY status
ORDER BY total DESC;

-- ================================================
-- 8. TESTE DE RPCs CRÍTICAS
-- ================================================

-- Testar listar_funcionarios_por_servico (Harmonização Facial)
SELECT 
  '🧪 TESTE RPC: listar_funcionarios_por_servico' as teste,
  funcionario_nome,
  nivel_habilidade
FROM listar_funcionarios_por_servico('plas-06')
LIMIT 5;

-- ================================================
-- FIM DA AUDITORIA RÁPIDA
-- ================================================
SELECT 
  '✅ AUDITORIA CONCLUÍDA' as status,
  NOW() AT TIME ZONE 'America/Sao_Paulo' as data_hora_brasilia;

