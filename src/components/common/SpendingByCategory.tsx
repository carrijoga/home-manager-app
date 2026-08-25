import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';

export interface SpendingCategory {
  label: string;
  amount: string;
  /** Fill ratio 0–1 */
  ratio: number;
  color: string;
}

interface SpendingByCategoryProps {
  categories?: SpendingCategory[];
  className?: string;
}

/**
 * SpendingByCategory — Gastos por categoria com barras de progresso.
 *
 * Design System "Domestic Sanctuary":
 * - bg-card (surface-container-low) como container principal
 * - bg-muted (surface-container-high) para o fundo das barras
 * - inner container bg-[var(--surface-container)]/30 (recuado)
 * - Sem bordas divisórias — espaçamento define separação
 * - font-editorial headline, font-ui para os dados
 */
export function SpendingByCategory({ categories = [], className }: SpendingByCategoryProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'flex h-full flex-col gap-6 rounded-3xl border border-border bg-card p-5 outline-none sm:p-8',
        className
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp
            size={18}
            className="shrink-0 text-foreground"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h3 className="font-editorial whitespace-nowrap text-lg font-bold text-foreground">
            Gastos por Categoria
          </h3>
        </div>
        <button
          type="button"
          onClick={() => navigate('/financial')}
          className="font-ui cursor-pointer border-none bg-transparent font-semibold uppercase tracking-[1.2px] text-primary transition-opacity hover:opacity-70"
          style={{ fontSize: 'var(--text-xs)' }}
        >
          Ver Finanças
        </button>
      </div>

      {/* Category rows — flat, no inner container */}
      <div className="flex flex-1 flex-col gap-3">
        {categories.length === 0 ? (
          <p className="font-ui text-sm leading-relaxed text-muted-foreground/50">
            Sem gastos registrados este mês.
          </p>
        ) : (
          categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              className="flex min-w-0 items-center gap-3"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1], delay: i * 0.08 }}
            >
              {/* Color dot indicator */}
              <div
                className="shrink-0 rounded-full"
                style={{ width: 8, height: 8, background: cat.color }}
                aria-hidden="true"
              />

              {/* Category name — truncates on narrow viewports */}
              <span
                className="font-ui truncate font-medium text-foreground"
                style={{
                  fontSize: 'var(--text-sm)',
                  minWidth: 0,
                  flex: '0 1 auto',
                  maxWidth: '35%',
                }}
              >
                {cat.label}
              </span>

              {/* Progress bar — grows to fill remaining space */}
              <div
                className="min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
                style={{ height: 6 }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, cat.ratio * 100))}%` }}
                  transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1], delay: 0.15 + i * 0.08 }}
                  style={{ background: cat.color }}
                />
              </div>

              {/* Amount — right-aligned, shrinks gracefully */}
              <span
                className="font-ui shrink-0 text-right font-semibold text-foreground"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                {cat.amount}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default SpendingByCategory;
