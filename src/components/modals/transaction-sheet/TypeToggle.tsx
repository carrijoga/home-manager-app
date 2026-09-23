// src/components/modals/transaction-sheet/TypeToggle.tsx
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { TransactionType } from '@/schemas/enums';

interface TypeToggleProps {
  value: number;
  onChange: (type: number) => void;
}

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  const reduced = usePrefersReducedMotion();
  const isExpense = value === TransactionType.Expense;

  return (
    <div
      className="font-ui grid grid-cols-2 gap-1.5 rounded-2xl border border-border/50 bg-muted/60 p-1.5"
      role="radiogroup"
      aria-label="Tipo de transação"
      onKeyDown={(e) => {
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          onChange(isExpense ? TransactionType.Income : TransactionType.Expense);
        }
      }}
    >
      {[
        {
          v: TransactionType.Expense,
          label: 'Despesa',
          icon: ArrowDownRight,
          color: 'var(--destructive)',
          bg: 'bg-destructive',
        },
        {
          v: TransactionType.Income,
          label: 'Receita',
          icon: ArrowUpRight,
          color: 'var(--chart-2)',
          bg: 'bg-chart-2',
        },
      ].map((opt) => {
        const active = value === opt.v;
        const Icon = opt.icon;
        return (
          <motion.button
            key={opt.v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.v)}
            animate={
              active
                ? { backgroundColor: opt.color, color: '#ffffff' }
                : { backgroundColor: 'transparent', color: 'var(--muted-foreground)' }
            }
            transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            className={`shadow-2xs flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
              active ? 'shadow-xs font-extrabold' : 'hover:text-foreground'
            }`}
          >
            <Icon size={15} strokeWidth={2.5} />
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}
