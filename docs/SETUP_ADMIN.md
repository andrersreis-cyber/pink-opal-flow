# 🔐 Setup: Criar Usuário Admin

## Passo 1: Criar Usuário via Supabase Dashboard

1. **Acesse o Dashboard:**
   - URL: https://supabase.com/dashboard/project/uyffrwuerhwrpkyiydvd
   - Faça login se necessário

2. **Navegue até Authentication:**
   - Menu lateral > **Authentication** > **Users**

3. **Adicione Novo Usuário:**
   - Clique no botão **"Add User"** (canto superior direito)
   - Selecione **"Create new user"**

4. **Preencha os Dados:**
   ```
   Email Address: admin@pinkopal.dev
   Password: PinkOpal2024!
   ```

5. **Configurações Importantes:**
   - ✅ Marque **"Auto Confirm User"** (importante!)
   - Deixe os outros campos vazios

6. **Criar:**
   - Clique em **"Create user"**
   - Aguarde a confirmação

---

## Passo 2: Configurar Role de Admin

O usuário foi criado, mas com role padrão 'funcionario'. Vamos corrigir:

1. **Acesse o SQL Editor:**
   - Menu lateral > **SQL Editor**

2. **Execute este Script:**

```sql
-- Atualizar role para admin
UPDATE profiles 
SET 
  role = 'admin',
  nome = 'Liz Martins',
  ativo = true
WHERE email = 'admin@pinkopal.dev';

-- Verificar se funcionou
SELECT 
  id,
  email,
  nome,
  role,
  ativo,
  created_at
FROM profiles 
WHERE email = 'admin@pinkopal.dev';
```

3. **Resultado Esperado:**

Você deve ver algo como:

| id | email | nome | role | ativo | created_at |
|----|-------|------|------|-------|------------|
| [uuid] | admin@pinkopal.dev | Liz Martins | admin | true | [timestamp] |

---

## Passo 3: Validar Infraestrutura

Execute este script para validar tudo:

```sql
-- Verificar estrutura criada
SELECT 
  'Tabela profiles' as validacao,
  COUNT(*) as registros
FROM profiles
UNION ALL
SELECT 
  'Coluna funcionario_id em agendamentos',
  COUNT(*)
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
  AND column_name = 'funcionario_id'
UNION ALL
SELECT 
  'Policies criadas',
  COUNT(*)::text
FROM pg_policies 
WHERE tablename IN ('profiles', 'agendamentos');
```

**Resultado Esperado:**
- Tabela profiles: 1 registro
- Coluna funcionario_id: 1 (existe)
- Policies criadas: 14 (todas configuradas)

---

## ✅ Checklist de Validação

Marque cada item após confirmar:

- [ ] Usuário criado via Dashboard
- [ ] Email confirmado automaticamente
- [ ] Role atualizada para 'admin' via SQL
- [ ] Nome definido como 'Liz Martins'
- [ ] Profile aparece na query de validação
- [ ] Policies aparecem (14 total)

---

## 🔑 Credenciais Criadas

**Email:** `admin@pinkopal.dev`  
**Senha:** `PinkOpal2024!`  
**Nome:** Liz Martins  
**Role:** admin  

---

## 🚨 Troubleshooting

### Problema: Profile não foi criado
**Solução:** Execute manualmente:
```sql
INSERT INTO profiles (id, email, nome, role, ativo)
SELECT 
  id,
  email,
  'Liz Martins',
  'admin',
  true
FROM auth.users 
WHERE email = 'admin@pinkopal.dev'
ON CONFLICT (email) DO UPDATE
SET role = 'admin', nome = 'Liz Martins';
```

### Problema: Não consigo atualizar role
**Causa:** RLS pode estar bloqueando
**Solução:** Execute com permissões de service_role ou desabilite RLS temporariamente:
```sql
-- Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Fazer update
UPDATE profiles SET role = 'admin' WHERE email = 'admin@pinkopal.dev';

-- Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## 📋 Próximos Passos

Após concluir este setup:

1. ✅ Marco 1 concluído
2. 🔄 Passar para Marco 2: Implementar sistema de login no frontend
3. 🧪 Testar login com as credenciais criadas

---

**Quando terminar, me avise para continuarmos com o Marco 2!** 🚀

