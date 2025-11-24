-- =====================================================
-- AUDITORIA SEGURA - Sem erros garantido!
-- =====================================================

-- 1. TABELAS QUE EXISTEM
-- =====================================================
SELECT 
  tablename as tabela,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. VIEWS QUE EXISTEM
-- =====================================================
SELECT table_name as view_name
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. FUNCTIONS (RPCs)
-- =====================================================
SELECT 
  routine_name as funcao,
  COUNT(*) as versoes
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
GROUP BY routine_name
ORDER BY routine_name;

-- 4. TRIGGERS ATIVOS
-- =====================================================
SELECT 
  event_object_table as tabela,
  trigger_name as trigger
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 5. DIAGNÓSTICO COMPLETO VIA DO BLOCK
-- =====================================================
DO $$
DECLARE
  v_count INTEGER;
  v_exists BOOLEAN;
  v_size TEXT;
BEGIN
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║         DIAGNÓSTICO COMPLETO DO BANCO DE DADOS         ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE ' ';
  
  -- ===== TABELAS PRINCIPAIS =====
  RAISE NOTICE '📊 TABELAS PRINCIPAIS:';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
  
  SELECT COUNT(*) INTO v_count FROM profiles;
  RAISE NOTICE '✅ profiles: % registros', v_count;
  
  SELECT COUNT(*) INTO v_count FROM clientes;
  RAISE NOTICE '✅ clientes: % registros', v_count;
  
  SELECT COUNT(*) INTO v_count FROM servicos;
  RAISE NOTICE '✅ servicos: % registros', v_count;
  
  SELECT COUNT(*) INTO v_count FROM agendamentos;
  RAISE NOTICE '✅ agendamentos: % registros', v_count;
  
  RAISE NOTICE ' ';
  
  -- ===== TABELAS DE CONVERSAS =====
  RAISE NOTICE '💬 TABELAS DE CONVERSAS:';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
  
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'n8n_chat_histories') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM n8n_chat_histories' INTO v_count;
    SELECT pg_size_pretty(pg_total_relation_size('n8n_chat_histories')) INTO v_size;
    RAISE NOTICE '✅ n8n_chat_histories: % registros (tamanho: %)', v_count, v_size;
  ELSE
    RAISE NOTICE '❌ n8n_chat_histories: NÃO EXISTE';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'historico_conversas') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM historico_conversas' INTO v_count;
    RAISE NOTICE '⚠️  historico_conversas: % registros (DUPLICATA?)', v_count;
  ELSE
    RAISE NOTICE '✅ historico_conversas: NÃO EXISTE (OK)';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversas') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM conversas' INTO v_count;
    RAISE NOTICE '⚠️  conversas: % registros (ANTIGA?)', v_count;
  ELSE
    RAISE NOTICE '✅ conversas: NÃO EXISTE (OK)';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'mensagens') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM mensagens' INTO v_count;
    RAISE NOTICE '⚠️  mensagens: % registros (ANTIGA?)', v_count;
  ELSE
    RAISE NOTICE '✅ mensagens: NÃO EXISTE (OK)';
  END IF;
  
  RAISE NOTICE ' ';
  
  -- ===== VERSÃO 6 =====
  RAISE NOTICE '🎯 RECURSOS DA VERSÃO 6:';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
  
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionario_servicos') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM funcionario_servicos' INTO v_count;
    RAISE NOTICE '✅ funcionario_servicos: % registros', v_count;
  ELSE
    RAISE NOTICE '❌ funcionario_servicos: NÃO EXISTE';
    RAISE NOTICE '   ➜ Precisa aplicar migration: 20251123_funcionario_servicos.sql';
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'listar_funcionarios_por_servico'
  ) INTO v_exists;
  IF v_exists THEN
    RAISE NOTICE '✅ listar_funcionarios_por_servico: EXISTE';
  ELSE
    RAISE NOTICE '❌ listar_funcionarios_por_servico: NÃO EXISTE';
    RAISE NOTICE '   ➜ Precisa aplicar migration: 20251123_rpc_funcionario_servicos.sql';
  END IF;
  
  RAISE NOTICE ' ';
  
  -- ===== TABELAS DE LOG/AUDITORIA =====
  RAISE NOTICE '📝 TABELAS DE LOG/AUDITORIA:';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
  
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamento_logs') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM agendamento_logs' INTO v_count;
    RAISE NOTICE '⚠️  agendamento_logs: % registros (trigger órfão?)', v_count;
  ELSE
    RAISE NOTICE '✅ agendamento_logs: NÃO EXISTE';
    RAISE NOTICE '   ⚠️  Mas trigger "log_agendamento_operations" pode estar órfão!';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cliente_stats') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM cliente_stats' INTO v_count;
    RAISE NOTICE '⚠️  cliente_stats: % registros (trigger órfão?)', v_count;
  ELSE
    RAISE NOTICE '✅ cliente_stats: NÃO EXISTE';
    RAISE NOTICE '   ⚠️  Mas trigger "update_cliente_stats" pode estar órfão!';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'atividades_dashboard') INTO v_exists;
  IF v_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM atividades_dashboard' INTO v_count;
    RAISE NOTICE '⚠️  atividades_dashboard: % registros (usar?)', v_count;
  ELSE
    RAISE NOTICE '✅ atividades_dashboard: NÃO EXISTE (OK)';
  END IF;
  
  RAISE NOTICE ' ';
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                  FIM DO DIAGNÓSTICO                    ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  
END $$;

-- =====================================================
-- FIM DA AUDITORIA SEGURA
-- =====================================================


