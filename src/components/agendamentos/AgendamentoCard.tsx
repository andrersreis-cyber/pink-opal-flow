import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MoreVertical,
  Edit 
} from "lucide-react";
import { formatTimeUTC } from "@/lib/dateUtils";

const statusColors = {
  confirmado: "bg-success/20 text-success",
  pendente: "bg-warning/20 text-warning",
  cancelado: "bg-destructive/20 text-destructive",
  remarcado: "bg-info/20 text-info",
};

interface AgendamentoCardProps {
  agendamento: any;
  onConfirmar: (id: number) => void;
  onCancelar: (id: number) => void;
  onRemarcar: (agendamento: any) => void;
  onEditar: (agendamento: any) => void;
}

export const AgendamentoCard = ({
  agendamento,
  onConfirmar,
  onCancelar,
  onRemarcar,
  onEditar,
}: AgendamentoCardProps) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
      <div className="text-sm font-semibold text-primary min-w-[60px]">
        {agendamento.data ? formatTimeUTC(agendamento.data) : "--:--"}
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{agendamento.cliente_nome}</p>
        <p className="text-sm text-muted-foreground">{agendamento.servico_nome}</p>
      </div>
      <Badge className={statusColors[agendamento.status as keyof typeof statusColors] || ""}>
        {agendamento.status}
      </Badge>
      <div className="text-sm text-muted-foreground">
        {agendamento.duracao_minutos} min
      </div>

      {/* Menu de ações */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-card">
          <DropdownMenuItem onClick={() => onEditar(agendamento)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          
          {agendamento.status !== 'confirmado' && (
            <DropdownMenuItem onClick={() => onConfirmar(agendamento.id)}>
              <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
              Confirmar
            </DropdownMenuItem>
          )}
          
          {agendamento.status !== 'cancelado' && (
            <DropdownMenuItem onClick={() => onCancelar(agendamento.id)}>
              <XCircle className="mr-2 h-4 w-4 text-destructive" />
              Cancelar
            </DropdownMenuItem>
          )}
          
          {agendamento.status !== 'cancelado' && (
            <DropdownMenuItem onClick={() => onRemarcar(agendamento)}>
              <Calendar className="mr-2 h-4 w-4 text-info" />
              Remarcar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
