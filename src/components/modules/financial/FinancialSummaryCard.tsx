import { Wallet } from 'lucide-react';

import { formatCurrency } from '@/utils/dashboardMetrics';

interface FinancialSummaryCardProps {
  income: number;
  expense: number;
  /** Total de despesas do mês anterior — para a variação. */
  previousExpense: number;
}

/** Resumo do mês: receitas, despesas, saldo e variação vs mês anterior. */
export function FinancialSummaryCard({ income, expense, previousExpense }: FinancialSummaryCardProps) {
  const balance = income - expense;
  const delta = expense - previousExpense;
  const deltaPercent = previousExpense > 0 ? Math.round((delta / previousExpense) * 100) : null;

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
            {formatCurrency(income)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Despesas</span>
          <span className="font-semibold text-destructive">{formatCurrency(expense)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-dashed border-border">
          <span className="text-foreground font-medium">Saldo</span>
          <span className="font-bold text-foreground text-base">{formatCurrency(balance)}</span>
        </div>
        {deltaPercent !== null && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">vs. mês anterior</span>
            <span
              className="font-semibold"
              style={{ color: delta > 0 ? 'var(--destructive)' : 'var(--chart-2)' }}
            >
              {delta >= 0 ? '+' : ''}{deltaPercent}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
