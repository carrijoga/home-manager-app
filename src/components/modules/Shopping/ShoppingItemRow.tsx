import MoneyInput from '@components/common/MoneyInput';
import { formatCurrency } from '@utils/formatters';
import { motion } from 'framer-motion';
import {
  Check,
  EyeOff,
  FileText,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

  const savings = getSavingsInfo(item);

  /* ── 1. Modo Edição Inline (Desktop) ── */
  if (isEditing) {
    return (
      <div className="relative border-l-3 border-primary bg-primary/5 p-4 sm:p-5 transition-all">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Check size={15} strokeWidth={2.5} />
          </div>
          <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">{item.name}</span>

          {/* Stepper de Quantidade */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Quantidade
            </span>
            <div className="flex h-9 items-center rounded-xl border border-border/80 bg-background shadow-xs">
              <button
                type="button"
                className="flex h-full w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                onClick={() =>
                  setInlineForm((f) => ({
                    ...f,
                    qty: String(Math.max(0.1, parseFloat(f.qty || '1') - 1)),
                  }))
                }
                aria-label="Diminuir quantidade"
              >
                <Minus size={13} />
              </button>
              <span className="w-16 text-center text-xs font-bold text-foreground">
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
                aria-label="Aumentar quantidade"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Preço Estimado */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Estimado (R$)
            </span>
            <MoneyInput
              value={inlineForm.estimated}
              onChange={(v) => setInlineForm((f) => ({ ...f, estimated: v }))}
              className="h-9 w-28 rounded-xl bg-background text-xs font-semibold"
            />
          </div>

          {/* Ações Salvar / Cancelar */}
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={onCancelInlineEdit}
              disabled={inlineSaving}
            >
              Cancelar
            </button>
            <button
              className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-95"
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

  /* ── 2. Modo Seleção em Massa (Bulk Mode) ── */
  if (isBulkMode) {
    return (
      <div
        className={cn(
          'flex items-center gap-3.5 px-4 py-3 sm:px-5 sm:py-3.5 transition-colors cursor-pointer select-none',
          isSelected ? 'bg-primary/10' : 'hover:bg-accent/40'
        )}
        onClick={() => onToggleSelection(item.shoppingItemId)}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(item.shoppingItemId)}
          className="shrink-0 rounded-lg h-5 w-5 border-border/80"
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
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
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

  /* ── 3. Estado Normal de Item (Design Limpo, Editorial e Tátil) ── */
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className={cn(
        'group flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 transition-colors duration-150 cursor-pointer select-none',
        isPurchased && 'bg-muted/15 opacity-75 hover:opacity-100 hover:bg-muted/30',
        isIgnored && 'bg-muted/20 opacity-55 hover:opacity-80',
        isNotPurchased && 'opacity-60 hover:opacity-85',
        isPendingStatus && 'hover:bg-accent/35 active:bg-accent/50'
      )}
      onClick={() => {
        if (isFinished && !isIgnored && !isNotPurchased) return;
        onOpenMobileSheet(item);
      }}
    >
      {/* Botão de Checkbox Circular e Tátil */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={(e) => {
          e.stopPropagation();
          if (isFinished) return;
          if (isPurchased) onUnmark(item);
          else if (isIgnored) onUnignore?.(item);
          else onMarkAsPurchased(item);
        }}
        disabled={isFinished || isPending}
        className={cn(
          'flex h-7 w-7 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full transition-colors active:scale-90',
          isPurchased &&
            'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700 dark:bg-emerald-500',
          isIgnored &&
            'border border-border/80 bg-muted text-muted-foreground hover:bg-accent',
          isNotPurchased &&
            'border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20',
          isPendingStatus &&
            'border-2 border-border/90 bg-card hover:border-primary hover:bg-primary/10 shadow-2xs'
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
        aria-label={
          isPurchased
            ? `Desfazer compra de ${item.name}`
            : `Marcar ${item.name} como comprado`
        }
      >
        {isPending ? (
          <Spinner size="sm" />
        ) : isPurchased ? (
          <motion.span
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26, bounce: 0.35 }}
            className="flex items-center justify-center"
          >
            <Check size={14} strokeWidth={3} />
          </motion.span>
        ) : isIgnored ? (
          <EyeOff size={12} />
        ) : isNotPurchased ? (
          <X size={12} strokeWidth={2.5} />
        ) : null}
      </motion.button>

      {/* Nome do Produto + Metadados Editoriais Limpos */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'truncate text-sm font-medium tracking-tight transition-all duration-200 ease-out select-none',
              isPurchased || isIgnored || isNotPurchased
                ? 'text-muted-foreground line-through decoration-muted-foreground/60 opacity-70'
                : 'text-foreground font-semibold opacity-100'
            )}
          >
            {item.name}
          </span>

          {isIgnored && (
            <span className="text-[10px] font-medium text-muted-foreground">
              (ignorado)
            </span>
          )}
          {isNotPurchased && (
            <span className="text-[10px] font-semibold text-destructive">
              (não comprado)
            </span>
          )}
        </div>

        {/* Linha de Metadados Unificada com Separadores Pontilhados (Sem poluição de badges) */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
          <span className="font-semibold text-foreground/85 shrink-0 tabular-nums">
            {quantityLabel(item.quantity, item.unitType)}
          </span>

          {item.categoryName && (
            <>
              <span className="text-muted-foreground/40 font-bold shrink-0">·</span>
              <span className="truncate text-muted-foreground/90 font-medium">
                {item.categoryName}
              </span>
            </>
          )}

          {item.notes && (
            <>
              <span className="text-muted-foreground/40 font-bold shrink-0">·</span>
              <span className="inline-flex items-center gap-1 italic text-muted-foreground/75 truncate max-w-[180px]">
                <FileText size={10} className="shrink-0 opacity-70" />
                <span className="truncate">{item.notes}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Preços e Variação Financeira Alinhados à Direita */}
      <div className="flex shrink-0 flex-col items-end text-right pl-2">
        {isPurchased ? (
          <>
            <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums">
              {item.price != null
                ? formatCurrency(getItemSpentTotal(item))
                : 'Comprado'}
            </span>
            {savings && savings.type === 'savings' && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                <TrendingDown size={11} className="shrink-0" />
                <span>-{formatCurrency(savings.diff)}</span>
              </span>
            )}
            {savings && savings.type === 'increase' && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                <TrendingUp size={11} className="shrink-0" />
                <span>+{formatCurrency(savings.diff)}</span>
              </span>
            )}
          </>
        ) : (
          <span className="text-xs sm:text-sm font-medium text-muted-foreground tabular-nums">
            {item.estimatedPrice != null
              ? formatCurrency(
                  getItemEstimatedTotal(item.estimatedPrice, item.quantity, item.unitType)
                )
              : '—'}
          </span>
        )}
      </div>

      {/* Menu de Ações Secundárias (Sempre alinhado e discreto, sem layout shift ou assimetria) */}
      {!isFinished && (
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground active:scale-95 cursor-pointer"
                aria-label={`Mais opções para ${item.name}`}
              >
                <MoreHorizontal size={15} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              {!isPurchased && (
                <DropdownMenuItem
                  onClick={() => onOpenInlineEdit(item)}
                  className="gap-2 cursor-pointer"
                >
                  <Pencil size={14} className="text-muted-foreground" />
                  <span>Edição Rápida</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => onOpenMobileSheet(item)}
                className="gap-2 cursor-pointer"
              >
                <SlidersHorizontal size={14} className="text-muted-foreground" />
                <span>Ver Detalhes</span>
              </DropdownMenuItem>

              {!isPurchased && onIgnore && (
                <DropdownMenuItem
                  onClick={() => onIgnore(item)}
                  className="gap-2 cursor-pointer"
                >
                  <EyeOff size={14} className="text-muted-foreground" />
                  <span>Ignorar nesta compra</span>
                </DropdownMenuItem>
              )}

              {isIgnored && onUnignore && (
                <DropdownMenuItem
                  onClick={() => onUnignore(item)}
                  className="gap-2 cursor-pointer"
                >
                  <RotateCcw size={14} className="text-muted-foreground" />
                  <span>Reativar item</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete(item)}
                disabled={isPending}
                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 size={14} className="text-destructive" />
                <span>Remover da lista</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </motion.div>
  );
}
