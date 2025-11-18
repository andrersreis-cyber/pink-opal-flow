import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

export const useDashboardStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");

      // Agendamentos de hoje
      const { count: agendamentosHoje } = await supabase
        .from("agendamentos")
        .select("*", { count: "exact", head: true })
        .gte("data", `${today}T00:00:00`)
        .lt("data", `${today}T23:59:59`);

      // Novos clientes (últimos 7 dias)
      const { count: novosClientes } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${weekAgo}T00:00:00`);

      // Cancelamentos hoje
      const { count: cancelamentos } = await supabase
        .from("agendamentos")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelado")
        .gte("data", `${today}T00:00:00`)
        .lt("data", `${today}T23:59:59`);

      // Pendentes hoje
      const { count: pendentes } = await supabase
        .from("agendamentos")
        .select("*", { count: "exact", head: true })
        .eq("status", "pendente")
        .gte("data", `${today}T00:00:00`)
        .lt("data", `${today}T23:59:59`);

      return {
        agendamentosHoje: agendamentosHoje || 0,
        novosClientes: novosClientes || 0,
        cancelamentos: cancelamentos || 0,
        pendentes: pendentes || 0,
      };
    },
  });

  return { stats, isLoading };
};
