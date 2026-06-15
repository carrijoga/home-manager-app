import { CreditCard as CreditCardIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import EmptyState from '@/components/common/EmptyState';
import { CreditCardSheet } from '@/components/modals/CreditCardSheet';
import { CreditCardSkeleton } from '@/components/skeletons/CreditCardSkeleton';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import type { BankAccountResponse } from '@/schemas/bank-account';
import type {
  CreateCreditCardRequest,
  CreditCardInvoice,
  CreditCardResponse,
  UpdateCreditCardRequest,
} from '@/schemas/credit-card';
import * as creditCardService from '@/services/creditCardService';

import { CreditCardDetails } from './credit-card/CreditCardDetails';
import { CreditCardList } from './credit-card/CreditCardList';

export function CreditCard() {
  const { activeNestId } = useApp();
  const { showSuccess, showError } = useToastNotifications();

  const [cards, setCards] = useState<CreditCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [invoice, setInvoice] = useState<CreditCardInvoice | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardResponse | null>(null);
  const [bankAccounts] = useState<BankAccountResponse[]>([]);

  const nestId = activeNestId ?? undefined;

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const list = await creditCardService.listCreditCards(nestId);
      setCards(list);
      setSelectedId((prev) => {
        if (prev && list.some((c) => c.creditCardId === prev)) return prev;
        return list.find((c) => c.isActive)?.creditCardId ?? list[0]?.creditCardId ?? null;
      });
    } catch {
      showError('Não foi possível carregar os cartões.');
    } finally {
      setLoading(false);
    }
  }, [nestId, showError]);

  useEffect(() => { void loadCards(); }, [loadCards]);

  useEffect(() => {
    if (!selectedId) { setInvoice(null); return; }
    let active = true;
    setInvoiceLoading(true);
    creditCardService.getCreditCardInvoice(selectedId)
      .then((inv) => { if (active) setInvoice(inv); })
      .catch(() => { if (active) setInvoice(null); })
      .finally(() => { if (active) setInvoiceLoading(false); });
    return () => { active = false; };
  }, [selectedId]);

  const usedByCard = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cards) {
      const isSelected = c.creditCardId === selectedId;
      const invoiceTotal = isSelected && invoice ? Number(invoice.total) : 0;
      map[c.creditCardId] = Number(c.previousBalance) + invoiceTotal;
    }
    return map;
  }, [cards, selectedId, invoice]);

  const selectedCard = cards.find((c) => c.creditCardId === selectedId) ?? null;

  const handleCreate = async (payload: CreateCreditCardRequest) => {
    try {
      await creditCardService.createCreditCard(payload, nestId);
      showSuccess('Cartão criado!');
      await loadCards();
    } catch {
      showError('Não foi possível criar o cartão.');
      throw new Error('create failed');
    }
  };

  const handleUpdate = async (id: string, payload: UpdateCreditCardRequest) => {
    try {
      await creditCardService.updateCreditCard(id, payload, nestId);
      showSuccess('Cartão atualizado!');
      await loadCards();
    } catch {
      showError('Não foi possível atualizar o cartão.');
      throw new Error('update failed');
    }
  };

  const handleToggleActive = async (card: CreditCardResponse) => {
    try {
      if (card.isActive) {
        await creditCardService.inactivateCreditCard(card.creditCardId, nestId);
        showSuccess('Cartão inativado.');
      } else {
        await creditCardService.activateCreditCard(card.creditCardId, nestId);
        showSuccess('Cartão ativado.');
      }
      await loadCards();
    } catch {
      showError('Não foi possível alterar o status do cartão.');
    }
  };

  const openCreate = () => { setEditingCard(null); setSheetOpen(true); };
  const openEdit = (card: CreditCardResponse) => { setEditingCard(card); setSheetOpen(true); };

  if (loading) return <CreditCardSkeleton />;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Cartões</h1>
        <p className="text-sm text-muted-foreground">Gerencie seus cartões de crédito</p>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title="Nenhum cartão ainda"
          description="Adicione um cartão de crédito para acompanhar limite e fatura."
          action={
            <button
              onClick={openCreate}
              className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
            >
              Adicionar cartão
            </button>
          }
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-[240px] shrink-0">
            <CreditCardList
              cards={cards}
              selectedId={selectedId}
              usedByCard={usedByCard}
              onSelect={setSelectedId}
              onEdit={openEdit}
              onToggleActive={handleToggleActive}
              onAdd={openCreate}
            />
          </div>
          <div className="flex-1">
            {selectedCard && (
              <CreditCardDetails
                card={selectedCard}
                used={usedByCard[selectedCard.creditCardId] ?? Number(selectedCard.previousBalance)}
                invoice={invoice}
                invoiceLoading={invoiceLoading}
              />
            )}
          </div>
        </div>
      )}

      <CreditCardSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        card={editingCard}
        bankAccounts={bankAccounts}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

export default CreditCard;
