-- =====================================================
-- SCRIPT DE LIMPEZA DO BANCO DE DADOS
-- Data: 24/11/2025
-- Objetivo: Remover tudo que não é usado
-- =====================================================

-- ⚠️ ATENÇÃO: Execute este script com cuidado!
-- Faça backup antes de executar.

-- =====================================================
-- FASE 1: REMOVER VIEWS NÃO UTILIZADAS
-- =====================================================

-- Remover view vw_agendamentos_completos se ainda existir
DROP VIEW IF EXISTS vw_agendamentos_completos CASCADE;

COMMENT ON VIEW vw_agendamentos_completos IS 'REMOVIDA: Substituída por queries diretas com RLS';

-- =====================================================
-- FASE 2: REMOVER FUNÇÕES DUPLICADAS (OVERLOADS)
-- =====================================================

-- Verificar e remover versões antigas de criar_agendamento_validado
-- Manter apenas a versão mais recente (com p_funcionario_id)

-- Listar todas as assinaturas:
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'criar_agendamento_validado';

-- CUIDADO: Só execute se houver duplicatas
-- DROP FUNCTION IF EXISTS criar_agendamento_validado(BIGINT, TEXT, TEXT, TEXT) CASCADE;
-- (Ajuste os parâmetros conforme necessário)

-- =====================================================
-- FASE 3: VERIFICAR TABELA atividades_dashboard
-- =====================================================

-- Primeiro, verificar se existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'atividades_dashboard'
  ) THEN
    -- Verificar quantos registros tem
    RAISE NOTICE 'Tabela atividades_dashboard existe. Verificando registros...';
    
    -- Descomentar para ver quantidade:
    -- SELECT COUNT(*) FROM atividades_dashboard;
    
    RAISE NOTICE 'Se não for usada, execute: DROP TABLE IF EXISTS atividades_dashboard CASCADE;';
  ELSE
    RAISE NOTICE 'Tabela atividades_dashboard não existe.';
  END IF;
END $$;

-- Se decidir remover (após confirmar que não é usada):
-- DROP TABLE IF EXISTS atividades_dashboard CASCADE;

-- =====================================================
-- FASE 4: REMOVER TABELAS OBSOLETAS
-- =====================================================

-- Remover tabelas de testes antigas (se existirem)
DROP TABLE IF EXISTS test_agendamentos CASCADE;
DROP TABLE IF EXISTS temp_migration CASCADE;
DROP TABLE IF EXISTS backup_agendamentos CASCADE;

-- =====================================================
-- FASE 5: LIMPAR ÍNDICES NÃO UTILIZADOS
-- =====================================================

-- Verificar índices duplicados ou não utilizados
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname NOT LIKE 'pg_%'
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- Remover índices específicos se forem duplicados
-- Exemplo (ajuste conforme necessário):
-- DROP INDEX IF EXISTS idx_duplicate_index;

-- =====================================================
-- FASE 6: OTIMIZAR SEQUENCES
-- =====================================================

-- Resetar sequences se quiser começar do zero (CUIDADO!)
-- Não execute se houver dados que você quer manter!

-- ALTER SEQUENCE agendamentos_id_seq RESTART WITH 1;
-- ALTER SEQUENCE funcionario_servicos_id_seq RESTART WITH 1;
-- ALTER SEQUENCE n8n_chat_histories_id_seq RESTART WITH 1;

-- Manter sequence de clientes começando de 2 (se você é o cliente 1)
-- ALTER SEQUENCE clientes_id_seq RESTART WITH 2;

-- =====================================================
-- FASE 7: VACUUM E ANALYZE
-- =====================================================

-- Limpar espaço físico e atualizar estatísticas
VACUUM ANALYZE profiles;
VACUUM ANALYZE clientes;
VACUUM ANALYZE servicos;
VACUUM ANALYZE agendamentos;
VACUUM ANALYZE funcionario_servicos;
VACUUM ANALYZE n8n_chat_histories;

-- =====================================================
-- FASE 8: VERIFICAR INTEGRIDADE
-- =====================================================

-- Verificar foreign keys quebradas
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Verificar agendamentos sem cliente
  SELECT COUNT(*) INTO r FROM agendamentos a
  WHERE NOT EXISTS (SELECT 1 FROM clientes c WHERE c.id = a.cliente_id);
  
  IF r > 0 THEN
    RAISE WARNING 'Existem % agendamentos com cliente_id inválido', r;
  END IF;
  
  -- Verificar agendamentos sem serviço
  SELECT COUNT(*) INTO r FROM agendamentos a
  WHERE NOT EXISTS (SELECT 1 FROM servicos s WHERE s.id = a.servico_id);
  
  IF r > 0 THEN
    RAISE WARNING 'Existem % agendamentos com servico_id inválido', r;
  END IF;
  
  -- Verificar agendamentos sem funcionário
  SELECT COUNT(*) INTO r FROM agendamentos a
  WHERE a.funcionario_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = a.funcionario_id);
  
  IF r > 0 THEN
    RAISE WARNING 'Existem % agendamentos com funcionario_id inválido', r;
  END IF;
  
  -- Verificar funcionario_servicos sem funcionário
  SELECT COUNT(*) INTO r FROM funcionario_servicos fs
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = fs.funcionario_id);
  
  IF r > 0 THEN
    RAISE WARNING 'Existem % registros em funcionario_servicos com funcionario_id inválido', r;
  END IF;
  
  -- Verificar funcionario_servicos sem serviço
  SELECT COUNT(*) INTO r FROM funcionario_servicos fs
  WHERE NOT EXISTS (SELECT 1 FROM servicos s WHERE s.id = fs.servico_id);
  
  IF r > 0 THEN
    RAISE WARNING 'Existem % registros em funcionario_servicos com servico_id inválido', r;
  END IF;
  
  RAISE NOTICE 'Verificação de integridade concluída!';
END $$;

-- =====================================================
-- FASE 9: RECRIAR ESTATÍSTICAS
-- =====================================================

ANALYZE profiles;
ANALYZE clientes;
ANALYZE servicos;
ANALYZE agendamentos;
ANALYZE funcionario_servicos;
ANALYZE n8n_chat_histories;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

SELECT 
  'Limpeza concluída!' as status,
  NOW() as data_hora;

-- Mostrar tamanho do banco após limpeza
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as tamanho_banco;

-- Mostrar quantidade de registros
SELECT 
  'profiles' as tabela, 
  COUNT(*) as registros 
FROM profiles
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'servicos', COUNT(*) FROM servicos
UNION ALL
SELECT 'agendamentos', COUNT(*) FROM agendamentos
UNION ALL
SELECT 'funcionario_servicos', COUNT(*) FROM funcionario_servicos
UNION ALL
SELECT 'n8n_chat_histories', COUNT(*) FROM n8n_chat_histories
ORDER BY tabela;

-- =====================================================
-- FIM DA LIMPEZA
-- =====================================================


