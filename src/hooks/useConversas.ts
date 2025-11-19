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
        .from("vw_conversas")
        .select("*")
        .order("created_at", { ascending: false });

      if (filtro) {
        query = query.or(
          `cliente_nome.ilike.%${filtro}%,telefone.ilike.%${filtro}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      const grouped = (data || []).reduce((acc: Record<string, ConversaGrupo>, msg: any) => {
        // Normalizar telefone (remover @lid e outros sufixos)
        const telefoneNormalizado = msg.telefone?.replace(/@.*$/, '') || 'sem-telefone';
        const key = msg.cliente_id?.toString() || telefoneNormalizado;
        
        if (!acc[key]) {
          acc[key] = {
            cliente_id: msg.cliente_id,
            cliente_nome: msg.cliente_nome || "Cliente sem nome",
            telefone: telefoneNormalizado,
            mensagens: [],
            ultima_mensagem: msg.created_at,
            total_mensagens: 0,
          };
        }
        acc[key].mensagens.push(msg);
        acc[key].total_mensagens++;
        if (new Date(msg.created_at) > new Date(acc[key].ultima_mensagem)) {
          acc[key].ultima_mensagem = msg.created_at;
        }
        return acc;
      }, {} as Record<string, ConversaGrupo>);

      return Object.values(grouped).sort(
        (a, b) =>
          new Date(b.ultima_mensagem).getTime() -
          new Date(a.ultima_mensagem).getTime()
      );
    },
  });

  return { conversas, isLoading, filtro, setFiltro };
};
