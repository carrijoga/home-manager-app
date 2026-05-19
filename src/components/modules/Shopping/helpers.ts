import { UNIT_TYPE_LABELS } from '@/schemas/enums';

import type { ItemFormData, ListFormData, PurchaseFormData } from './types';

export function toISOMonthYear(ymStr: string): string {
  return `${ymStr}-01T00:00:00Z`;
}

export function fromISOMonthYear(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthYearPT(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatMonthYearShort(ymStr: string): string {
  return new Date(`${ymStr}-01T00:00:00Z`).toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function quantityLabel(quantity: number, unitType: number): string {
  return `${quantity} ${UNIT_TYPE_LABELS[unitType] ?? 'un'}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function addMonths(ymStr: string, delta: number): string {
  const [y, m] = ymStr.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export const emptyListForm = (): ListFormData => ({
  name: '',
  monthYear: currentMonthValue(),
  notes: '',
});

export const emptyItemForm = (): ItemFormData => ({
  name: '',
  quantity: '1',
  unitType: '0',
  categoryId: '',
  estimatedPrice: null,
  notes: '',
});

export const emptyPurchaseForm = (est?: number | null): PurchaseFormData => ({
  price: est ?? null,
  purchasedAt: todayISO(),
});
