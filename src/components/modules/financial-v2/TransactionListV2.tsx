import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Receipt, RotateCcw, Scale } from 'lucide-react';

import { AnimatedCurrency, AnimatedNumber } from '@/components/common/AnimatedNumber';
import EmptyState from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { TransactionType } from '@/schemas/enums';
import type { FinancialTransactionResponse } from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { calculateTransactionsTotals, groupTransactionsByDay } from '@/utils/financialUtils';

import { TransactionRowV2 } from './TransactionRowV2';

interface TransactionListV2Props {
  transactions: FinancialTransactionResponse[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  emptyTitle: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  onPay: (t: FinancialTransactionResponse) => void;
  onEdit: (t: FinancialTransactionResponse) => void;
  onDelete: (t: FinancialTransactionResponse) => void;
  onRemovePayment: (t: FinancialTransactionResponse, paymentId: string) => void;
  sourceNameById: Map<string, string>;
}

/**
 * TransactionListV2 — Lista analítica de lançamentos V2.
 * Agrupa transações por data com cálculo automático de subtotal diário no cabeçalho,
 * fita de métricas do filtro ativo e animações escalonadas suaves.
 */
export function TransactionListV2({
  transactions,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  emptyTitle,
  emptyDescription,
  onResetFilters,
  onPay,
  onEdit,
  onDelete,
  onRemovePayment,
  sourceNameById,
}: TransactionListV2Props) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const groups = groupTransactionsByDay(transactions);

  // Subtotais da seleção/filtro atual
  const filteredIncome = transactions
    .filter((t) => t.transactionType === TransactionType.Income)
    .reduce((sum, t) => sum + Number(t.value), 0);

  const filteredExpense = transactions
    .filter((t) => t.transactionType === TransactionType.Expense)
    .reduce((sum, t) => sum + Number(t.value), 0);

  const filteredBalance = filteredIncome - filteredExpense;

  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Carregando lançamentos">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-subtle"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 sm:w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border/80 bg-card p-8 shadow-xs">
        <EmptyState icon={Receipt} title={emptyTitle} description={emptyDescription} />
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="font-ui flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/80 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
          >
            <RotateCcw size={13} />
            Limpar filtros aplicados
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Fita de Estatísticas e Subtotais da Exibição Atual */}
      <div className="font-ui flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-border/80 bg-card px-4 py-3 text-xs shadow-xs">
        <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
          Exibindo <b className="font-bold text-foreground"><AnimatedNumber value={transactions.length} /></b>{' '}
          {transactions.length === 1 ? 'lançamento' : 'lançamentos'}
        </span>

        <div className="flex flex-wrap items-center gap-3 font-semibold sm:gap-4">
          <span className="flex items-center gap-1 text-chart-2">
            <ArrowUpRight size={14} strokeWidth={2.5} /> <AnimatedCurrency value={filteredIncome} />
          </span>
          <span className="flex items-center gap-1 text-destructive">
            <ArrowDownRight size={14} strokeWidth={2.5} /> <AnimatedCurrency value={filteredExpense} />
          </span>
          <span className="flex items-center gap-1 border-l border-border/80 pl-3 font-bold text-foreground">
            <Scale size={13} className="text-primary" /> Balanço:{' '}
            <AnimatedCurrency
              value={filteredBalance}
              style={{
                color: filteredBalance >= 0 ? 'var(--chart-2)' : 'var(--destructive)',
              }}
            />
          </span>
        </div>
      </div>

      {/* Lista de Grupos Diários */}
      <div className="flex flex-col gap-2">
        {groups.map((group) => {
          const groupTotals = calculateTransactionsTotals(group.items);

          return (
            <div key={group.key} className="flex flex-col gap-2">
              {/* Cabeçalho do Dia com Subtotal Diário */}
              <div className="font-ui mt-3 flex items-center justify-between px-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-muted-foreground">
                  {group.label}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    groupTotals.balance > 0
                      ? 'bg-chart-2/10 text-chart-2'
                      : groupTotals.balance < 0
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {groupTotals.balance > 0 ? '+' : ''}
                  {formatCurrency(groupTotals.balance)} no dia
                </span>
              </div>

              {/* Linhas de Transações */}
              {group.items.map((t, i) => (
                <motion.div
                  key={t.financialTransactionId}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    ease: [0.25, 1, 0.5, 1],
                    delay: Math.min(i * 0.03, 0.25),
                  }}
                >
                  <TransactionRowV2
                    transaction={t}
                    onPay={onPay}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onRemovePayment={onRemovePayment}
                    sourceNameById={sourceNameById}
                  />
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="font-ui mx-auto mt-4 rounded-full border border-border/80 bg-card px-6 py-2.5 text-xs font-bold text-foreground shadow-xs transition-all hover:bg-muted active:scale-95 disabled:opacity-60"
        >
          {loadingMore ? 'Carregando lançamentos…' : 'Carregar mais lançamentos'}
        </button>
      )}
    </div>
  );
}

