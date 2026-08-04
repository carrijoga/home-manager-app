import { Plus } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
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
  onAdd: () => void;
}

export function PaymentCardList({
  cards, selectedId, usedByCard, canDeleteMap, onSelect, onEdit, onToggleActive, onDelete, onAdd,
}: PaymentCardListProps) {
  const activeCards = cards.filter((card) => card.isActive);
  const inactiveCards = cards.filter((card) => !card.isActive);

  const renderTile = (card: PaymentCardResponse) => (
    <div key={card.paymentCardId} className="min-w-[220px] lg:min-w-0">
      <PaymentCardTile
        card={card}
        used={usedByCard[card.paymentCardId] ?? Number(card.previousBalance ?? 0)}
        selected={card.paymentCardId === selectedId}
        // Só o cartão selecionado tem canDelete verificado (ver PaymentCard.tsx);
        // os demais assumem true (otimista) — o DELETE real ainda é bloqueado
        // pelo servidor (400 + toast) se a checagem otimista estiver errada.
        canDelete={canDeleteMap[card.paymentCardId] ?? true}
        onSelect={() => onSelect(card.paymentCardId)}
        onEdit={() => onEdit(card)}
        onToggleActive={() => onToggleActive(card)}
        onDelete={() => onDelete(card)}
      />
    </div>
  );

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
        {activeCards.map(renderTile)}
      </div>

      {inactiveCards.length > 0 && (
        <div className="flex flex-col gap-3 pt-3 border-t border-dashed border-border">
          <p className="font-ui text-[11px] uppercase tracking-wide text-muted-foreground">
            Inativos
          </p>
          <div
            className={cn(
              'flex gap-3',
              'flex-row overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0',
            )}
          >
            {inactiveCards.map(renderTile)}
          </div>
        </div>
      )}
    </div>
  );
}
