import { cn } from '@/lib/utils';

import { AnimatedCurrency, AnimatedPercent } from './AnimatedNumber';

interface FinanceCardV2Props {
  current: number;
  previous: number;
  deltaPercent: number;
  isIncrease: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * FinanceCardV2 — Card de Finanças do dashboard-v2.
 * Layout horizontal: ícone + categoria à esquerda, valor + variação à direita.
 */
export function FinanceCardV2({
  current,
  previous,
  deltaPercent,
  isIncrease,
  isLoading = false,
  onClick,
  className,
}: FinanceCardV2Props) {
  const hasComparison = previous > 0;
  const trendColor = isIncrease ? '#e0a189' : '#9fc0a7';

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={cn(
        'relative flex h-full items-center justify-between gap-4 overflow-hidden rounded-3xl border border-border p-5 outline-none transition-all duration-300',
        onClick &&
          'cursor-pointer hover:-translate-y-1 hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]',
        className
      )}
      style={{ backgroundImage: 'linear-gradient(160deg, var(--card) 0%, color-mix(in srgb, var(--primary) 6%, var(--card)) 100%)' }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 p-0.5 shadow-2xs dark:bg-stone-900/90">
          <img
            src="/icons/clay-optimized/financial_wallet.webp"
            alt="Finanças"
            className="size-full object-contain"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <span
            className="font-ui block font-bold uppercase tracking-[1px]"
            style={{ fontSize: '10px', color: 'var(--primary)' }}
          >
            Finanças
          </span>
          <p className="font-ui truncate text-muted-foreground" style={{ fontSize: '11px' }}>
            Gasto este mês
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded-md bg-muted/60" />
        ) : (
          <div className="font-ui text-2xl font-extrabold tracking-tight text-foreground">
            <AnimatedCurrency value={current} />
          </div>
        )}

        {isLoading ? (
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted/50" />
        ) : hasComparison ? (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ color: trendColor, backgroundColor: `${trendColor}24` }}
          >
            <span>{isIncrease ? '↑' : '↓'}</span>
            <AnimatedPercent value={deltaPercent} showSign={false} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default FinanceCardV2;
