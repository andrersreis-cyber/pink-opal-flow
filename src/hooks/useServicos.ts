import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useServicos = () => {
  const { data: servicos, isLoading } = useQuery({
    queryKey: ["servicos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servicos")
        .select("*")
        .eq("ativo", true)
        .order("categoria")
        .order("nome");
      
      if (error) throw error;
      return data;
    },
  });

  const servicosPorCategoria = servicos?.reduce((acc, servico) => {
    if (!acc[servico.categoria]) {
      acc[servico.categoria] = [];
    }
    acc[servico.categoria].push(servico);
    return acc;
  }, {} as Record<string, typeof servicos>);

  return {
    servicos,
    servicosPorCategoria,
    isLoading,
  };
};
