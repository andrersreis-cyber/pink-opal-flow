import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCliente = (clienteId: number | null) => {
  const { data: cliente, isLoading } = useQuery({
    queryKey: ["cliente", clienteId],
    queryFn: async () => {
      if (!clienteId) return null;
      
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", clienteId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!clienteId,
  });

  const { data: agendamentos, isLoading: isLoadingAgendamentos } = useQuery({
    queryKey: ["agendamentos-cliente", clienteId],
    queryFn: async () => {
      if (!clienteId) return [];
      
      const { data, error } = await supabase
        .from("vw_agendamentos_completos")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("data", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clienteId,
  });

  return { 
    cliente, 
    agendamentos,
    isLoading: isLoading || isLoadingAgendamentos 
  };
};
