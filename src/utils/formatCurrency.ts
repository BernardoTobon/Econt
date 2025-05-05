// Formatea un número a $X.XXX formato colombiano sin decimales
export function formatCurrencyCOP(value: string | number): string {
  let num = typeof value === 'string' ? value.replace(/[^\d]/g, '') : value;
  if (typeof num === 'string') num = parseInt(num, 10) || 0;
  return '$' + num.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}
