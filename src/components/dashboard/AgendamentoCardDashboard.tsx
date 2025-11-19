import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Scissors } from "lucide-react";
import { formatTimeLocal } from "@/lib/dateUtils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusClasses: Record<string, string> = {
  pendente: "bg-warning/20 text-warning border-warning/30",
  confirmado: "bg-success/20 text-success border-success/30",
  cancelado: "bg-destructive/10 text-destructive border-destructive/30",
};

interface AgendamentoCardDashboardProps {
  agendamento: any;
}

const getTempoRelativo = (isoDate: string) => {
  const agora = new Date();
  const data = new Date(isoDate);
  const diffMs = data.getTime() - agora.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMs < 0) return "Atrasado";
  if (diffMinutes <= 30) return "Agora";
  if (diffHours < 24) return `Em ${diffHours}h`;

  return formatDistanceToNow(data, { addSuffix: true, locale: ptBR });
};

export const AgendamentoCardDashboard = ({
  agendamento,
}: AgendamentoCardDashboardProps) => {
  const tempoRelativo = getTempoRelativo(agendamento.data);
  const urgente = tempoRelativo === "Agora" || tempoRelativo === "Atrasado";
  const statusClass = statusClasses[agendamento.status] ?? "bg-muted text-muted-foreground";

  return (
    <Card
      className={`bg-muted/30 border-0 hover:bg-muted/50 transition-colors ${
        urgente ? "ring-1 ring-primary/60" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-base">
                {formatTimeLocal(agendamento.data)}
              </span>
              <Badge variant={urgente ? "default" : "outline"} className="text-xs">
                {tempoRelativo}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{agendamento.cliente_nome}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Scissors className="h-3 w-3" />
              <span className="truncate">{agendamento.servico_nome}</span>
              {agendamento.duracao_minutos && (
                <>
                  <span>•</span>
                  <span>{agendamento.duracao_minutos}min</span>
                </>
              )}
            </div>
          </div>
          <Badge className={statusClass}>{agendamento.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
