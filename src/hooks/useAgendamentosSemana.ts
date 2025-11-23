import { useQuery } from "@tanstack/react-query";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { buildAgendamentosQuery, transformAgendamento } from "@/lib/agendamentosQuery";

export const useAgendamentosSemana = (date: Date, funcionarioId?: string | null) => {
  const inicioSemana = startOfWeek(date, { weekStartsOn: 0 }); // Domingo
  const fimSemana = endOfWeek(date, { weekStartsOn: 0 }); // Sábado

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ["agendamentos-semana", format(inicioSemana, "yyyy-MM-dd"), funcionarioId],
    queryFn: async () => {
      let query = buildAgendamentosQuery()
        .gte("data", format(inicioSemana, "yyyy-MM-dd'T'00:00:00"))
        .lte("data", format(fimSemana, "yyyy-MM-dd'T'23:59:59"))
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

  return { agendamentos, isLoading, inicioSemana, fimSemana };
};
