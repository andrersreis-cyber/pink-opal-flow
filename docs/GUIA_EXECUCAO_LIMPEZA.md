# 🚀 GUIA DE EXECUÇÃO - Limpeza e Atualização do Banco

**Tempo total estimado**: 10-15 minutos  
**Nível de risco**: Baixo (com backup)  
**Reversível**: Sim (com backup do Supabase)

---

## ⚠️ ANTES DE COMEÇAR

### 1. **BACKUP OBRIGATÓRIO** 🔒

No painel do Supabase:
1. Vá em **Database** → **Backups**
2. Clique em **Create Backup**
3. Aguarde confirmação

**OU** (alternativa):

```sql
-- No SQL Editor, execute para fazer dump das tabelas críticas:
-- (Cole os resultados em um arquivo .txt de backup)

SELECT * FROM profiles;
SELECT * FROM clientes;
SELECT * FROM servicos;
SELECT * FROM agendamentos;
SELECT * FROM n8n_chat_histories;
```

---

## 📋 CHECKLIST PRÉ-EXECUÇÃO

- [ ] Backup criado no Supabase
- [ ] Ninguém está usando o sistema agora
- [ ] Frontend parado (opcional, mas recomendado)
- [ ] Você tem acesso ao Supabase SQL Editor
- [ ] Você leu este guia completo

---

## 🎯 SEQUÊNCIA DE EXECUÇÃO

### **PASSO 1: Investigação Final** 🔍
**Objetivo**: Confirmar o que será removido

```sql
-- Execute no SQL Editor:
-- Copie e cole o conteúdo de: supabase/scripts/investigation.sql
```

**O que observar nos NOTICES:**
- ✅ `historico_conversas` tem 0 registros? → Seguro remover
- ✅ `agendamento_logs` não existe? → Trigger órfão confirmado
- ✅ `cliente_stats` não existe? → Trigger órfão confirmado

**⏱️ Tempo**: 1 minuto

---

### **PASSO 2: Limpeza Completa** 🧹
**Objetivo**: Remover duplicatas, órfãos e otimizar

```sql
-- Execute no SQL Editor:
-- Copie e cole o conteúdo de: supabase/scripts/cleanup-final.sql
```

**O que vai acontecer:**
1. ✅ Remove triggers duplicados (10 triggers)
2. ✅ Remove funções órfãs (5 funções)
3. ✅ Remove tabela `historico_conversas`
4. ✅ Remove tabelas órfãs (se existirem)
5. ✅ Executa `VACUUM ANALYZE` (otimização)

**⏱️ Tempo**: 2 minutos

**Resultado esperado:**
```
✅ Triggers ativos: 4-6
✅ Tabelas: 5-6
✅ Funções: ~15-20 (RPCs necessários)
```

---

### **PASSO 3: Aplicar Versão 6 - Part 1** 🎯
**Objetivo**: Criar tabela `funcionario_servicos`

```sql
-- Execute no SQL Editor:
-- Copie e cole o conteúdo de: 
supabase/migrations/20251123_funcionario_servicos.sql
```

**O que vai acontecer:**
1. ✅ Cria tabela `funcionario_servicos`
2. ✅ Cria índices
3. ✅ Cria RLS policies
4. ✅ Insere dados iniciais (Liz admin + Carla funcionário)

**Verificar:**
```sql
SELECT * FROM funcionario_servicos;
-- Deve retornar ~10 registros (serviços para Liz e Carla)
```

**⏱️ Tempo**: 2 minutos

---

### **PASSO 4: Aplicar Versão 6 - Part 2** 🚀
**Objetivo**: Criar RPCs de especialização

```sql
-- Execute no SQL Editor:
-- Copie e cole o conteúdo de:
supabase/migrations/20251123_rpc_funcionario_servicos.sql
```

**O que vai acontecer:**
1. ✅ Cria `listar_funcionarios_por_servico()`
2. ✅ Cria `listar_servicos_por_funcionario()`
3. ✅ Cria `funcionario_pode_executar_servico()`
4. ✅ Atualiza `criar_agendamento_validado()` com `funcionario_id`
5. ✅ Atualiza `verificar_disponibilidade_por_funcionario()` com filtro de serviço

**Verificar:**
```sql
-- Testar RPC
SELECT * FROM listar_funcionarios_por_servico('plas-06');
-- Deve retornar Liz e Carla (ou apenas quem pode fazer o serviço)
```

**⏱️ Tempo**: 2 minutos

---

### **PASSO 5: Validação Final** ✅
**Objetivo**: Confirmar que tudo está funcionando

```sql
-- Execute no SQL Editor:
supabase/scripts/safe-audit.sql
```

**O que verificar nos NOTICES:**
```
✅ profiles: 3 registros
✅ clientes: X registros
✅ servicos: 15 registros
✅ agendamentos: X registros
✅ n8n_chat_histories: X registros
✅ funcionario_servicos: 10+ registros ← DEVE EXISTIR AGORA!
✅ listar_funcionarios_por_servico: EXISTE ← DEVE EXISTIR!
✅ historico_conversas: NÃO EXISTE (OK) ← REMOVIDO!
✅ agendamento_logs: NÃO EXISTE ← OK!
```

**⏱️ Tempo**: 1 minuto

---

### **PASSO 6: Testar Frontend** 💻
**Objetivo**: Confirmar que o sistema funciona

1. **Inicie o servidor:**
   ```bash
   pnpm run dev
   ```

2. **Faça login como Admin (Liz):**
   - Email: `liz@clinica.com`
   - Senha: (sua senha)

3. **Teste básico:**
   - [ ] Dashboard carrega
   - [ ] Lista de agendamentos funciona
   - [ ] Criar agendamento funciona
   - [ ] Histórico de conversas carrega

4. **Faça login como Funcionário (Carla):**
   - Email: `carla@clinica.com`
   - Senha: (sua senha)

5. **Teste isolamento:**
   - [ ] Carla vê apenas seus agendamentos
   - [ ] Carla NÃO vê menu "Equipe"

**⏱️ Tempo**: 3-5 minutos

---

## 📊 RESULTADO FINAL ESPERADO

### **Banco de Dados Limpo:**
```
✅ 5-6 tabelas essenciais
✅ 4-6 triggers necessários
✅ ~20 funções (RPCs)
✅ Versão 6 aplicada
✅ funcionario_servicos funcional
✅ Sem duplicatas
✅ Sem triggers órfãos
```

### **Frontend Funcional:**
```
✅ Login funciona
✅ RLS funciona (Carla isolada)
✅ Agendamentos funcionam
✅ Conversas funcionam
✅ Dashboard funciona
```

### **N8N Pronto:**
```
⏳ Próximo passo: Atualizar workflow n8n
⏳ Configurar tools de especialização
```

---

## 🆘 TROUBLESHOOTING

### **Erro: "relation funcionario_servicos does not exist"**
**Causa**: Migration do Passo 3 não foi executada  
**Solução**: Execute `20251123_funcionario_servicos.sql` novamente

### **Erro: "function listar_funcionarios_por_servico does not exist"**
**Causa**: Migration do Passo 4 não foi executada  
**Solução**: Execute `20251123_rpc_funcionario_servicos.sql` novamente

### **Frontend não carrega / Erro de RLS**
**Causa**: Possível conflito de policies  
**Solução**: 
```sql
-- Verificar policies ativas
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### **"Carla vê agendamentos de Liz"**
**Causa**: Ainda usando views antigas  
**Solução**: Verificar que frontend usa `buildAgendamentosQuery` (já corrigido na v6)

---

## 🔄 COMO REVERTER (SE NECESSÁRIO)

### **Opção 1: Usar backup do Supabase**
1. Painel Supabase → **Database** → **Backups**
2. Selecionar backup antes da limpeza
3. Clicar em **Restore**

### **Opção 2: Reverter manualmente**
```sql
-- Não é possível reverter automaticamente
-- Por isso o BACKUP é OBRIGATÓRIO!
```

---

## 📝 NOTAS IMPORTANTES

1. **Backup**: Sem backup, não há como reverter tabelas removidas
2. **Downtime**: Recomenda-se executar fora do horário de pico
3. **Frontend**: Pode manter rodando, mas melhor parar durante limpeza
4. **N8N**: Não será afetado até você atualizar o workflow
5. **Dados**: Nenhum dado crítico será perdido (profiles, clientes, servicos, agendamentos, n8n_chat_histories são preservados)

---

## ✅ APÓS CONCLUSÃO

- [ ] Banco limpo e otimizado
- [ ] Versão 6 aplicada
- [ ] Frontend testado e funcional
- [ ] Commit das alterações no Git
- [ ] Atualizar workflow n8n (próximo passo)
- [ ] Documentar em `CHANGELOG.md`

---

## 🎯 PRÓXIMOS PASSOS (APÓS LIMPEZA)

1. **Configurar n8n** com novos RPCs de especialização
2. **Testar agente IA** com escolha de funcionários
3. **Implementar Marco 1** do sistema de login (se ainda não feito)

---

**🤖 Criado com Claude Sonnet 4.5**

**Alguma dúvida? Execute passo a passo e me avise em caso de erro!** 🚀


