import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export const useAgendamentos = (date?: Date) => {
  const queryClient = useQueryClient();

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ["agendamentos", date ? format(date, "yyyy-MM-dd") : "all"],
    queryFn: async () => {
      let query = supabase
        .from("vw_agendamentos_completos")
        .select("*")
        .order("data", { ascending: true });
      
      if (date) {
        const dateStr = format(date, "yyyy-MM-dd");
        query = query
          .gte("data", `${dateStr}T00:00:00`)
          .lt("data", `${dateStr}T23:59:59`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  const createAgendamento = useMutation({
    mutationFn: async (newAgendamento: {
      cliente_id: number;
      servico_id: string;
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
