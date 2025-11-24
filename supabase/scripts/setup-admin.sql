-- ========================================
-- SETUP: Configurar usuário admin após criação manual
-- Execute este script APÓS criar o usuário via Dashboard
-- ========================================

-- 1. Atualizar role para admin e configurar nome
UPDATE profiles 
SET 
  role = 'admin',
  nome = 'Liz Martins',
  ativo = true
WHERE email = 'admin@pinkopal.dev';

-- 2. Verificar se usuário admin foi configurado corretamente
SELECT 
  id,
  email,
  nome,
  role,
  ativo,
  created_at
FROM profiles 
WHERE email = 'admin@pinkopal.dev';

-- 3. Verificar policies (deve retornar as policies criadas)
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'agendamentos')
ORDER BY tablename, cmd;

-- 4. Testar se RLS está funcionando
-- (Este teste só funciona se você estiver logado como admin)
-- SELECT * FROM profiles; -- Admin deve ver todos
-- SELECT * FROM agendamentos; -- Admin deve ver todos

-- ========================================
-- RESULTADO ESPERADO
-- ========================================
-- Se tudo estiver correto, você deve ver:
-- ✅ 1 registro em profiles com role = 'admin'
-- ✅ 14 policies criadas (profiles + agendamentos)
-- ✅ RLS habilitado em profiles e agendamentos


