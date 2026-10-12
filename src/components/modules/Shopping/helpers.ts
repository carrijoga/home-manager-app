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

export function quantityLabel(quantity: number | string, unitType: number | string): string {
  return `${quantity} ${UNIT_TYPE_LABELS[Number(unitType)] ?? 'un'}`;
}

/** Rótulo de quantidade: comprada (se comprado) + "(planejado …)" quando difere. */
export function getQuantityDisplay(item: {
  quantity: number | string;
  purchasedQuantity?: number | null;
  unitType: number | string;
  isPurchased: boolean;
  status?: number;
}): { label: string; plannedLabel: string | null } {
  const purchased = item.isPurchased || item.status === 1;
  if (purchased && item.purchasedQuantity != null) {
    const differs = Number(item.purchasedQuantity) !== Number(item.quantity);
    return {
      label: quantityLabel(item.purchasedQuantity, item.unitType),
      plannedLabel: differs ? `(planejado ${quantityLabel(item.quantity, item.unitType)})` : null,
    };
  }
  return { label: quantityLabel(item.quantity, item.unitType), plannedLabel: null };
}

export function isPricePerUnit(unitType: number | string): boolean {
  return [0, 1, 3, 5, 6, 7].includes(Number(unitType));
}

export function getItemMultiplier(unitType: number | string, quantity: number | string): number {
  const qty = Number(quantity);
  return isPricePerUnit(unitType) ? (qty > 0 ? qty : 1) : 1;
}

export function getItemEstimatedTotal(
  estimatedPrice: number | null | undefined,
  quantity: number | string,
  unitType: number | string
): number {
  if (estimatedPrice == null) return 0;
  return Number(estimatedPrice) * getItemMultiplier(unitType, quantity);
}

/** Quantidade usada no gasto: a comprada quando > 0, senão 1 (regra do backend). */
export function getSpentQuantity(item: { purchasedQuantity?: number | string | null }): number {
  const qty = Number(item.purchasedQuantity ?? 0);
  return qty > 0 ? qty : 1;
}

export interface SpentInput {
  price?: number | null;
  purchasedQuantity?: number | string | null;
  unitType: number | string;
}

/** Gasto = preço × quantidade comprada (em unidades por item; g/mL não multiplicam). */
export function getItemSpentTotal(item: SpentInput): number {
  if (item.price == null) return 0;
  return Number(item.price) * getItemMultiplier(item.unitType, getSpentQuantity(item));
}

export function unitPriceLabel(
  price: number | null | undefined,
  unitType: number | string
): string | null {
  if (price == null) return null;
  const unit = UNIT_TYPE_LABELS[Number(unitType)] ?? 'un';
  return `R$ ${Number(price).toFixed(2).replace('.', ',')}/${unit}`;
}

export interface SavingsInput extends SpentInput {
  estimatedPrice?: number | null;
}

/**
 * Variação de preço do item comprado. O estimado é recalculado na quantidade
 * comprada: comprar mais do que o planejado não conta como "acréscimo".
 */
export function getSavingsInfo(item: SavingsInput) {
  if (item.estimatedPrice == null || item.price == null) return null;
  const estTotal = getItemEstimatedTotal(item.estimatedPrice, getSpentQuantity(item), item.unitType);
  const paidTotal = getItemSpentTotal(item);
  if (estTotal <= 0) return null;
  const diff = paidTotal - estTotal;
  if (Math.abs(diff) < 0.01) return { type: 'equal' as const, diff: 0, pct: 0 };
  const pct = Math.round((Math.abs(diff) / estTotal) * 100);
  if (diff < 0) {
    return { type: 'savings' as const, diff: Math.abs(diff), pct };
  }
  return { type: 'increase' as const, diff: Math.abs(diff), pct };
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

export const emptyPurchaseForm = (
  quantity?: number | string,
  est?: number | null
): PurchaseFormData => ({
  quantity: quantity ? String(quantity) : '1',
  price: est ?? null,
  purchasedAt: todayISO(),
});
