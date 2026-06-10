import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { FinancialTransactionCategoryExpenseResponse } from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';

interface CategoryBreakdownCardProps {
  expensesByCategory: FinancialTransactionCategoryExpenseResponse[];
}

const COLORS = ['var(--primary)', 'var(--secondary)', 'var(--chart-2)', 'var(--chart-5)', 'var(--chart-4)'];

/** Despesas do mês agrupadas por categoria, em barras (dados do dashboard). */
export function CategoryBreakdownCard({ expensesByCategory }: CategoryBreakdownCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const max = Math.max(...expensesByCategory.map(r => Number(r.totalAmount)), 1);
  const rows = expensesByCategory.slice(0, 5).map((r, i) => ({
    label: r.categoryName,
    amount: Number(r.totalAmount),
    ratio: Number(r.totalAmount) / max,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="flex flex-col gap-4 p-6 rounded-3xl bg-card border border-border">
      <div className="flex items-center gap-3">
        <TrendingUp size={18} className="text-foreground" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="font-editorial font-bold text-foreground text-lg">Gastos por categoria</h3>
      </div>

      {rows.length === 0 ? (
        <p className="font-ui text-sm text-muted-foreground">Sem despesas neste mês.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map(row => (
            <div key={row.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between font-ui text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-semibold text-foreground">{formatCurrency(row.amount)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={prefersReducedMotion ? false : { width: 0 }}
                  animate={{ width: `${row.ratio * 100}%` }}
                  transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
                  style={{ background: row.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
