-- =====================================================
-- REMOVER TRIGGERS DUPLICADOS
-- Baseado na auditoria que encontrou:
-- - trigger_log_agendamento_operations x3
-- - trigger_update_cliente_stats x3  
-- - trigger_normalizar_telefone_clientes x2
-- - trigger_validate_mensagem x2
-- =====================================================

-- IMPORTANTE: Execute este script SOMENTE após revisar a investigação!

-- 1. Listar triggers antes da remoção
-- =====================================================
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 2. Remover triggers duplicados em agendamentos
-- =====================================================
-- Manter apenas AFTER INSERT (ou escolher qual manter)
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  RAISE NOTICE '🧹 Limpando triggers duplicados...';
  RAISE NOTICE ' ';
  
  -- Verificar quantos existem antes
  SELECT COUNT(*) INTO v_count
  FROM information_schema.triggers
  WHERE trigger_name = 'trigger_log_agendamento_operations';
  
  IF v_count > 1 THEN
    RAISE NOTICE '⚠️  trigger_log_agendamento_operations: % duplicatas encontradas', v_count;
    
    -- Remover TODOS
    DROP TRIGGER IF EXISTS trigger_log_agendamento_operations ON agendamentos;
    RAISE NOTICE '✅ Removidos todos trigger_log_agendamento_operations';
    
    -- Se a função for útil, você pode recriar apenas 1 trigger depois
    -- Senão, remova a função também (veja script cleanup-orphan-triggers.sql)
  ELSE
    RAISE NOTICE '✅ trigger_log_agendamento_operations: OK (apenas %)', v_count;
  END IF;
  
  -- trigger_update_cliente_stats
  SELECT COUNT(*) INTO v_count
  FROM information_schema.triggers
  WHERE trigger_name = 'trigger_update_cliente_stats';
  
  IF v_count > 1 THEN
    RAISE NOTICE '⚠️  trigger_update_cliente_stats: % duplicatas encontradas', v_count;
    
    DROP TRIGGER IF EXISTS trigger_update_cliente_stats ON agendamentos;
    RAISE NOTICE '✅ Removidos todos trigger_update_cliente_stats';
  ELSE
    RAISE NOTICE '✅ trigger_update_cliente_stats: OK (apenas %)', v_count;
  END IF;
  
END $$;

-- 3. Remover triggers duplicados em clientes
-- =====================================================
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- trigger_normalizar_telefone_clientes
  SELECT COUNT(*) INTO v_count
  FROM information_schema.triggers
  WHERE trigger_name = 'trigger_normalizar_telefone_clientes';
  
  IF v_count > 1 THEN
    RAISE NOTICE '⚠️  trigger_normalizar_telefone_clientes: % duplicatas encontradas', v_count;
    
    DROP TRIGGER IF EXISTS trigger_normalizar_telefone_clientes ON clientes;
    RAISE NOTICE '✅ Removidos todos trigger_normalizar_telefone_clientes';
    
    -- Recriar apenas 1 (este É necessário!)
    CREATE TRIGGER trigger_normalizar_telefone_clientes
      BEFORE INSERT OR UPDATE ON clientes
      FOR EACH ROW
      EXECUTE FUNCTION normalizar_telefone_clientes();
    
    RAISE NOTICE '✅ Recriado trigger_normalizar_telefone_clientes (apenas 1)';
  ELSE
    RAISE NOTICE '✅ trigger_normalizar_telefone_clientes: OK (apenas %)', v_count;
  END IF;
  
END $$;

-- 4. Remover triggers duplicados em historico_conversas
-- =====================================================
DO $$
DECLARE
  v_count INTEGER;
  v_exists BOOLEAN;
BEGIN
  -- Verificar se tabela existe
  SELECT EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'historico_conversas'
  ) INTO v_exists;
  
  IF v_exists THEN
    -- trigger_validate_mensagem
    SELECT COUNT(*) INTO v_count
    FROM information_schema.triggers
    WHERE trigger_name = 'trigger_validate_mensagem';
    
    IF v_count > 1 THEN
      RAISE NOTICE '⚠️  trigger_validate_mensagem: % duplicatas encontradas', v_count;
      
      DROP TRIGGER IF EXISTS trigger_validate_mensagem ON historico_conversas;
      RAISE NOTICE '✅ Removidos todos trigger_validate_mensagem';
    ELSE
      RAISE NOTICE '✅ trigger_validate_mensagem: OK (apenas %)', v_count;
    END IF;
  ELSE
    RAISE NOTICE '❌ historico_conversas não existe, nada a fazer';
  END IF;
  
END $$;

-- 5. Verificar resultado
-- =====================================================
DO $$
DECLARE
  v_total INTEGER;
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '📊 RESULTADO FINAL:';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
  
  SELECT COUNT(*) INTO v_total
  FROM information_schema.triggers
  WHERE trigger_schema = 'public';
  
  RAISE NOTICE 'Total de triggers agora: %', v_total;
  RAISE NOTICE ' ';
  RAISE NOTICE 'Execute novamente a query de listagem para verificar!';
END $$;

-- Listar triggers após limpeza
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- FIM DA REMOÇÃO DE DUPLICATAS
-- =====================================================


