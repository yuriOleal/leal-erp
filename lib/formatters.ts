// Formatadores centralizados para manter valores monetários e datas
// consistentes em todas as telas do ERP.
export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

// Datas vindas do banco podem estar em YYYY-MM-DD. Ao acrescentar horário
// local, evitamos que o fuso do navegador mostre o dia anterior no Brasil.
const toLocalDate = (value: string | Date) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(toLocalDate(value));

// Mantém os indicadores mensais alinhados ao mês civil da pessoa usuária.
export const isInCurrentMonth = (value: string | Date, referenceDate = new Date()) => {
  const date = toLocalDate(value);
  return date.getFullYear() === referenceDate.getFullYear()
    && date.getMonth() === referenceDate.getMonth();
};
