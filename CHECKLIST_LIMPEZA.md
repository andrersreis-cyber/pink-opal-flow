# ✅ CHECKLIST DE LIMPEZA DO BANCO DE DADOS

**Data**: ___/___/2025  
**Executor**: _________________  
**Início**: ___:___  
**Fim**: ___:___

---

## 📋 PRÉ-REQUISITOS

- [ ] Li o arquivo `docs/GUIA_EXECUCAO_LIMPEZA.md`
- [ ] Li o arquivo `docs/README_LIMPEZA.md`
- [ ] Entendo o que será feito
- [ ] Tenho acesso ao Supabase SQL Editor
- [ ] Sistema não está em uso no momento
- [ ] Avisei a equipe sobre manutenção

---

## 🔒 PASSO 0: BACKUP (OBRIGATÓRIO!)

- [ ] Acessei Supabase → Database → Backups
- [ ] Cliquei em "Create Backup"
- [ ] Aguardei confirmação do backup
- [ ] Anotei horário do backup: ___:___

**⚠️ NÃO PROSSIGA SEM BACKUP!**

---

## 🔍 PASSO 1: INVESTIGAÇÃO

- [ ] Abri Supabase SQL Editor
- [ ] Executei `scripts/investigation.sql`
- [ ] Li os NOTICES
- [ ] Confirmei: `historico_conversas` tem _____ registros
- [ ] Confirmei: `agendamento_logs` existe? SIM / NÃO
- [ ] Confirmei: `cliente_stats` existe? SIM / NÃO
- [ ] Estou ciente do que será removido

**Observações:**
_____________________________________________
_____________________________________________

---

## 🧹 PASSO 2: LIMPEZA COMPLETA

- [ ] Abri `scripts/cleanup-final.sql`
- [ ] **Revisei** o script (importante!)
- [ ] Executei o script completo
- [ ] Aguardei conclusão (1-2 min)
- [ ] Vi mensagem "LIMPEZA CONCLUÍDA COM SUCESSO!"
- [ ] Verifiquei contadores finais:
  - Triggers ativos: _____
  - Tabelas: _____
  - Funções: _____

**Erros encontrados?**
- [ ] Nenhum erro ✅
- [ ] Houve erros (descrever abaixo):

_____________________________________________
_____________________________________________

---

## 🎯 PASSO 3: APLICAR VERSÃO 6 - PARTE 1

- [ ] Abri `migrations/20251123_funcionario_servicos.sql`
- [ ] Executei o script
- [ ] Aguardei conclusão
- [ ] **VALIDAÇÃO:**
  ```sql
  SELECT COUNT(*) FROM funcionario_servicos;
  ```
  - [ ] Retornou > 0 registros (quantos? _____)
  - [ ] Tabela existe e tem dados ✅

**Erros encontrados?**
- [ ] Nenhum erro ✅
- [ ] Houve erros (descrever abaixo):

_____________________________________________
_____________________________________________

---

## 🚀 PASSO 4: APLICAR VERSÃO 6 - PARTE 2

- [ ] Abri `migrations/20251123_rpc_funcionario_servicos.sql`
- [ ] Executei o script
- [ ] Aguardei conclusão
- [ ] **VALIDAÇÃO:**
  ```sql
  SELECT * FROM listar_funcionarios_por_servico('plas-06');
  ```
  - [ ] Retornou funcionários (quantos? _____)
  - [ ] RPC funciona ✅

**Erros encontrados?**
- [ ] Nenhum erro ✅
- [ ] Houve erros (descrever abaixo):

_____________________________________________
_____________________________________________

---

## ✅ PASSO 5: VALIDAÇÃO FINAL

- [ ] Executei `scripts/safe-audit.sql`
- [ ] Vi os NOTICES de validação
- [ ] Confirmações:
  - [ ] `funcionario_servicos`: EXISTE ✅
  - [ ] `listar_funcionarios_por_servico`: EXISTE ✅
  - [ ] `historico_conversas`: NÃO EXISTE ✅
  - [ ] Triggers duplicados: REMOVIDOS ✅

**Status Geral:**
- [ ] Tudo OK ✅
- [ ] Problemas encontrados (descrever):

_____________________________________________
_____________________________________________

---

## 💻 PASSO 6: TESTAR FRONTEND

### 6.1. Iniciar Servidor
- [ ] Executei `pnpm run dev`
- [ ] Servidor iniciou na porta 3000
- [ ] Sem erros no console

### 6.2. Login Admin (Liz)
- [ ] Acessei `http://localhost:3000`
- [ ] Fiz login como admin
- [ ] Dashboard carregou ✅
- [ ] Lista de agendamentos funciona ✅
- [ ] Criar agendamento funciona ✅
- [ ] Histórico de conversas funciona ✅

### 6.3. Login Funcionário (Carla)
- [ ] Fiz logout
- [ ] Fiz login como Carla
- [ ] Vejo apenas meus agendamentos ✅
- [ ] NÃO vejo menu "Equipe" ✅
- [ ] RLS está funcionando ✅

**Problemas no Frontend?**
- [ ] Nenhum problema ✅
- [ ] Problemas encontrados:

_____________________________________________
_____________________________________________

---

## 📝 PASSO 7: DOCUMENTAÇÃO

- [ ] Atualizei este checklist com resultados
- [ ] Documentei problemas encontrados (se houver)
- [ ] Commit das alterações no Git:
  ```bash
  git add .
  git commit -m "feat: limpeza banco + versão 6 aplicada"
  git push
  ```
- [ ] Avisei equipe que manutenção terminou

---

## 📊 RESULTADO FINAL

### Status do Banco:
- Versão: **V6** ✅
- Triggers: _____ (esperado: 4-6)
- Tabelas: _____ (esperado: 5-6)
- `funcionario_servicos`: **EXISTE** ✅
- Duplicatas: **REMOVIDAS** ✅

### Status do Frontend:
- [ ] Funcional ✅
- [ ] RLS funcionando ✅
- [ ] Sem erros ✅

### Tempo Total:
- Início: ___:___
- Fim: ___:___
- Duração: _____ minutos

---

## 🎯 PRÓXIMOS PASSOS

- [ ] Atualizar workflow n8n com RPCs de especialização
- [ ] Testar agente IA com escolha de funcionários
- [ ] Implementar Marcos 1-5 (login multiusuário)
- [ ] Criar changelog da versão 6

---

## 🆘 EM CASO DE PROBLEMA

### Se algo deu errado:

1. **RESTAURAR BACKUP**
   - [ ] Acessei Supabase → Backups
   - [ ] Selecionei backup de ___:___
   - [ ] Cliquei em "Restore"
   - [ ] Aguardei conclusão

2. **REVERTER GIT (se commitou)**
   ```bash
   git log  # Ver último commit
   git revert HEAD  # Reverter último commit
   ```

3. **DOCUMENTAR PROBLEMA**
   - Erro encontrado: _________________________
   - Passo onde ocorreu: _____________________
   - Solução aplicada: _______________________

---

## ✅ CONCLUSÃO

- [ ] Limpeza concluída com sucesso
- [ ] Versão 6 aplicada
- [ ] Frontend testado e funcional
- [ ] Equipe avisada
- [ ] Documentação atualizada
- [ ] Sistema em produção novamente

**Assinatura:** _________________  
**Data/Hora:** ___/___/___ às ___:___

---

**🎉 PARABÉNS! BANCO LIMPO E OTIMIZADO!**


