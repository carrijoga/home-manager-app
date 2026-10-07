import { cn } from '@/lib/utils';

import { AnimatedCurrency, AnimatedNumber } from './AnimatedNumber';

interface ShoppingCardV2Props {
  pendingItems: number;
  estimatedValue: number;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * ShoppingCardV2 — Card de Compras do dashboard-v2.
 * Layout horizontal (sem mini-lista — a API do dashboard só retorna o total).
 */
export function ShoppingCardV2({
  pendingItems,
  estimatedValue,
  isLoading = false,
  onClick,
  className,
}: ShoppingCardV2Props) {
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
      style={{ backgroundImage: 'linear-gradient(160deg, var(--card) 0%, color-mix(in srgb, var(--chart-2) 6%, var(--card)) 100%)' }}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/95 p-0.5 shadow-2xs dark:bg-stone-900/90">
          <img
            src="/icons/clay-optimized/shopping_basket.webp"
            alt="Compras"
            className="size-full object-contain"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <span
            className="font-ui font-bold uppercase tracking-[1px]"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--chart-2)' }}
          >
            Compras
          </span>
          <p className="font-ui truncate text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
            Itens para comprar
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        {isLoading ? (
          <div className="h-8 w-10 animate-pulse rounded-md bg-muted/60" />
        ) : (
          <span className="font-ui text-2xl font-extrabold tracking-tight text-foreground">
            <AnimatedNumber value={pendingItems} />
          </span>
        )}

        {isLoading ? (
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted/50" />
        ) : (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ color: 'var(--chart-2)', backgroundColor: 'color-mix(in srgb, var(--chart-2) 14%, transparent)' }}
          >
            <AnimatedCurrency value={estimatedValue} />
          </span>
        )}
      </div>
    </div>
  );
}

export default ShoppingCardV2;
