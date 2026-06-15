import { MoreVertical, Pencil, Power, PowerOff } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { CreditCardResponse } from '@/schemas/credit-card';
import { formatCurrency } from '@/utils/dashboardMetrics';

import { CARD_TEXT_COLOR,cardGradient } from './gradient';

interface CreditCardTileProps {
  card: CreditCardResponse;
  used: number;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
}

export function CreditCardTile({
  card, used, selected, onSelect, onEdit, onToggleActive,
}: CreditCardTileProps) {
  const limit = Number(card.creditLimit);
  const available = Math.max(0, limit - used);
  const usedPct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const inactive = !card.isActive;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      className={cn(
        'relative rounded-2xl p-4 text-left cursor-pointer transition-all',
        'min-h-[120px] flex flex-col justify-between',
        selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'ring-0',
        inactive && 'opacity-50 grayscale',
      )}
      style={{ background: cardGradient(card.color), color: CARD_TEXT_COLOR }}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold drop-shadow-sm">{card.name}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1 hover:bg-black/15 transition-colors"
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <div className="text-[11px] opacity-85">Disponível</div>
        <div className="text-lg font-bold drop-shadow-sm">{formatCurrency(available)}</div>
        <div className="mt-2 h-1.5 rounded-full bg-white/25 overflow-hidden">
          <div className="h-full rounded-full bg-white/80" style={{ width: `${usedPct}%` }} />
        </div>
        <div className="text-[10px] opacity-80 mt-1">
          {formatCurrency(used)} de {formatCurrency(limit)}{inactive ? ' · Inativo' : ''}
        </div>
      </div>
    </div>
  );
}
