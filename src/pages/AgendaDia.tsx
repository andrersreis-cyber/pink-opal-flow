import { useState } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  confirmado: "bg-success/20 text-success",
  pendente: "bg-warning/20 text-warning",
  cancelado: "bg-destructive/20 text-destructive",
  remarcado: "bg-info/20 text-info",
};

const AgendaDia = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { agendamentos, isLoading } = useAgendamentos(selectedDate);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Agenda do Dia</h1>
          <p className="text-muted-foreground mt-2">
            {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Button className="gradient-pink-purple">
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
                <div
                  key={agendamento.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="text-sm font-semibold text-primary min-w-[60px]">
                    {agendamento.data ? format(new Date(agendamento.data), "HH:mm") : "--:--"}
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaDia;
