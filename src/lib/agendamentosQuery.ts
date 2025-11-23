/**
 * Helper para buscar agendamentos com RLS aplicado
 * 
 * Como VIEWs não suportam RLS, precisamos buscar direto da tabela
 * `agendamentos` com JOINs para respeitar as políticas de segurança.
 */

import { supabase } from "@/integrations/supabase/client";

export type AgendamentoCompleto = {
  id: number;
  cliente_id: number;
  servico_id: string;
  funcionario_id: string;
  data: string;
  duracao_minutos: number;
  preco: number;
  status: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Dados do cliente
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email?: string;
  // Dados do serviço
  servico_nome: string;
  servico_duracao: number;
  servico_preco: number;
  servico_categoria: string;
  // Dados do funcionário
  funcionario_nome: string;
  funcionario_email: string;
};

export const buildAgendamentosQuery = () => {
  return supabase
    .from("agendamentos")
    .select(`
      *,
      cliente:clientes(id, nome, telefone, email),
      servico:servicos(id, nome, duracao_minutos, preco, categoria),
      funcionario:profiles!agendamentos_funcionario_id_fkey(id, nome, email)
    `);
};

export const transformAgendamento = (ag: any): AgendamentoCompleto => ({
  ...ag,
  cliente_id: ag.cliente?.id,
  cliente_nome: ag.cliente?.nome,
  cliente_telefone: ag.cliente?.telefone,
  cliente_email: ag.cliente?.email,
  servico_id: ag.servico?.id,
  servico_nome: ag.servico?.nome,
  servico_duracao: ag.servico?.duracao_minutos,
  servico_preco: ag.servico?.preco,
  servico_categoria: ag.servico?.categoria,
  funcionario_nome: ag.funcionario?.nome,
  funcionario_email: ag.funcionario?.email,
});

