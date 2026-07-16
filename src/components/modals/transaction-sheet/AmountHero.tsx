// src/components/modals/transaction-sheet/AmountHero.tsx
import { motion } from 'framer-motion';

import MoneyInput from '@/components/common/MoneyInput';
import { Input, Label } from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { TransactionType } from '@/schemas/enums';

interface AmountHeroProps {
  type: number;
  amount: number | null;
  onAmountChange: (v: number | null) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
}

const EXPENSE_COLOR = '#e07070';
const INCOME_COLOR = '#6ab085';

export function AmountHero({ type, amount, onAmountChange, description, onDescriptionChange }: AmountHeroProps) {
  const reduced = usePrefersReducedMotion();
  const isExpense = type === TransactionType.Expense;
  const color = isExpense ? EXPENSE_COLOR : INCOME_COLOR;
  const label = isExpense ? 'Valor da despesa' : 'Valor recebido';
  const placeholder = isExpense ? 'Ex.: Conta de luz' : 'Ex.: Salário de junho';

  return (
    <div className="px-1 py-4 text-center border-b border-border/40">
      <motion.p
        animate={{ color }}
        transition={reduced ? { duration: 0 } : { duration: 0.2 }}
        className="text-[10px] uppercase tracking-widest mb-2 font-semibold"
      >
        {label}
      </motion.p>

      <motion.div
        animate={{ color }}
        transition={reduced ? { duration: 0 } : { duration: 0.2 }}
        className="text-5xl font-extrabold tracking-tighter mb-4 [&_input]:text-center [&_input]:text-5xl [&_input]:font-extrabold [&_input]:tracking-tighter [&_input]:border-none [&_input]:bg-transparent [&_input]:shadow-none [&_input]:p-0 [&_input]:h-auto [&_input]:focus-visible:ring-0"
        style={{ color }}
      >
        <MoneyInput
          id="tx-amount"
          value={amount}
          onChange={onAmountChange}
          placeholder="R$ 0,00"
        />
      </motion.div>

      <div className="text-left">
        <Label htmlFor="tx-description" className="sr-only">Descrição</Label>
        <Input
          id="tx-description"
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          placeholder={placeholder}
          className="bg-muted/30 border-border/40 text-sm"
        />
      </div>
    </div>
  );
}
