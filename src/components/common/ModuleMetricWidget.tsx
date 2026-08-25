import { motion } from 'framer-motion';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface FooterItem {
  label: string;
  value: string;
  valueColor?: string;
}

interface ModuleMetricWidgetProps {
  icon: ReactNode;
  iconColor: string;
  category: string;
  label: string;
  value: string;
  /** Up to 2 footer stat pairs */
  footer?: [FooterItem, FooterItem?];
  /** Progress bar fill 0–1 */
  progress?: number;
  progressColor?: string;
  progressLabel?: string;
  progressLabelColor?: string;
  extra?: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * ModuleMetricWidget — Card de métrica de módulo.
 *
 * Design System "Domestic Sanctuary":
 * - bg-card (surface-container-low) sobre bg-background (surface)
 * - border-border ghost border — sem linhas divisórias internas
 * - font-ui para labels e valores
 * - rounded-3xl (xl rounding)
 * - Tonal depth via background shift, nunca boxShadow pesado
 */
export function ModuleMetricWidget({
  icon,
  iconColor,
  category,
  label,
  value,
  footer,
  progress,
  progressColor = 'var(--chart-2)',
  progressLabel,
  progressLabelColor,
  extra,
  className,
  onClick,
}: ModuleMetricWidgetProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={cn(
        'flex h-full flex-col justify-between gap-6 rounded-3xl border border-border bg-card p-6 outline-none',
        onClick &&
          'duration-[length:var(--dur-base)] cursor-pointer transition-all hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]',
        className
      )}
    >
      {/* Icon + category label */}
      <div className="flex w-full items-center justify-between">
        <div style={{ color: iconColor }}>{icon}</div>
        <span
          className="font-ui font-semibold uppercase tracking-[1px] text-muted-foreground/80"
          style={{ fontSize: 'var(--text-xs)' }}
        >
          {category}
        </span>
      </div>

      {/* Main value */}
      <div className="flex w-full flex-col gap-0.5">
        <p className="font-ui text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
          {label}
        </p>
        <p className="font-ui truncate text-2xl font-semibold leading-tight text-foreground">
          {value}
        </p>
      </div>

      {/* Footer stats */}
      {footer && (
        <div className="flex w-full items-end justify-between">
          {footer.map((item, i) =>
            item ? (
              <div key={i} className="flex min-w-0 flex-col gap-1">
                <span
                  className="font-ui truncate uppercase text-muted-foreground/80"
                  style={{ fontSize: 'var(--text-xs)', textAlign: i === 1 ? 'right' : 'left' }}
                >
                  {item.label}
                </span>
                <span
                  className="font-ui truncate text-sm font-semibold"
                  style={{
                    color: item.valueColor ?? 'var(--foreground)',
                    textAlign: i === 1 ? 'right' : 'left',
                  }}
                >
                  {item.value}
                </span>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="flex w-full items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
              style={{ background: progressColor }}
            />
          </div>
          {progressLabel && (
            <span
              className="font-ui shrink-0 font-semibold"
              style={{
                fontSize: 'var(--text-xs)',
                color: progressLabelColor ?? progressColor,
              }}
            >
              {progressLabel}
            </span>
          )}
        </div>
      )}

      {extra}
    </div>
  );
}

export default ModuleMetricWidget;
