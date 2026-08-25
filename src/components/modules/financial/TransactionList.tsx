import { motion } from 'framer-motion';
import { Receipt } from 'lucide-react';

import EmptyState from '@/components/common/EmptyState';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { FinancialTransactionResponse } from '@/schemas/financial';
import { groupTransactionsByDay } from '@/utils/financialUtils';

import { TransactionRow } from './TransactionRow';

interface TransactionListProps {
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

/** Lista agrupada por dia com entrada em cascata e paginação "Carregar mais". */
export function TransactionList({
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
}: TransactionListProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const groups = groupTransactionsByDay(transactions);

  if (loading) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return <EmptyState icon={Receipt} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="flex flex-col gap-1">
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-1.5">
          <p
            className="font-ui mb-1 mt-3 px-1 font-semibold uppercase tracking-[1px] text-muted-foreground/80"
            style={{ fontSize: 'var(--text-xs)' }}
          >
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
              <TransactionRow
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

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="font-ui duration-[length:var(--dur-base)] mx-auto mt-4 rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground disabled:opacity-60"
        >
          {loadingMore ? 'Carregando…' : 'Carregar mais'}
        </button>
      )}
    </div>
  );
}
