import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useClientes = () => {
  const queryClient = useQueryClient();

  const { data: clientes, isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data;
    },
  });

  const createCliente = useMutation({
    mutationFn: async (newCliente: {
      nome: string;
      telefone: string;
      email?: string;
      observacoes?: string;
    }) => {
      const { data, error } = await supabase
        .from("clientes")
        .insert([newCliente])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente cadastrado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao cadastrar cliente: " + error.message);
    },
  });

  const updateCliente = useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: number;
      nome?: string;
      telefone?: string;
      email?: string;
      observacoes?: string;
    }) => {
      const { data, error } = await supabase
        .from("clientes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar cliente: " + error.message);
    },
  });

  return {
    clientes,
    isLoading,
    createCliente,
    updateCliente,
  };
};
