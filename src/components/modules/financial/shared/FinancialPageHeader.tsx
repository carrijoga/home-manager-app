import type { ReactNode } from 'react';

interface FinancialPageHeaderProps {
  title: string;
  description: string;
  badgeLabel?: string;
  badgeDotColor?: string;
  actions?: ReactNode;
}

export function FinancialPageHeader({
  title,
  description,
  badgeLabel,
  badgeDotColor = 'bg-emerald-500',
  actions,
}: FinancialPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {badgeLabel && (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className={`h-1.5 w-1.5 rounded-full ${badgeDotColor} animate-pulse`} />
              <span>{badgeLabel}</span>
            </div>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          {description}
        </p>
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
