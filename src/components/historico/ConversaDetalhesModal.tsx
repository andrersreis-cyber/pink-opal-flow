import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConversaDetalhesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversa: any;
}

export const ConversaDetalhesModal = ({
  open,
  onOpenChange,
  conversa,
}: ConversaDetalhesModalProps) => {
  if (!conversa) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-2xl text-gradient">
              {conversa.cliente_nome}
            </DialogTitle>
            <div className="flex gap-2">
              {conversa.telefone && (
                <Badge variant="outline">
                  <Phone className="h-3 w-3 mr-1" />
                  {conversa.telefone}
                </Badge>
              )}
              <Badge variant="outline">
                {conversa.total_mensagens} mensagens
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {conversa.mensagens?.map((msg: any) => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg ${
                  msg.direcao === "incoming"
                    ? "bg-primary/10 ml-0 mr-12"
                    : "bg-muted ml-12 mr-0"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge
                    variant={msg.direcao === "incoming" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {msg.direcao === "incoming" ? "Cliente" : "Bot"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm">
                  {msg.direcao === "incoming"
                    ? (msg.mensagem_usuario || "Mensagem sem conteúdo")
                    : (msg.mensagem_bot || "Mensagem do sistema sem conteúdo")}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
