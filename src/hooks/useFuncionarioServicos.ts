import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FuncionarioServico {
  id: number;
  funcionario_id: string;
  servico_id: string;
  ativo: boolean;
  nivel_habilidade: "basico" | "avancado";
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface ServicoComVinculo {
  servico_id: string;
  servico_nome: string;
  servico_preco: number;
  servico_duracao: number;
  vinculado: boolean;
  nivel_habilidade?: "basico" | "avancado";
  funcionario_servico_id?: number;
}

export const useFuncionarioServicos = (funcionarioId?: string) => {
  const queryClient = useQueryClient();

  // Buscar todos os serviços com status de vínculo para um funcionário
  const { data: servicosComVinculo, isLoading: isLoadingServicos } = useQuery({
    queryKey: ["funcionario-servicos", funcionarioId],
    queryFn: async () => {
      if (!funcionarioId) return [];

      // Buscar todos os serviços ativos
      const { data: todosServicos, error: errorServicos } = await supabase
        .from("servicos")
        .select("id, nome, preco, duracao_minutos")
        .eq("ativo", true)
        .order("nome");

      if (errorServicos) throw errorServicos;

      // Buscar vínculos do funcionário
      const { data: vinculos, error: errorVinculos } = await supabase
        .from("funcionario_servicos")
        .select("*")
        .eq("funcionario_id", funcionarioId);

      if (errorVinculos) throw errorVinculos;

      // Combinar dados
      const servicosComStatus: ServicoComVinculo[] = todosServicos.map((servico) => {
        const vinculo = vinculos?.find((v) => v.servico_id === servico.id);
        return {
          servico_id: servico.id,
          servico_nome: servico.nome,
          servico_preco: servico.preco,
          servico_duracao: servico.duracao_minutos,
          vinculado: vinculo?.ativo ?? false,
          nivel_habilidade: vinculo?.nivel_habilidade ?? "basico",
          funcionario_servico_id: vinculo?.id,
        };
      });

      return servicosComStatus;
    },
    enabled: !!funcionarioId,
  });

  // Vincular serviço ao funcionário
  const vincularServico = useMutation({
    mutationFn: async ({
      funcionarioId,
      servicoId,
      nivelHabilidade = "basico",
    }: {
      funcionarioId: string;
      servicoId: string;
      nivelHabilidade?: "basico" | "avancado";
    }) => {
      const { data, error } = await supabase
        .from("funcionario_servicos")
        .upsert({
          funcionario_id: funcionarioId,
          servico_id: servicoId,
          ativo: true,
          nivel_habilidade: nivelHabilidade,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionario-servicos"] });
      toast.success("Serviço vinculado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao vincular serviço: ${error.message}`);
    },
  });

  // Desvincular serviço do funcionário
  const desvincularServico = useMutation({
    mutationFn: async ({
      funcionarioId,
      servicoId,
    }: {
      funcionarioId: string;
      servicoId: string;
    }) => {
      const { error } = await supabase
        .from("funcionario_servicos")
        .update({ ativo: false })
        .eq("funcionario_id", funcionarioId)
        .eq("servico_id", servicoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionario-servicos"] });
      toast.success("Serviço desvinculado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao desvincular serviço: ${error.message}`);
    },
  });

  // Atualizar nível de habilidade
  const atualizarNivelHabilidade = useMutation({
    mutationFn: async ({
      funcionarioId,
      servicoId,
      nivelHabilidade,
    }: {
      funcionarioId: string;
      servicoId: string;
      nivelHabilidade: "basico" | "avancado";
    }) => {
      const { error } = await supabase
        .from("funcionario_servicos")
        .update({ nivel_habilidade: nivelHabilidade })
        .eq("funcionario_id", funcionarioId)
        .eq("servico_id", servicoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionario-servicos"] });
      toast.success("Nível de habilidade atualizado!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar nível: ${error.message}`);
    },
  });

  // Toggle serviço (ativa/desativa)
  const toggleServico = async (
    funcionarioId: string,
    servicoId: string,
    vinculado: boolean,
    nivelHabilidade: "basico" | "avancado" = "basico"
  ) => {
    if (vinculado) {
      // Desvincular
      await desvincularServico.mutateAsync({ funcionarioId, servicoId });
    } else {
      // Vincular
      await vincularServico.mutateAsync({ funcionarioId, servicoId, nivelHabilidade });
    }
  };

  return {
    servicosComVinculo,
    isLoadingServicos,
    vincularServico,
    desvincularServico,
    atualizarNivelHabilidade,
    toggleServico,
  };
};

