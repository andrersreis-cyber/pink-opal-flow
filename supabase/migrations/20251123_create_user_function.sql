-- Função para criar novo usuário (requer role admin)
-- Esta função usa security definer para ter permissões elevadas

CREATE OR REPLACE FUNCTION criar_usuario(
  p_email TEXT,
  p_senha TEXT,
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
  v_profile JSONB;
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

  -- Gerar UUID para o novo usuário
  v_user_id := gen_random_uuid();

  -- Inserir usuário no auth.users (via INSERT direto, não via API)
  -- NOTA: Esta abordagem pode não funcionar em todos os ambientes Supabase
  -- Alternativa: Usar uma Edge Function com service_role key
  
  -- Por enquanto, vamos apenas criar o profile e retornar instruções
  -- para o usuário criar manualmente via Dashboard
  
  -- Inserir profile
  INSERT INTO profiles (id, email, nome, role, ativo)
  VALUES (v_user_id, p_email, p_nome, p_role::TEXT, true)
  RETURNING jsonb_build_object(
    'id', id,
    'email', email,
    'nome', nome,
    'role', role,
    'mensagem', 'Profile criado. Crie o usuário correspondente no Supabase Auth Dashboard.'
  ) INTO v_profile;

  RETURN v_profile;
END;
$$;

-- Comentário: Esta função tem limitações pois não pode criar usuários no auth.users
-- Solução recomendada: Criar uma Edge Function com service_role key

