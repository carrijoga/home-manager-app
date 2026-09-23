import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AnimatedCurrency } from '@/components/common/AnimatedNumber';
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
  Button,
} from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useDebounce } from '@/hooks/useDebounce';
import { usePolling } from '@/hooks/usePolling';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { BankAccountResponse } from '@/schemas/bank-account';
import { PaymentStatus, TransactionType } from '@/schemas/enums';
import type {
  AddPaymentRequest,
  CreateTransactionRequest,
  FinancialTransactionDashboardResponse,
  FinancialTransactionResponse,
  FinancialTransactionUpcomingBillResponse,
  UpdateTransactionRequest,
} from '@/schemas/financial';
import type { CategoryResponse } from '@/schemas/legacyCategory';
import type { PaymentCardResponse } from '@/schemas/payment-card';
import * as bankAccountService from '@/services/bankAccountService';
import * as financialService from '@/services/financialService';
import * as categoryService from '@/services/legacyCategoryService';
import * as paymentCardService from '@/services/paymentCardService';
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
  const navigate = useNavigate();
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
  const [dashboardData, setDashboardData] = useState<FinancialTransactionDashboardResponse | null>(
    null
  );
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [paymentCards, setPaymentCards] = useState<PaymentCardResponse[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Modais ─────────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinancialTransactionResponse | null>(null);
  const [payingTx, setPayingTx] = useState<FinancialTransactionResponse | null>(null);
  const [deletingTx, setDeletingTx] = useState<FinancialTransactionResponse | null>(null);

  // Busca dashboard e lista de transações em paralelo.
  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [dashboard, list] = await Promise.all([
          financialService.getFinancialDashboard(month.getMonth() + 1, month.getFullYear(), nestId),
          financialService.listTransactions({ ...getMonthRange(month), pageSize: 1000 }, nestId),
        ]);
        setDashboardData(dashboard);
        setMonthTransactions(list ?? []);
      } catch {
        if (!silent) showError('Erro ao carregar transações.');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [month, nestId, showError]
  );

  useEffect(() => {
    loadData(false);
  }, [loadData, refreshKey]);

  usePolling(
    useCallback(() => loadData(true), [loadData]),
    { intervalMs: 10000, enabled: Boolean(nestId) }
  );

  // Categorias — uma vez por nest, sem refresh em mutações
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nestId]);

  // Contas e cartões — para resolver nomes de origem nos pagamentos expandidos
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (filters.type === 'transfer')
      result = result.filter(
        (t) => t.transactionType === TransactionType.Transfer || t.transactionType === 3
      );
    if (filters.status === 'unpaid')
      result = result.filter((t) => t.paymentStatus !== PaymentStatus.Paid);
    if (filters.status === 'overdue') result = result.filter((t) => t.isOverdue);
    if (filters.categoryId) result = result.filter((t) => t.categoryId === filters.categoryId);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(q));
    }
    return result;
  }, [monthTransactions, filters.type, filters.status, filters.categoryId, debouncedSearch]);

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
      showError('Erro ao excluir. O backend pode ainda não suportar exclusão.');
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
    Boolean(filters.categoryId);

  const sourceNameById = useMemo(() => {
    const map = new Map<string, string>();
    bankAccounts.forEach((a) => map.set(a.bankAccountId, a.name));
    paymentCards.forEach((c) => map.set(c.paymentCardId, c.name));
    return map;
  }, [bankAccounts, paymentCards]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex max-w-full flex-col gap-6 overflow-x-hidden">
      {/* ── Banner de Alternância de Versão (V2 Beta) ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Sparkles size={16} />
          <span>
            Conheça o novo <strong className="font-bold">Financial V2</strong> com novo design, métricas analíticas e baixa rápida
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/financial-v2')}
          className="font-ui font-semibold text-primary underline transition-colors hover:text-primary/80"
        >
          Experimentar V2 →
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
              <AnimatedCurrency
                value={Number(dashboardData?.currentMonth.balance ?? 0)}
              />
            </b>
          </span>
          <Button
            type="button"
            onClick={openCreate}
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl font-bold shadow-xs active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={2.5} /> Nova transação
          </Button>
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
            <FinancialSummaryCard
              currentMonth={
                dashboardData?.currentMonth ?? { totalIncome: 0, totalExpenses: 0, balance: 0 }
              }
              previousMonth={
                dashboardData?.previousMonth ?? { totalIncome: 0, totalExpenses: 0, balance: 0 }
              }
            />
          </motion.div>
          <motion.div variants={cardSlide}>
            <UpcomingBillsCard bills={dashboardData?.upcomingBills ?? []} onPay={handlePayBill} />
          </motion.div>
          <motion.div variants={cardSlide} className="hidden lg:block">
            <CategoryBreakdownCard expensesByCategory={dashboardData?.expensesByCategory ?? []} />
          </motion.div>
        </div>

        {/* Coluna principal — lista */}
        <motion.div
          variants={cardSlide}
          className="order-2 flex flex-col gap-3 lg:order-1 lg:col-span-2"
        >
          <TransactionFilters value={filters} onChange={setFilters} categories={categories} />
          <TransactionList
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
          <CategoryBreakdownCard expensesByCategory={dashboardData?.expensesByCategory ?? []} />
        </motion.div>
      </motion.div>

      {/* FAB mobile */}
      <motion.div
        className="fixed bottom-6 right-6 z-40 sm:hidden pb-[env(safe-area-inset-bottom)]"
        whileTap={{ scale: 0.92 }}
      >
        <button
          type="button"
          aria-label="Nova transação"
          onClick={openCreate}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl transition-transform"
        >
          <Plus size={26} strokeWidth={3} />
        </button>
      </motion.div>

      {/* Modais */}
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
};

export default Financial;
