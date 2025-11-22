
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
  
  // Formatar datas para ISO com timezone correto (o backend espera string)
  // Importante: A RPC espera formato ISO 8601
  const p_data_inicio = dataInicio.toISOString();
  const p_data_fim = dataFim.toISOString();

  console.log("Verificando disponibilidade (RPC):", { p_data_inicio, p_data_fim });

  const { data, error } = await supabase.rpc('verificar_disponibilidade', {
    p_data_inicio,
    p_data_fim
  });

  if (error) {
    console.error("Erro na RPC verificar_disponibilidade:", error);
    throw error;
  }

  // A RPC retorna { disponivel: boolean, conflitos: [...] }
  // Precisamos filtrar o agendamento atual se estivermos editando
  let conflitos = data.conflitos || [];
  
  if (ignorarAgendamentoId && conflitos.length > 0) {
    conflitos = conflitos.filter((c: any) => c.id !== ignorarAgendamentoId);
    // Se removemos todos os conflitos (era só ele mesmo), então está disponível
    if (conflitos.length === 0) {
      return { disponivel: true, conflitos: [] };
    }
  }

  return {
    disponivel: conflitos.length === 0,
    conflitos
  };
};


