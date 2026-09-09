import MoneyInput from '@components/common/MoneyInput';
import { formatCurrency } from '@utils/formatters';
import {
  Check,
  EyeOff,
  FileText,
  Minus,
  Pencil,
  Plus,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
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
  onIgnore?: (item: AppShoppingItem) => void;
  onUnignore?: (item: AppShoppingItem) => void;
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
    onMarkAsPurchased,
    onUnmark,
    onIgnore,
    onUnignore,
    onOpenInlineEdit,
    onCancelInlineEdit,
    onSaveInlineEdit,
    onDelete,
  } = props;

  const savings = getSavingsInfo(item.estimatedPrice, item.price, item.quantity, item.unitType);

  /* ── Editing state (desktop inline) ── */
  if (isEditing) {
    return (
      <div className="relative border-l-2 border-primary bg-primary/5 px-4 py-4 sm:px-5 sm:py-5">
        <div className="relative flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Check size={16} strokeWidth={3} />
          </div>
          <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">{item.name}</span>

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
                    qty: String(Math.max(0.1, parseFloat(f.qty || '1') - 1)),
                  }))
                }
              >
                <Minus size={12} />
              </button>
              <span className="w-16 text-center text-sm font-semibold text-foreground">
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
              className="h-9 w-28 rounded-xl bg-background text-sm font-medium"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={onCancelInlineEdit}
              disabled={inlineSaving}
            >
              Cancelar
            </button>
            <button
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
              onClick={() => onSaveInlineEdit(item)}
              disabled={inlineSaving}
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
          'flex items-center gap-3.5 px-4 py-3.5 transition-colors cursor-pointer',
          isSelected ? 'bg-primary/10' : 'hover:bg-accent/20'
        )}
        onClick={() => onToggleSelection(item.shoppingItemId)}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(item.shoppingItemId)}
          className="shrink-0 rounded-lg h-5 w-5"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-foreground">{item.name}</span>
          {item.notes && (
            <span className="truncate text-xs text-muted-foreground">{item.notes}</span>
          )}
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {quantityLabel(item.quantity, item.unitType)}
        </span>
        {item.estimatedPrice != null && (
          <span className="text-xs font-semibold text-muted-foreground">
            {formatCurrency(
              getItemEstimatedTotal(item.estimatedPrice, item.quantity, item.unitType)
            )}
          </span>
        )}
      </div>
    );
  }

  const isPurchased = item.status === 1 || item.isPurchased;
  const isIgnored = item.status === 2;
  const isNotPurchased = item.status === 3;
  const isPendingStatus = !isPurchased && !isIgnored && !isNotPurchased;

  /* ── Normal Item State (Mobile-First Touch Target) ── */
  return (
    <div
      className={cn(
        'group flex items-center gap-3.5 px-4 py-3 transition-colors cursor-pointer active:bg-accent/40',
        isPurchased && 'opacity-85 hover:opacity-100 bg-muted/20',
        isIgnored && 'opacity-60 hover:opacity-80 bg-muted/30',
        isNotPurchased && 'opacity-60 hover:opacity-80',
        isPendingStatus && 'hover:bg-accent/25'
      )}
      onClick={() => {
        if (isFinished && !isIgnored && !isNotPurchased) return;
        onOpenMobileSheet(item);
      }}
    >
      {/* Botão de Checkbox Mobile Grande (Toque Fácil com uma só mão) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (isFinished) return;
          if (isPurchased) onUnmark(item);
          else if (isIgnored) onUnignore?.(item);
          else onMarkAsPurchased(item);
        }}
        disabled={isFinished || isPending}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all active:scale-90',
          isPurchased && 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600',
          isIgnored && 'border border-border/80 bg-muted text-muted-foreground hover:bg-accent',
          isNotPurchased && 'border border-destructive/40 bg-destructive/10 text-destructive',
          isPendingStatus && 'border-2 border-border/90 bg-card hover:border-primary hover:bg-primary/5 dark:bg-[#181818]'
        )}
        title={
          isPurchased
            ? 'Desfazer compra'
            : isIgnored
              ? 'Voltar para pendente'
              : isNotPurchased
                ? 'Não comprado'
                : 'Marcar como comprado'
        }
      >
        {isPending ? (
          <Spinner size="sm" />
        ) : isPurchased ? (
          <Check size={16} strokeWidth={3} />
        ) : isIgnored ? (
          <EyeOff size={14} />
        ) : isNotPurchased ? (
          <X size={14} strokeWidth={2.5} />
        ) : null}
      </button>

      {/* Item info (Nome, Categoria, Notas, Quantidade) */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'truncate text-sm font-semibold transition-colors',
              isPurchased || isIgnored || isNotPurchased
                ? 'text-muted-foreground line-through'
                : 'text-foreground'
            )}
          >
            {item.name}
          </span>

          {isIgnored && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              <EyeOff size={9} />
              Ignorado
            </span>
          )}
          {isNotPurchased && (
            <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
              <X size={9} strokeWidth={2.5} />
              Não comprado
            </span>
          )}
        </div>

        {/* Quantidade, Categoria e Notas */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.2 text-[11px] font-bold text-foreground/90">
            {quantityLabel(item.quantity, item.unitType)}
          </span>

          {item.categoryName && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Tag size={10} />
              {item.categoryName}
            </span>
          )}

          {item.notes && (
            <span className="flex items-center gap-1 text-[11px] italic text-muted-foreground/80 truncate max-w-[160px]">
              <FileText size={10} className="shrink-0 opacity-70" />
              <span className="truncate">{item.notes}</span>
            </span>
          )}
        </div>
      </div>

      {/* Valores: Mobile View (Estimado ou Pago + Badge de Economia) */}
      <div className="flex shrink-0 flex-col items-end text-right">
        {isPurchased ? (
          <>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {item.price != null
                ? formatCurrency(getItemSpentTotal(item.price, item.quantity, item.unitType))
                : 'Comprado'}
            </span>
            {savings && savings.type === 'savings' && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
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
          <span className="text-xs font-semibold text-muted-foreground">
            {item.estimatedPrice != null
              ? formatCurrency(
                  getItemEstimatedTotal(item.estimatedPrice, item.quantity, item.unitType)
                )
              : '—'}
          </span>
        )}
      </div>

      {/* Desktop Quick Actions */}
      {!isFinished && (
        <div
          className="hidden shrink-0 items-center gap-0.5 opacity-30 transition-opacity group-hover:opacity-100 sm:flex"
          onClick={(e) => e.stopPropagation()}
        >
          {!isPurchased && (
            <>
              <button
                className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => onOpenInlineEdit(item)}
                title="Editar inline"
              >
                <Pencil size={13} />
              </button>
              {onIgnore && (
                <button
                  className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={() => onIgnore(item)}
                  title="Marcar como ignorado"
                >
                  <EyeOff size={13} />
                </button>
              )}
            </>
          )}
          <button
            className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(item)}
            title="Remover item"
            disabled={isPending}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
