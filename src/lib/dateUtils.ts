/**
 * Utilitários UTC para formatação de data/hora
 * IMPORTANTE: Sempre usar UTC para dados do banco de dados
 */

// Formatar horário local de um timestamp ISO (ex: "2024-11-30T14:00:00Z" → "11:00" se UTC-3)
export const formatTimeLocal = (isoString: string): string => {
  const date = new Date(isoString); // Converte UTC para horário local automaticamente
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Manter compatibilidade temporária com código antigo
export const formatTimeUTC = formatTimeLocal;

// Formatar data UTC de um timestamp ISO (ex: "2024-11-30T14:00:00Z" → "2024-11-30")
export const formatDateUTC = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Formatar data UTC para exibição (ex: "2024-11-30T14:00:00Z" → "30/11")
export const formatDateDisplayUTC = (isoString: string): string => {
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

// Obter data de hoje em UTC (formato YYYY-MM-DD)
export const getTodayUTC = (): string => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Criar data/hora em UTC a partir do horário LOCAL do usuário
export const criarDataHoraUTC = (data: string, hora: string): string => {
  const [year, month, day] = data.split('-').map(Number);
  const [hours, minutes] = hora.split(':').map(Number);
  
  // Criar Date no horário LOCAL do navegador
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  
  // toISOString() converte automaticamente para UTC
  return localDate.toISOString();
};

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

// Converter data + hora para ISO 8601 (mantém UTC)
export const criarDataHora = (data: string, hora: string): string => {
  return criarDataHoraUTC(data, hora);
};

