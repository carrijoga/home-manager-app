import { ChevronLeft, ChevronRight } from 'lucide-react';

import { getMonthLabel } from '@/utils/financialUtils';

interface MonthNavigatorProps {
  month: Date;
  onChange: (month: Date) => void;
}

/** Navegador de período ‹ Junho 2026 › — controla o filtro de mês da tela. */
export function MonthNavigator({ month, onChange }: MonthNavigatorProps) {
  const shift = (delta: number) =>
    onChange(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Mês anterior"
        onClick={() => shift(-1)}
        className="duration-[length:var(--dur-base)] rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
      </button>
      <h2 className="font-editorial min-w-[170px] text-center text-xl font-bold text-foreground">
        {getMonthLabel(month)}
      </h2>
      <button
        type="button"
        aria-label="Próximo mês"
        onClick={() => shift(1)}
        className="duration-[length:var(--dur-base)] rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}
