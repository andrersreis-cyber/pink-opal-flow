-- RPC Function para criar usuários (alternativa à Edge Function)
-- Esta função pode ser chamada diretamente do frontend

CREATE OR REPLACE FUNCTION rpc_create_user(
  p_email TEXT,
  p_password TEXT,
  p_nome TEXT,
  p_role TEXT DEFAULT 'funcionario'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Verificar se usuário atual é admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem criar usuários';
  END IF;

  -- Validar role
  IF p_role NOT IN ('admin', 'funcionario') THEN
    RAISE EXCEPTION 'Role inválido. Use admin ou funcionario';
  END IF;

  -- Validar email
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email é obrigatório';
  END IF;

  -- Validar senha
  IF p_password IS NULL OR length(p_password) < 6 THEN
    RAISE EXCEPTION 'Senha deve ter no mínimo 6 caracteres';
  END IF;

  -- Validar nome
  IF p_nome IS NULL OR p_nome = '' THEN
    RAISE EXCEPTION 'Nome é obrigatório';
  END IF;

  -- Verificar se email já existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Este email já está cadastrado';
  END IF;

  -- Gerar UUID para o novo usuário
  v_user_id := gen_random_uuid();

  -- IMPORTANTE: Esta função não pode criar diretamente em auth.users
  -- O usuário precisa ser criado manualmente ou via Edge Function
  -- Por enquanto, apenas criamos o profile e retornamos instruções
  
  -- Criar profile
  INSERT INTO profiles (id, email, nome, role, ativo)
  VALUES (v_user_id, p_email, p_nome, p_role, true);

  -- Retornar instruções
  v_result := jsonb_build_object(
    'success', false,
    'profile_created', true,
    'user_id', v_user_id,
    'message', 'Profile criado. Para completar, crie o usuário no Supabase Auth Dashboard com este email: ' || p_email || ' e senha fornecida.',
    'instructions', jsonb_build_object(
      'step1', 'Vá para Authentication > Users no Dashboard',
      'step2', 'Clique em Add User',
      'step3', 'Email: ' || p_email,
      'step4', 'Password: (use a senha fornecida)',
      'step5', 'Marque Auto Confirm User',
      'step6', 'O sistema atualizará automaticamente o profile com o ID correto'
    )
  );

  RETURN v_result;
END;
$$;

-- Comentário sobre limitação
COMMENT ON FUNCTION rpc_create_user IS 'Função RPC para criar usuários. LIMITAÇÃO: Não pode criar em auth.users diretamente. Use Edge Function ou Dashboard manual.';


