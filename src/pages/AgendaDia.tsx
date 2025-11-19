import { useState } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { AgendamentoModal } from "@/components/agendamentos/AgendamentoModal";
import { AgendamentoCardDashboard } from "@/components/dashboard/AgendamentoCardDashboard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const AgendaDia = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<any>(null);
  const { agendamentos, isLoading } = useAgendamentos(selectedDate);

  const handleCardClick = (agendamento: any) => {
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
          <CardTitle>Horários do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : agendamentos?.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum agendamento para este dia</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agendamentos?.map((agendamento) => (
                <div
                  key={agendamento.id}
                  onClick={() => handleCardClick(agendamento)}
                  className="cursor-pointer"
                >
                  <AgendamentoCardDashboard agendamento={agendamento} />
                </div>
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
