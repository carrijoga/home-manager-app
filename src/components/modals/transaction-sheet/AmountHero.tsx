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

export function AmountHero({
  type,
  amount,
  onAmountChange,
  description,
  onDescriptionChange,
}: AmountHeroProps) {
  const reduced = usePrefersReducedMotion();
  const isExpense = type === TransactionType.Expense;
  const color = isExpense ? 'var(--destructive)' : 'var(--chart-2)';
  const label = isExpense ? 'Valor da despesa' : 'Valor da receita';
  const placeholder = isExpense ? 'Ex.: Supermercado, Aluguel...' : 'Ex.: Salário, Freelance...';

  return (
    <div className="font-ui border-b border-border/50 px-1 py-3 text-center">
      <motion.p
        animate={{ color }}
        transition={reduced ? { duration: 0 } : { duration: 0.2 }}
        className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </motion.p>

      <motion.div
        animate={{ color }}
        transition={reduced ? { duration: 0 } : { duration: 0.2 }}
        className="mb-4 text-4xl font-extrabold tracking-tighter sm:text-5xl [&_input]:h-auto [&_input]:border-none [&_input]:bg-transparent [&_input]:p-0 [&_input]:text-center [&_input]:text-4xl [&_input]:font-extrabold [&_input]:tracking-tighter [&_input]:shadow-none [&_input]:focus-visible:ring-0 [&_input]:sm:text-5xl"
        style={{ color }}
      >
        <MoneyInput id="tx-amount" value={amount} onChange={onAmountChange} placeholder="R$ 0,00" />
      </motion.div>

      <div className="space-y-1 text-left">
        <Label htmlFor="tx-description" className="text-xs font-semibold text-foreground">
          Descrição
        </Label>
        <Input
          id="tx-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-xl border-border/70 bg-muted/40 text-xs focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>
    </div>
  );
}
