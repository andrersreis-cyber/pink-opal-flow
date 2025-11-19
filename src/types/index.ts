export interface ConversationHistory {
  id: string;
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageDate: string;
  status: "ativo" | "arquivado";
  messages: Array<{
    id: string;
    clientId: string;
    clientName: string;
    content: string;
    timestamp: string;
    sender: "client" | "system";
  }>;
  // Compatibilidade com componentes existentes
  cliente_id: number | null;
  cliente_nome: string | null;
  telefone: string | null;
  total_mensagens: number;
  ultima_mensagem: string;
}
