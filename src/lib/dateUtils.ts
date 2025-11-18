// Gerar horários disponíveis (30min de intervalo, 08:00 - 20:00)
export const gerarHorarios = (): string[] => {
  const horarios: string[] = [];
  for (let h = 8; h <= 20; h++) {
    horarios.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 20) {
      horarios.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }
  return horarios;
};

// Converter data + hora para ISO 8601
export const criarDataHora = (data: string, hora: string): string => {
  return new Date(`${data}T${hora}:00`).toISOString();
};

// Verificar conflito de horário
export const verificarConflito = (
  data: string,
  hora: string,
  duracao: number,
  agendamentos: any[],
  agendamentoAtualId?: number
): boolean => {
  const novoInicio = new Date(`${data}T${hora}:00`);
  const novoFim = new Date(novoInicio.getTime() + duracao * 60000);
  
  return agendamentos.some(ag => {
    // Ignorar o agendamento atual ao editar
    if (agendamentoAtualId && ag.id === agendamentoAtualId) {
      return false;
    }
    
    // Ignorar agendamentos cancelados
    if (ag.status === 'cancelado') {
      return false;
    }
    
    const agInicio = new Date(ag.data);
    const agFim = new Date(agInicio.getTime() + ag.duracao_minutos * 60000);
    
    return (
      (novoInicio >= agInicio && novoInicio < agFim) ||
      (novoFim > agInicio && novoFim <= agFim) ||
      (novoInicio <= agInicio && novoFim >= agFim)
    );
  });
};
