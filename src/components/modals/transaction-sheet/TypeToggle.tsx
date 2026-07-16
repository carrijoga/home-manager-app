// src/components/modals/transaction-sheet/TypeToggle.tsx
import { motion } from 'framer-motion';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { TransactionType } from '@/schemas/enums';

interface TypeToggleProps {
  value: number;
  onChange: (type: number) => void;
}

const EXPENSE_COLOR = '#e07070';
const INCOME_COLOR = '#6ab085';

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  const reduced = usePrefersReducedMotion();
  const isExpense = value === TransactionType.Expense;

  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-xl bg-muted/40 p-1"
      role="radiogroup"
      aria-label="Tipo de transação"
      onKeyDown={e => {
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          onChange(isExpense ? TransactionType.Income : TransactionType.Expense);
        }
      }}
    >
      {[
        { v: TransactionType.Expense, label: '💸 Despesa', color: EXPENSE_COLOR },
        { v: TransactionType.Income, label: '📈 Receita', color: INCOME_COLOR },
      ].map(opt => {
        const active = value === opt.v;
        return (
          <motion.button
            key={opt.v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.v)}
            animate={active ? { backgroundColor: opt.color, color: '#ffffff' } : { backgroundColor: 'transparent', color: '#6b7280' }}
            transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            className="rounded-lg py-2.5 text-sm font-semibold"
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}
