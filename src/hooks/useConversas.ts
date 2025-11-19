import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ConversationHistory } from "@/types";

export const useConversas = () => {
  const { data: conversas, isLoading } = useQuery({
    queryKey: ["conversas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vw_conversas_formatadas")
        .select("*")
        .order("last_message_date", { ascending: false });

      if (error) throw error;

      return (data || []).map((conv: any) => ({
        // Formato camelCase (novo)
        id: conv.id,
        clientId: conv.client_id || conv.phone,
        clientName: conv.client_name || "Cliente sem nome",
        lastMessage: conv.last_message || "",
        lastMessageDate: conv.last_message_date,
        status: (conv.status || "ativo") as "ativo" | "arquivado",
        messages: (conv.messages || []).map((msg: any) => ({
          id: msg.id,
          clientId: conv.client_id || conv.phone,
          clientName: conv.client_name || "Cliente sem nome",
          content: msg.content,
          timestamp: msg.timestamp,
          sender: msg.sender === "client" ? "client" : "system",
        })),
        // Formato snake_case (compatibilidade com componentes existentes)
        cliente_id: conv.client_id ? parseInt(conv.client_id) : null,
        cliente_nome: conv.client_name || "Cliente sem nome",
        telefone: conv.phone,
        total_mensagens: (conv.messages || []).length,
        ultima_mensagem: conv.last_message_date,
      })) as ConversationHistory[];
    },
  });

  return {
    conversas,
    isLoading,
  };
};
