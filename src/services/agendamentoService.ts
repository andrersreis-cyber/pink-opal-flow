
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface VerificarDisponibilidadeParams {
  dataInicio: Date;
  dataFim: Date;
  ignorarAgendamentoId?: number;
}

export interface ResultadoDisponibilidade {
  disponivel: boolean;
  conflitos: any[]; // Pode ser tipado melhor com base no retorno da RPC
}

/**
 * Verifica disponibilidade usando a RPC do banco de dados (mesma lógica do n8n)
 */
export const verificarDisponibilidadeRemota = async ({
  dataInicio,
  dataFim,
  ignorarAgendamentoId
}: VerificarDisponibilidadeParams): Promise<ResultadoDisponibilidade> => {
  
  // Formatar datas para ISO (a função original espera TEXT)
  const p_data_inicio = dataInicio.toISOString();
  const p_data_fim = dataFim.toISOString();

  console.log("Verificando disponibilidade (RPC):", { p_data_inicio, p_data_fim });

  // Chamar RPC (função original que estava funcionando com o n8n)
  const { data, error } = await supabase.rpc('verificar_disponibilidade', {
    p_data_inicio,
    p_data_fim
  });

  if (error) {
    console.error("Erro na RPC verificar_disponibilidade:", error);
    throw error;
  }

  // A função retorna: { verificar_disponibilidade: { disponivel: boolean, conflitos: [...] } }
  console.log("Resposta da RPC:", data);
  
  // Extrair o objeto aninhado
  const resultado = data?.verificar_disponibilidade || data || { disponivel: false, conflitos: [] };
  
  // Filtrar o agendamento atual se estivermos editando (validação local)
  let conflitos = resultado.conflitos || [];
  if (ignorarAgendamentoId && Array.isArray(conflitos) && conflitos.length > 0) {
    conflitos = conflitos.filter((c: any) => c.id !== ignorarAgendamentoId);
  }
  
  return {
    disponivel: conflitos.length === 0,
    conflitos
  };
};

