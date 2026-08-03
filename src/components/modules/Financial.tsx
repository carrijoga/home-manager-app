import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
} from '@/schemas/financial';
import type { PaymentCardResponse } from '@/schemas/payment-card';
import * as bankAccountService from '@/services/bankAccountService';
import * as categoryService from '@/services/categoryService';
import * as financialService from '@/services/financialService';
import * as paymentCardService from '@/services/paymentCardService';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { getMonthRange } from '@/utils/financialUtils';

import { CategoryBreakdownCard } from './financial/CategoryBreakdownCard';
import { FinancialSummaryCard } from './financial/FinancialSummaryCard';
import { MonthNavigator } from './financial/MonthNavigator';
import {
  DEFAULT_FILTERS,
  TransactionFilters,
  type TransactionFiltersState,
} from './financial/TransactionFilters';
import { TransactionList } from './financial/TransactionList';
import { UpcomingBillsCard } from './financial/UpcomingBillsCard';

const firstOfCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const cardSlide: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] } },
};

/**
 * Financial — Hub de transações da casa (Domestic Sanctuary design).
 *
 * Uma única requisição por mês busca todas as transações. Lista filtrada,
 * resumo e contas-a-vencer são derivados client-side — sem requests extras.
 */
const Financial = () => {
  const { user, activeNestId } = useApp();
  const { showSuccess, showError } = useToastNotifications();
  const prefersReducedMotion = usePrefersReducedMotion();
  const nestId = activeNestId ?? undefined;
  const currentUserId = user?.id ?? '';

  // ── Período e filtros ──────────────────────────────────────────────────────
  const [month, setMonth] = useState<Date>(firstOfCurrentMonth);
  const [filters, setFilters] = useState<TransactionFiltersState>(DEFAULT_FILTERS);
  const debouncedSearch = useDebounce(filters.search, 300);

  // ── Dados do servidor ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [monthTransactions, setMonthTransactions] = useState<FinancialTransactionResponse[]>([]);
  const [dashboardData, setDashboardData] = useState<FinancialTransactionDashboardResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [paymentCards, setPaymentCards] = useState<PaymentCardResponse[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Modais ─────────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
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

  // Categorias — uma vez por nest, sem refresh em mutações
  useEffect(() => {
    let active = true;
    categoryService
      .listCategories({ pageSize: 100 }, nestId)
      .then(res => { if (active) setCategories(res ?? []); })
      .catch(() => {});
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nestId]);

  // Contas e cartões — para resolver nomes de origem nos pagamentos expandidos
  useEffect(() => {
    let active = true;
    Promise.all([
      bankAccountService.listBankAccounts(nestId),
      paymentCardService.listPaymentCards(nestId),
    ]).then(([accounts, cards]) => {
      if (active) { setBankAccounts(accounts); setPaymentCards(cards); }
    }).catch(() => {});
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nestId]);

  const handleCreateCategory = async (payload: { name: string; type: number }) => {
    const created = await categoryService.createCategory({ name: payload.name, type: payload.type }, nestId);
    setCategories(prev => [...prev, created]);
    return created;
  };

  // ── Derivados client-side ──────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    let result = monthTransactions;
    if (filters.type === 'expense') result = result.filter(t => t.transactionType === TransactionType.Expense);
    if (filters.type === 'income') result = result.filter(t => t.transactionType === TransactionType.Income);
    if (filters.status === 'unpaid') result = result.filter(t => t.paymentStatus !== PaymentStatus.Paid);
    if (filters.status === 'overdue') result = result.filter(t => t.isOverdue);
    if (filters.categoryId) result = result.filter(t => t.categoryId === filters.categoryId);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter(t => t.description.toLowerCase().includes(q));
    }
    return result;
  }, [monthTransactions, filters.type, filters.status, filters.categoryId, debouncedSearch]);

  // ── Mutações ───────────────────────────────────────────────────────────────
  const refresh = () => setRefreshKey(k => k + 1);

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
        { financialTransactionId: t.financialTransactionId, paymentId, removedByUserId: currentUserId },
        nestId,
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
      await financialService.deleteTransaction({ financialTransactionId: deletingTx.financialTransactionId }, nestId);
      showSuccess('Transação excluída.');
      refresh();
    } catch {
      showError('Erro ao excluir. O backend pode ainda não suportar exclusão.');
    } finally {
      setDeletingTx(null);
    }
  };

  const handlePayBill = (bill: FinancialTransactionUpcomingBillResponse) => {
    const tx = monthTransactions.find(t => t.financialTransactionId === bill.financialTransactionId);
    if (tx) setPayingTx(tx);
  };

  const openCreate = () => { setFormOpen(true); };

  const hasActiveFilters =
    Boolean(debouncedSearch) || filters.type !== 'all' || filters.status !== 'all' || Boolean(filters.categoryId);

  const sourceNameById = useMemo(() => {
    const map = new Map<string, string>();
    bankAccounts.forEach(a => map.set(a.bankAccountId, a.name));
    paymentCards.forEach(c => map.set(c.paymentCardId, c.name));
    return map;
  }, [bankAccounts, paymentCards]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-full overflow-x-hidden">
      {/* Header: período + saldo + nova transação */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthNavigator month={month} onChange={setMonth} />
        <div className="flex items-center gap-4">
          <span className="font-ui text-sm text-muted-foreground hidden sm:inline">
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
            className="hidden sm:inline-flex items-center gap-2 font-ui text-sm font-semibold bg-primary text-primary-foreground rounded-full px-4 py-2 hover:brightness-105 active:scale-[0.98] transition-all duration-[length:var(--dur-base)]"
          >
            <Plus size={16} strokeWidth={2} /> Nova transação
          </button>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 items-start"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate="show"
      >
        {/* Coluna lateral — primeiro no mobile */}
        <div className="flex flex-col gap-3 md:gap-6 order-1 lg:order-2 lg:col-span-1">
          <motion.div variants={cardSlide}>
            <FinancialSummaryCard
              currentMonth={dashboardData?.currentMonth ?? { totalIncome: 0, totalExpenses: 0, balance: 0 }}
              previousMonth={dashboardData?.previousMonth ?? { totalIncome: 0, totalExpenses: 0, balance: 0 }}
            />
          </motion.div>
          <motion.div variants={cardSlide}>
            <UpcomingBillsCard
              bills={dashboardData?.upcomingBills ?? []}
              onPay={handlePayBill}
            />
          </motion.div>
          <motion.div variants={cardSlide} className="hidden lg:block">
            <CategoryBreakdownCard expensesByCategory={dashboardData?.expensesByCategory ?? []} />
          </motion.div>
        </div>

        {/* Coluna principal — lista */}
        <motion.div variants={cardSlide} className="flex flex-col gap-3 order-2 lg:order-1 lg:col-span-2">
          <TransactionFilters value={filters} onChange={setFilters} categories={categories} />
          <TransactionList
            transactions={filteredTransactions}
            loading={loading}
            hasMore={false}
            loadingMore={false}
            onLoadMore={() => {}}
            emptyTitle={hasActiveFilters ? 'Nenhuma transação encontrada' : 'Nenhuma transação neste mês'}
            emptyDescription="Registre a primeira transação pelo botão Nova transação."
            onPay={setPayingTx}
            onDelete={setDeletingTx}
            onRemovePayment={(t, paymentId) => { void handleRemovePayment(t, paymentId); }}
            sourceNameById={sourceNameById}
          />
        </motion.div>

        {/* Categorias — abaixo da lista no mobile */}
        <motion.div variants={cardSlide} className="order-3 lg:hidden">
          <CategoryBreakdownCard expensesByCategory={dashboardData?.expensesByCategory ?? []} />
        </motion.div>
      </motion.div>

      {/* FAB mobile */}
      <button
        type="button"
        aria-label="Nova transação"
        onClick={openCreate}
        className="sm:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <Plus size={24} strokeWidth={2} />
      </button>

      {/* Modais */}
      <TransactionSheet
        open={formOpen}
        onClose={() => { setFormOpen(false); }}
        categories={categories}
        nestId={nestId}
        currentUserId={currentUserId}
        onCreate={handleCreate}
        onCreateCategory={handleCreateCategory}
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
        onOpenChange={o => { if (!o) setDeletingTx(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingTx?.description}&quot; será removida permanentemente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { void handleDeleteConfirm(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Financial;
