import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PaymentModal } from '@/components/modals/PaymentModal';
import { TransactionFormModal } from '@/components/modals/TransactionFormModal';
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
import type { CategoryResponse } from '@/schemas/category';
import { TransactionType } from '@/schemas/enums';
import type {
  AddPaymentRequest,
  CreateTransactionRequest,
  FinancialTransactionFilter,
  FinancialTransactionResponse,
  UpdateTransactionRequest,
} from '@/schemas/financial';
import type { NestMember } from '@/schemas/nest';
import * as categoryService from '@/services/categoryService';
import * as financialService from '@/services/financialService';
import * as nestService from '@/services/nestService';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { getMonthRange, toIsoDate } from '@/utils/financialUtils';

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

const PAGE_SIZE = 20;

const firstOfCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Financial — Hub de transações da casa (Domestic Sanctuary design).
 * Lista protagonista + coluna lateral (resumo, contas a vencer, categorias).
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

  // ── Dados ──────────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState<FinancialTransactionResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [monthTransactions, setMonthTransactions] = useState<FinancialTransactionResponse[]>([]);
  const [previousExpense, setPreviousExpense] = useState(0);
  const [upcomingBills, setUpcomingBills] = useState<FinancialTransactionResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [members, setMembers] = useState<NestMember[]>([]);
  /** Incrementado após cada mutação para recarregar todas as queries. */
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Modais ─────────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinancialTransactionResponse | null>(null);
  const [payingTx, setPayingTx] = useState<FinancialTransactionResponse | null>(null);
  const [deletingTx, setDeletingTx] = useState<FinancialTransactionResponse | null>(null);

  const listFilter = useMemo<FinancialTransactionFilter>(() => {
    const base: FinancialTransactionFilter = { ...getMonthRange(month), pageSize: PAGE_SIZE };
    if (filters.type === 'expense') base.types = [TransactionType.Expense];
    if (filters.type === 'income') base.types = [TransactionType.Income];
    if (filters.status === 'unpaid') base.isPaid = false;
    if (filters.status === 'overdue') base.isOverdue = true;
    if (debouncedSearch.trim()) base.description = debouncedSearch.trim();
    if (filters.categoryId) base.categoryIds = [filters.categoryId];
    return base;
  }, [month, filters.type, filters.status, filters.categoryId, debouncedSearch]);

  // Lista paginada (sempre volta à página 1 quando filtro muda)
  useEffect(() => {
    let active = true;
    setLoadingList(true);
    setPage(1);
    financialService
      .listTransactions({ ...listFilter, page: 1 }, nestId)
      .then(res => {
        if (!active) return;
        setTransactions(res.items);
        setTotalCount(res.totalCount);
      })
      .catch(() => {
        if (active) showError('Erro ao carregar transações.');
      })
      .finally(() => {
        if (active) setLoadingList(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilter, nestId, refreshKey]);

  // Resumo do mês + mês anterior (sem filtros de UI)
  useEffect(() => {
    let active = true;
    const prevMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
    Promise.all([
      financialService.listTransactions({ ...getMonthRange(month), pageSize: 1000 }, nestId),
      financialService.listTransactions({ ...getMonthRange(prevMonth), pageSize: 1000 }, nestId),
    ])
      .then(([current, previous]) => {
        if (!active) return;
        setMonthTransactions(current.items);
        setPreviousExpense(
          previous.items
            .filter(t => t.transactionType === TransactionType.Expense)
            .reduce((sum, t) => sum + Number(t.value), 0),
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [month, nestId, refreshKey]);

  // Contas a vencer: não pagas com vencimento até hoje+14 (inclui vencidas de outros meses)
  useEffect(() => {
    let active = true;
    const limit = new Date();
    limit.setDate(limit.getDate() + 14);
    financialService
      .listTransactions(
        { isPaid: false, types: [TransactionType.Expense], maxDueDate: toIsoDate(limit), pageSize: 50 },
        nestId,
      )
      .then(res => {
        if (!active) return;
        setUpcomingBills([...res.items].sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate))));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [nestId, refreshKey]);

  // Categorias + membros (uma vez por nest)
  useEffect(() => {
    let active = true;
    categoryService
      .listCategories({ pageSize: 100 }, nestId)
      .then(res => {
        if (active) setCategories(res.items);
      })
      .catch(() => {});
    if (activeNestId) {
      nestService
        .getNestMembers(activeNestId)
        .then(m => {
          if (active) setMembers(m);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [activeNestId, nestId]);

  // ── Derivados ──────────────────────────────────────────────────────────────
  const monthIncome = useMemo(
    () =>
      monthTransactions
        .filter(t => t.transactionType === TransactionType.Income)
        .reduce((sum, t) => sum + Number(t.value), 0),
    [monthTransactions],
  );
  const monthExpense = useMemo(
    () =>
      monthTransactions
        .filter(t => t.transactionType === TransactionType.Expense)
        .reduce((sum, t) => sum + Number(t.value), 0),
    [monthTransactions],
  );

  const hasMore = transactions.length < totalCount;

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await financialService.listTransactions({ ...listFilter, page: next }, nestId);
      setTransactions(prev => [...prev, ...res.items]);
      setPage(next);
    } catch {
      showError('Erro ao carregar mais transações.');
    } finally {
      setLoadingMore(false);
    }
  }, [page, listFilter, nestId, showError]);

  const refresh = () => setRefreshKey(k => k + 1);

  // ── Mutações ───────────────────────────────────────────────────────────────
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
      showSuccess('Transação atualizada!');
      refresh();
    } catch (error) {
      showError('Erro ao atualizar. O backend pode ainda não suportar edição.');
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

  const openCreate = () => {
    setEditingTx(null);
    setFormOpen(true);
  };
  const openEdit = (t: FinancialTransactionResponse) => {
    setEditingTx(t);
    setFormOpen(true);
  };

  const cardSlide: Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] } },
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) || filters.type !== 'all' || filters.status !== 'all' || Boolean(filters.categoryId);

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
              style={{ color: monthIncome - monthExpense >= 0 ? 'var(--chart-2)' : 'var(--destructive)' }}
            >
              {formatCurrency(monthIncome - monthExpense)}
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
        {/* Coluna lateral — primeiro no mobile (Resumo → Contas a vencer) */}
        <div className="flex flex-col gap-3 md:gap-6 order-1 lg:order-2 lg:col-span-1">
          <motion.div variants={cardSlide}>
            <FinancialSummaryCard income={monthIncome} expense={monthExpense} previousExpense={previousExpense} />
          </motion.div>
          <motion.div variants={cardSlide}>
            <UpcomingBillsCard bills={upcomingBills} onPay={setPayingTx} />
          </motion.div>
          <motion.div variants={cardSlide} className="hidden lg:block">
            <CategoryBreakdownCard transactions={monthTransactions} />
          </motion.div>
        </div>

        {/* Coluna principal — lista */}
        <motion.div variants={cardSlide} className="flex flex-col gap-3 order-2 lg:order-1 lg:col-span-2">
          <TransactionFilters value={filters} onChange={setFilters} categories={categories} />
          <TransactionList
            transactions={transactions}
            loading={loadingList}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={() => {
              void handleLoadMore();
            }}
            emptyTitle={hasActiveFilters ? 'Nenhuma transação encontrada' : 'Nenhuma transação neste mês'}
            emptyDescription="Registre a primeira transação pelo botão Nova transação."
            onPay={setPayingTx}
            onEdit={openEdit}
            onDelete={setDeletingTx}
            onRemovePayment={(t, paymentId) => {
              void handleRemovePayment(t, paymentId);
            }}
          />
        </motion.div>

        {/* Categorias — abaixo da lista no mobile */}
        <motion.div variants={cardSlide} className="order-3 lg:hidden">
          <CategoryBreakdownCard transactions={monthTransactions} />
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
      <TransactionFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTx(null);
        }}
        transaction={editingTx}
        categories={categories}
        members={members}
        currentUserId={currentUserId}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
      <PaymentModal
        open={payingTx !== null}
        onClose={() => setPayingTx(null)}
        transaction={payingTx}
        currentUserId={currentUserId}
        onSubmit={handlePaymentSubmit}
      />
      <AlertDialog
        open={deletingTx !== null}
        onOpenChange={o => {
          if (!o) setDeletingTx(null);
        }}
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
