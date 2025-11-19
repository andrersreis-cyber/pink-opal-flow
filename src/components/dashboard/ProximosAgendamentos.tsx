import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { Skeleton } from "@/components/ui/skeleton";
import { AgendamentoModal } from "@/components/agendamentos/AgendamentoModal";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AgendamentoCardDashboard } from "./AgendamentoCardDashboard";

export const ProximosAgendamentos = () => {
  const { agendamentos, isLoading, updateAgendamento } = useAgendamentos(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<any>(null);

  const handleConfirmar = async (id: number) => {
    try {
      await updateAgendamento.mutateAsync({ id, status: "confirmado" });
      toast.success("Agendamento confirmado!");
    } catch (error) {
      console.error("Erro ao confirmar:", error);
      toast.error("Erro ao confirmar agendamento");
    }
  };

  const handleCancelar = async (id: number) => {
    try {
      await updateAgendamento.mutateAsync({ id, status: "cancelado" });
      toast.success("Agendamento cancelado!");
    } catch (error) {
      console.error("Erro ao cancelar:", error);
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

  const ativos =
    agendamentos?.filter(
      (a) => a.status === "confirmado" || a.status === "pendente"
    ) ?? [];
  const confirmados = ativos.filter((a) => a.status === "confirmado").length;
  const pendentes = ativos.filter((a) => a.status === "pendente").length;

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
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
          <div className="flex items-center justify-between">
            <CardTitle>Próximos Agendamentos</CardTitle>
            <div className="flex gap-2">
              {confirmados > 0 && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  ✓ {confirmados}
                </Badge>
              )}
              {pendentes > 0 && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                  ⏰ {pendentes}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ativos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum agendamento confirmado ou pendente para hoje
              </p>
            ) : (
              ativos.slice(0, 5).map((agendamento) => (
                <button
                  key={agendamento.id}
                  type="button"
                  onClick={() => handleEditar(agendamento)}
                  className="w-full text-left"
                >
                  <AgendamentoCardDashboard agendamento={agendamento} />
                </button>
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

