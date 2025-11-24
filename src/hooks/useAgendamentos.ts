import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { getTodayUTC } from "@/lib/dateUtils";
import { buildAgendamentosQuery, transformAgendamento } from "@/lib/agendamentosQuery";

export const useAgendamentos = (date?: Date, funcionarioId?: string | null) => {
  const queryClient = useQueryClient();

  // Configurar Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:agendamentos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agendamentos' },
        (payload) => {
          console.log('Mudança em agendamentos detectada (Realtime):', payload);
          
          // Invalidar todas as queries relacionadas a agendamentos
          queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-agendamentos"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["agendamentos-semana"] });
          queryClient.invalidateQueries({ queryKey: ["agendamentos-mes"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ["agendamentos", date ? format(date, "yyyy-MM-dd") : "all", funcionarioId],
    queryFn: async () => {
      // Buscar direto da tabela agendamentos com JOINs para respeitar RLS
      let query = buildAgendamentosQuery().order("data", { ascending: true });
      
      if (date) {
        // Extrair componentes UTC do objeto Date
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const day = date.getUTCDate();
        
        // Usar Date.UTC para criar timestamps corretos
        const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
        
        query = query
          .gte("data", startOfDay.toISOString())
          .lte("data", endOfDay.toISOString());
      }

      // Aplicar filtro de funcionário se selecionado
      if (funcionarioId) {
        query = query.eq("funcionario_id", funcionarioId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transformar para o formato esperado
      return data?.map(transformAgendamento) || [];
    },
  });

  const createAgendamento = useMutation({
    mutationFn: async (newAgendamento: {
      cliente_id: number;
      servico_id: string;
      funcionario_id?: string;
      data: string;
      duracao_minutos: number;
      preco: number;
      status: string;
      observacoes?: string;
    }) => {
      // Validar dados antes de inserir
      if (!newAgendamento.cliente_id || newAgendamento.cliente_id <= 0) {
        throw new Error("Cliente inválido");
      }
      
      if (!newAgendamento.servico_id) {
        throw new Error("Serviço inválido");
      }
      
      if (!newAgendamento.data) {
        throw new Error("Data inválida");
      }

      const { data, error } = await supabase
        .from("agendamentos")
        .insert([newAgendamento])
        .select()
        .single();
      
      if (error) {
        console.error("Erro do Supabase:", error);
        throw new Error(error.message || "Erro ao criar agendamento");
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-agendamentos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["agendamentos-semana"] });
      queryClient.invalidateQueries({ queryKey: ["agendamentos-mes"] });
      toast.success("Agendamento criado com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Erro na mutation:", error);
      toast.error("Erro ao criar agendamento: " + error.message);
    },
  });

  const updateAgendamento = useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: number;
      data?: string;
      status?: string;
      observacoes?: string;
    }) => {
      const { data, error } = await supabase
        .from("agendamentos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-agendamentos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["agendamentos-semana"] });
      queryClient.invalidateQueries({ queryKey: ["agendamentos-mes"] });
      toast.success("Agendamento atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar agendamento: " + error.message);
    },
  });

  return {
    agendamentos,
    isLoading,
    createAgendamento,
    updateAgendamento,
  };
};
