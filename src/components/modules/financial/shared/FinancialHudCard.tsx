import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface HudSegment {
  percentage: number;
  color: string;
  label?: string;
}

interface FinancialHudCardProps {
  primaryLabel: string;
  primaryValue: string;
  primarySubtitle?: string;
  primaryColorClass?: string;

  secondaryLabel: string;
  secondaryValue: string;
  secondarySubtitle?: string;
  secondaryTag?: string;
  secondaryColorClass?: string;

  // Barra de progresso única (ex: cartões) ou multi-segmento (ex: contas)
  progressPct?: number;
  progressBarGradient?: string;
  segments?: HudSegment[];
  barLabelLeft?: string;
  barLabelRight?: string;

  // Micro-insights no rodapé do HUD
  insightLeft?: {
    icon?: ReactNode;
    text: string;
  };
  insightRight?: {
    icon?: ReactNode;
    text: string;
    colorClass?: string;
  };
}

export function FinancialHudCard({
  primaryLabel,
  primaryValue,
  primarySubtitle,
  primaryColorClass = 'text-emerald-600 dark:text-emerald-400',
  secondaryLabel,
  secondaryValue,
  secondarySubtitle,
  secondaryTag,
  secondaryColorClass = 'text-foreground',
  progressPct,
  progressBarGradient = 'from-emerald-500 via-teal-400 to-amber-500',
  segments,
  barLabelLeft,
  barLabelRight,
  insightLeft,
  insightRight,
}: FinancialHudCardProps) {
  return (
    <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-card/70 p-5 sm:p-6 shadow-lg relative overflow-hidden dark:bg-[#1C1B19]">
      {/* Luz ambiente de fundo sutil */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4 mb-3 relative z-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            {primaryLabel}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight tabular-nums ${primaryColorClass}`}>
              {primaryValue}
            </span>
            {primarySubtitle && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {primarySubtitle}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            {secondaryLabel}
          </span>
          <div className={`text-lg sm:text-xl font-bold tabular-nums mt-0.5 ${secondaryColorClass}`}>
            <span>{secondaryValue}</span>{' '}
            {secondarySubtitle && (
              <span className="text-xs font-normal text-muted-foreground">
                {secondarySubtitle}
              </span>
            )}
          </div>
          {secondaryTag && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              {secondaryTag}
            </span>
          )}
        </div>
      </div>

      {/* Barra Tátil */}
      <div className="space-y-1.5 relative z-10">
        {(barLabelLeft || barLabelRight) && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{barLabelLeft}</span>
            <span>{barLabelRight}</span>
          </div>
        )}

        <div className="h-2.5 w-full rounded-full bg-muted/60 p-0.5 border border-border/40 overflow-hidden flex gap-1">
          {segments && segments.length > 0 ? (
            segments.map((seg, idx) => (
              <motion.div
                key={idx}
                className={`h-full rounded-full ${seg.color}`}
                style={{ width: `${Math.max(2, Math.min(100, seg.percentage))}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(2, Math.min(100, seg.percentage))}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                title={seg.label}
              />
            ))
          ) : progressPct != null ? (
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${progressBarGradient}`}
              style={{ width: `${Math.max(0, Math.min(100, progressPct))}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(100, progressPct))}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          ) : null}
        </div>
      </div>

      {/* Rodapé do HUD: Micro-insights */}
      {(insightLeft || insightRight) && (
        <div className="mt-3.5 pt-2.5 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground relative z-10">
          {insightLeft && (
            <div className="flex items-center gap-1.5">
              {insightLeft.icon}
              <span>{insightLeft.text}</span>
            </div>
          )}
          {insightRight && (
            <div className={`flex items-center gap-1 font-semibold ${insightRight.colorClass ?? 'text-foreground'}`}>
              {insightRight.icon}
              <span>{insightRight.text}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
