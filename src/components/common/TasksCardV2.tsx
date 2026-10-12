import { cn } from '@/lib/utils';

import { AnimatedNumber } from './AnimatedNumber';

interface TasksCardV2Props {
  pending: number;
  completed: number;
  completionRate: number;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * TasksCardV2 — Card de Tarefas do dashboard-v2.
 * Layout horizontal: ícone clay + categoria à esquerda, donut + valor no centro, footer à direita.
 */
export function TasksCardV2({
  pending,
  completed,
  completionRate,
  isLoading = false,
  onClick,
  className,
}: TasksCardV2Props) {
  const clampedRate = Math.min(100, Math.max(0, completionRate));
  const dashOffset = CIRCUMFERENCE * (1 - clampedRate / 100);

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
      style={{ backgroundImage: 'linear-gradient(160deg, var(--card) 0%, color-mix(in srgb, var(--chart-5) 6%, var(--card)) 100%)' }}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/95 p-0.5 shadow-2xs dark:bg-stone-900/90">
          <img
            src="/icons/clay-optimized/tasks_clipboard.webp"
            alt="Tarefas"
            className="size-full object-contain"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <span
            className="font-ui font-bold uppercase tracking-[1px]"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--chart-5)' }}
          >
            Tarefas
          </span>
          <p className="font-ui truncate text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
            Pendentes hoje
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <svg viewBox="0 0 64 64" width="52" height="52" className="shrink-0">
          <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="var(--muted)" strokeWidth="7" />
          {!isLoading && (
            <circle
              cx="32"
              cy="32"
              r={RADIUS}
              fill="none"
              stroke="var(--chart-5)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 32 32)"
            />
          )}
          <text x="32" y="36" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--foreground)">
            {isLoading ? '--' : `${Math.round(clampedRate)}%`}
          </text>
        </svg>

        {isLoading ? (
          <div className="h-8 w-10 animate-pulse rounded-md bg-muted/60" />
        ) : (
          <span className="font-ui text-2xl font-extrabold leading-none tracking-tight text-foreground">
            <AnimatedNumber value={pending} />
          </span>
        )}

        {isLoading ? (
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted/50" />
        ) : (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ color: 'var(--chart-5)', backgroundColor: 'color-mix(in srgb, var(--chart-5) 14%, transparent)' }}
          >
            <AnimatedNumber value={completed} />
            <span>ok</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default TasksCardV2;
