import { Calendar, Users, XCircle, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProximosAgendamentos } from "@/components/dashboard/ProximosAgendamentos";
import { AtividadesRecentes } from "@/components/dashboard/AtividadesRecentes";
import { StatsDetailModal } from "@/components/dashboard/StatsDetailModal";
import { AgendamentoModal } from "@/components/agendamentos/AgendamentoModal";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDashboardAgendamentos } from "@/hooks/useDashboardAgendamentos";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, isLoading } = useDashboardStats();
  const { updateAgendamento } = useAgendamentos();
  
  // Estados para modais
  const [modalCancelamentos, setModalCancelamentos] = useState(false);
  const [modalPendentes, setModalPendentes] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<any>(null);

  // Buscar agendamentos filtrados
  const { agendamentos: cancelados } = useDashboardAgendamentos("cancelado");
  const { agendamentos: pendentes } = useDashboardAgendamentos("pendente");

  // Handlers de ações
  const handleConfirmar = async (id: number) => {
    try {
      await updateAgendamento.mutateAsync({ id, status: "confirmado" });
      toast.success("Agendamento confirmado!");
    } catch (error) {
      toast.error("Erro ao confirmar agendamento");
    }
  };

  const handleCancelar = async (id: number) => {
    try {
      await updateAgendamento.mutateAsync({ id, status: "cancelado" });
      toast.success("Agendamento cancelado!");
    } catch (error) {
      toast.error("Erro ao cancelar agendamento");
    }
  };

  const handleRemarcar = (agendamento: any) => {
    setAgendamentoParaEditar(agendamento);
    setIsEditModalOpen(true);
    setModalCancelamentos(false);
    setModalPendentes(false);
  };

  const handleEditar = (agendamento: any) => {
    setAgendamentoParaEditar(agendamento);
    setIsEditModalOpen(true);
    setModalCancelamentos(false);
    setModalPendentes(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visão geral da sua clínica</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </>
        ) : (
          <>
            <StatsCard
              icon={Calendar}
              title="Agendamentos Hoje"
              value={stats?.agendamentosHoje || 0}
              variant="pink"
              onClick={() => navigate("/agenda/dia")}
            />
            <StatsCard
              icon={Users}
              title="Novos Clientes"
              value={stats?.novosClientes || 0}
              variant="purple"
              onClick={() => navigate("/clientes")}
            />
            <StatsCard
              icon={XCircle}
              title="Cancelamentos"
              value={stats?.cancelamentos || 0}
              variant="yellow"
              onClick={() => setModalCancelamentos(true)}
            />
            <StatsCard
              icon={Clock}
              title="Pendentes"
              value={stats?.pendentes || 0}
              variant="green"
              onClick={() => setModalPendentes(true)}
            />
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProximosAgendamentos />
        </div>
        <div>
          <AtividadesRecentes />
        </div>
      </div>

      {/* Modais de Detalhes */}
      <StatsDetailModal
        open={modalCancelamentos}
        onOpenChange={setModalCancelamentos}
        title="Cancelamentos de Hoje"
        agendamentos={cancelados || []}
        onEditar={handleEditar}
      />

      <StatsDetailModal
        open={modalPendentes}
        onOpenChange={setModalPendentes}
        title="Agendamentos Pendentes"
        agendamentos={pendentes || []}
        onConfirmar={handleConfirmar}
        onCancelar={handleCancelar}
        onRemarcar={handleRemarcar}
        onEditar={handleEditar}
      />

      {/* Modal de Edição */}
      <AgendamentoModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setAgendamentoParaEditar(null);
        }}
        agendamento={agendamentoParaEditar}
      />
    </div>
  );
};

export default Dashboard;
