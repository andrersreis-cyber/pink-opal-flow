import { Phone, MessageSquare, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConversaCardProps {
  conversa: {
    cliente_id: number | null;
    cliente_nome: string | null;
    telefone: string | null;
    total_mensagens: number;
    ultima_mensagem: string;
  };
  onClick: () => void;
}

export const ConversaCard = ({ conversa, onClick }: ConversaCardProps) => {
  return (
    <Card 
      className="glass-card hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {conversa.cliente_nome}
              </h3>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>

          {/* Phone Badge */}
          {conversa.telefone && (
            <Badge variant="outline" className="text-xs">
              <Phone className="h-3 w-3 mr-1" />
              {conversa.telefone}
            </Badge>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{conversa.total_mensagens} msg</span>
            </div>
            <div className="text-xs">
              {formatDistanceToNow(new Date(conversa.ultima_mensagem), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
