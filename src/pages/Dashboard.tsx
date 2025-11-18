import { Calendar, Users, XCircle, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProximosAgendamentos } from "@/components/dashboard/ProximosAgendamentos";
import { AtividadesRecentes } from "@/components/dashboard/AtividadesRecentes";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { stats, isLoading } = useDashboardStats();

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
            />
            <StatsCard
              icon={Users}
              title="Novos Clientes"
              value={stats?.novosClientes || 0}
              variant="purple"
            />
            <StatsCard
              icon={XCircle}
              title="Cancelamentos"
              value={stats?.cancelamentos || 0}
              variant="yellow"
            />
            <StatsCard
              icon={Clock}
              title="Pendentes"
              value={stats?.pendentes || 0}
              variant="green"
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
    </div>
  );
};

export default Dashboard;
