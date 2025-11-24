-- =====================================================
-- CLEANUP FINAL - Limpeza Completa do Banco de Dados
-- =====================================================
-- 
-- Este script remove:
-- 1. Triggers duplicados
-- 2. Triggers órfãos (sem tabela de destino)
-- 3. Funções não utilizadas
-- 4. Tabela historico_conversas (duplicata)
-- 5. Otimiza o banco
-- 
-- ATENÇÃO: Execute apenas após revisar a investigação!
-- =====================================================

-- Criar backup de segurança (caso precise reverter)
-- RECOMENDADO: Fazer backup manual no painel do Supabase antes!

-- =====================================================
-- PARTE 1: REMOVER TRIGGERS DUPLICADOS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║              LIMPEZA FINAL DO BANCO                    ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE ' ';
  RAISE NOTICE '🧹 FASE 1: Removendo triggers duplicados...';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
END $$;

-- 1.1. Remover TODOS os triggers duplicados em agendamentos
DROP TRIGGER IF EXISTS trigger_log_agendamento_operations ON agendamentos;
DROP TRIGGER IF EXISTS trigger_update_cliente_stats ON agendamentos;

-- 1.2. Remover TODOS os triggers duplicados em clientes
DROP TRIGGER IF EXISTS trigger_normalizar_telefone_clientes ON clientes;

-- 1.3. Remover TODOS os triggers duplicados em historico_conversas
DROP TRIGGER IF EXISTS trigger_validate_mensagem ON historico_conversas;

-- 1.4. Recriar apenas o trigger NECESSÁRIO de normalização
CREATE TRIGGER trigger_normalizar_telefone_clientes
  BEFORE INSERT OR UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION normalizar_telefone_clientes();

DO $$
BEGIN
  RAISE NOTICE '✅ Triggers duplicados removidos';
  RAISE NOTICE '✅ trigger_normalizar_telefone_clientes recriado (1x apenas)';
  RAISE NOTICE ' ';
END $$;

-- =====================================================
-- PARTE 2: REMOVER TRIGGERS ÓRFÃOS E FUNÇÕES NÃO USADAS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '🧹 FASE 2: Removendo triggers órfãos e funções não usadas...';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
END $$;

-- 2.1. Remover triggers de sync (se não forem necessários)
DROP TRIGGER IF EXISTS sync_chats_trigger ON clientes;
DROP TRIGGER IF EXISTS sync_dados_cliente_trigger ON clientes;

-- 2.2. Remover funções órfãs
DROP FUNCTION IF EXISTS log_agendamento_operations() CASCADE;
DROP FUNCTION IF EXISTS update_cliente_stats() CASCADE;
DROP FUNCTION IF EXISTS sync_chats() CASCADE;
DROP FUNCTION IF EXISTS sync_dados_cliente() CASCADE;
DROP FUNCTION IF EXISTS validate_mensagem() CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✅ Funções órfãs removidas';
  RAISE NOTICE ' ';
END $$;

-- =====================================================
-- PARTE 3: REMOVER TABELA historico_conversas
-- =====================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  RAISE NOTICE '🧹 FASE 3: Removendo tabela historico_conversas...';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
  
  -- Verificar se tem dados
  EXECUTE 'SELECT COUNT(*) FROM historico_conversas' INTO v_count;
  
  IF v_count > 0 THEN
    RAISE NOTICE '⚠️  historico_conversas tem % registros!', v_count;
    RAISE NOTICE '   Se você precisa desses dados, PARE AQUI e faça backup!';
    RAISE NOTICE '   Caso contrário, a tabela será removida em 5 segundos...';
  ELSE
    RAISE NOTICE '✅ historico_conversas está vazia, seguro remover';
  END IF;
  
END $$;

-- ATENÇÃO: Comente esta linha se quiser preservar historico_conversas
DROP TABLE IF EXISTS historico_conversas CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✅ Tabela historico_conversas removida';
  RAISE NOTICE ' ';
END $$;

-- =====================================================
-- PARTE 4: REMOVER TABELAS ÓRFÃS (SE EXISTIREM)
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '🧹 FASE 4: Removendo tabelas órfãs (se existirem)...';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
END $$;

-- Remover apenas se não forem usadas
DROP TABLE IF EXISTS agendamento_logs CASCADE;
DROP TABLE IF EXISTS cliente_stats CASCADE;

-- Tabelas antigas que podem estar sem uso
DROP TABLE IF EXISTS conversas CASCADE;
DROP TABLE IF EXISTS mensagens CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✅ Tabelas órfãs removidas (se existiam)';
  RAISE NOTICE ' ';
END $$;

-- =====================================================
-- PARTE 5: VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
  v_triggers INTEGER;
  v_tables INTEGER;
  v_functions INTEGER;
BEGIN
  RAISE NOTICE '📊 VERIFICAÇÃO FINAL:';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
  
  -- Contar triggers
  SELECT COUNT(*) INTO v_triggers
  FROM information_schema.triggers
  WHERE trigger_schema = 'public';
  
  -- Contar tabelas
  SELECT COUNT(*) INTO v_tables
  FROM pg_tables
  WHERE schemaname = 'public';
  
  -- Contar funções
  SELECT COUNT(*) INTO v_functions
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION';
  
  RAISE NOTICE '✅ Triggers ativos: %', v_triggers;
  RAISE NOTICE '✅ Tabelas: %', v_tables;
  RAISE NOTICE '✅ Funções: %', v_functions;
  RAISE NOTICE ' ';
  
END $$;

-- =====================================================
-- PARTE 6: OTIMIZAÇÃO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '🚀 FASE 5: Otimizando banco de dados...';
  RAISE NOTICE '─────────────────────────────────────────────────────────';
END $$;

-- Atualizar estatísticas e recuperar espaço
VACUUM ANALYZE;

DO $$
BEGIN
  RAISE NOTICE '✅ VACUUM ANALYZE concluído';
  RAISE NOTICE ' ';
  RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           LIMPEZA CONCLUÍDA COM SUCESSO!               ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
  RAISE NOTICE ' ';
  RAISE NOTICE '📋 PRÓXIMO PASSO: Aplicar migrations da versão 6';
  RAISE NOTICE '   1. supabase/migrations/20251123_funcionario_servicos.sql';
  RAISE NOTICE '   2. supabase/migrations/20251123_rpc_funcionario_servicos.sql';
  RAISE NOTICE ' ';
END $$;

-- =====================================================
-- LISTAR O QUE RESTOU
-- =====================================================

-- Tabelas finais
SELECT 
  '📊 TABELAS RESTANTES' as info,
  tablename as nome,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Triggers finais
SELECT 
  '🔧 TRIGGERS RESTANTES' as info,
  event_object_table as tabela,
  trigger_name as trigger
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- FIM DO CLEANUP
-- =====================================================


