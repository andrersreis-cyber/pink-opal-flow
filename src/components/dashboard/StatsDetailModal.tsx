import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgendamentoCard } from "@/components/agendamentos/AgendamentoCard";

interface StatsDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  agendamentos: any[];
  onConfirmar?: (id: number) => void;
  onCancelar?: (id: number) => void;
  onRemarcar?: (agendamento: any) => void;
  onEditar?: (agendamento: any) => void;
}

export const StatsDetailModal = ({
  open,
  onOpenChange,
  title,
  agendamentos,
  onConfirmar,
  onCancelar,
  onRemarcar,
  onEditar,
}: StatsDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient flex items-center justify-between">
            {title}
            <Badge variant="outline" className="text-lg">
              {agendamentos.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {agendamentos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum agendamento encontrado</p>
              </div>
            ) : (
              agendamentos.map((agendamento) => (
                <AgendamentoCard
                  key={agendamento.id}
                  agendamento={agendamento}
                  onConfirmar={onConfirmar || (() => {})}
                  onCancelar={onCancelar || (() => {})}
                  onRemarcar={onRemarcar || (() => {})}
                  onEditar={onEditar || (() => {})}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
