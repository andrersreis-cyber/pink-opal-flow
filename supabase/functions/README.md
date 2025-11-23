# Edge Functions - Pink Opal Flow

## create-user

Edge Function para criar usuários de forma segura usando SERVICE_ROLE_KEY.

### Deploy

#### Via Supabase CLI (Recomendado)

1. **Instalar Supabase CLI:**
```bash
npm install -g supabase
```

2. **Login no Supabase:**
```bash
supabase login
```

3. **Link ao projeto:**
```bash
supabase link --project-ref uyffrwuerhwrpkyiydvd
```

4. **Deploy da função:**
```bash
supabase functions deploy create-user
```

#### Via Supabase Dashboard (Alternativa)

1. Acesse: https://supabase.com/dashboard/project/uyffrwuerhwrpkyiydvd/functions

2. Clique em **"Create a new function"**

3. Nome: `create-user`

4. Copie e cole o conteúdo de `supabase/functions/create-user/index.ts`

5. Clique em **"Deploy function"**

### Testar

```bash
curl -i --location --request POST \
  'https://uyffrwuerhwrpkyiydvd.supabase.co/functions/v1/create-user' \
  --header 'Authorization: Bearer SEU_ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "teste@exemplo.com",
    "password": "senha123",
    "nome": "Usuário Teste",
    "role": "funcionario"
  }'
```

### Segurança

- ✅ Apenas usuários autenticados podem chamar
- ✅ Apenas admins podem criar novos usuários
- ✅ SERVICE_ROLE_KEY é usada apenas no servidor (Edge Function)
- ✅ ANON_KEY é usada no frontend (sem acesso admin)

### Fluxo

1. Frontend chama Edge Function com token do usuário admin
2. Edge Function valida se usuário é admin
3. Edge Function cria usuário em auth.users usando SERVICE_ROLE
4. Edge Function cria/atualiza profile em profiles
5. Retorna sucesso para o frontend

