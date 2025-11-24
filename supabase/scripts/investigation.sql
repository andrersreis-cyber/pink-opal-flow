-- =====================================================
-- INVESTIGAÇÃO PROFUNDA - Descobrir o que pode ser removido
-- =====================================================

-- 1. COMPARAR ESTRUTURAS DE CONVERSAS
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║              INVESTIGAÇÃO PROFUNDA                     ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE ' ';
  RAISE NOTICE '📋 COMPARANDO ESTRUTURAS DE TABELAS DE CONVERSAS:';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
END $$;

-- Estrutura de historico_conversas
SELECT 
  '🔹 historico_conversas' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'historico_conversas'
ORDER BY ordinal_position;

-- Estrutura de n8n_chat_histories
SELECT 
  '🔹 n8n_chat_histories' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'n8n_chat_histories'
ORDER BY ordinal_position;

-- 2. CONTAR REGISTROS
-- =====================================================
DO $$
DECLARE
  v_historico INTEGER;
  v_n8n INTEGER;
  v_profiles INTEGER;
  v_clientes INTEGER;
  v_servicos INTEGER;
  v_agendamentos INTEGER;
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '📊 CONTAGEM DE REGISTROS:';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
  
  EXECUTE 'SELECT COUNT(*) FROM historico_conversas' INTO v_historico;
  EXECUTE 'SELECT COUNT(*) FROM n8n_chat_histories' INTO v_n8n;
  SELECT COUNT(*) INTO v_profiles FROM profiles;
  SELECT COUNT(*) INTO v_clientes FROM clientes;
  SELECT COUNT(*) INTO v_servicos FROM servicos;
  SELECT COUNT(*) INTO v_agendamentos FROM agendamentos;
  
  RAISE NOTICE 'historico_conversas: % registros', v_historico;
  RAISE NOTICE 'n8n_chat_histories: % registros', v_n8n;
  RAISE NOTICE 'profiles: % registros', v_profiles;
  RAISE NOTICE 'clientes: % registros', v_clientes;
  RAISE NOTICE 'servicos: % registros', v_servicos;
  RAISE NOTICE 'agendamentos: % registros', v_agendamentos;
  
  RAISE NOTICE ' ';
  IF v_historico = v_n8n AND v_historico > 0 THEN
    RAISE NOTICE '⚠️  ALERTA: historico_conversas e n8n_chat_histories têm o mesmo número de registros!';
    RAISE NOTICE '   Possível duplicata. Verificar conteúdo!';
  ELSIF v_historico > 0 AND v_n8n = 0 THEN
    RAISE NOTICE '⚠️  ALERTA: historico_conversas tem dados mas n8n_chat_histories está vazio!';
    RAISE NOTICE '   Pode ser tabela antiga que precisa migração.';
  ELSIF v_historico = 0 AND v_n8n > 0 THEN
    RAISE NOTICE '✅ OK: n8n_chat_histories está em uso, historico_conversas vazio (pode remover).';
  END IF;
  
END $$;

-- 3. VERIFICAR TABELAS ÓRFÃS
-- =====================================================
DO $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '🔍 VERIFICANDO TABELAS ÓRFÃS (usadas por triggers):';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
  
  -- agendamento_logs
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamento_logs') INTO v_exists;
  IF v_exists THEN
    RAISE NOTICE '⚠️  agendamento_logs: EXISTE (trigger pode estar usando)';
  ELSE
    RAISE NOTICE '❌ agendamento_logs: NÃO EXISTE (trigger órfão!)';
  END IF;
  
  -- cliente_stats
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cliente_stats') INTO v_exists;
  IF v_exists THEN
    RAISE NOTICE '⚠️  cliente_stats: EXISTE (trigger pode estar usando)';
  ELSE
    RAISE NOTICE '❌ cliente_stats: NÃO EXISTE (trigger órfão!)';
  END IF;
  
END $$;

-- 4. VER CÓDIGO DOS TRIGGERS SUSPEITOS
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '📝 CÓDIGO DAS FUNÇÕES DE TRIGGER:';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
END $$;

-- log_agendamento_operations
SELECT 
  '🔸 log_agendamento_operations' as funcao,
  LEFT(routine_definition, 500) as primeiros_500_chars
FROM information_schema.routines
WHERE routine_name = 'log_agendamento_operations'
LIMIT 1;

-- update_cliente_stats
SELECT 
  '🔸 update_cliente_stats' as funcao,
  LEFT(routine_definition, 500) as primeiros_500_chars
FROM information_schema.routines
WHERE routine_name = 'update_cliente_stats'
LIMIT 1;

-- sync_chats
SELECT 
  '🔸 sync_chats' as funcao,
  LEFT(routine_definition, 500) as primeiros_500_chars
FROM information_schema.routines
WHERE routine_name = 'sync_chats'
LIMIT 1;

-- sync_dados_cliente
SELECT 
  '🔸 sync_dados_cliente' as funcao,
  LEFT(routine_definition, 500) as primeiros_500_chars
FROM information_schema.routines
WHERE routine_name = 'sync_dados_cliente'
LIMIT 1;

-- validate_mensagem
SELECT 
  '🔸 validate_mensagem' as funcao,
  LEFT(routine_definition, 500) as primeiros_500_chars
FROM information_schema.routines
WHERE routine_name = 'validate_mensagem'
LIMIT 1;

-- 5. ANÁLISE DO FRONTEND
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '💻 ANÁLISE: O que o FRONTEND usa?';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
  RAISE NOTICE '✅ useConversas.ts → Usa vw_conversas_formatadas (view)';
  RAISE NOTICE '✅ Realtime → Escuta n8n_chat_histories';
  RAISE NOTICE '❓ historico_conversas → NÃO encontrado em hooks';
  RAISE NOTICE ' ';
  RAISE NOTICE '🔍 CHECKLIST DE DECISÃO:';
  RAISE NOTICE ' ';
  RAISE NOTICE '[ ] Se historico_conversas estiver vazio → REMOVER';
  RAISE NOTICE '[ ] Se for duplicata de n8n_chat_histories → MIGRAR + REMOVER';
  RAISE NOTICE '[ ] Se agendamento_logs não existir → REMOVER trigger órfão';
  RAISE NOTICE '[ ] Se cliente_stats não existir → REMOVER trigger órfão';
  RAISE NOTICE '[ ] Se sync_chats referenciar historico_conversas → ATUALIZAR ou REMOVER';
  RAISE NOTICE ' ';
END $$;

-- 6. RESUMO DE TRIGGERS DUPLICADOS
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '⚠️  TRIGGERS DUPLICADOS ENCONTRADOS:';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
  RAISE NOTICE 'trigger_log_agendamento_operations → 3x (deve ter 1!)';
  RAISE NOTICE 'trigger_update_cliente_stats → 3x (deve ter 1!)';
  RAISE NOTICE 'trigger_normalizar_telefone_clientes → 2x (deve ter 1!)';
  RAISE NOTICE 'trigger_validate_mensagem → 2x (deve ter 1!)';
  RAISE NOTICE ' ';
  RAISE NOTICE '❗ AÇÃO: Remover duplicatas mantendo apenas 1 de cada.';
  RAISE NOTICE ' ';
END $$;

-- =====================================================
-- FIM DA INVESTIGAÇÃO
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           FIM DA INVESTIGAÇÃO PROFUNDA                 ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
END $$;


