import { CreditCard as CreditCardIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import EmptyState from '@/components/common/EmptyState';
import { PaymentCardSheet } from '@/components/modals/PaymentCardSheet';
import { PaymentCardSkeleton } from '@/components/skeletons/PaymentCardSkeleton';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import type { BankAccountResponse } from '@/schemas/bank-account';
import { CardType } from '@/schemas/enums';
import type {
  CreatePaymentCardRequest,
  PaymentCardInvoice,
  PaymentCardResponse,
  UpdateCreditPaymentCardSettingsRequest,
  UpdatePaymentCardDetailsRequest,
} from '@/schemas/payment-card';
import * as paymentCardService from '@/services/paymentCardService';

import { PaymentCardDetails } from './payment-card/PaymentCardDetails';
import { PaymentCardList } from './payment-card/PaymentCardList';

export function PaymentCard() {
  const { activeNestId } = useApp();
  const { showSuccess, showError } = useToastNotifications();

  const [cards, setCards] = useState<PaymentCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [invoice, setInvoice] = useState<PaymentCardInvoice | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PaymentCardResponse | null>(null);
  const [bankAccounts] = useState<BankAccountResponse[]>([]);

  const nestId = activeNestId ?? undefined;

  // showError vem de useToastNotifications, que retorna funções novas a cada
  // render. Guardamos a referência atual num ref para que loadCards dependa
  // apenas de nestId — senão o efeito entraria em loop infinito (flicker).
  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const list = await paymentCardService.listPaymentCards(nestId);
      setCards(list);
      setSelectedId((prev) => {
        if (prev && list.some((c) => c.paymentCardId === prev)) return prev;
        return list.find((c) => c.isActive)?.paymentCardId ?? list[0]?.paymentCardId ?? null;
      });
    } catch {
      showErrorRef.current('Não foi possível carregar os cartões.');
    } finally {
      setLoading(false);
    }
  }, [nestId]);

  useEffect(() => { void loadCards(); }, [loadCards]);

  useEffect(() => {
    if (!selectedId) { setInvoice(null); return; }
    let active = true;
    setInvoiceLoading(true);
    paymentCardService.getPaymentCardInvoice(selectedId)
      .then((inv) => { if (active) setInvoice(inv); })
      .catch(() => { if (active) setInvoice(null); })
      .finally(() => { if (active) setInvoiceLoading(false); });
    return () => { active = false; };
  }, [selectedId]);

  const usedByCard = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cards) {
      const isSelected = c.paymentCardId === selectedId;
      const invoiceTotal = isSelected && invoice ? Number(invoice.total) : 0;
      map[c.paymentCardId] = Number(c.previousBalance ?? 0) + invoiceTotal;
    }
    return map;
  }, [cards, selectedId, invoice]);

  const selectedCard = cards.find((c) => c.paymentCardId === selectedId) ?? null;

  const handleCreate = async (payload: CreatePaymentCardRequest) => {
    try {
      await paymentCardService.createPaymentCard(payload, nestId);
      showSuccess('Cartão criado!');
      await loadCards();
    } catch {
      showError('Não foi possível criar o cartão.');
      throw new Error('create failed');
    }
  };

  const handleUpdateDetails = async (id: string, payload: UpdatePaymentCardDetailsRequest) => {
    try {
      await paymentCardService.updatePaymentCardDetails(id, payload, nestId);
      showSuccess('Cartão atualizado!');
      await loadCards();
    } catch {
      showError('Não foi possível atualizar o cartão.');
      throw new Error('update details failed');
    }
  };

  const handleUpdateCreditSettings = async (
    id: string,
    payload: UpdateCreditPaymentCardSettingsRequest,
  ) => {
    try {
      await paymentCardService.updateCreditPaymentCardSettings(id, payload, nestId);
      await loadCards();
    } catch {
      showError('Não foi possível atualizar as configurações de crédito.');
      throw new Error('update credit settings failed');
    }
  };

  const handleToggleActive = async (card: PaymentCardResponse) => {
    try {
      if (card.isActive) {
        await paymentCardService.inactivatePaymentCard(card.paymentCardId, nestId);
        showSuccess('Cartão inativado.');
      } else {
        await paymentCardService.activatePaymentCard(card.paymentCardId, nestId);
        showSuccess('Cartão ativado.');
      }
      await loadCards();
    } catch {
      showError('Não foi possível alterar o status do cartão.');
    }
  };

  const openCreate = () => { setEditingCard(null); setSheetOpen(true); };
  const openEdit = (card: PaymentCardResponse) => { setEditingCard(card); setSheetOpen(true); };

  if (loading) return <PaymentCardSkeleton />;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Cartões</h1>
        <p className="text-sm text-muted-foreground">Gerencie seus cartões</p>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title="Nenhum cartão ainda"
          description="Adicione um cartão para acompanhar seus gastos."
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
            <PaymentCardList
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
              <PaymentCardDetails
                card={selectedCard}
                used={usedByCard[selectedCard.paymentCardId] ?? Number(selectedCard.previousBalance ?? 0)}
                invoice={selectedCard.type === CardType.Credit ? invoice : null}
                invoiceLoading={invoiceLoading}
              />
            )}
          </div>
        </div>
      )}

      <PaymentCardSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        card={editingCard}
        bankAccounts={bankAccounts}
        onCreate={handleCreate}
        onUpdateDetails={handleUpdateDetails}
        onUpdateCreditSettings={handleUpdateCreditSettings}
      />
    </div>
  );
}

export default PaymentCard;
