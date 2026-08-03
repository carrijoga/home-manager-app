import { PaymentStatus } from '@/schemas/enums';
import type { FinancialTransactionResponse } from '@/schemas/financial';

export type TransactionStatus = 'open' | 'partiallyPaid' | 'paid';

export function getPaidAmount(t: FinancialTransactionResponse): number {
  return (t.payments ?? []).reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
}

/** Mapeamento 1:1 do PaymentStatus — isOverdue é indicado separadamente (não altera este status). */
export function getTransactionStatus(t: FinancialTransactionResponse): TransactionStatus {
  if (t.paymentStatus === PaymentStatus.Paid) return 'paid';
  if (t.paymentStatus === PaymentStatus.PartiallyPaid) return 'partiallyPaid';
  return 'open';
}

/** Data LOCAL em YYYY-MM-DD (não usar toISOString — off-by-one em UTC-3). */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Range [primeiro dia, último dia] do mês, em ISO date local. */
export function getMonthRange(month: Date): { minTransactionDate: string; maxTransactionDate: string } {
  return {
    minTransactionDate: toIsoDate(new Date(month.getFullYear(), month.getMonth(), 1)),
    maxTransactionDate: toIsoDate(new Date(month.getFullYear(), month.getMonth() + 1, 0)),
  };
}

/** "junho de 2026" → "Junho de 2026". */
export function getMonthLabel(month: Date): string {
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(month);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** "Hoje · 10 jun" / "Ontem · 9 jun" / "seg · 8 jun". */
export function getDayGroupLabel(isoDateTime: string): string {
  // Interpreta só a parte de data, em horário local — consistente com a chave de agrupamento
  const date = new Date(`${isoDateTime.slice(0, 10)}T00:00:00`);
  const today = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(today) - startOfDay(date)) / 86_400_000);
  const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' })
    .format(date)
    .replace('.', '');
  if (dayDiff === 0) return `Hoje · ${dayMonth}`;
  if (dayDiff === 1) return `Ontem · ${dayMonth}`;
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', '');
  return `${weekday} · ${dayMonth}`;
}

export interface DayGroup {
  key: string;
  label: string;
  items: FinancialTransactionResponse[];
}

/** Agrupa por dia (assume lista já ordenada por data desc). */
export function groupTransactionsByDay(items: FinancialTransactionResponse[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const t of items) {
    const key = String(t.transactionDate).slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(t);
    } else {
      groups.push({ key, label: getDayGroupLabel(String(t.transactionDate)), items: [t] });
    }
  }
  return groups;
}

/** "venceu há 3 dias" / "vence hoje" / "vence em 5 dias". */
export function getDueLabel(isoDateTime: string): string {
  // Interpreta só a parte de data, em horário local — consistente com a chave de agrupamento
  const due = new Date(`${isoDateTime.slice(0, 10)}T00:00:00`);
  const today = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOfDay(due) - startOfDay(today)) / 86_400_000);
  if (diff === 0) return 'vence hoje';
  if (diff < 0) return `venceu há ${-diff} dia${diff === -1 ? '' : 's'}`;
  return `vence em ${diff} dia${diff === 1 ? '' : 's'}`;
}
