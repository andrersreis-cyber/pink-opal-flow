import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, format } from "date-fns";

export const useAgendamentosSemana = (date: Date) => {
  const inicioSemana = startOfWeek(date, { weekStartsOn: 0 }); // Domingo
  const fimSemana = endOfWeek(date, { weekStartsOn: 0 }); // Sábado

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ["agendamentos-semana", format(inicioSemana, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vw_agendamentos_completos")
        .select("*")
        .gte("data", format(inicioSemana, "yyyy-MM-dd'T'00:00:00"))
        .lte("data", format(fimSemana, "yyyy-MM-dd'T'23:59:59"))
        .order("data", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  return { agendamentos, isLoading, inicioSemana, fimSemana };
};
