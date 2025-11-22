
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

  // O Supabase retorna o JSONB como um objeto aninhado
  // Formato: { verificar_disponibilidade: { disponivel: boolean, conflitos: [...] } }
  // Ou quando é uma função que retorna jsonb, vem direto como objeto
  console.log("Resposta da RPC:", data);
  
  // Extrair o resultado (pode vir aninhado ou direto)
  const resultado = typeof data === 'object' && data !== null 
    ? (data.disponivel !== undefined ? data : data.verificar_disponibilidade || data)
    : { disponivel: false, conflitos: [] };

  return {
    disponivel: resultado.disponivel,
    conflitos: resultado.conflitos || []
  };
};

