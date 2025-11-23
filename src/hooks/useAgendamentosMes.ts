import { useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { buildAgendamentosQuery, transformAgendamento } from "@/lib/agendamentosQuery";

export const useAgendamentosMes = (date: Date, funcionarioId?: string | null) => {
  const inicioMes = startOfMonth(date);
  const fimMes = endOfMonth(date);

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

  return { agendamentos, isLoading, inicioMes, fimMes };
};
