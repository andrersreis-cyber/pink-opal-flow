import { useState } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { AgendamentoModal } from "@/components/agendamentos/AgendamentoModal";
import { AgendamentoCard } from "@/components/agendamentos/AgendamentoCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const AgendaDia = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<any>(null);
  const { agendamentos, isLoading, updateAgendamento } = useAgendamentos(selectedDate);

  const handleConfirmar = async (id: number) => {
    try {
      await updateAgendamento.mutateAsync({ id, status: 'confirmado' });
      toast.success("Agendamento confirmado!");
    } catch (error) {
      console.error('Erro ao confirmar:', error);
      toast.error("Erro ao confirmar agendamento");
    }
  };

  const handleCancelar = async (id: number) => {
    try {
      await updateAgendamento.mutateAsync({ id, status: 'cancelado' });
      toast.success("Agendamento cancelado!");
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      toast.error("Erro ao cancelar agendamento");
    }
  };

  const handleRemarcar = (agendamento: any) => {
    setAgendamentoParaEditar(agendamento);
    setIsModalOpen(true);
  };

  const handleEditar = (agendamento: any) => {
    setAgendamentoParaEditar(agendamento);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Agenda do Dia</h1>
          <p className="text-muted-foreground mt-2">
            {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Button 
          className="gradient-pink-purple"
          onClick={() => setIsModalOpen(true)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Horários</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : agendamentos?.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum agendamento para este dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agendamentos?.map((agendamento) => (
                <AgendamentoCard
                  key={agendamento.id}
                  agendamento={agendamento}
                  onConfirmar={handleConfirmar}
                  onCancelar={handleCancelar}
                  onRemarcar={handleRemarcar}
                  onEditar={handleEditar}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AgendamentoModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setAgendamentoParaEditar(null);
        }}
        agendamento={agendamentoParaEditar}
        dataInicial={selectedDate}
      />
    </div>
  );
};

export default AgendaDia;
