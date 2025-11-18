import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAgendamentosMes } from "@/hooks/useAgendamentosMes";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { AgendamentoModal } from "@/components/agendamentos/AgendamentoModal";
import { StatsDetailModal } from "@/components/dashboard/StatsDetailModal";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const AgendaMes = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<any>(null);
  
  const { agendamentos, isLoading, inicioMes, fimMes } = useAgendamentosMes(selectedMonth);
  const { updateAgendamento } = useAgendamentos();

  // Gerar array de dias para o calendário (incluindo dias do mês anterior/posterior)
  const inicioCalendario = startOfWeek(startOfMonth(selectedMonth), { weekStartsOn: 0 });
  const fimCalendario = endOfWeek(endOfMonth(selectedMonth), { weekStartsOn: 0 });
  const diasDoCalendario = eachDayOfInterval({ start: inicioCalendario, end: fimCalendario });

  // Dias da semana
  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Contar agendamentos por dia
  const contarAgendamentos = (dia: Date) => {
    return agendamentos?.filter(ag => 
      isSameDay(new Date(ag.data), dia)
    ).length || 0;
  };

  // Obter agendamentos de um dia específico
  const agendamentosDoDia = (dia: Date) => {
    return agendamentos?.filter(ag => 
      isSameDay(new Date(ag.data), dia)
    ) || [];
  };

  const handleDayClick = (dia: Date) => {
    setSelectedDate(dia);
    const agendamentosDia = agendamentosDoDia(dia);
    
    if (agendamentosDia.length > 0) {
      setIsDayModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
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
    setIsDayModalOpen(false);
    setIsModalOpen(true);
  };

  const handleEditar = (agendamento: any) => {
    setAgendamentoParaEditar(agendamento);
    setIsDayModalOpen(false);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho com Navegação */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Agenda do Mês</h1>
          <p className="text-muted-foreground mt-2">
            {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setSelectedMonth(new Date())}
          >
            Hoje
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button 
            className="gradient-pink-purple ml-4"
            onClick={() => {
              setSelectedDate(null);
              setAgendamentoParaEditar(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Calendário Mensal */}
      <Card className="glass-card">
        <CardContent className="p-6">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {diasDaSemana.map((dia) => (
              <div key={dia} className="text-center font-semibold text-sm text-muted-foreground py-2">
                {dia}
              </div>
            ))}
          </div>

          {/* Grade de dias */}
          {isLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {diasDoCalendario.map((dia, index) => {
                const isDiaAtual = isSameDay(dia, new Date());
                const isMesAtual = isSameMonth(dia, selectedMonth);
                const qtdAgendamentos = contarAgendamentos(dia);

                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(dia)}
                    className={`
                      min-h-24 p-2 rounded-lg border transition-all
                      hover:border-pink-500 hover:shadow-lg
                      ${isDiaAtual ? 'bg-pink-500/20 border-pink-500 ring-2 ring-pink-500' : 'border-border'}
                      ${!isMesAtual ? 'opacity-40' : ''}
                      ${qtdAgendamentos > 0 ? 'bg-accent' : ''}
                      cursor-pointer
                    `}
                  >
                    <div className="flex flex-col items-center justify-between h-full">
                      <span className={`text-sm font-semibold ${isDiaAtual ? 'text-pink-500' : ''}`}>
                        {format(dia, "d")}
                      </span>
                      
                      {qtdAgendamentos > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs mt-1"
                        >
                          {qtdAgendamentos}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Dia */}
      {selectedDate && (
        <StatsDetailModal
          open={isDayModalOpen}
          onOpenChange={setIsDayModalOpen}
          title={`Agendamentos - ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })}`}
          agendamentos={agendamentosDoDia(selectedDate)}
          onConfirmar={handleConfirmar}
          onCancelar={handleCancelar}
          onRemarcar={handleRemarcar}
          onEditar={handleEditar}
        />
      )}

      {/* Modal de Novo/Editar Agendamento */}
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

export default AgendaMes;
