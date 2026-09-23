import { motion } from 'framer-motion';
import { Check, Filter, Lightbulb, Plus, TrendingUp } from 'lucide-react';

import { AnimatedCurrency, AnimatedPercent } from '@/components/common/AnimatedNumber';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { FinancialTransactionCategoryExpenseResponse } from '@/schemas/financial';

interface CategoryBreakdownCardV2Props {
  expensesByCategory: FinancialTransactionCategoryExpenseResponse[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onAddCategory?: () => void;
}

const FALLBACK_PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

/**
 * CategoryBreakdownCardV2 — Gastos por Categoria V2.
 * Visualização de distribuição de despesas com micro-interações,
 * insight de maior centro de custo e filtro de 1 clique na lista principal.
 */
export function CategoryBreakdownCardV2({
  expensesByCategory,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
}: CategoryBreakdownCardV2Props) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Ordena de forma decrescente pelo amount para que topCategory seja a maior despesa
  const sortedExpenses = [...expensesByCategory].sort(
    (a, b) => (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0)
  );

  const totalExpenseSum = sortedExpenses.reduce(
    (sum, r) => sum + (Number(r.totalAmount) || 0),
    0
  );
  const max = Math.max(...sortedExpenses.map((r) => Number(r.totalAmount) || 0), 1);

  // A API já agrupa pela categoria principal e manda id, ícone e cor.
  const rows = sortedExpenses.map((r, i) => {
    const amount = Number(r.totalAmount);
    const percentage = totalExpenseSum > 0 ? Math.round((amount / totalExpenseSum) * 100) : 0;
    return {
      categoryId: r.categoryId || null,
      label: `${r.categoryIcon} ${r.categoryName}`.trim(),
      amount,
      ratio: amount / max,
      percentage,
      color: r.categoryColor || FALLBACK_PALETTE[i % FALLBACK_PALETTE.length],
    };
  });

  const topCategory = rows.length > 0 ? rows[0] : null;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-all sm:p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/15 text-secondary-foreground">
            <TrendingUp size={20} strokeWidth={2.2} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold leading-tight text-foreground">
              Gastos por Categoria
            </h3>
            <p className="font-ui text-xs text-muted-foreground">Clique para filtrar lançamentos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCategoryId && (
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="font-ui flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <Filter size={11} /> Limpar
            </button>
          )}
          {onAddCategory && (
            <button
              type="button"
              onClick={onAddCategory}
              className="font-ui flex items-center gap-1 rounded-full border border-border/80 bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:bg-muted"
              title="Nova Categoria"
            >
              <Plus size={13} /> Categoria
            </button>
          )}
        </div>
      </div>

      {/* Insight de Maior Centro de Custo */}
      {topCategory && topCategory.percentage > 0 && (
        <div className="font-ui flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-2.5 text-xs text-muted-foreground">
          <Lightbulb size={14} className="shrink-0 text-amber-500" />
          <span>
            Maior gasto:{' '}
            <strong className="font-bold text-foreground">{topCategory.label}</strong> (
            {topCategory.percentage}% do total do mês)
          </span>
        </div>
      )}

      {/* Lista de Categorias */}
      {rows.length === 0 ? (
        <p className="font-ui py-4 text-center text-xs text-muted-foreground">
          Nenhuma despesa categorizada registrada neste mês.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => {
            const isSelected = selectedCategoryId !== null && row.categoryId === selectedCategoryId;
            return (
              <button
                key={row.categoryId ?? row.label}
                type="button"
                onClick={() => {
                  if (!row.categoryId) return;
                  onSelectCategory(isSelected ? null : row.categoryId);
                }}
                className={`group flex flex-col gap-2 rounded-2xl p-3 text-left outline-none transition-all ${
                  isSelected
                    ? 'border border-primary/40 bg-primary/10 shadow-xs ring-2 ring-primary/30'
                    : 'border border-border/40 bg-muted/20 hover:border-border/80 hover:bg-muted/50 focus-visible:bg-muted/60'
                }`}
              >
                <div className="font-ui flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 truncate font-semibold text-foreground">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: row.color }}
                    />
                    {isSelected && <Check size={13} className="shrink-0 text-primary" />}
                    <span className="truncate">{row.label}</span>
                    <span className="shrink-0 rounded-full bg-muted/80 px-1.5 py-0.2 text-[10px] font-normal text-muted-foreground">
                      <AnimatedPercent value={row.percentage} />
                    </span>
                  </span>
                  <span className="shrink-0 pl-2 font-bold text-foreground">
                    <AnimatedCurrency value={row.amount} />
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted/80">
                  <motion.div
                    className="h-full rounded-full"
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    animate={{ width: `${Math.max(row.ratio * 100, 4)}%` }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.2 }
                        : { type: 'spring', stiffness: 140, damping: 22, mass: 0.8 }
                    }
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

