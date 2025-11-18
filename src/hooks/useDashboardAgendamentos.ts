import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTodayUTC } from "@/lib/dateUtils";

export const useDashboardAgendamentos = (status?: string) => {
  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ["dashboard-agendamentos", status],
    queryFn: async () => {
      const today = getTodayUTC();
      
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
