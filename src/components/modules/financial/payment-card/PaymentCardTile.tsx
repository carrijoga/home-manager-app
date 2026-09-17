import { CreditCard, MoreVertical, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CARD_TYPE_LABELS, CardType } from '@/schemas/enums';
import type { PaymentCardResponse } from '@/schemas/payment-card';
import { formatCurrency } from '@/utils/formatters';

interface PaymentCardTileProps {
  card: PaymentCardResponse;
  used: number;
  selected: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

export function PaymentCardTile({
  card,
  used,
  selected,
  canDelete,
  onSelect,
  onEdit,
  onToggleActive,
  onDelete,
}: PaymentCardTileProps) {
  const isCredit = card.type === CardType.Credit;
  const limit = Number(card.creditLimit ?? 0);
  const closingDay = card.closingDay ? Number(card.closingDay) : null;
  const dueDay = card.dueDay ? Number(card.dueDay) : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'group flex items-center justify-between gap-3.5 rounded-2xl p-3.5 sm:p-4 transition-all duration-150 cursor-pointer',
        selected
          ? 'border-2 border-primary bg-card shadow-md ring-1 ring-primary/20'
          : 'border border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30 shadow-subtle',
        !card.isActive && 'opacity-60 grayscale-[40%]'
      )}
    >
      {/* Esquerda: Squircle da Bandeira/Marca + Metadados */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-xs font-bold text-xs"
          style={{ backgroundColor: card.color || '#C05621' }}
        >
          <CreditCard size={18} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-foreground truncate">
              {card.name}
            </span>
            {!card.isActive && (
              <span className="rounded-full bg-muted px-2 py-0.2 text-[10px] font-semibold text-muted-foreground">
                Inativo
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate">
            <span className="font-semibold text-foreground/80">
              {CARD_TYPE_LABELS[card.type]}
            </span>
            {isCredit && (closingDay != null || dueDay != null) && (
              <>
                <span className="text-muted-foreground/40 font-bold">·</span>
                {closingDay != null && <span>Fecha dia {closingDay}</span>}
                {closingDay != null && dueDay != null && (
                  <span className="text-muted-foreground/40 font-bold">·</span>
                )}
                {dueDay != null && (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Vence dia {dueDay}
                  </span>
                )}
              </>
            )}
            {!isCredit && (
              <>
                <span className="text-muted-foreground/40 font-bold">·</span>
                <span>{card.bankAccountId ? 'Vinculado à conta' : 'Débito avulso'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Direita: Métrica de Fatura/Limite e Ações */}
      <div className="flex items-center gap-2 shrink-0 pl-2">
        <div className="text-right">
          {isCredit ? (
            <>
              <span className="text-sm sm:text-base font-bold tabular-nums block text-foreground">
                {formatCurrency(used)}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                de {formatCurrency(limit)} limite
              </span>
            </>
          ) : (
            <>
              <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 block">
                Ativo
              </span>
              <span className="text-[10px] text-muted-foreground block">
                débito
              </span>
            </>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              aria-label="Ações do cartão"
            >
              <MoreVertical size={18} strokeWidth={1.8} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
              <Pencil size={14} strokeWidth={1.8} /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleActive} className="gap-2 cursor-pointer">
              {card.isActive ? (
                <PowerOff size={14} strokeWidth={1.8} />
              ) : (
                <Power size={14} strokeWidth={1.8} />
              )}
              {card.isActive ? 'Inativar' : 'Ativar'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={canDelete ? onDelete : undefined}
              disabled={!canDelete}
              title={
                canDelete
                  ? undefined
                  : 'Este cartão possui lançamentos vinculados. Apenas inativação é permitida.'
              }
              className={cn(
                'gap-2 cursor-pointer',
                canDelete ? 'text-destructive focus:text-destructive' : 'text-destructive/50'
              )}
            >
              <Trash2 size={14} strokeWidth={1.8} /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
