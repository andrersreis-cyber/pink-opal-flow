import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useDashboardAgendamentos = (status?: string) => {
  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ["dashboard-agendamentos", status],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      
      let query = supabase
        .from("vw_agendamentos_completos")
        .select("*")
        .gte("data", `${today}T00:00:00`)
        .lt("data", `${today}T23:59:59`)
        .order("data", { ascending: true });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
  });

  return { agendamentos, isLoading };
};
