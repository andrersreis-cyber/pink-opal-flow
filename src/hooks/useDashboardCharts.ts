import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

export const useDashboardCharts = () => {
  // 1. Receita ao longo do tempo (30 dias)
  const { data: receitaData, isLoading: receitaLoading } = useQuery({
    queryKey: ["dashboard-receita"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vw_estatisticas_dia")
        .select("*")
        .gte("dia", format(subDays(new Date(), 30), "yyyy-MM-dd"))
        .order("dia", { ascending: true });
      
      if (error) throw error;
      
      return data?.map(d => ({
        dia: format(new Date(d.dia!), "dd/MM"),
        prevista: Number(d.receita_prevista || 0),
        realizada: Number(d.receita_realizada || 0),
        agendamentos: d.total_agendamentos,
      })) || [];
    },
  });

  // 2. Serviços mais populares (30 dias)
  const { data: servicosData, isLoading: servicosLoading } = useQuery({
    queryKey: ["dashboard-servicos"],
    queryFn: async () => {
      const result = await supabase
        .from("vw_agendamentos_completos")
        .select("servico_nome, servico_categoria, preco")
        .eq("status", "confirmado")
        .gte("data", format(subDays(new Date(), 30), "yyyy-MM-dd"));
      
      if (result.error) throw result.error;
      
      // Agrupar manualmente
      const grouped = result.data.reduce((acc, item) => {
        const key = item.servico_nome || "Sem nome";
        if (!acc[key]) {
          acc[key] = { nome: key, categoria: item.servico_categoria, total: 0, receita: 0 };
        }
        acc[key].total += 1;
        acc[key].receita += Number(item.preco || 0);
        return acc;
      }, {} as Record<string, any>);
      
      return Object.values(grouped)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 5);
    },
  });

  // 3. Agendamentos por status (30 dias)
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["dashboard-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vw_estatisticas_dia")
        .select("*")
        .gte("dia", format(subDays(new Date(), 30), "yyyy-MM-dd"))
        .order("dia", { ascending: true });
      
      if (error) throw error;
      
      return data?.map(d => ({
        dia: format(new Date(d.dia!), "dd/MM"),
        confirmados: d.confirmados,
        pendentes: d.pendentes,
        cancelados: d.cancelados,
      })) || [];
    },
  });

  // 4. Taxa de ocupação (hoje)
  const { data: ocupacaoData, isLoading: ocupacaoLoading } = useQuery({
    queryKey: ["dashboard-ocupacao"],
    queryFn: async () => {
      const hoje = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("vw_estatisticas_dia")
        .select("*")
        .eq("dia", hoje)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Horário de trabalho: 8h-20h = 12h = 720 minutos
      const minutosDisponiveis = 720;
      const minutosOcupados = Number(data?.minutos_ocupados || 0);
      const percentual = Math.min((minutosOcupados / minutosDisponiveis) * 100, 100);
      
      return {
        minutosOcupados,
        minutosDisponiveis,
        percentual: Math.round(percentual),
        agendamentos: data?.total_agendamentos || 0,
      };
    },
  });

  return {
    receita: { data: receitaData, isLoading: receitaLoading },
    servicos: { data: servicosData, isLoading: servicosLoading },
    status: { data: statusData, isLoading: statusLoading },
    ocupacao: { data: ocupacaoData, isLoading: ocupacaoLoading },
  };
};
