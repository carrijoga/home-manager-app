import { MoreVertical, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CARD_TYPE_LABELS, CardType } from '@/schemas/enums';
import type { PaymentCardResponse } from '@/schemas/payment-card';
import { formatCurrency } from '@/utils/dashboardMetrics';

import { CARD_TEXT_COLOR, cardGradient } from './gradient';

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
  const available = Math.max(0, limit - used);
  const usedPct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const inactive = !card.isActive;

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
        'relative cursor-pointer rounded-2xl p-4 text-left transition-all',
        'flex min-h-[120px] flex-col justify-between',
        selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'ring-0',
        inactive && 'opacity-50 grayscale'
      )}
      style={{ background: cardGradient(card.color ?? ''), color: CARD_TEXT_COLOR }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-semibold drop-shadow-sm">{card.name}</span>
          <span className="text-[10px] uppercase tracking-wide opacity-80">
            {CARD_TYPE_LABELS[card.type]}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1 transition-colors hover:bg-black/15"
              aria-label="Ações do cartão"
            >
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onEdit} className="gap-2">
              <Pencil size={14} /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleActive} className="gap-2">
              {card.isActive ? <PowerOff size={14} /> : <Power size={14} />}
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
                'gap-2',
                canDelete ? 'text-destructive focus:text-destructive' : 'text-destructive/50'
              )}
            >
              <Trash2 size={14} /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isCredit ? (
        <div>
          <div className="text-[11px] opacity-85">Disponível</div>
          <div className="text-lg font-bold drop-shadow-sm">{formatCurrency(available)}</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white/80" style={{ width: `${usedPct}%` }} />
          </div>
          <div className="mt-1 text-[10px] opacity-80">
            {formatCurrency(used)} de {formatCurrency(limit)}
            {inactive ? ' · Inativo' : ''}
          </div>
        </div>
      ) : (
        <div className="text-[10px] opacity-80">{inactive ? 'Inativo' : 'Ativo'}</div>
      )}
    </div>
  );
}
