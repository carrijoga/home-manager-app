import { cn } from '@/lib/utils';

import { AnimatedNumber } from './AnimatedNumber';

interface AgendaCardV2Props {
  eventCount: number;
  nextEventTimeLabel?: string | null;
  nextEventTitle?: string | null;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

const WEEKDAY_LABEL = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

/**
 * AgendaCardV2 — Card de Agenda do dashboard-v2.
 * "Folhinha" de calendário com o dia real de hoje + próximo evento.
 */
export function AgendaCardV2({
  eventCount,
  nextEventTimeLabel,
  nextEventTitle,
  isLoading = false,
  onClick,
  className,
}: AgendaCardV2Props) {
  const today = new Date();
  const dayNumber = today.getDate();
  const weekdayLabel = WEEKDAY_LABEL.format(today).replace('.', '').toUpperCase();

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={cn(
        'relative flex h-full items-stretch gap-3.5 overflow-hidden rounded-3xl border border-border bg-card p-5 outline-none transition-all duration-300',
        onClick &&
          'cursor-pointer hover:-translate-y-1 hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]',
        className
      )}
      style={{ backgroundImage: 'linear-gradient(160deg, var(--card) 0%, color-mix(in srgb, var(--accent) 8%, var(--card)) 100%)' }}
    >
      <div className="flex w-12 shrink-0 flex-col self-center overflow-hidden rounded-xl shadow-md">
        <div
          className="py-1 text-center text-[9px] font-extrabold tracking-wide"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
        >
          {weekdayLabel}
        </div>
        <div className="flex items-center justify-center bg-white py-2 text-xl font-extrabold text-stone-900">
          {dayNumber}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-center justify-between">
          <span
            className="font-ui font-bold uppercase tracking-[1px]"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-foreground)' }}
          >
            Agenda
          </span>
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 p-0.5 shadow-2xs dark:bg-stone-900/90">
            <img
              src="/icons/clay-optimized/calendar_desk.webp"
              alt=""
              className="size-full object-contain"
              loading="lazy"
            />
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="h-6 w-10 animate-pulse rounded-md bg-muted/60" />
          ) : (
            <span className="font-ui text-2xl font-extrabold tracking-tight text-foreground">
              <AnimatedNumber value={eventCount} />
            </span>
          )}
          <span className="font-ui text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
            {' '}
            eventos esta semana
          </span>
        </div>

        {nextEventTitle && (
          <div className="flex flex-col gap-0.5">
            {nextEventTimeLabel && (
              <span className="font-ui text-xs font-bold" style={{ color: 'var(--accent-foreground)' }}>
                {nextEventTimeLabel}
              </span>
            )}
            <span className="truncate font-ui text-xs text-muted-foreground">{nextEventTitle}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgendaCardV2;
