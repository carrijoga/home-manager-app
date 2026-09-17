import type { PaymentCardResponse } from '@/schemas/payment-card';

import { PaymentCardTile } from './PaymentCardTile';

interface PaymentCardListProps {
  cards: PaymentCardResponse[];
  selectedId: string | null;
  usedByCard: Record<string, number>;
  canDeleteMap: Record<string, boolean>;
  onSelect: (id: string) => void;
  onEdit: (card: PaymentCardResponse) => void;
  onToggleActive: (card: PaymentCardResponse) => void;
  onDelete: (card: PaymentCardResponse) => void;
}

export function PaymentCardList({
  cards,
  selectedId,
  usedByCard,
  canDeleteMap,
  onSelect,
  onEdit,
  onToggleActive,
  onDelete,
}: PaymentCardListProps) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Nenhum cartão encontrado nesta categoria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {cards.map((card) => (
        <PaymentCardTile
          key={card.paymentCardId}
          card={card}
          used={usedByCard[card.paymentCardId] ?? Number(card.previousBalance ?? 0)}
          selected={card.paymentCardId === selectedId}
          canDelete={canDeleteMap[card.paymentCardId] ?? true}
          onSelect={() => onSelect(card.paymentCardId)}
          onEdit={() => onEdit(card)}
          onToggleActive={() => onToggleActive(card)}
          onDelete={() => onDelete(card)}
        />
      ))}
    </div>
  );
}
