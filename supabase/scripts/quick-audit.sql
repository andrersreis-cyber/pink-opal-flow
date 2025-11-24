-- =====================================================
-- AUDITORIA RÁPIDA - Diagnóstico Inicial
-- =====================================================

-- 1. LISTAR TODAS AS TABELAS
SELECT 
  tablename as tabela,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. LISTAR TODAS AS VIEWS
SELECT table_name as view_name
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. LISTAR TODAS AS FUNCTIONS
SELECT 
  routine_name as funcao,
  COUNT(*) as versoes
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
GROUP BY routine_name
ORDER BY routine_name;

-- 4. VERIFICAR SE TABELAS CRÍTICAS EXISTEM
SELECT 
  'profiles' as tabela,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') as existe
UNION ALL
SELECT 
  'clientes',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'clientes')
UNION ALL
SELECT 
  'servicos',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'servicos')
UNION ALL
SELECT 
  'agendamentos',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamentos')
UNION ALL
SELECT 
  'funcionario_servicos',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionario_servicos')
UNION ALL
SELECT 
  'n8n_chat_histories',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'n8n_chat_histories');

-- 5. VERIFICAR COLUNA funcionario_id EM agendamentos
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agendamentos'
  AND column_name = 'funcionario_id';

-- =====================================================
-- RESULTADO: Você saberá o que falta criar
-- =====================================================


