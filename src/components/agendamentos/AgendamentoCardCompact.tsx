import { Card } from "@/components/ui/card";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Edit,
  Clock
} from "lucide-react";
import { formatTimeUTC } from "@/lib/dateUtils";

const statusConfig = {
  confirmado: { 
    color: "bg-success/10 border-success/30 hover:bg-success/20",
    textColor: "text-success",
    icon: CheckCircle2 
  },
  pendente: { 
    color: "bg-warning/10 border-warning/30 hover:bg-warning/20",
    textColor: "text-warning",
    icon: Clock 
  },
  cancelado: { 
    color: "bg-destructive/10 border-destructive/30",
    textColor: "text-destructive",
    icon: XCircle 
  },
};

interface AgendamentoCardCompactProps {
  agendamento: any;
  onConfirmar: (id: number) => void;
  onCancelar: (id: number) => void;
  onRemarcar: (agendamento: any) => void;
  onEditar: (agendamento: any) => void;
}

export const AgendamentoCardCompact = ({
  agendamento,
  onConfirmar,
  onCancelar,
  onRemarcar,
  onEditar,
}: AgendamentoCardCompactProps) => {
  const config = statusConfig[agendamento.status as keyof typeof statusConfig] || statusConfig.pendente;
  const StatusIcon = config.icon;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className={`p-3 cursor-pointer transition-all border ${config.color}`}>
          {/* Horário */}
          <div className="text-lg font-bold text-primary mb-2">
            {agendamento.data ? formatTimeUTC(agendamento.data) : "--:--"}
          </div>
          
          {/* Nome do Cliente */}
          <div className="font-medium text-sm text-foreground mb-1 line-clamp-1">
            {agendamento.cliente_nome}
          </div>
          
          {/* Serviço */}
          <div className="text-xs text-muted-foreground mb-1 line-clamp-1">
            {agendamento.servico_nome}
          </div>
          
          {/* Status */}
          <div className={`flex items-center gap-1 text-xs ${config.textColor} mb-1`}>
            <StatusIcon className="h-3 w-3" />
            <span className="capitalize">{agendamento.status}</span>
          </div>
          
          {/* Duração */}
          <div className="text-xs text-muted-foreground">
            {agendamento.duracao_minutos} min
          </div>
        </Card>
      </ContextMenuTrigger>

      <ContextMenuContent className="glass-card w-48">
        <ContextMenuItem onClick={() => onEditar(agendamento)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </ContextMenuItem>
        
        {agendamento.status !== 'confirmado' && (
          <ContextMenuItem onClick={() => onConfirmar(agendamento.id)}>
            <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
            Confirmar
          </ContextMenuItem>
        )}
        
        {agendamento.status !== 'cancelado' && (
          <ContextMenuItem onClick={() => onCancelar(agendamento.id)}>
            <XCircle className="mr-2 h-4 w-4 text-destructive" />
            Cancelar
          </ContextMenuItem>
        )}
        
        {agendamento.status !== 'cancelado' && (
          <ContextMenuItem onClick={() => onRemarcar(agendamento)}>
            <Calendar className="mr-2 h-4 w-4 text-info" />
            Remarcar
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
