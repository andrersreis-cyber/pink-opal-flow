import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAgendamentosSemana } from "@/hooks/useAgendamentosSemana";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { AgendamentoModal } from "@/components/agendamentos/AgendamentoModal";
import { AgendamentoCardCompact } from "@/components/agendamentos/AgendamentoCardCompact";
import { format, addWeeks, subWeeks, isSameDay, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const AgendaSemana = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { agendamentos, isLoading, inicioSemana, fimSemana } = useAgendamentosSemana(selectedWeek);
  const { updateAgendamento } = useAgendamentos();

  // Gerar array com os 7 dias da semana
  const diasDaSemana = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedWeek, { weekStartsOn: 0 }), i)
  );

  // Agrupar agendamentos por dia
  const agendamentosPorDia = (dia: Date) => {
    return agendamentos?.filter(ag => 
      isSameDay(new Date(ag.data), dia)
    ) || [];
  };

  const handleConfirmar = async (id: number) => {
    try {
      await updateAgendamento.mutateAsync({ id, status: 'confirmado' });
      toast.success("Agendamento confirmado!");
    } catch (error) {
      toast.error("Erro ao confirmar agendamento");
    }
  };

  const handleCancelar = async (id: number) => {
    try {
      await updateAgendamento.mutateAsync({ id, status: 'cancelado' });
      toast.success("Agendamento cancelado!");
    } catch (error) {
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

  const handleNovoAgendamento = (dia?: Date) => {
    setSelectedDate(dia || null);
    setAgendamentoParaEditar(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho com Navegação */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Agenda da Semana</h1>
          <p className="text-muted-foreground mt-2">
            {format(inicioSemana, "d 'de' MMMM", { locale: ptBR })} - {format(fimSemana, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setSelectedWeek(new Date())}
          >
            Hoje
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button 
            className="gradient-pink-purple ml-4"
            onClick={() => handleNovoAgendamento()}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Grade Semanal */}
      <div className="grid grid-cols-7 gap-4">
        {diasDaSemana.map((dia, index) => {
          const agendamentosDoDia = agendamentosPorDia(dia);
          const isHoje = isSameDay(dia, new Date());

          return (
            <Card 
              key={index} 
              className={`glass-card ${isHoje ? 'ring-2 ring-pink-500' : ''}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex flex-col items-center gap-1">
                  <span className="text-muted-foreground uppercase">
                    {format(dia, "EEE", { locale: ptBR })}
                  </span>
                  <span className={`text-2xl ${isHoje ? 'text-pink-500' : ''}`}>
                    {format(dia, "d")}
                  </span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ScrollArea className="h-[500px] pr-2">
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : agendamentosDoDia.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-xs text-muted-foreground">Sem agendamentos</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => handleNovoAgendamento(dia)}
                      >
                        + Adicionar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {agendamentosDoDia.map((agendamento) => (
                        <AgendamentoCardCompact
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
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de Agendamento */}
      <AgendamentoModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setAgendamentoParaEditar(null);
            setSelectedDate(null);
          }
        }}
        agendamento={agendamentoParaEditar}
        dataInicial={selectedDate || undefined}
      />
    </div>
  );
};

export default AgendaSemana;
