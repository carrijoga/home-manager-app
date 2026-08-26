import { motion } from 'framer-motion';
import { Check, Filter, Plus, TrendingUp } from 'lucide-react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { CategoryResponse } from '@/schemas/category';
import type { FinancialTransactionCategoryExpenseResponse } from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';

interface CategoryBreakdownCardV2Props {
  expensesByCategory: FinancialTransactionCategoryExpenseResponse[];
  categories: CategoryResponse[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onAddCategory?: () => void;
}

const COLORS = [
  'var(--primary)',
  'var(--secondary)',
  'var(--chart-2)',
  'var(--chart-5)',
  'var(--chart-4)',
  'var(--chart-1)',
];

/**
 * CategoryBreakdownCardV2 — Gastos por categoria com suporte a filtro interativo ao clicar!
 */
export function CategoryBreakdownCardV2({
  expensesByCategory,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
}: CategoryBreakdownCardV2Props) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const totalExpenseSum = expensesByCategory.reduce((sum, r) => sum + Number(r.totalAmount), 0);
  const max = Math.max(...expensesByCategory.map((r) => Number(r.totalAmount)), 1);

  // Mapeia os dados da API para associar com o categoryId real
  const rows = expensesByCategory.map((r, i) => {
    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase().trim() === r.categoryName.toLowerCase().trim()
    );
    const amount = Number(r.totalAmount);
    const percentage = totalExpenseSum > 0 ? Math.round((amount / totalExpenseSum) * 100) : 0;
    return {
      categoryId: matchedCategory?.categoryId ?? null,
      label: r.categoryName,
      amount,
      ratio: amount / max,
      percentage,
      color: COLORS[i % COLORS.length],
    };
  });

  return (
    <div className="shadow-xs flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9.5 w-9.5 flex items-center justify-center rounded-2xl bg-secondary/15 text-secondary-foreground">
            <TrendingUp size={19} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold leading-tight text-foreground">
              Gastos por Categoria
            </h3>
            <p className="font-ui text-xs text-muted-foreground">Clique para filtrar a lista</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCategoryId && (
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="font-ui flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:underline"
            >
              <Filter size={11} /> Limpar
            </button>
          )}
          {onAddCategory && (
            <button
              type="button"
              onClick={onAddCategory}
              className="font-ui flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
              title="Nova Categoria"
            >
              <Plus size={12} /> Categoria
            </button>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="font-ui py-2 text-xs text-muted-foreground">
          Sem despesas registradas neste mês.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => {
            const isSelected = selectedCategoryId !== null && row.categoryId === selectedCategoryId;
            return (
              <button
                key={row.label}
                type="button"
                onClick={() => {
                  if (!row.categoryId) return;
                  onSelectCategory(isSelected ? null : row.categoryId);
                }}
                className={`flex flex-col gap-1.5 rounded-2xl p-3 text-left outline-none transition-all ${
                  isSelected
                    ? 'shadow-xs bg-primary/15 ring-2 ring-primary/40'
                    : 'border border-transparent hover:border-border/60 hover:bg-muted/50 focus-visible:bg-muted/60'
                }`}
              >
                <div className="font-ui flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 truncate font-medium text-foreground">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: row.color }}
                    />
                    {isSelected && <Check size={13} className="shrink-0 text-primary" />}
                    <span className="truncate">{row.label}</span>
                    <span className="shrink-0 text-[10px] font-normal text-muted-foreground">
                      ({row.percentage}%)
                    </span>
                  </span>
                  <span className="shrink-0 pl-2 font-bold text-foreground">
                    {formatCurrency(row.amount)}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted/80">
                  <motion.div
                    className="h-full rounded-full"
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    animate={{ width: `${row.ratio * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                    style={{ background: row.color }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
