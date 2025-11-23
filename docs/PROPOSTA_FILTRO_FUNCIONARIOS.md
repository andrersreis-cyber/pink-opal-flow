# 🎯 PROPOSTA: Filtro de Funcionários para Admin

## 📋 **SITUAÇÃO ATUAL:**

- ✅ **Funcionário (Carla, Maria):** Vê apenas seus agendamentos (RLS funcionando)
- ✅ **Admin (Liz):** Vê todos os agendamentos, mas SEM filtro visual

**Problema:**
- Admin vê todos os agendamentos misturados
- Não há como separar visualmente por funcionário
- Difícil de gerenciar quando há muitos agendamentos

---

## 🎨 **PROPOSTA DE MELHORIA:**

### **Conceito:**
Adicionar um **dropdown de filtro** no cabeçalho das páginas de Agenda (Dia, Semana, Mês) para o Admin selecionar qual funcionário visualizar.

---

## 🖼️ **DESIGN PROPOSTO:**

### **Localização:**
No cabeçalho, entre o título e os botões de navegação:

```
┌─────────────────────────────────────────────────────────────────┐
│  Agenda do Mês                      [Filtro: Todos ▼]  [ <- ] [ Hoje ] [ -> ] [+ Novo]
│  novembro de 2025
└─────────────────────────────────────────────────────────────────┘
```

### **Opções do Dropdown:**

```
┌─────────────────────────┐
│ ✅ Todos os Funcionários │ ← Padrão (mostra tudo)
├─────────────────────────┤
│ 👤 Liz Martins          │
│ 👤 Carla Souza          │
│ 👤 Maria Silva          │
└─────────────────────────┘
```

---

## 🎨 **MELHORIAS VISUAIS:**

### **1. Código de Cores por Funcionário**

Cada funcionário tem uma cor identificadora:

| Funcionário | Cor Principal | Uso |
|-------------|---------------|-----|
| **Liz Martins** | 🟣 Roxo (`#9b59b6`) | Badge, borda |
| **Carla Souza** | 🟢 Verde (`#27ae60`) | Badge, borda |
| **Maria Silva** | 🔵 Azul (`#3498db`) | Badge, borda |

**Exemplo Visual:**

```
┌──────────────────────────────────────┐
│ 14:00 - Natálya Araujo              │
│ Criolipólise                         │
│ [Carla Souza] ← Badge verde         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 17:00 - Natálya Araujo              │
│ Brow lamination                      │
│ [Liz Martins] ← Badge roxo          │
└──────────────────────────────────────┘
```

### **2. Indicador Visual no Calendário (Agenda Mês)**

Nos dias com múltiplos agendamentos de diferentes funcionários:

```
┌─────┐
│ 30  │
├─────┤
│ ●●  │ ← 2 agendamentos: 1 verde (Carla) + 1 roxo (Liz)
└─────┘
```

---

## 🛠️ **IMPLEMENTAÇÃO TÉCNICA:**

### **Arquivos a Modificar:**

1. **Hook: `src/hooks/useAgendamentosMes.ts`** (e similares para Dia/Semana)
   - Adicionar parâmetro `funcionarioId?: string`
   - Aplicar filtro `.eq('funcionario_id', funcionarioId)` quando selecionado

2. **Componente: `src/pages/AgendaMes.tsx`**
   - Adicionar state `const [funcionarioFiltro, setFuncionarioFiltro] = useState<string | null>(null)`
   - Adicionar dropdown com `useUsuarios()` para listar funcionários
   - Passar filtro para o hook

3. **Componente: `src/components/agendamentos/FuncionarioFilter.tsx`** (novo)
   - Dropdown reutilizável com lista de funcionários
   - Opção "Todos" como padrão

4. **Componente: `src/components/agendamentos/AgendamentoCard.tsx`** (melhorar existente)
   - Adicionar badge colorido com nome do funcionário
   - Cor dinâmica baseada em `funcionario_id`

---

## 📝 **EXEMPLO DE CÓDIGO:**

### **1. FuncionarioFilter.tsx (NOVO)**

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsuarios } from "@/hooks/useUsuarios";
import { useAuth } from "@/hooks/useAuth";
import { Users } from "lucide-react";

interface FuncionarioFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export const FuncionarioFilter = ({ value, onChange }: FuncionarioFilterProps) => {
  const { profile } = useAuth();
  const { usuarios } = useUsuarios();

  // Não mostrar filtro para funcionários (só admin)
  if (profile?.role !== 'admin') return null;

  return (
    <Select
      value={value || 'todos'}
      onValueChange={(v) => onChange(v === 'todos' ? null : v)}
    >
      <SelectTrigger className="w-[220px]">
        <Users className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Filtrar por funcionário" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">✅ Todos os Funcionários</SelectItem>
        {usuarios?.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            👤 {user.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

### **2. Modificar useAgendamentosMes.ts**

```tsx
export const useAgendamentosMes = (date: Date, funcionarioId?: string | null) => {
  // ... código existente ...

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ["agendamentos-mes", format(inicioMes, "yyyy-MM"), funcionarioId],
    queryFn: async () => {
      let query = buildAgendamentosQuery()
        .gte("data", format(inicioMes, "yyyy-MM-dd'T'00:00:00"))
        .lte("data", format(fimMes, "yyyy-MM-dd'T'23:59:59"))
        .order("data", { ascending: true });

      // Aplicar filtro de funcionário se selecionado
      if (funcionarioId) {
        query = query.eq("funcionario_id", funcionarioId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data?.map(transformAgendamento) || [];
    },
  });

  // ... resto do código ...
};
```

### **3. Modificar AgendaMes.tsx (adicionar no cabeçalho)**

```tsx
import { FuncionarioFilter } from "@/components/agendamentos/FuncionarioFilter";

const AgendaMes = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [funcionarioFiltro, setFuncionarioFiltro] = useState<string | null>(null); // NOVO

  const { agendamentos, isLoading, inicioMes, fimMes } = useAgendamentosMes(
    selectedMonth, 
    funcionarioFiltro // NOVO
  );

  // ... resto do código ...

  return (
    <div className="space-y-8">
      {/* Cabeçalho com Navegação */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Agenda do Mês</h1>
          <p className="text-muted-foreground mt-2">
            {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex gap-3 items-center">
          {/* NOVO: Filtro de Funcionário */}
          <FuncionarioFilter 
            value={funcionarioFiltro}
            onChange={setFuncionarioFiltro}
          />

          <Button variant="outline" size="icon" onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* ... resto dos botões ... */}
        </div>
      </div>

      {/* ... resto do componente ... */}
    </div>
  );
};
```

### **4. Badge Colorido no AgendamentoCard**

```tsx
const funcionarioCores: Record<string, string> = {
  'ff301f27-7d2d-4ac5-9c39-682b4b13d55b': 'bg-purple-500', // Liz
  '3eb7a0f2-e8a6-4562-beb0-a99163a527be': 'bg-green-500',  // Carla
  'c5c7c09c-b161-4763-9b49-16e49f85d417': 'bg-blue-500',   // Maria
};

// No componente:
<Badge className={funcionarioCores[agendamento.funcionario_id] || 'bg-gray-500'}>
  {agendamento.funcionario_nome}
</Badge>
```

---

## ✅ **BENEFÍCIOS:**

| Benefício | Descrição |
|-----------|-----------|
| **🎯 Foco** | Admin consegue visualizar agenda específica de cada funcionário |
| **📊 Gestão** | Facilita balanceamento de carga entre funcionários |
| **🎨 Visual** | Identificação rápida por cores |
| **🚀 Performance** | Filtra no banco (menos dados trafegados) |
| **♿ UX** | Não afeta funcionários (filtro só aparece para admin) |

---

## 🧪 **CASOS DE USO:**

### **Caso 1: Admin quer ver agenda da Carla**
1. Admin acessa "Agenda Mês"
2. Seleciona "Carla Souza" no filtro
3. Vê APENAS agendamentos da Carla
4. Pode criar novos agendamentos para ela

### **Caso 2: Admin quer visão geral**
1. Admin deixa filtro em "Todos"
2. Vê todos os agendamentos com badges coloridos
3. Identifica visualmente quem está mais/menos ocupado

### **Caso 3: Funcionário acessa (sem mudança)**
1. Funcionário entra na agenda
2. **NÃO vê** o filtro (oculto automaticamente)
3. Vê apenas seus agendamentos (RLS)

---

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO:**

### **Fase 1: Componentes Base (30 min)**
- [ ] Criar `FuncionarioFilter.tsx`
- [ ] Criar helper de cores `funcionarioCores.ts`
- [ ] Testar dropdown isoladamente

### **Fase 2: Hooks (20 min)**
- [ ] Modificar `useAgendamentosMes.ts` (adicionar parâmetro)
- [ ] Modificar `useAgendamentosSemana.ts` (adicionar parâmetro)
- [ ] Modificar `useAgendamentos.ts` (adicionar parâmetro)
- [ ] Testar filtro no banco de dados

### **Fase 3: Páginas (30 min)**
- [ ] Integrar filtro em `AgendaMes.tsx`
- [ ] Integrar filtro em `AgendaSemana.tsx`
- [ ] Integrar filtro em `AgendaDia.tsx`
- [ ] Adicionar badges coloridos nos cards

### **Fase 4: Testes (20 min)**
- [ ] Testar como Admin: filtro funciona
- [ ] Testar como Funcionário: filtro não aparece
- [ ] Testar performance com muitos agendamentos
- [ ] Testar responsividade mobile

---

## 🎯 **RESULTADO ESPERADO:**

**Para Admin:**
```
┌─────────────────────────────────────────────────────────┐
│ Agenda do Mês    [Filtro: Carla Souza ▼]  [ <- ][ Hoje ]...
│ novembro de 2025
├─────────────────────────────────────────────────────────┤
│ Calendário mostrando APENAS agendamentos da Carla      │
│ com badges verdes 🟢                                    │
└─────────────────────────────────────────────────────────┘
```

**Para Funcionário:**
```
┌─────────────────────────────────────────────────────────┐
│ Agenda do Mês                          [ <- ][ Hoje ]...
│ novembro de 2025
├─────────────────────────────────────────────────────────┤
│ Calendário mostrando APENAS seus agendamentos (RLS)    │
│ SEM filtro visível                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 **ESTIMATIVA DE TEMPO:**

| Fase | Tempo | Complexidade |
|------|-------|--------------|
| Componentes Base | 30 min | ⭐⭐ Média |
| Hooks | 20 min | ⭐ Fácil |
| Páginas | 30 min | ⭐⭐ Média |
| Testes | 20 min | ⭐ Fácil |
| **TOTAL** | **~1h40** | ⭐⭐ Média |

---

## 🚀 **PRÓXIMOS PASSOS (se aprovado):**

1. Criar branch `filtro-funcionarios`
2. Implementar Fase 1 → Testar
3. Implementar Fase 2 → Testar
4. Implementar Fase 3 → Testar
5. Testes finais
6. Commit e merge para `versao5`

---

## ❓ **PERGUNTAS PARA O USUÁRIO:**

1. **Cores:** Gostou das cores sugeridas (Roxo/Verde/Azul) ou prefere outras?
2. **Posição:** Gostou do filtro no cabeçalho ou prefere em outro lugar (ex: sidebar)?
3. **Extras:** Quer adicionar contador ao lado? Ex: "Carla Souza (12 agendamentos)"
4. **Dashboard:** Quer filtro também no Dashboard?

---

**Aprova essa proposta? Posso começar a implementar?** 🎯✨

