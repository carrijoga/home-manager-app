import MoneyInput from '@components/common/MoneyInput';
import { formatCurrency } from '@utils/formatters';
import {
  Check,
  FileText,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { UNIT_TYPE_LABELS } from '@/schemas/enums';
import type { AppShoppingItem } from '@/types';

import {
  getItemEstimatedTotal,
  getItemSpentTotal,
  getSavingsInfo,
  quantityLabel,
  unitPriceLabel,
} from './helpers';

interface ShoppingItemRowProps {
  item: AppShoppingItem;
  isBulkMode: boolean;
  isFinished: boolean;
  isEditing: boolean;
  isSelected: boolean;
  isPending: boolean;
  inlineForm: { qty: string; estimated: number | null; paid: number | null };
  inlineSaving: boolean;
  setInlineForm: React.Dispatch<
    React.SetStateAction<{ qty: string; estimated: number | null; paid: number | null }>
  >;
  onOpenMobileSheet: (item: AppShoppingItem) => void;
  onToggleSelection: (id: string) => void;
  onMarkAsPurchased: (item: AppShoppingItem) => void;
  onUnmark: (item: AppShoppingItem) => void;
  onOpenInlineEdit: (item: AppShoppingItem) => void;
  onCancelInlineEdit: () => void;
  onSaveInlineEdit: (item: AppShoppingItem) => void;
  onDelete: (item: AppShoppingItem) => void;
}

export function ShoppingItemRow(props: ShoppingItemRowProps) {
  const {
    item,
    isBulkMode,
    isFinished,
    isEditing,
    isSelected,
    isPending,
    inlineForm,
    inlineSaving,
    setInlineForm,
    onOpenMobileSheet,
    onToggleSelection,
    onUnmark,
    onOpenInlineEdit,
    onCancelInlineEdit,
    onSaveInlineEdit,
    onDelete,
  } = props;

  const savings = getSavingsInfo(item.estimatedPrice, item.price, item.quantity, item.unitType);

  /* ── Editing state (desktop inline) ── */
  if (isEditing) {
    return (
      <div className="relative border-l-2 border-[#adc6ff] bg-[rgba(173,198,255,0.04)] px-5 py-5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(173,198,255,0.04)] to-transparent" />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#adc6ff]">
            <Check size={13} style={{ color: '#0e0e0e' }} strokeWidth={3} />
          </div>
          <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{item.name}</span>

          {/* Qty stepper */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Quantidade
            </span>
            <div className="flex h-9 items-center gap-0 rounded-xl border border-border bg-background">
              <button
                type="button"
                className="flex h-full w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                onClick={() =>
                  setInlineForm((f) => ({
                    ...f,
                    qty: String(Math.max(0, parseFloat(f.qty || '1') - 1)),
                  }))
                }
              >
                <Minus size={12} />
              </button>
              <span className="w-16 text-center text-sm text-foreground">
                {inlineForm.qty} {UNIT_TYPE_LABELS[item.unitType] ?? 'un'}
              </span>
              <button
                type="button"
                className="flex h-full w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                onClick={() =>
                  setInlineForm((f) => ({
                    ...f,
                    qty: String(parseFloat(f.qty || '0') + 1),
                  }))
                }
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Estimated price */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Estimado (R$)
            </span>
            <MoneyInput
              value={inlineForm.estimated}
              onChange={(v) => setInlineForm((f) => ({ ...f, estimated: v }))}
              className="h-9 w-28 rounded-xl bg-background text-sm"
            />
          </div>

          {/* Paid price */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Pago (R$)
            </span>
            <MoneyInput
              value={inlineForm.paid}
              onChange={(v) => setInlineForm((f) => ({ ...f, paid: v }))}
              className="h-9 w-28 rounded-xl bg-background text-sm"
            />
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onCancelInlineEdit}
              className="px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              disabled={inlineSaving}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onSaveInlineEdit(item)}
              disabled={inlineSaving}
              className="rounded-2xl px-6 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ background: '#adc6ff', color: '#0e0e0e' }}
            >
              {inlineSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Bulk Mode ── */
  if (isBulkMode) {
    return (
      <div
        className={cn(
          'flex items-center gap-4 px-5 py-4 transition-colors duration-200',
          isSelected ? 'bg-[rgba(120,160,255,0.06)]' : ''
        )}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(item.shoppingItemId)}
          className="shrink-0"
        />
        <div className="h-6 w-6 shrink-0 rounded-lg border border-border/60" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
          {item.notes && (
            <span className="truncate text-xs text-muted-foreground/80">{item.notes}</span>
          )}
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {quantityLabel(item.quantity, item.unitType)}
        </span>
        {item.estimatedPrice != null && (
          <span className="text-sm font-medium text-muted-foreground">
            {formatCurrency(
              getItemEstimatedTotal(item.estimatedPrice, item.quantity, item.unitType)
            )}
          </span>
        )}
      </div>
    );
  }

  /* ── Normal / Purchased state ── */
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-5 py-3.5 transition-colors duration-150',
        item.isPurchased
          ? 'opacity-75 hover:opacity-100'
          : 'cursor-pointer hover:bg-accent/30 active:bg-accent/50'
      )}
      onClick={() => {
        if (isFinished) return;
        onOpenMobileSheet(item);
      }}
    >
      {/* Checkbox button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isFinished) {
            if (item.isPurchased) onUnmark(item);
          }
        }}
        disabled={isFinished || isPending}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all',
          item.isPurchased
            ? 'bg-[#78dc77] text-[#131313] hover:opacity-80'
            : 'border border-border/80 bg-background/50 hover:border-foreground/40'
        )}
      >
        {isPending ? (
          <Spinner size="sm" />
        ) : item.isPurchased ? (
          <Check size={13} strokeWidth={3} />
        ) : null}
      </button>

      {/* Item info (Name, category, notes, unit price breakdown) */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'truncate text-sm font-medium transition-colors',
              item.isPurchased ? 'text-muted-foreground line-through' : 'text-foreground'
            )}
          >
            {item.name}
          </span>
          {item.categoryName && (
            <span className="hidden items-center gap-1 rounded-md border border-border/50 bg-accent/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
              <Tag size={9} />
              {item.categoryName}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
          {/* Quantity & Unit Price Breakdown */}
          <span className="text-[12px] font-medium text-foreground/80">
            {quantityLabel(item.quantity, item.unitType)}
            {item.quantity > 1 && item.price != null && (
              <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                ({unitPriceLabel(item.price, item.unitType)})
              </span>
            )}
            {item.quantity > 1 && item.price == null && item.estimatedPrice != null && (
              <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                ({unitPriceLabel(item.estimatedPrice, item.unitType)})
              </span>
            )}
          </span>

          {/* Observações / Notes */}
          {item.notes && (
            <span className="flex items-center gap-1 text-[11px] italic text-muted-foreground/80">
              <FileText size={10} className="shrink-0 opacity-70" />
              <span className="max-w-[180px] truncate">{item.notes}</span>
            </span>
          )}
        </div>
      </div>

      {/* Desktop Columns: Estimated Total | Paid Total & Savings Badge */}
      <div className="hidden items-center gap-6 pr-2 sm:flex">
        {/* Estimated Column */}
        <div className="flex w-24 flex-col items-end">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Estimado
          </span>
          <span
            className={cn(
              'text-sm font-medium',
              item.isPurchased ? 'text-muted-foreground/60 line-through' : 'text-foreground/90'
            )}
          >
            {item.estimatedPrice != null
              ? formatCurrency(
                  getItemEstimatedTotal(item.estimatedPrice, item.quantity, item.unitType)
                )
              : '---'}
          </span>
        </div>

        {/* Paid Column + Savings Badge */}
        <div className="flex w-28 flex-col items-end">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {item.isPurchased ? 'Pago Total' : 'Pago'}
          </span>
          <span
            className={cn(
              'text-sm font-semibold',
              item.isPurchased ? 'text-[#78dc77]' : 'text-muted-foreground/50'
            )}
          >
            {item.price != null
              ? formatCurrency(getItemSpentTotal(item.price, item.quantity, item.unitType))
              : '---'}
          </span>

          {/* Savings or Increase indicator */}
          {item.isPurchased && savings && savings.type === 'savings' && (
            <span className="mt-0.5 inline-flex items-center gap-0.5 rounded-full bg-[#78dc77]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#78dc77]">
              <TrendingDown size={10} />-{formatCurrency(savings.diff)} ({savings.pct}%)
            </span>
          )}
          {item.isPurchased && savings && savings.type === 'increase' && (
            <span className="mt-0.5 inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
              <TrendingUp size={10} />+{formatCurrency(savings.diff)}
            </span>
          )}
        </div>
      </div>

      {/* Mobile view: Paid/Estimated + Savings Badge */}
      <div className="flex shrink-0 flex-col items-end text-right sm:hidden">
        {item.isPurchased ? (
          <>
            <span className="text-xs font-semibold text-[#78dc77]">
              {item.price != null
                ? formatCurrency(getItemSpentTotal(item.price, item.quantity, item.unitType))
                : '---'}
            </span>
            {savings && savings.type === 'savings' && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#78dc77]">
                <TrendingDown size={9} />-{formatCurrency(savings.diff)}
              </span>
            )}
            {savings && savings.type === 'increase' && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-500">
                <TrendingUp size={9} />+{formatCurrency(savings.diff)}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            {item.estimatedPrice != null
              ? formatCurrency(
                  getItemEstimatedTotal(item.estimatedPrice, item.quantity, item.unitType)
                )
              : '---'}
          </span>
        )}
      </div>

      {/* Desktop action icons */}
      {!isFinished && (
        <div
          className="hidden shrink-0 items-center gap-0.5 opacity-40 transition-opacity hover:opacity-100 sm:flex"
          onClick={(e) => e.stopPropagation()}
        >
          {item.isPurchased ? (
            <button
              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => onUnmark(item)}
              title="Desfazer compra"
              disabled={isPending}
            >
              <RotateCcw size={13} />
            </button>
          ) : (
            <button
              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => onOpenInlineEdit(item)}
              title="Editar item"
            >
              <Pencil size={13} />
            </button>
          )}
          <button
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
            onClick={() => onDelete(item)}
            title="Remover item"
            disabled={isPending}
          >
            {isPending ? <Spinner size="sm" /> : <Trash2 size={13} />}
          </button>
        </div>
      )}
    </div>
  );
}
