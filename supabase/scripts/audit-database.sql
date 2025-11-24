-- =====================================================
-- SCRIPT DE AUDITORIA DO BANCO DE DADOS
-- Data: 24/11/2025
-- Objetivo: Listar tudo que existe no banco
-- =====================================================

-- 1. LISTAR TODAS AS TABELAS
-- =====================================================
SELECT 
  tablename as nome_tabela,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. LISTAR TODAS AS VIEWS
-- =====================================================
SELECT table_name as nome_view
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. LISTAR TODAS AS FUNCTIONS (RPCs)
-- =====================================================
SELECT 
  routine_name as nome_funcao,
  routine_type as tipo,
  data_type as retorno
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 4. LISTAR FUNCTIONS DUPLICADAS (OVERLOADS)
-- =====================================================
SELECT 
  routine_name as nome_funcao, 
  COUNT(*) as numero_versoes,
  array_agg(DISTINCT data_type) as tipos_retorno
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
GROUP BY routine_name
HAVING COUNT(*) > 1
ORDER BY numero_versoes DESC, routine_name;

-- 5. LISTAR COLUNAS DE CADA TABELA PRINCIPAL
-- =====================================================

-- profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- clientes  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'clientes'
ORDER BY ordinal_position;

-- servicos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'servicos'
ORDER BY ordinal_position;

-- agendamentos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agendamentos'
ORDER BY ordinal_position;

-- funcionario_servicos (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionario_servicos') THEN
    RAISE NOTICE '=== COLUNAS DE funcionario_servicos ===';
    -- A query real será executada separadamente
  ELSE
    RAISE NOTICE '⚠️ TABELA funcionario_servicos NÃO EXISTE';
  END IF;
END $$;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'funcionario_servicos'
ORDER BY ordinal_position;

-- 6. VERIFICAR FOREIGN KEYS
-- =====================================================
SELECT
  tc.table_name as tabela,
  kcu.column_name as coluna,
  ccu.table_name AS tabela_referenciada,
  ccu.column_name AS coluna_referenciada
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 7. VERIFICAR ÍNDICES
-- =====================================================
SELECT
  tablename as tabela,
  indexname as indice,
  indexdef as definicao
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 8. VERIFICAR POLICIES (RLS)
-- =====================================================
SELECT 
  tablename as tabela,
  policyname as policy,
  permissive,
  roles,
  cmd as comando,
  qual as condicao
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 9. CONTAR REGISTROS EM CADA TABELA
-- =====================================================
-- Usando query dinâmica para evitar erros se tabela não existir
DO $$
DECLARE
  r RECORD;
  v_count INTEGER;
BEGIN
  RAISE NOTICE '=== CONTAGEM DE REGISTROS ===';
  
  -- profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    SELECT COUNT(*) INTO v_count FROM profiles;
    RAISE NOTICE 'profiles: % registros', v_count;
  ELSE
    RAISE NOTICE 'profiles: TABELA NÃO EXISTE';
  END IF;
  
  -- clientes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clientes') THEN
    SELECT COUNT(*) INTO v_count FROM clientes;
    RAISE NOTICE 'clientes: % registros', v_count;
  ELSE
    RAISE NOTICE 'clientes: TABELA NÃO EXISTE';
  END IF;
  
  -- servicos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'servicos') THEN
    SELECT COUNT(*) INTO v_count FROM servicos;
    RAISE NOTICE 'servicos: % registros', v_count;
  ELSE
    RAISE NOTICE 'servicos: TABELA NÃO EXISTE';
  END IF;
  
  -- agendamentos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamentos') THEN
    SELECT COUNT(*) INTO v_count FROM agendamentos;
    RAISE NOTICE 'agendamentos: % registros', v_count;
  ELSE
    RAISE NOTICE 'agendamentos: TABELA NÃO EXISTE';
  END IF;
  
  -- funcionario_servicos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionario_servicos') THEN
    SELECT COUNT(*) INTO v_count FROM funcionario_servicos;
    RAISE NOTICE 'funcionario_servicos: % registros', v_count;
  ELSE
    RAISE NOTICE 'funcionario_servicos: TABELA NÃO EXISTE ⚠️';
  END IF;
  
  -- n8n_chat_histories
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'n8n_chat_histories') THEN
    SELECT COUNT(*) INTO v_count FROM n8n_chat_histories;
    RAISE NOTICE 'n8n_chat_histories: % registros', v_count;
  ELSE
    RAISE NOTICE 'n8n_chat_histories: TABELA NÃO EXISTE';
  END IF;
END $$;

-- 10. VERIFICAR TABELA atividades_dashboard (se existir)
-- =====================================================
SELECT 
  EXISTS(
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'atividades_dashboard'
  ) as tabela_atividades_existe;

-- Se existir, contar registros:
-- SELECT COUNT(*) FROM atividades_dashboard;

-- 11. LISTAR TRIGGERS
-- =====================================================
SELECT 
  event_object_table as tabela,
  trigger_name as trigger,
  event_manipulation as evento,
  action_timing as timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- FIM DA AUDITORIA
-- =====================================================

