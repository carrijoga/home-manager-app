import MoneyInput from '@components/common/MoneyInput';
import { formatCurrency } from '@utils/formatters';
import { Check, Minus, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { UNIT_TYPE_LABELS } from '@/schemas/enums';
import type { AppShoppingItem } from '@/types';

import { quantityLabel } from './helpers';

interface ShoppingItemRowProps {
  item: AppShoppingItem;
  isBulkMode: boolean;
  isFinished: boolean;
  isEditing: boolean;
  isSelected: boolean;
  isPending: boolean;
  inlineForm: { qty: string; estimated: number | null; paid: number | null };
  inlineSaving: boolean;
  setInlineForm: React.Dispatch<React.SetStateAction<{ qty: string; estimated: number | null; paid: number | null }>>;
  onOpenMobileSheet: (item: AppShoppingItem) => void;
  onToggleSelection: (id: string) => void;
  onMarkAsPurchased: (item: AppShoppingItem) => void;
  onUnmark: (item: AppShoppingItem) => void;
  onOpenInlineEdit: (item: AppShoppingItem) => void;
  onCancelInlineEdit: () => void;
  onSaveInlineEdit: (item: AppShoppingItem) => void;
  onEdit: (item: AppShoppingItem) => void;
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

  /* ── Editing state (desktop inline) ── */
  if (isEditing) {
    return (
      <div className="relative border-l-2 border-[#adc6ff] bg-[rgba(173,198,255,0.04)] px-5 py-5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(173,198,255,0.04)] to-transparent" />
        <div className="relative flex flex-wrap items-center gap-4">
          {/* Checkbox checked */}
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#adc6ff]">
            <Check
              size={13}
              style={{ color: '#0e0e0e' }}
              strokeWidth={3}
            />
          </div>
          <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
            {item.name}
          </span>

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
                    qty: String(
                      Math.max(0, parseFloat(f.qty || '1') - 1)
                    ),
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
              onChange={(v) =>
                setInlineForm((f) => ({ ...f, estimated: v }))
              }
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

  if (item.isPurchased) {
    /* ── Purchased (checked) state ── */
    return (
      <div
        className={cn(
          'hover:bg-accent/20 flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors duration-200',
          isBulkMode && isSelected
            ? 'bg-[rgba(120,160,255,0.06)]'
            : 'opacity-70'
        )}
        onClick={() => {
          if (!isBulkMode) {
            onOpenMobileSheet(item);
          }
        }}
      >
        {isBulkMode ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() =>
              onToggleSelection(item.shoppingItemId)
            }
            className="shrink-0"
          />
        ) : (
          <button
            onClick={() => !isFinished && onUnmark(item)}
            disabled={isFinished || isPending}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#78dc77] transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-100"
          >
            {isPending ? (
              <Spinner size="sm" />
            ) : (
              <Check
                size={13}
                style={{ color: '#131313' }}
                strokeWidth={3}
              />
            )}
          </button>
        )}

        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground line-through">
          {item.name}
        </span>

        <div className="hidden items-center gap-8 pr-2 sm:flex">
          <span className="w-16 text-right text-sm text-muted-foreground">
            {quantityLabel(item.quantity, item.unitType)}
          </span>
          <span className="w-24 text-right text-sm text-muted-foreground line-through">
            {item.estimatedPrice != null
              ? formatCurrency(item.estimatedPrice)
              : '---'}
          </span>
          <span className="w-24 text-right text-sm font-medium text-[#78dc77]">
            {item.price != null ? formatCurrency(item.price) : '---'}
          </span>
        </div>

        {/* Mobile: paid value only */}
        <span className="shrink-0 text-xs font-medium text-[#78dc77] sm:hidden">
          {item.price != null ? formatCurrency(item.price) : '---'}
        </span>

        {!isBulkMode && !isFinished && (
          <div
            className="flex shrink-0 items-center gap-0.5 opacity-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => onUnmark(item)}
              title="Desfazer compra"
              disabled={isPending}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isBulkMode) {
    /* ── Bulk selection state ── */
    return (
      <div
        className={cn(
          'flex items-center gap-4 px-5 py-4 transition-colors duration-200',
          isSelected
            ? 'bg-[rgba(120,160,255,0.06)]'
            : ''
        )}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(item.shoppingItemId)}
          className="shrink-0"
        />
        <div className="border-border/60 h-6 w-6 shrink-0 rounded-lg border" />
        <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
          {item.name}
        </span>
        <span className="text-sm text-muted-foreground">
          {quantityLabel(item.quantity, item.unitType)}
        </span>
        {item.estimatedPrice != null && (
          <span className="text-sm text-muted-foreground">
            {formatCurrency(item.estimatedPrice)}
          </span>
        )}
      </div>
    );
  }

  /* ── Normal (unpurchased) state ── */
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-5 py-4 transition-colors duration-150',
        !isFinished &&
          'hover:bg-accent/30 active:bg-accent/50 cursor-pointer'
      )}
      onClick={() => {
        if (isFinished) return;
        onOpenMobileSheet(item);
      }}
    >
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {item.name}
      </span>

      {/* Desktop columns: qty | estimated | paid */}
      <div className="hidden items-center gap-8 pr-8 sm:flex">
        <span className="w-16 text-right text-sm text-muted-foreground">
          {quantityLabel(item.quantity, item.unitType)}
        </span>
        <span className="w-24 text-right text-sm text-muted-foreground">
          {item.estimatedPrice != null
            ? formatCurrency(item.estimatedPrice)
            : '---'}
        </span>
        <span className="w-24 text-right text-sm text-muted-foreground">
          ---
        </span>
      </div>

      {/* Mobile: compact qty */}
      <span className="shrink-0 text-xs text-muted-foreground sm:hidden">
        {quantityLabel(item.quantity, item.unitType)}
      </span>

      {/* Desktop action icons */}
      {!isFinished && (
        <div
          className="hidden shrink-0 items-center gap-0.5 opacity-50 transition-opacity hover:opacity-100 sm:flex"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => onOpenInlineEdit(item)}
            title="Editar item"
          >
            <Pencil size={13} />
          </button>
          <button
            className="hover:bg-destructive/10 rounded-xl p-2 text-muted-foreground transition-colors hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
            onClick={() => onDelete(item)}
            title="Remover item"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner size="sm" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
