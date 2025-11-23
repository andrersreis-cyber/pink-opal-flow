# 🚀 Deploy da Edge Function - Criação Automática de Usuários

## 📋 O QUE FOI CRIADO

Uma **Edge Function** no Supabase que permite criar usuários diretamente do frontend de forma segura.

### Arquitetura:
```
Frontend (ANON_KEY)
    ↓ [HTTP POST com token do admin]
Edge Function (SERVICE_ROLE_KEY)
    ↓ [Valida admin]
    ↓ [Cria usuário em auth.users]
    ↓ [Cria profile em profiles]
    ↓ [Retorna sucesso]
Frontend ✅
```

---

## 🛠️ OPÇÃO 1: Deploy via Supabase Dashboard (MAIS FÁCIL)

### Passo 1: Acessar Functions no Dashboard

1. Vá para: https://supabase.com/dashboard/project/uyffrwuerhwrpkyiydvd/functions

2. Clique em **"Create a new function"**

### Passo 2: Configurar a Function

3. **Nome da função:** `create-user`

4. **Copie o código:**
   - Abra o arquivo: `supabase/functions/create-user/index.ts`
   - Copie TODO o conteúdo
   - Cole no editor do Supabase Dashboard

### Passo 3: Deploy

5. Clique em **"Deploy function"**

6. Aguarde o deploy completar (1-2 minutos)

### Passo 4: Verificar

7. URL da função será:
   ```
   https://uyffrwuerhwrpkyiydvd.supabase.co/functions/v1/create-user
   ```

8. Status: **"Active"** ✅

---

## 🛠️ OPÇÃO 2: Deploy via CLI (MAIS PROFISSIONAL)

### Passo 1: Instalar Supabase CLI

```bash
npm install -g supabase
```

### Passo 2: Login

```bash
supabase login
```

Isso abrirá o navegador para você fazer login.

### Passo 3: Link ao Projeto

```bash
cd "c:\Users\andre\Clinica esterica V0\pink-opal-flow"
supabase link --project-ref uyffrwuerhwrpkyiydvd
```

### Passo 4: Deploy da Função

```bash
supabase functions deploy create-user
```

Output esperado:
```
Deploying Function create-user (project ref: uyffrwuerhwrpkyiydvd)
✓ Function deployed successfully!
URL: https://uyffrwuerhwrpkyiydvd.supabase.co/functions/v1/create-user
```

---

## ✅ TESTAR A FUNÇÃO

### Via Frontend (Recomendado)

1. Faça login como admin no sistema: http://localhost:8080/login
   - Email: `admin@pinkopal.dev`
   - Senha: `PinkOpal2024!`

2. Vá para: http://localhost:8080/equipe

3. Clique em **"Adicionar Funcionário"**

4. Preencha:
   ```
   Nome: Maria Silva
   Email: maria@teste.com
   Senha: Maria123!
   Tipo: Funcionário
   ```

5. Clique em **"Criar Funcionário"**

6. ✅ Se aparecer "Funcionário criado com sucesso!" → FUNCIONOU!

### Via cURL (Para Debug)

```bash
# 1. Pegar o access_token
# Faça login no frontend e abra o DevTools (F12)
# Console → Execute:
localStorage.getItem('supabase.auth.token')

# 2. Testar a função
curl -i --location --request POST \
  'https://uyffrwuerhwrpkyiydvd.supabase.co/functions/v1/create-user' \
  --header 'Authorization: Bearer SEU_ACCESS_TOKEN_AQUI' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "teste@exemplo.com",
    "password": "senha123",
    "nome": "Usuário Teste",
    "role": "funcionario"
  }'
```

Resposta esperada:
```json
{
  "success": true,
  "user": {
    "id": "uuid-gerado",
    "email": "teste@exemplo.com",
    "nome": "Usuário Teste",
    "role": "funcionario"
  }
}
```

---

## 🔍 TROUBLESHOOTING

### Erro: "Function not found"
- ✅ Verifique se a função foi deployada
- ✅ Vá em: https://supabase.com/dashboard/project/uyffrwuerhwrpkyiydvd/functions
- ✅ Deve aparecer "create-user" com status "Active"

### Erro: "Não autorizado"
- ✅ Verifique se está logado
- ✅ Verifique se o token está sendo enviado
- ✅ Token deve ser do usuário admin

### Erro: "Apenas administradores podem criar usuários"
- ✅ Verifique no banco: `SELECT role FROM profiles WHERE email = 'admin@pinkopal.dev'`
- ✅ Deve retornar `'admin'`

### Erro: "CORS"
- ✅ Edge Function já tem CORS configurado
- ✅ Se persistir, adicione o domínio nas configurações do Supabase

---

## 📊 MONITORAMENTO

### Ver Logs da Edge Function

1. Vá para: https://supabase.com/dashboard/project/uyffrwuerhwrpkyiydvd/functions

2. Clique em **"create-user"**

3. Aba **"Logs"** → Ver todas as execuções

4. Aba **"Metrics"** → Ver estatísticas de uso

---

## 🎯 PRÓXIMOS PASSOS

Após deploy da Edge Function:

1. ✅ Testar criação de funcionário no frontend
2. ✅ Fazer login com o novo funcionário
3. ✅ Verificar que ele vê apenas sua agenda
4. ✅ Verificar que admin vê todas as agendas

---

## 🔐 SEGURANÇA

### O que está protegido:

- ✅ SERVICE_ROLE_KEY nunca é exposta ao frontend
- ✅ Apenas usuários autenticados podem chamar a função
- ✅ Apenas admins podem criar novos usuários
- ✅ Validação de role antes de criar
- ✅ CORS configurado corretamente

### Produção:

Para produção, considere adicionar:
- Rate limiting (limite de requisições)
- Logging de auditoria (quem criou quem)
- Validação de email corporativo
- Senha forte obrigatória

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique os logs da Edge Function
2. Verifique o console do navegador (F12)
3. Verifique se a função está "Active" no dashboard

**A Edge Function está pronta para uso!** 🚀

