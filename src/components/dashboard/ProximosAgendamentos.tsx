import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  confirmado: "bg-success/20 text-success",
  pendente: "bg-warning/20 text-warning",
  cancelado: "bg-destructive/20 text-destructive",
  remarcado: "bg-info/20 text-info",
};

export const ProximosAgendamentos = () => {
  const { agendamentos, isLoading } = useAgendamentos(new Date());

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
              <div
                key={agendamento.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-sm font-semibold text-primary">
                    {agendamento.data ? format(new Date(agendamento.data), "HH:mm") : "--:--"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{agendamento.cliente_nome}</p>
                    <p className="text-sm text-muted-foreground">{agendamento.servico_nome}</p>
                  </div>
                </div>
                <Badge className={statusColors[agendamento.status as keyof typeof statusColors] || ""}>
                  {agendamento.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
