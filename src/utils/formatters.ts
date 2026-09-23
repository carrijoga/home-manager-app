/**
 * @fileoverview Funções utilitárias para formatação
 */

/**
 * Formata uma data para o padrão brasileiro (dd/mm/yyyy)
 * @param date - Data a ser formatada
 * @returns Data formatada
 */
export function formatDateBR(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
}

/**
 * Formata um valor monetário para o padrão brasileiro
 * @param value - Valor a ser formatado
 * @returns Valor formatado (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Gera um ID único baseado no timestamp
 * @returns ID único
 */
export function generateId(): number {
  return Date.now();
}

/**
 * Formata uma data/hora completa para o padrão brasileiro
 * @param date - Data a ser formatada
 * @returns Data e hora formatadas
 */
export function formatDateTimeBR(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('pt-BR');
}

/**
 * Obtém a data atual no formato ISO (YYYY-MM-DD)
 * @returns Data atual em formato ISO
 */
export function getCurrentDateISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Obtém o nome do mês atual em português
 * @returns Nome do mês e ano (ex: "Outubro 2025")
 */
export function getCurrentMonthName(): string {
  const now = new Date();
  const month = now.toLocaleDateString('pt-BR', { month: 'long' });
  const year = now.getFullYear();
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
}

/**
 * Verifica se uma data está no passado
 * @param date - Data a verificar
 * @returns True se a data está no passado
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj < today;
}

/**
 * Calcula a diferença em dias entre duas datas
 * @param date1 - Primeira data
 * @param date2 - Segunda data
 * @returns Diferença em dias
 */
export function daysDifference(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default {
  formatDateBR,
  formatCurrency,
  generateId,
  formatDateTimeBR,
  getCurrentDateISO,
  getCurrentMonthName,
  isPastDate,
  daysDifference,
};
