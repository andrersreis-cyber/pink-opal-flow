# 🧠 ANÁLISE: FUNCIONÁRIO x SERVIÇOS

## 🎯 **CENÁRIO ATUAL vs CENÁRIO IDEAL**

### **SITUAÇÃO ATUAL:**
- ✅ Temos múltiplos funcionários (Liz, Carla, etc.)
- ✅ Temos múltiplos serviços (Avaliação, Brow Lamination, Limpeza de Pele, etc.)
- ❌ **NÃO existe vínculo:** Qualquer funcionário pode ser agendado para qualquer serviço

### **PROBLEMA REAL:**
```
Exemplo:
- Carla é EXPERT em Brow Lamination
- Carla NÃO sabe fazer Harmonização Facial
- Cliente pede Harmonização às 10h
- Agente IA oferece Carla (que está livre)
- ❌ ERRO: Carla não executa esse serviço!
```

---

## 🔍 **CENÁRIOS PROBLEMÁTICOS:**

### **Cenário 1: Especialização**
```
Serviço: Harmonização Facial (complexo)
Quem pode fazer: Apenas Liz (gestora, experiente)
Quem NÃO pode: Carla (nova, sem certificação)

PROBLEMA: Sistema pode agendar com Carla
```

### **Cenário 2: Certificações**
```
Serviço: Peeling Químico (requer certificação)
Quem pode fazer: Liz (certificada)
Quem NÃO pode: Maria (sem certificação)

PROBLEMA: Sistema pode agendar com Maria
```

### **Cenário 3: Tempo de Execução Diferente**
```
Serviço: Limpeza de Pele
Liz: 45 minutos (experiente, rápida)
Carla: 60 minutos (nova, mais cuidadosa)

PROBLEMA: Sistema usa mesma duração para todos
```

### **Cenário 4: Preços Diferenciados**
```
Serviço: Massagem Relaxante
Liz: R$ 200 (gestora, 10 anos experiência)
Carla: R$ 150 (funcionária, 2 anos experiência)

PROBLEMA: Sistema cobra mesmo preço
```

---

## 💡 **SOLUÇÕES PROPOSTAS:**

## **OPÇÃO A: Tabela de Relacionamento Simples**

### **Estrutura:**
```sql
CREATE TABLE funcionario_servicos (
  id BIGSERIAL PRIMARY KEY,
  funcionario_id UUID REFERENCES profiles(id),
  servico_id TEXT REFERENCES servicos(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Exemplo de dados:
-- Liz pode fazer TODOS os serviços
INSERT INTO funcionario_servicos (funcionario_id, servico_id)
VALUES 
  ('liz-uuid', 'av-01'),
  ('liz-uuid', 'bl-01'),
  ('liz-uuid', 'lp-01'),
  ('liz-uuid', 'hf-01');

-- Carla pode fazer apenas alguns
INSERT INTO funcionario_servicos (funcionario_id, servico_id)
VALUES 
  ('carla-uuid', 'av-01'),
  ('carla-uuid', 'bl-01'),
  ('carla-uuid', 'lp-01');
  -- Carla NÃO faz Harmonização (hf-01)
```

### **Vantagens:**
- ✅ Simples de implementar
- ✅ Fácil de manter
- ✅ Resolve o problema de especialização

### **Desvantagens:**
- ❌ Não considera preços diferenciados
- ❌ Não considera tempos diferentes
- ❌ Não considera níveis de habilidade

---

## **OPÇÃO B: Tabela Completa com Atributos**

### **Estrutura:**
```sql
CREATE TABLE funcionario_servicos (
  id BIGSERIAL PRIMARY KEY,
  funcionario_id UUID REFERENCES profiles(id),
  servico_id TEXT REFERENCES servicos(id),
  
  -- Atributos Específicos
  preco_personalizado DECIMAL(10,2) NULL, -- Se NULL, usa preço padrão
  duracao_personalizada INTEGER NULL,     -- Minutos, se NULL usa padrão
  nivel_habilidade TEXT CHECK (nivel_habilidade IN ('iniciante', 'intermediario', 'avancado', 'expert')),
  
  -- Controles
  ativo BOOLEAN DEFAULT true,
  certificacoes TEXT[], -- Ex: ['Peeling Químico', 'Microagulhamento']
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Exemplo de dados:
-- Liz: Expert, preço premium
INSERT INTO funcionario_servicos (funcionario_id, servico_id, preco_personalizado, duracao_personalizada, nivel_habilidade)
VALUES 
  ('liz-uuid', 'bl-01', 250.00, 45, 'expert'),
  ('liz-uuid', 'hf-01', 800.00, 90, 'expert');

-- Carla: Intermediária, preço normal, tempo maior
INSERT INTO funcionario_servicos (funcionario_id, servico_id, preco_personalizado, duracao_personalizada, nivel_habilidade)
VALUES 
  ('carla-uuid', 'bl-01', 200.00, 60, 'intermediario'),
  ('carla-uuid', 'lp-01', 180.00, 60, 'intermediario');
```

### **Vantagens:**
- ✅ Flexibilidade total
- ✅ Preços diferenciados por funcionário
- ✅ Tempos diferentes por funcionário
- ✅ Nível de habilidade visível
- ✅ Certificações rastreáveis

### **Desvantagens:**
- ❌ Mais complexo de implementar
- ❌ Mais dados para gerenciar
- ❌ UX precisa ser bem pensada

---

## **OPÇÃO C: Híbrida (RECOMENDADA)**

### **Estrutura:**
```sql
CREATE TABLE funcionario_servicos (
  id BIGSERIAL PRIMARY KEY,
  funcionario_id UUID REFERENCES profiles(id),
  servico_id TEXT REFERENCES servicos(id),
  
  -- Apenas o essencial
  ativo BOOLEAN DEFAULT true,
  nivel_habilidade TEXT CHECK (nivel_habilidade IN ('basico', 'avancado')) DEFAULT 'basico',
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(funcionario_id, servico_id)
);

-- Índices
CREATE INDEX idx_funcionario_servicos_funcionario ON funcionario_servicos(funcionario_id);
CREATE INDEX idx_funcionario_servicos_servico ON funcionario_servicos(servico_id);
CREATE INDEX idx_funcionario_servicos_ativo ON funcionario_servicos(ativo) WHERE ativo = true;
```

### **Por que é a melhor:**
1. **Simples:** Apenas vínculo funcionário-serviço
2. **Escalável:** Pode adicionar colunas depois se necessário
3. **Prático:** Nível básico vs avançado é suficiente
4. **Manutenível:** Fácil de administrar

---

## 🎯 **IMPACTOS NO SISTEMA:**

### **1. Frontend (Admin):**

#### **Nova Página: Gestão de Serviços por Funcionário**
```
/equipe
  - Lista de funcionários
  - Ao clicar em funcionário:
    [x] Avaliação
    [x] Brow Lamination
    [x] Limpeza de Pele
    [ ] Harmonização Facial (desabilitado)
    
  - Checkbox para ativar/desativar serviços
```

#### **Modal de Agendamento:**
```
Antes:
- Seleciona Funcionário: [Dropdown com TODOS]

Depois:
- Seleciona Serviço: Limpeza de Pele
- Seleciona Funcionário: [Dropdown com APENAS quem faz Limpeza]
```

---

### **2. n8n (Agente IA):**

#### **Nova RPC: `listar_funcionarios_por_servico`**
```sql
CREATE OR REPLACE FUNCTION listar_funcionarios_por_servico(
  p_servico_id TEXT
)
RETURNS TABLE(
  funcionario_id UUID,
  funcionario_nome TEXT,
  nivel_habilidade TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    COALESCE(fs.nivel_habilidade, 'basico') as nivel_habilidade
  FROM profiles p
  INNER JOIN funcionario_servicos fs 
    ON fs.funcionario_id = p.id
  WHERE fs.servico_id = p_servico_id
    AND fs.ativo = true
    AND p.ativo = true
  ORDER BY 
    CASE fs.nivel_habilidade 
      WHEN 'avancado' THEN 1 
      ELSE 2 
    END,
    p.nome;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **Atualização do System Prompt:**
```markdown
REGRA CRÍTICA: VERIFICAR ESPECIALIZAÇÃO

Antes de sugerir profissionais:
1. Use listar_funcionarios_por_servico(servico_id)
2. Ofereça APENAS profissionais que executam aquele serviço
3. Mencione o nível (se avançado, destaque isso)

Exemplo:
Cliente: "Quero fazer Brow Lamination"
Agente: "Temos 2 profissionais especializadas em Brow Lamination:
- Liz Martins (Expert, 10 anos de experiência)
- Carla Souza (Profissional qualificada)

Com quem você prefere agendar?"

NÃO oferecer profissionais que NÃO executam o serviço!
```

---

### **3. Validação de Disponibilidade:**

#### **Atualizar `criar_agendamento_validado`:**
```sql
CREATE OR REPLACE FUNCTION criar_agendamento_validado(...)
RETURNS JSON AS $$
DECLARE
  v_funcionario_faz_servico BOOLEAN;
BEGIN
  -- NOVA VALIDAÇÃO: Verificar se funcionário executa o serviço
  SELECT EXISTS(
    SELECT 1 FROM funcionario_servicos
    WHERE funcionario_id = p_funcionario_id
      AND servico_id = p_servico_id
      AND ativo = true
  ) INTO v_funcionario_faz_servico;
  
  IF NOT v_funcionario_faz_servico THEN
    RETURN json_build_object(
      'sucesso', false,
      'agendamento_id', null,
      'erro', 'Este profissional não executa este serviço'
    );
  END IF;
  
  -- ... resto da validação
END;
$$ LANGUAGE plpgsql;
```

---

## 🧪 **CENÁRIOS DE TESTE:**

### **Teste 1: Admin Configura Especialização**
1. Login como Admin (Liz)
2. Ir em "Equipe"
3. Clicar em "Carla Souza"
4. Ver lista de serviços
5. Desmarcar "Harmonização Facial"
6. Salvar
7. **Resultado:** Carla não pode mais ser agendada para Harmonização

### **Teste 2: Cliente via WhatsApp**
```
Cliente: "Quero fazer Harmonização Facial dia 25 às 14h"
Agente: "Harmonização Facial é executada pela Liz Martins.
         Vou verificar disponibilidade..."
         
Se Liz ocupada:
Agente: "Liz está ocupada neste horário. Quer escolher outro horário com ela
         ou outro serviço?"
         
NÃO DEVE oferecer Carla!
```

### **Teste 3: Frontend - Modal de Agendamento**
1. Selecionar serviço: "Harmonização Facial"
2. Abrir dropdown "Funcionário"
3. **Resultado:** Deve mostrar APENAS "Liz Martins"

---

## 📊 **PRIORIDADES:**

### **MVP (Mínimo Viável):**
1. ✅ Criar tabela `funcionario_servicos`
2. ✅ Popular com vínculos iniciais
3. ✅ Criar RPC `listar_funcionarios_por_servico`
4. ✅ Atualizar `criar_agendamento_validado` com validação
5. ✅ Atualizar n8n System Prompt
6. ✅ Frontend: Filtrar funcionários no modal

### **Fase 2 (Melhorias):**
- Interface admin para gerenciar vínculos
- Níveis de habilidade visíveis para cliente
- Relatórios de especialização

---

## 🤔 **QUESTÕES PARA DECIDIR:**

### **1. Todos os funcionários fazem os mesmos serviços?**
- Se SIM: Não precisa dessa tabela agora
- Se NÃO: Precisamos implementar urgente

### **2. Preços são iguais para todos?**
- Se SIM: Opção C (híbrida) é suficiente
- Se NÃO: Precisamos Opção B (completa)

### **3. Cliente pode escolher profissional preferido?**
- Se SIM: Manter lógica atual + filtro
- Se NÃO: Agente escolhe automaticamente

### **4. Como popular dados iniciais?**
- Manualmente no SQL?
- Interface admin?
- Importar de planilha?

---

## 💬 **MINHAS PERGUNTAS PARA VOCÊ:**

1. **Na clínica real, todos fazem todos os serviços ou há especialização?**
2. **Liz (gestora) faz serviços mais complexos que funcionários?**
3. **Tem algum serviço que APENAS a gestora pode fazer?**
4. **Tem algum serviço que qualquer funcionário pode fazer?**
5. **Preços variam por profissional ou são fixos?**

---

## 🎯 **RECOMENDAÇÃO FINAL:**

**IMPLEMENTAR OPÇÃO C (Híbrida)** porque:
- ✅ Evita conflitos operacionais
- ✅ Profissionaliza o sistema
- ✅ Melhora experiência do cliente
- ✅ Simples de gerenciar
- ✅ Escalável para crescimento

**Quer que eu implemente isso agora?** 🚀

Me responda as 5 perguntas acima para desenharmos a solução perfeita!

