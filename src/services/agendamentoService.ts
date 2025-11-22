
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
  const p_data_inicio = dataInicio.toISOString();
  const p_data_fim = dataFim.toISOString();

  console.log("Verificando disponibilidade (RPC):", { 
    p_data_inicio, 
    p_data_fim, 
    p_ignorar_agendamento_id: ignorarAgendamentoId 
  });

  // Chamar RPC passando todos os parâmetros
  const { data, error } = await supabase.rpc('verificar_disponibilidade', {
    p_data_inicio,
    p_data_fim,
    p_ignorar_agendamento_id: ignorarAgendamentoId || null
  });

  if (error) {
    console.error("Erro na RPC verificar_disponibilidade:", error);
    throw error;
  }

  // A RPC com RETURNS TABLE retorna um array com um objeto
  // Formato: [{ disponivel: boolean, conflitos: [...] }]
  console.log("Resposta da RPC:", data);
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error("Resposta inválida da RPC:", data);
    return { disponivel: false, conflitos: [] };
  }

  const resultado = data[0];
  
  return {
    disponivel: resultado.disponivel,
    conflitos: resultado.conflitos || []
  };
};

