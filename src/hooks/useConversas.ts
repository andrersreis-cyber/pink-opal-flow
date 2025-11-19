import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export interface ConversaGrupo {
  cliente_id: number | null;
  cliente_nome: string | null;
  telefone: string | null;
  mensagens: any[];
  ultima_mensagem: string;
  total_mensagens: number;
}

export const useConversas = () => {
  const [filtro, setFiltro] = useState("");

  const { data: conversas, isLoading } = useQuery<ConversaGrupo[]>({
    queryKey: ["conversas", filtro],
    queryFn: async () => {
      let query = supabase
        .from("vw_conversas_formatadas")
        .select("*")
        .order("last_message_date", { ascending: false });

      if (filtro) {
        query = query.or(
          `client_name.ilike.%${filtro}%,phone.ilike.%${filtro}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      // Mapear dados da view formatada para o formato esperado pelos componentes
      return (data || []).map((conv: any) => {
        // Mapear mensagens do formato da view para o formato dos componentes
        const mensagens = (conv.messages || []).map((msg: any) => ({
          id: msg.id,
          direcao: msg.sender === "client" ? "incoming" : "outgoing",
          mensagem_usuario: msg.sender === "client" ? msg.content : null,
          mensagem_bot: msg.sender === "bot" ? msg.content : null,
          created_at: msg.timestamp || conv.last_message_date,
        }));

        return {
          cliente_id: conv.client_id ? parseInt(conv.client_id) : null,
          cliente_nome: conv.client_name || "Cliente sem nome",
          telefone: conv.phone,
          mensagens: mensagens,
          ultima_mensagem: conv.last_message_date,
          total_mensagens: mensagens.length,
        };
      });
    },
  });

  return { conversas, isLoading, filtro, setFiltro };
};
