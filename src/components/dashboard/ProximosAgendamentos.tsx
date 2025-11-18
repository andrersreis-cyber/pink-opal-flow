import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { Skeleton } from "@/components/ui/skeleton";
import { AgendamentoCard } from "@/components/agendamentos/AgendamentoCard";
import { AgendamentoModal } from "@/components/agendamentos/AgendamentoModal";
import { toast } from "sonner";

export const ProximosAgendamentos = () => {
  const { agendamentos, isLoading, updateAgendamento } = useAgendamentos(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<any>(null);

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

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agendamentos?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum agendamento para hoje
              </p>
            ) : (
              agendamentos?.slice(0, 5).map((agendamento) => (
                <AgendamentoCard
                  key={agendamento.id}
                  agendamento={agendamento}
                  onConfirmar={handleConfirmar}
                  onCancelar={handleCancelar}
                  onRemarcar={handleRemarcar}
                  onEditar={handleEditar}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AgendamentoModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setAgendamentoParaEditar(null);
        }}
        agendamento={agendamentoParaEditar}
      />
    </>
  );
};
