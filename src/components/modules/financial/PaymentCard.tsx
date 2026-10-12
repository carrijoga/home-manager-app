import { CreditCard as CreditCardIcon, Plus, Sparkles, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import EmptyState from '@/components/common/EmptyState';
import { PaymentCardSheet } from '@/components/modals/PaymentCardSheet';
import { PaymentCardSkeleton } from '@/components/skeletons/PaymentCardSkeleton';
import { Button } from '@/components/ui';
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
import { ApiError } from '@/services/api/httpClient';
import * as bankAccountService from '@/services/bankAccountService';
import * as paymentCardService from '@/services/paymentCardService';
import { formatCurrency } from '@/utils/formatters';

import { PaymentCardDetails } from './payment-card/PaymentCardDetails';
import { PaymentCardList } from './payment-card/PaymentCardList';
import { type FilterPillItem,FinancialFilterPills } from './shared/FinancialFilterPills';
import { FinancialHudCard } from './shared/FinancialHudCard';
import { FinancialPageHeader } from './shared/FinancialPageHeader';

export function PaymentCard() {
  const { activeNestId } = useApp();
  const { showSuccess, showError } = useToastNotifications();

  const [cards, setCards] = useState<PaymentCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');

  const [invoice, setInvoice] = useState<PaymentCardInvoice | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const [canDeleteSelected, setCanDeleteSelected] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PaymentCardResponse | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);

  const nestId = activeNestId ?? undefined;

  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const [list, accounts] = await Promise.all([
        paymentCardService.listPaymentCards(nestId),
        bankAccountService.listBankAccounts(nestId),
      ]);
      setCards(list);
      setBankAccounts(accounts.filter((acc) => acc.isActive));
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

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  useEffect(() => {
    if (!selectedId) {
      setInvoice(null);
      return;
    }
    let active = true;
    setInvoiceLoading(true);
    paymentCardService
      .getPaymentCardInvoice(selectedId)
      .then((inv) => {
        if (active) setInvoice(inv);
      })
      .catch(() => {
        if (active) setInvoice(null);
      })
      .finally(() => {
        if (active) setInvoiceLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setCanDeleteSelected(false);
      return;
    }
    let active = true;
    paymentCardService
      .canDeletePaymentCard(selectedId, nestId)
      .then((res) => {
        if (active) setCanDeleteSelected(res.canDelete);
      })
      .catch(() => {
        if (active) setCanDeleteSelected(false);
      });
    return () => {
      active = false;
    };
  }, [selectedId, nestId]);

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
  const canDeleteMap = selectedId ? { [selectedId]: canDeleteSelected } : {};

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
    payload: UpdateCreditPaymentCardSettingsRequest
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

  const handleDelete = async (card: PaymentCardResponse) => {
    try {
      await paymentCardService.deletePaymentCard(card.paymentCardId, nestId);
      showSuccess('Cartão excluído.');
      await loadCards();
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 400 && err.message
          ? err.message
          : 'Não foi possível excluir o cartão.';
      showError(message);
    }
  };

  const openCreate = () => {
    setEditingCard(null);
    setSheetOpen(true);
  };
  const openEdit = (card: PaymentCardResponse) => {
    setEditingCard(card);
    setSheetOpen(true);
  };

  // Cálculos do HUD consolidado de Cartões
  const activeCards = useMemo(() => cards.filter((c) => c.isActive), [cards]);
  const inactiveCards = useMemo(() => cards.filter((c) => !c.isActive), [cards]);

  const creditCards = useMemo(() => activeCards.filter((c) => c.type === CardType.Credit), [activeCards]);

  const totalCreditLimit = useMemo(() => {
    return creditCards.reduce((acc, c) => acc + Number(c.creditLimit ?? 0), 0);
  }, [creditCards]);

  const totalUsedLimit = useMemo(() => {
    return creditCards.reduce((acc, c) => acc + (usedByCard[c.paymentCardId] ?? Number(c.previousBalance ?? 0)), 0);
  }, [creditCards, usedByCard]);

  const totalAvailableLimit = Math.max(0, totalCreditLimit - totalUsedLimit);
  const usedPct = totalCreditLimit > 0 ? Math.min(100, Math.round((totalUsedLimit / totalCreditLimit) * 100)) : 0;
  const freePct = 100 - usedPct;

  // Próximo vencimento de cartão de crédito ativo
  const nextDueCard = useMemo(() => {
    const withDue = creditCards.filter((c) => c.dueDay);
    if (withDue.length === 0) return null;
    const today = new Date().getDate();
    return [...withDue].sort((a, b) => {
      const diffA = (Number(a.dueDay) - today + 31) % 31;
      const diffB = (Number(b.dueDay) - today + 31) % 31;
      return diffA - diffB;
    })[0];
  }, [creditCards]);

  // Filtros em pílulas
  const filterPills: FilterPillItem[] = useMemo(() => {
    const creditCount = cards.filter((c) => c.type === CardType.Credit && c.isActive).length;
    const debitCount = cards.filter((c) => c.type === CardType.Debit && c.isActive).length;

    const items: FilterPillItem[] = [
      { id: 'todos', label: 'Todos', count: activeCards.length },
    ];

    if (creditCount > 0) items.push({ id: 'credito', label: 'Crédito', count: creditCount });
    if (debitCount > 0) items.push({ id: 'debito', label: 'Débito', count: debitCount });
    if (inactiveCards.length > 0) items.push({ id: 'inativos', label: 'Inativos', count: inactiveCards.length });

    return items;
  }, [cards, activeCards.length, inactiveCards.length]);

  // Cartões filtrados
  const displayedCards = useMemo(() => {
    if (selectedFilter === 'credito') {
      return cards.filter((c) => c.type === CardType.Credit && c.isActive);
    }
    if (selectedFilter === 'debito') {
      return cards.filter((c) => c.type === CardType.Debit && c.isActive);
    }
    if (selectedFilter === 'inativos') {
      return inactiveCards;
    }
    return activeCards;
  }, [cards, activeCards, inactiveCards, selectedFilter]);

  if (loading) return <PaymentCardSkeleton />;

  return (
    <div className="flex max-w-full flex-col gap-4 overflow-x-hidden animate-in fade-in duration-200">
      {/* 1. Cabeçalho Padronizado */}
      <FinancialPageHeader
        title="Cartões"
        description="Gerencie seus cartões, limites e faturas"
        badgeLabel={`${activeCards.length} ${activeCards.length === 1 ? 'Ativo' : 'Ativos'}`}
        actions={
          <Button
            type="button"
            size="sm"
            onClick={openCreate}
            className="h-9 rounded-xl px-3.5 font-bold gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Novo Cartão</span>
          </Button>
        }
      />

      {cards.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-6">
          <EmptyState
            icon={CreditCardIcon}
            title="Nenhum cartão ainda"
            description="Adicione um cartão para acompanhar seus gastos e limites."
            action={
              <Button
                onClick={openCreate}
                className="h-11 rounded-2xl px-5 font-bold shadow-sm"
              >
                <Plus size={16} strokeWidth={3} className="mr-1.5" /> Adicionar cartão
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* 2. Placar HUD Hero (Estilo Modo Mercado) */}
          <FinancialHudCard
            primaryLabel="TOTAL EM FATURAS ABERTAS"
            primaryValue={formatCurrency(totalUsedLimit)}
            primarySubtitle={totalCreditLimit > 0 ? `de ${formatCurrency(totalCreditLimit)} limite total` : undefined}
            primaryColorClass="text-amber-600 dark:text-amber-400"
            secondaryLabel="LIMITE DISPONÍVEL GERAL"
            secondaryValue={totalCreditLimit > 0 ? formatCurrency(totalAvailableLimit) : '—'}
            secondarySubtitle={totalCreditLimit > 0 ? `(${freePct}% livre)` : undefined}
            secondaryTag={usedPct > 80 ? 'Uso elevado' : 'Uso sob controle'}
            progressPct={usedPct}
            progressBarGradient="from-emerald-500 via-teal-400 to-amber-500"
            barLabelLeft="Comprometimento do Limite"
            barLabelRight={`${usedPct}% utilizado`}
            insightLeft={{
              icon: nextDueCard ? <Zap size={14} className="text-amber-500" /> : <Sparkles size={14} className="text-primary" />,
              text: nextDueCard
                ? `Próximo vencimento: ${nextDueCard.name} (Dia ${nextDueCard.dueDay})`
                : 'Faturas e cartões em dia',
            }}
            insightRight={{
              text: `${creditCards.length} ${creditCards.length === 1 ? 'cartão com fatura' : 'cartões com fatura'}`,
              colorClass: 'text-muted-foreground',
            }}
          />

          {/* 3. Filtros em Pílulas Deslizantes */}
          <FinancialFilterPills
            items={filterPills}
            selectedId={selectedFilter}
            onSelect={setSelectedFilter}
          />

          {/* 4. Área Mestre-Detalhes (7x5 no desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <PaymentCardList
                cards={displayedCards}
                selectedId={selectedId}
                usedByCard={usedByCard}
                canDeleteMap={canDeleteMap}
                onSelect={setSelectedId}
                onEdit={openEdit}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            </div>

            <div className="lg:col-span-5">
              {selectedCard ? (
                <PaymentCardDetails
                  card={selectedCard}
                  used={
                    usedByCard[selectedCard.paymentCardId] ??
                    Number(selectedCard.previousBalance ?? 0)
                  }
                  invoice={selectedCard.type === CardType.Credit ? invoice : null}
                  invoiceLoading={invoiceLoading}
                  onEdit={openEdit}
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-6 text-center text-sm text-muted-foreground">
                  Selecione um cartão para ver os detalhes
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Sheet de Criação / Edição preservado */}
      <PaymentCardSheet
        open={sheetOpen}
        card={editingCard}
        bankAccounts={bankAccounts}
        onClose={() => setSheetOpen(false)}
        onCreate={handleCreate}
        onUpdateDetails={handleUpdateDetails}
        onUpdateCreditSettings={handleUpdateCreditSettings}
      />
    </div>
  );
}

export default PaymentCard;
