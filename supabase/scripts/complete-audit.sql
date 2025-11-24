-- =====================================================
-- AUDITORIA COMPLETA - Análise Profunda
-- Baseado nos triggers encontrados
-- =====================================================

-- 1. LISTAR TODAS AS TABELAS (incluindo as "escondidas")
-- =====================================================
SELECT 
  tablename as tabela,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename) as num_colunas
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 2. VERIFICAR TABELAS DESCOBERTAS PELOS TRIGGERS
-- =====================================================
SELECT 
  'historico_conversas' as tabela,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'historico_conversas') as existe
UNION ALL
SELECT 
  'agendamento_logs',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamento_logs')
UNION ALL
SELECT 
  'cliente_stats',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cliente_stats')
UNION ALL
SELECT 
  'conversas',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversas')
UNION ALL
SELECT 
  'mensagens',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens');

-- 3. ANALISAR TRIGGERS E SUAS FUNÇÕES
-- =====================================================
SELECT 
  event_object_table as tabela,
  trigger_name as trigger,
  event_manipulation as evento,
  action_timing as timing,
  action_statement as funcao_executada
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 4. VERIFICAR SE TRIGGERS SÃO USADOS
-- =====================================================
-- trigger_log_agendamento_operations → Grava logs?
SELECT 
  routine_name as funcao_trigger,
  routine_definition as codigo
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'trigger_agendamentos_updated_at',
    'log_agendamento_operations',
    'update_cliente_stats',
    'sync_chats',
    'sync_dados_cliente',
    'normalizar_telefone_clientes',
    'validate_mensagem',
    'set_updated_at'
  );

-- 5. VERIFICAR TABELA n8n_chat_histories vs outras de conversas
-- =====================================================
DO $$
DECLARE
  v_exists BOOLEAN;
  v_size TEXT;
BEGIN
  RAISE NOTICE '=== TABELAS DE CONVERSAS ===';
  
  -- n8n_chat_histories
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'n8n_chat_histories') INTO v_exists;
  IF v_exists THEN
    SELECT pg_size_pretty(pg_total_relation_size('n8n_chat_histories')) INTO v_size;
    RAISE NOTICE 'n8n_chat_histories: EXISTE (tamanho: %)', v_size;
  ELSE
    RAISE NOTICE 'n8n_chat_histories: NÃO EXISTE';
  END IF;
  
  -- historico_conversas
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'historico_conversas') INTO v_exists;
  IF v_exists THEN
    SELECT pg_size_pretty(pg_total_relation_size('historico_conversas')) INTO v_size;
    RAISE NOTICE 'historico_conversas: EXISTE (tamanho: %) ⚠️', v_size;
  ELSE
    RAISE NOTICE 'historico_conversas: NÃO EXISTE';
  END IF;
  
  -- conversas
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversas') INTO v_exists;
  IF v_exists THEN
    SELECT pg_size_pretty(pg_total_relation_size('conversas')) INTO v_size;
    RAISE NOTICE 'conversas: EXISTE (tamanho: %) ⚠️', v_size;
  ELSE
    RAISE NOTICE 'conversas: NÃO EXISTE';
  END IF;
  
  -- mensagens
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens') INTO v_exists;
  IF v_exists THEN
    SELECT pg_size_pretty(pg_total_relation_size('mensagens')) INTO v_size;
    RAISE NOTICE 'mensagens: EXISTE (tamanho: %) ⚠️', v_size;
  ELSE
    RAISE NOTICE 'mensagens: NÃO EXISTE';
  END IF;
  
END $$;

-- 6. LISTAR COLUNAS DE historico_conversas (se existir)
-- =====================================================
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'historico_conversas') THEN
    RAISE NOTICE ' ';
    RAISE NOTICE '=== COLUNAS DE historico_conversas ===';
    -- A query de colunas será executada separadamente se necessário
  END IF;
END $$;

-- Se quiser ver as colunas, descomente abaixo (só execute se a tabela existir):
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'historico_conversas'
-- ORDER BY ordinal_position;

-- 7. VERIFICAR SE HÁ TABELAS DE LOG
-- =====================================================
SELECT 
  tablename as tabela_log,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho
FROM pg_tables 
WHERE schemaname = 'public' 
  AND (
    tablename LIKE '%log%' 
    OR tablename LIKE '%audit%'
    OR tablename LIKE '%history%'
  )
ORDER BY tablename;

-- 8. ANALISAR FUNÇÃO normalizar_telefone_clientes
-- =====================================================
SELECT 
  routine_name as funcao,
  data_type as retorno,
  routine_definition as codigo
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%normalizar%telefone%';

-- 9. VERIFICAR VIEWS RELACIONADAS A CONVERSAS
-- =====================================================
SELECT 
  table_name as view_name,
  view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
  AND (
    table_name LIKE '%conversa%'
    OR table_name LIKE '%mensagem%'
    OR table_name LIKE '%chat%'
  )
ORDER BY table_name;

-- 10. CONTAR REGISTROS NAS TABELAS QUE EXISTEM
-- =====================================================
DO $$
DECLARE
  v_count INTEGER;
  v_exists BOOLEAN;
BEGIN
  RAISE NOTICE '=== CONTAGEM DE REGISTROS ===';
  
  -- profiles
  SELECT COUNT(*) INTO v_count FROM profiles;
  RAISE NOTICE 'profiles: % registros', v_count;
  
  -- clientes
  SELECT COUNT(*) INTO v_count FROM clientes;
  RAISE NOTICE 'clientes: % registros', v_count;
  
  -- servicos
  SELECT COUNT(*) INTO v_count FROM servicos;
  RAISE NOTICE 'servicos: % registros', v_count;
  
  -- agendamentos
  SELECT COUNT(*) INTO v_count FROM agendamentos;
  RAISE NOTICE 'agendamentos: % registros', v_count;
  
  -- n8n_chat_histories
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'n8n_chat_histories') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM n8n_chat_histories' INTO v_count;
    RAISE NOTICE 'n8n_chat_histories: % registros', v_count;
  ELSE
    RAISE NOTICE 'n8n_chat_histories: NÃO EXISTE';
  END IF;
  
  -- funcionario_servicos
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionario_servicos') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM funcionario_servicos' INTO v_count;
    RAISE NOTICE 'funcionario_servicos: % registros', v_count;
  ELSE
    RAISE NOTICE 'funcionario_servicos: ⚠️ NÃO EXISTE (precisa aplicar migration v6)';
  END IF;
  
  RAISE NOTICE ' ';
  RAISE NOTICE '=== TABELAS DESCOBERTAS PELOS TRIGGERS ===';
  
  -- agendamento_logs
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamento_logs') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM agendamento_logs' INTO v_count;
    RAISE NOTICE 'agendamento_logs: % registros ⚠️', v_count;
  ELSE
    RAISE NOTICE 'agendamento_logs: NÃO EXISTE (trigger pode estar órfão)';
  END IF;
  
  -- cliente_stats
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cliente_stats') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM cliente_stats' INTO v_count;
    RAISE NOTICE 'cliente_stats: % registros ⚠️', v_count;
  ELSE
    RAISE NOTICE 'cliente_stats: NÃO EXISTE (trigger pode estar órfão)';
  END IF;
  
  -- historico_conversas
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'historico_conversas') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM historico_conversas' INTO v_count;
    RAISE NOTICE 'historico_conversas: % registros ⚠️ (duplicata?)', v_count;
  ELSE
    RAISE NOTICE 'historico_conversas: NÃO EXISTE (trigger pode estar órfão)';
  END IF;
  
  -- conversas
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversas') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM conversas' INTO v_count;
    RAISE NOTICE 'conversas: % registros ⚠️ (antiga?)', v_count;
  ELSE
    RAISE NOTICE 'conversas: NÃO EXISTE';
  END IF;
  
  -- mensagens
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM mensagens' INTO v_count;
    RAISE NOTICE 'mensagens: % registros ⚠️ (antiga?)', v_count;
  ELSE
    RAISE NOTICE 'mensagens: NÃO EXISTE';
  END IF;
  
END $$;

-- =====================================================
-- FIM DA AUDITORIA COMPLETA
-- =====================================================

