import { Plus } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { PaymentCardResponse } from '@/schemas/payment-card';

import { PaymentCardTile } from './PaymentCardTile';

interface PaymentCardListProps {
  cards: PaymentCardResponse[];
  selectedId: string | null;
  usedByCard: Record<string, number>;
  onSelect: (id: string) => void;
  onEdit: (card: PaymentCardResponse) => void;
  onToggleActive: (card: PaymentCardResponse) => void;
  onDelete: (card: PaymentCardResponse) => void;
  onAdd: () => void;
}

export function PaymentCardList({
  cards, selectedId, usedByCard, onSelect, onEdit, onToggleActive, onDelete, onAdd,
}: PaymentCardListProps) {
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
          <div key={card.paymentCardId} className="min-w-[220px] lg:min-w-0">
            <PaymentCardTile
              card={card}
              used={usedByCard[card.paymentCardId] ?? Number(card.previousBalance ?? 0)}
              selected={card.paymentCardId === selectedId}
              onSelect={() => onSelect(card.paymentCardId)}
              onEdit={() => onEdit(card)}
              onToggleActive={() => onToggleActive(card)}
              onDelete={() => onDelete(card)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
