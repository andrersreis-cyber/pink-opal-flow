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
  try {
    const dataHora = new Date(`${data}T${hora}:00`);
    
    if (isNaN(dataHora.getTime())) {
      throw new Error(`Data/hora inválida: ${data} ${hora}`);
    }
    
    return dataHora.toISOString();
  } catch (error) {
    console.error("Erro ao criar data/hora:", error);
    throw error;
  }
};

// Verificar conflito de horário
export const verificarConflito = (
  data: string,
  hora: string,
  duracao: number,
  agendamentos: any[],
  agendamentoAtualId?: number
): boolean => {
  try {
    const novoInicio = new Date(`${data}T${hora}:00`);
    const novoFim = new Date(novoInicio.getTime() + duracao * 60000);
    
    // Validar se as datas são válidas
    if (isNaN(novoInicio.getTime()) || isNaN(novoFim.getTime())) {
      console.error("Data inválida:", data, hora);
      return true; // Considerar conflito se data inválida
    }
    
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
      
      // Validar datas do agendamento
      if (isNaN(agInicio.getTime()) || isNaN(agFim.getTime())) {
        return false;
      }
      
      return (
        (novoInicio >= agInicio && novoInicio < agFim) ||
        (novoFim > agInicio && novoFim <= agFim) ||
        (novoInicio <= agInicio && novoFim >= agFim)
      );
    });
  } catch (error) {
    console.error("Erro ao verificar conflito:", error);
    return true; // Considerar conflito em caso de erro
  }
};
