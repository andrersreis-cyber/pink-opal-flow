import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServicoComVinculo {
  servico_id: string;
  servico_nome: string;
  servico_preco: number;
  servico_duracao: number;
  vinculado: boolean;
  nivel_habilidade?: "basico" | "avancado";
}

export const useFuncionarioServicos = (funcionarioId: string) => {
  const queryClient = useQueryClient();

  // Query: Listar todos os serviços com status de vínculo
  const { data: servicosComVinculo, isLoading: isLoadingServicos } = useQuery({
    queryKey: ["funcionario-servicos", funcionarioId],
    queryFn: async () => {
      // 1. Buscar todos os serviços ativos
      const { data: todosServicos, error: errorServicos } = await supabase
        .from("servicos")
        .select("id, nome, preco, duracao_minutos")
        .eq("ativo", true)
        .order("nome");

      if (errorServicos) throw errorServicos;

      // 2. Buscar serviços vinculados ao funcionário
      const { data: servicosVinculados, error: errorVinculados } = await supabase
        .from("funcionario_servicos")
        .select("servico_id, nivel_habilidade")
        .eq("funcionario_id", funcionarioId)
        .eq("ativo", true);

      if (errorVinculados) throw errorVinculados;

      // 3. Criar mapa de vínculos
      const vinculosMap = new Map(
        servicosVinculados?.map((v) => [v.servico_id, v.nivel_habilidade]) || []
      );

      // 4. Combinar informações
      const resultado: ServicoComVinculo[] = todosServicos?.map((servico) => ({
        servico_id: servico.id,
        servico_nome: servico.nome,
        servico_preco: Number(servico.preco),
        servico_duracao: servico.duracao_minutos,
        vinculado: vinculosMap.has(servico.id),
        nivel_habilidade: vinculosMap.get(servico.id),
      })) || [];

      return resultado;
    },
    enabled: !!funcionarioId,
  });

  // Mutation: Vincular/Desvincular serviço
  const toggleServico = async (
    funcionarioId: string,
    servicoId: string,
    vinculado: boolean,
    nivelHabilidade: "basico" | "avancado" = "basico"
  ) => {
    if (vinculado) {
      // Desvincular (DELETE ou UPDATE ativo=false)
      const { error } = await supabase
        .from("funcionario_servicos")
        .delete()
        .eq("funcionario_id", funcionarioId)
        .eq("servico_id", servicoId);

      if (error) {
        toast.error("Erro ao desvincular serviço: " + error.message);
        throw error;
      }

      toast.success("Serviço desvinculado com sucesso!");
    } else {
      // Vincular (INSERT)
      const { error } = await supabase
        .from("funcionario_servicos")
        .insert({
          funcionario_id: funcionarioId,
          servico_id: servicoId,
          nivel_habilidade: nivelHabilidade,
          ativo: true,
        });

      if (error) {
        toast.error("Erro ao vincular serviço: " + error.message);
        throw error;
      }

      toast.success("Serviço vinculado com sucesso!");
    }

    // Invalidar queries para atualizar UI
    queryClient.invalidateQueries({ queryKey: ["funcionario-servicos", funcionarioId] });
    queryClient.invalidateQueries({ queryKey: ["funcionarios-por-servico"] });
  };

  // Mutation: Atualizar nível de habilidade
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
    onSuccess: (_, variables) => {
      toast.success("Nível de habilidade atualizado!");
      queryClient.invalidateQueries({ 
        queryKey: ["funcionario-servicos", variables.funcionarioId] 
      });
      queryClient.invalidateQueries({ queryKey: ["funcionarios-por-servico"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar nível: " + error.message);
    },
  });

  return {
    servicosComVinculo,
    isLoadingServicos,
    toggleServico,
    atualizarNivelHabilidade,
  };
};
