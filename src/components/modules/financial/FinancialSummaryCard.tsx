import { Wallet } from 'lucide-react';

import type { FinancialTransactionMonthSummary } from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';

interface FinancialSummaryCardProps {
  currentMonth: FinancialTransactionMonthSummary;
  previousMonth: FinancialTransactionMonthSummary;
}

/** Resumo do mês: receitas, despesas, saldo e variação vs mês anterior. */
export function FinancialSummaryCard({ currentMonth, previousMonth }: FinancialSummaryCardProps) {
  const delta = Number(currentMonth.totalExpenses) - Number(previousMonth.totalExpenses);
  const deltaPercent =
    Number(previousMonth.totalExpenses) > 0
      ? Math.round((delta / Number(previousMonth.totalExpenses)) * 100)
      : null;

  return (
    <div className="flex flex-col gap-4 p-6 rounded-3xl bg-card border border-border">
      <div className="flex items-center gap-3">
        <Wallet size={18} className="text-foreground" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="font-editorial font-bold text-foreground text-lg">Resumo do mês</h3>
      </div>

      <div className="flex flex-col gap-2 font-ui text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Receitas</span>
          <span className="font-semibold" style={{ color: 'var(--chart-2)' }}>
            {formatCurrency(Number(currentMonth.totalIncome))}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Despesas</span>
          <span className="font-semibold text-destructive">
            {formatCurrency(Number(currentMonth.totalExpenses))}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-dashed border-border">
          <span className="text-foreground font-medium">Saldo</span>
          <span className="font-bold text-foreground text-base">
            {formatCurrency(Number(currentMonth.balance))}
          </span>
        </div>
        {deltaPercent !== null && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">vs. mês anterior</span>
            <span
              className="font-semibold"
              style={{ color: delta > 0 ? 'var(--destructive)' : 'var(--chart-2)' }}
            >
              {delta >= 0 ? '+' : ''}
              {deltaPercent}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
