-- ========================================
-- CRIAR USUÁRIO ADMIN INICIAL
-- Data: 2025-11-23
-- Descrição: Script para criar primeiro usuário admin
-- Email: admin@pinkopal.dev
-- Senha: PinkOpal2024!
-- ========================================

-- NOTA: Este script deve ser executado com permissões de service_role
-- ou através da interface do Supabase Dashboard

-- Passo 1: Criar usuário no auth.users
-- Este comando deve ser executado via Supabase Dashboard > Authentication > Add User
-- OU via API com service_role key

/*
COMANDO PARA EXECUTAR VIA SUPABASE DASHBOARD:
1. Ir em Authentication > Users
2. Clicar em "Add User"
3. Preencher:
   - Email: admin@pinkopal.dev
   - Password: PinkOpal2024!
   - Auto Confirm User: YES
4. Após criar, o trigger automaticamente criará o profile

OU VIA cURL (com SERVICE_ROLE_KEY):

curl -X POST 'https://uyffrwuerhwrpkyiydvd.supabase.co/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pinkopal.dev",
    "password": "PinkOpal2024!",
    "email_confirm": true,
    "user_metadata": {
      "nome": "Liz Martins",
      "role": "admin"
    }
  }'
*/

-- Passo 2: Se o profile não foi criado automaticamente pelo trigger,
-- criar manualmente (substitua o UUID pelo ID do usuário criado)

-- Verificar se admin já existe
DO $$
DECLARE
  v_user_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE email = 'admin@pinkopal.dev'
  ) INTO v_user_exists;
  
  IF v_user_exists THEN
    RAISE NOTICE '✅ Usuário admin já existe!';
  ELSE
    RAISE NOTICE '⚠️  Usuário admin NÃO encontrado. Crie via Supabase Dashboard.';
    RAISE NOTICE 'Email: admin@pinkopal.dev';
    RAISE NOTICE 'Senha: PinkOpal2024!';
  END IF;
END $$;

