import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Receipt, Scale } from 'lucide-react';

import EmptyState from '@/components/common/EmptyState';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { TransactionType } from '@/schemas/enums';
import type { FinancialTransactionResponse } from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { groupTransactionsByDay } from '@/utils/financialUtils';

import { TransactionRowV2 } from './TransactionRowV2';

interface TransactionListV2Props {
  transactions: FinancialTransactionResponse[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  emptyTitle: string;
  emptyDescription?: string;
  onPay: (t: FinancialTransactionResponse) => void;
  onEdit: (t: FinancialTransactionResponse) => void;
  onDelete: (t: FinancialTransactionResponse) => void;
  onRemovePayment: (t: FinancialTransactionResponse, paymentId: string) => void;
  sourceNameById: Map<string, string>;
}

/**
 * Lista V2 agrupada por dia com fita de estatísticas e subtotais dinâmicos.
 */
export function TransactionListV2({
  transactions,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  emptyTitle,
  emptyDescription,
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
      <div className="flex flex-col gap-2.5" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="shadow-2xs rounded-3xl border border-border/80 bg-card p-6">
        <EmptyState icon={Receipt} title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Fita de Estatísticas e Subtotais dos Itens Filtrados */}
      <div className="shadow-2xs font-ui flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/80 bg-card px-4 py-3 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
          Exibindo <b className="font-bold text-foreground">{transactions.length}</b>{' '}
          {transactions.length === 1 ? 'lançamento' : 'lançamentos'}
        </span>

        <div className="flex flex-wrap items-center gap-3 font-semibold sm:gap-4">
          <span className="flex items-center gap-1 text-chart-2">
            <ArrowUpRight size={14} /> {formatCurrency(filteredIncome)}
          </span>
          <span className="flex items-center gap-1 text-destructive">
            <ArrowDownRight size={14} /> {formatCurrency(filteredExpense)}
          </span>
          <span className="flex items-center gap-1 border-l border-border/80 pl-3 font-bold text-foreground">
            <Scale size={13} className="text-primary" /> Balanço: {formatCurrency(filteredBalance)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-1.5">
            <p className="font-ui mb-1 mt-3.5 px-1 text-[11px] font-bold uppercase tracking-[1.2px] text-muted-foreground/80">
              {group.label}
            </p>
            {group.items.map((t, i) => (
              <motion.div
                key={t.financialTransactionId}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: [0.25, 1, 0.5, 1],
                  delay: Math.min(i * 0.04, 0.3),
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
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="font-ui duration-[length:var(--dur-base)] shadow-2xs mx-auto mt-4 rounded-full bg-muted px-5 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-95 disabled:opacity-60"
        >
          {loadingMore ? 'Carregando…' : 'Carregar mais'}
        </button>
      )}
    </div>
  );
}
