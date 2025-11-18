import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

export const useAgendamentosMes = (date: Date) => {
  const inicioMes = startOfMonth(date);
  const fimMes = endOfMonth(date);

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ["agendamentos-mes", format(inicioMes, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vw_agendamentos_completos")
        .select("*")
        .gte("data", format(inicioMes, "yyyy-MM-dd'T'00:00:00"))
        .lte("data", format(fimMes, "yyyy-MM-dd'T'23:59:59"))
        .order("data", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  return { agendamentos, isLoading, inicioMes, fimMes };
};
