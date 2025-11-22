# Roteiro de Validação do Sistema - Pink Opal Flow

Este documento descreve os passos para validar o funcionamento integrado do Frontend (Gestão) e do Backend/Automação (n8n/Supabase).

## 🎭 Personas do Teste

1.  **Dona da Clínica (Liz):** Usa o computador/tablet. Acessa o sistema via navegador.
2.  **Cliente (André/Maria):** Usa o celular. Manda mensagens via WhatsApp para o número da clínica.

---

## 🧪 Cenário 1: Gestão Manual (Frontend)
**Objetivo:** Garantir que a interface grava e lê corretamente do Supabase.

### 📝 Passo a Passo

1.  **Criar Agendamento (Fluxo Feliz)**
    *   **Ação:** Acessar `/agenda/semana`. Clicar em "Novo Agendamento".
    *   **Dados:** Cliente: "Maria Silva", Serviço: "Limpeza de pele", Data: Amanhã às 14:00.
    *   **Resultado Esperado:** Modal fecha, card aparece na agenda.
    *   **Verificação no Banco (SQL):**
        ```sql
        SELECT * FROM agendamentos WHERE data::date = CURRENT_DATE + 1;
        ```

2.  **Editar Agendamento**
    *   **Ação:** Clicar no agendamento criado. Mudar status para "Confirmado" e adicionar observação "Cliente alérgica a látex".
    *   **Resultado Esperado:** Card atualiza a cor/ícone.
    *   **Verificação no Banco:** Coluna `status` deve ser 'confirmado' e `observacoes` preenchida.

3.  **Validar Conflito (Bloqueio)**
    *   **Ação:** Tentar criar *outro* agendamento para Amanhã às 14:00 (mesmo horário do passo 1).
    *   **Resultado Esperado:** Sistema deve exibir erro "Horário ocupado" e **NÃO** permitir salvar.

4.  **Cancelar Agendamento**
    *   **Ação:** Abrir o agendamento e mudar status para "Cancelado".
    *   **Resultado Esperado:** Agendamento deve sair da visualização principal (ou ficar cinza/riscado dependendo do filtro).

---

## 🤖 Cenário 2: Agendamento Automático (WhatsApp + IA)
**Objetivo:** Validar se o n8n entende o cliente, consulta o banco e grava os dados corretamente.

### 📝 Passo a Passo

1.  **Consulta de Serviços (Brain Test)**
    *   **Ação (Cliente):** Enviar no WhatsApp: *"Quais tratamentos faciais vocês têm?"*
    *   **Resultado Esperado (IA):** A IA deve responder listando APENAS os serviços da categoria FACIAL cadastrados no banco (ex: Limpeza de Pele, Drenagem Facial).
    *   **Validação Técnica:** Confirma que a tool `buscar_servicos_disponiveis` funcionou.

2.  **Consulta de Disponibilidade (Intelligence Test)**
    *   **Ação (Cliente):** *"Tem horário para Limpeza de Pele amanhã às 14:00?"* (Lembre-se: se você não cancelou o teste do Cenário 1, esse horário está ocupado/cancelado). Tente um horário livre: *"E para amanhã às 16:00?"*
    *   **Resultado Esperado (IA):** 
        *   Se ocupado: "Infelizmente esse horário já está reservado."
        *   Se livre: "Sim, tenho horário livre às 16h. Posso agendar?"
    *   **Validação Técnica:** Confirma que a tool `verificar_disponibilidade` está checando o banco.

3.  **Agendamento Efetivo (Write Test)**
    *   **Ação (Cliente):** *"Pode marcar então."*
    *   **Resultado Esperado (IA):** "Agendado! Limpeza de Pele amanhã às 16:00."
    *   **Efeito Mágico:** Olhe para a tela do Frontend. O agendamento deve **aparecer sozinho** na agenda (Realtime), sem você precisar recarregar a página.

4.  **Histórico de Conversa**
    *   **Ação (Dona):** No Frontend, vá em "Clientes", busque o cliente do WhatsApp e clique em "Histórico".
    *   **Resultado Esperado:** Você deve ver a transcrição da conversa que acabou de acontecer.
    *   **Validação Técnica:** Confirma que o n8n gravou na tabela `historico_conversas`.

5.  **Cancelamento via Chat**
    *   **Ação (Cliente):** *"Aconteceu um imprevisto, preciso cancelar a limpeza de amanhã."*
    *   **Resultado Esperado (IA):** "Entendido, cancelei seu agendamento de amanhã. Quer remarcar?"
    *   **Efeito Mágico:** O agendamento deve sumir/atualizar na tela do Frontend instantaneamente.

---

## 🚨 Cenário 3: Teste de Estresse (Concorrência)
**Objetivo:** Garantir que Dona e IA não marquem o mesmo horário.

1.  **Preparação:** Escolha um horário livre (ex: Sexta-feira 10:00).
2.  **Ação Simultânea:**
    *   **Dona:** Abra a modal de agendamento, preencha Sexta 10:00, mas **NÃO** clique em salvar ainda.
    *   **Cliente:** Mande no WhatsApp: *"Quero marcar Limpeza de Pele sexta às 10:00"*.
3.  **Execução:**
    *   Assim que a IA responder "Agendado!", a Dona clica em "Salvar" no Frontend.
    *   **Resultado Esperado:** O Frontend deve dar erro "Horário ocupado", pois a IA chegou primeiro no banco (milissegundos antes).

---

## 🛠 Queries SQL para Auditoria (Supabase)

Use estas queries no SQL Editor do Supabase para confirmar os dados brutos se tiver dúvida.

**Verificar últimos 5 agendamentos:**
```sql
SELECT 
  a.id, 
  c.nome as cliente, 
  s.nome as servico, 
  a.data, 
  a.status 
FROM agendamentos a
JOIN clientes c ON a.cliente_id = c.id
JOIN servicos s ON a.servico_id = s.id
ORDER BY a.created_at DESC 
LIMIT 5;
```

**Verificar histórico de conversas recente:**
```sql
SELECT 
  c.nome, 
  h.mensagem, 
  h.tipo, 
  h.created_at 
FROM historico_conversas h
JOIN clientes c ON h.cliente_id = c.id
ORDER BY h.created_at DESC 
LIMIT 10;
```


