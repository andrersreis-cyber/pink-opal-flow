// Formatar telefone brasileiro
export const formatarTelefone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, ddd, p1, p2) => {
      return p2 ? `(${ddd}) ${p1}-${p2}` : p1 ? `(${ddd}) ${p1}` : `(${ddd}`;
    });
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, ddd, p1, p2) => {
    return p2 ? `(${ddd}) ${p1}-${p2}` : `(${ddd}) ${p1}`;
  });
};

// Limpar telefone para salvar no banco
export const limparTelefone = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Formatar preço
export const formatarPreco = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
