import { Plus } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { CreditCardResponse } from '@/schemas/credit-card';

import { CreditCardTile } from './CreditCardTile';

interface CreditCardListProps {
  cards: CreditCardResponse[];
  selectedId: string | null;
  usedByCard: Record<string, number>;
  onSelect: (id: string) => void;
  onEdit: (card: CreditCardResponse) => void;
  onToggleActive: (card: CreditCardResponse) => void;
  onAdd: () => void;
}

export function CreditCardList({
  cards, selectedId, usedByCard, onSelect, onEdit, onToggleActive, onAdd,
}: CreditCardListProps) {
  return (
    <div className="flex flex-col gap-3">
      <Button onClick={onAdd} className="w-full gap-2 font-semibold">
        <Plus size={16} /> Novo cartão
      </Button>

      <div
        className={cn(
          'flex gap-3',
          'flex-row overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0',
        )}
      >
        {cards.map((card) => (
          <div key={card.creditCardId} className="min-w-[220px] lg:min-w-0">
            <CreditCardTile
              card={card}
              used={usedByCard[card.creditCardId] ?? Number(card.previousBalance)}
              selected={card.creditCardId === selectedId}
              onSelect={() => onSelect(card.creditCardId)}
              onEdit={() => onEdit(card)}
              onToggleActive={() => onToggleActive(card)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
