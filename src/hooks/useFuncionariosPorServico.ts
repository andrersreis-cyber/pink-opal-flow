import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FuncionarioPorServico {
  funcionario_id: string;
  funcionario_nome: string;
  funcionario_email: string;
  nivel_habilidade: "basico" | "avancado";
  observacoes?: string;
}

export const useFuncionariosPorServico = (servicoId?: string) => {
  return useQuery({
    queryKey: ["funcionarios-por-servico", servicoId],
    queryFn: async () => {
      if (!servicoId) return [];

      const { data, error } = await supabase.rpc("listar_funcionarios_por_servico", {
        p_servico_id: servicoId,
      });

      if (error) throw error;

      return data as FuncionarioPorServico[];
    },
    enabled: !!servicoId,
  });
};

