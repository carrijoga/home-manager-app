import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreateCategoryModal } from '@/components/modals/CreateCategoryModal';
import { PaymentModal } from '@/components/modals/PaymentModal';
import { TransactionSheet } from '@/components/modals/TransactionSheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useDebounce } from '@/hooks/useDebounce';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { BankAccountResponse } from '@/schemas/bank-account';
import type { CategoryResponse } from '@/schemas/category';
import { PaymentStatus, TransactionType } from '@/schemas/enums';
import type {
  AddPaymentRequest,
  CreateTransactionRequest,
  FinancialTransactionDashboardResponse,
  FinancialTransactionResponse,
  FinancialTransactionUpcomingBillResponse,
  UpdateTransactionRequest,
} from '@/schemas/financial';
import type { NestMember } from '@/schemas/nest';
import type { PaymentCardResponse } from '@/schemas/payment-card';
import * as bankAccountService from '@/services/bankAccountService';
import * as categoryService from '@/services/categoryService';
import * as financialService from '@/services/financialService';
import * as nestService from '@/services/nestService';
import * as paymentCardService from '@/services/paymentCardService';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { getMonthLabel, getMonthRange } from '@/utils/financialUtils';

import { MonthNavigator } from './financial/MonthNavigator';
import { CategoryBreakdownCardV2 } from './financial-v2/CategoryBreakdownCardV2';
import { FinancialSummaryCardV2 } from './financial-v2/FinancialSummaryCardV2';
import {
  DEFAULT_FILTERS_V2,
  TransactionFiltersV2,
  type TransactionFiltersV2State,
} from './financial-v2/TransactionFiltersV2';
import { TransactionListV2 } from './financial-v2/TransactionListV2';
import { UpcomingBillsCardV2 } from './financial-v2/UpcomingBillsCardV2';

const firstOfCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const cardSlide: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] } },
};

/**
 * FinancialV2 — Hub de lançamentos financeiros redesenhado (Versão 2).
 * Traz saldo real/previsto, filtros inteligentes por morador e categoria por clique,
 * baixa rápida em 1 clique e exportação de extrato em CSV.
 */
export function FinancialV2() {
  const navigate = useNavigate();
  const { user, activeNestId } = useApp();
  const { showSuccess, showError } = useToastNotifications();
  const prefersReducedMotion = usePrefersReducedMotion();
  const nestId = activeNestId ?? undefined;
  const currentUserId = user?.id ?? '';

  // ── Período e filtros ──────────────────────────────────────────────────────
  const [month, setMonth] = useState<Date>(firstOfCurrentMonth);
  const [filters, setFilters] = useState<TransactionFiltersV2State>(DEFAULT_FILTERS_V2);
  const debouncedSearch = useDebounce(filters.search, 300);

  // ── Dados do servidor ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [monthTransactions, setMonthTransactions] = useState<FinancialTransactionResponse[]>([]);
  const [dashboardData, setDashboardData] = useState<FinancialTransactionDashboardResponse | null>(
    null
  );
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [paymentCards, setPaymentCards] = useState<PaymentCardResponse[]>([]);
  const [members, setMembers] = useState<NestMember[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Modais ─────────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinancialTransactionResponse | null>(null);
  const [payingTx, setPayingTx] = useState<FinancialTransactionResponse | null>(null);
  const [deletingTx, setDeletingTx] = useState<FinancialTransactionResponse | null>(null);

  // Busca dashboard e lista de transações em paralelo.
  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      financialService.getFinancialDashboard(month.getMonth() + 1, month.getFullYear(), nestId),
      financialService.listTransactions({ ...getMonthRange(month), pageSize: 1000 }, nestId),
    ])
      .then(([dashboard, list]) => {
        if (!active) return;
        setDashboardData(dashboard);
        setMonthTransactions(list ?? []);
      })
      .catch(() => {
        if (active) showError('Erro ao carregar transações.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, nestId, refreshKey]);

  // Categorias — uma vez por nest
  useEffect(() => {
    let active = true;
    categoryService
      .listCategories({ pageSize: 100 }, nestId)
      .then((res) => {
        if (active) setCategories(res ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [nestId]);

  // Moradores — para filtro por responsável
  useEffect(() => {
    if (!nestId) return;
    let active = true;
    nestService
      .getNestMembers(nestId)
      .then((res) => {
        if (active) setMembers(res ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [nestId]);

  // Contas e cartões
  useEffect(() => {
    let active = true;
    Promise.all([
      bankAccountService.listBankAccounts(nestId),
      paymentCardService.listPaymentCards(nestId),
    ])
      .then(([accounts, cards]) => {
        if (active) {
          setBankAccounts(accounts);
          setPaymentCards(cards);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [nestId]);

  const handleCreateCategory = async (payload: { name: string; type: number }) => {
    const created = await categoryService.createCategory(
      { name: payload.name, type: payload.type },
      nestId
    );
    setCategories((prev) => [...prev, created]);
    return created;
  };

  // ── Derivados client-side ──────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    let result = monthTransactions;
    if (filters.type === 'expense')
      result = result.filter((t) => t.transactionType === TransactionType.Expense);
    if (filters.type === 'income')
      result = result.filter((t) => t.transactionType === TransactionType.Income);
    if (filters.status === 'unpaid')
      result = result.filter((t) => t.paymentStatus !== PaymentStatus.Paid);
    if (filters.status === 'overdue') result = result.filter((t) => t.isOverdue);
    if (filters.categoryId) result = result.filter((t) => t.categoryId === filters.categoryId);
    if (filters.responsibleUserId)
      result = result.filter((t) => t.responsibleUserId === filters.responsibleUserId);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(q));
    }
    return result;
  }, [
    monthTransactions,
    filters.type,
    filters.status,
    filters.categoryId,
    filters.responsibleUserId,
    debouncedSearch,
  ]);

  // ── Mutações ───────────────────────────────────────────────────────────────
  const refresh = () => setRefreshKey((k) => k + 1);

  const handleCreate = async (payload: CreateTransactionRequest) => {
    try {
      await financialService.createTransaction(payload, nestId);
      showSuccess('Transação criada com sucesso!');
      refresh();
    } catch (error) {
      showError('Erro ao criar transação. Tente novamente.');
      throw error;
    }
  };

  const handleUpdate = async (payload: UpdateTransactionRequest) => {
    try {
      await financialService.updateTransaction(payload, nestId);
      showSuccess('Transação atualizada com sucesso!');
      refresh();
    } catch (error) {
      showError('Erro ao atualizar transação. Tente novamente.');
      throw error;
    }
  };

  const handlePaymentSubmit = async (payload: AddPaymentRequest) => {
    try {
      await financialService.addPayment(payload, nestId);
      showSuccess('Pagamento registrado!');
      refresh();
    } catch (error) {
      showError('Erro ao registrar pagamento. Tente novamente.');
      throw error;
    }
  };

  const handleRemovePayment = async (t: FinancialTransactionResponse, paymentId: string) => {
    try {
      await financialService.removePayment(
        {
          financialTransactionId: t.financialTransactionId,
          paymentId,
          removedByUserId: currentUserId,
        },
        nestId
      );
      showSuccess('Pagamento estornado.');
      refresh();
    } catch {
      showError('Erro ao estornar pagamento.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTx) return;
    try {
      await financialService.deleteTransaction(
        { financialTransactionId: deletingTx.financialTransactionId },
        nestId
      );
      showSuccess('Transação excluída.');
      refresh();
    } catch {
      showError('Erro ao excluir.');
    } finally {
      setDeletingTx(null);
    }
  };

  const handlePayBill = (bill: FinancialTransactionUpcomingBillResponse) => {
    const tx = monthTransactions.find(
      (t) => t.financialTransactionId === bill.financialTransactionId
    );
    if (tx) setPayingTx(tx);
  };

  const openCreate = () => {
    setEditingTx(null);
    setFormOpen(true);
  };
  const openEdit = (t: FinancialTransactionResponse) => {
    setEditingTx(t);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingTx(null);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    Boolean(filters.categoryId) ||
    Boolean(filters.responsibleUserId);

  const sourceNameById = useMemo(() => {
    const map = new Map<string, string>();
    bankAccounts.forEach((a) => map.set(a.bankAccountId, a.name));
    paymentCards.forEach((c) => map.set(c.paymentCardId, c.name));
    return map;
  }, [bankAccounts, paymentCards]);

  const monthLabelStr = getMonthLabel(month);

  return (
    <div className="flex max-w-full flex-col gap-6 overflow-x-hidden">
      {/* Banner de Alternância de Versão (V1 / V2) */}
      <div className="font-ui flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 p-3 px-4 text-xs">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Sparkles size={16} />
          <span>
            Você está visualizando a <strong className="font-bold">Versão 2 (Novo Design)</strong>{' '}
            de Lançamentos Financeiros
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/financial')}
          className="font-semibold text-foreground underline transition-colors hover:text-primary"
        >
          Voltar para V1 Original
        </button>
      </div>

      {/* Header: período + saldo + nova transação */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthNavigator month={month} onChange={setMonth} />
        <div className="flex items-center gap-4">
          <span className="font-ui hidden text-sm text-muted-foreground sm:inline">
            Saldo do mês{' '}
            <b
              className="text-base"
              style={{
                color:
                  Number(dashboardData?.currentMonth.balance ?? 0) >= 0
                    ? 'var(--chart-2)'
                    : 'var(--destructive)',
              }}
            >
              {formatCurrency(Number(dashboardData?.currentMonth.balance ?? 0))}
            </b>
          </span>
          <button
            type="button"
            onClick={openCreate}
            className="font-ui duration-[length:var(--dur-base)] hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-105 active:scale-[0.98] sm:inline-flex"
          >
            <Plus size={16} strokeWidth={2} /> Nova transação
          </button>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 items-start gap-3 md:gap-6 lg:grid-cols-3"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate="show"
      >
        {/* Coluna lateral — primeiro no mobile */}
        <div className="order-1 flex flex-col gap-3 md:gap-6 lg:order-2 lg:col-span-1">
          <motion.div variants={cardSlide}>
            <FinancialSummaryCardV2
              currentMonth={
                dashboardData?.currentMonth ?? { totalIncome: 0, totalExpenses: 0, balance: 0 }
              }
              previousMonth={
                dashboardData?.previousMonth ?? { totalIncome: 0, totalExpenses: 0, balance: 0 }
              }
              transactions={monthTransactions}
            />
          </motion.div>
          <motion.div variants={cardSlide}>
            <UpcomingBillsCardV2
              bills={dashboardData?.upcomingBills ?? []}
              onPay={handlePayBill}
              onViewAllUnpaid={() => setFilters((f) => ({ ...f, status: 'unpaid' }))}
            />
          </motion.div>
          <motion.div variants={cardSlide} className="hidden lg:block">
            <CategoryBreakdownCardV2
              expensesByCategory={dashboardData?.expensesByCategory ?? []}
              categories={categories}
              selectedCategoryId={filters.categoryId}
              onSelectCategory={(catId) => setFilters((f) => ({ ...f, categoryId: catId }))}
              onAddCategory={() => setCreateCategoryOpen(true)}
            />
          </motion.div>
        </div>

        {/* Coluna principal — lista */}
        <motion.div
          variants={cardSlide}
          className="order-2 flex flex-col gap-3 lg:order-1 lg:col-span-2"
        >
          <TransactionFiltersV2
            value={filters}
            onChange={setFilters}
            categories={categories}
            members={members}
            filteredTransactions={filteredTransactions}
            monthLabel={monthLabelStr}
          />
          <TransactionListV2
            transactions={filteredTransactions}
            loading={loading}
            hasMore={false}
            loadingMore={false}
            onLoadMore={() => {}}
            emptyTitle={
              hasActiveFilters ? 'Nenhuma transação encontrada' : 'Nenhuma transação neste mês'
            }
            emptyDescription="Registre a primeira transação pelo botão Nova transação."
            onPay={setPayingTx}
            onEdit={openEdit}
            onDelete={setDeletingTx}
            onRemovePayment={(t, paymentId) => {
              void handleRemovePayment(t, paymentId);
            }}
            sourceNameById={sourceNameById}
          />
        </motion.div>

        {/* Categorias — abaixo da lista no mobile */}
        <motion.div variants={cardSlide} className="order-3 lg:hidden">
          <CategoryBreakdownCardV2
            expensesByCategory={dashboardData?.expensesByCategory ?? []}
            categories={categories}
            selectedCategoryId={filters.categoryId}
            onSelectCategory={(catId) => setFilters((f) => ({ ...f, categoryId: catId }))}
            onAddCategory={() => setCreateCategoryOpen(true)}
          />
        </motion.div>
      </motion.div>

      {/* FAB mobile */}
      <button
        type="button"
        aria-label="Nova transação"
        onClick={openCreate}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 sm:hidden"
      >
        <Plus size={24} strokeWidth={2} />
      </button>

      {/* Modais */}
      <CreateCategoryModal
        open={createCategoryOpen}
        onClose={() => setCreateCategoryOpen(false)}
        nestId={nestId}
        onCategoryCreated={(newCat) => setCategories((prev) => [...prev, newCat])}
      />
      <TransactionSheet
        open={formOpen}
        onClose={closeForm}
        categories={categories}
        nestId={nestId}
        currentUserId={currentUserId}
        onCreate={handleCreate}
        onCreateCategory={handleCreateCategory}
        editingTransaction={editingTx}
        onUpdate={handleUpdate}
      />
      <PaymentModal
        open={payingTx !== null}
        onClose={() => setPayingTx(null)}
        transaction={payingTx}
        currentUserId={currentUserId}
        nestId={nestId}
        onSubmit={handlePaymentSubmit}
      />
      <AlertDialog
        open={deletingTx !== null}
        onOpenChange={(o) => {
          if (!o) setDeletingTx(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingTx?.description}&quot; será removida permanentemente. Essa ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleDeleteConfirm();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default FinancialV2;
