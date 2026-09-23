import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';

export interface CalendarEvent {
  id: string;
  /** Ex: "Amanhã • 10:00" */
  dateLabel: string;
  title: string;
  location?: string | null;
  /** true = destaca com primary (próximo evento) */
  isNext?: boolean;
}

interface UpcomingEventsProps {
  events?: CalendarEvent[];
  className?: string;
}

/**
 * UpcomingEvents — Próximos eventos com barra vertical colorida.
 *
 * Design System "Domestic Sanctuary":
 * - bg-card (surface-container-low)
 * - Barra vertical primary para o evento mais próximo, muted para os demais
 * - font-editorial para título de seção, font-ui para os dados
 * - Botão ghost border sem texto em caps
 */
export function UpcomingEvents({ events = [], className }: UpcomingEventsProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'flex h-full flex-col gap-6 rounded-3xl border border-border bg-card p-6 outline-none',
        className
      )}
    >
      {/* Section title */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 p-0.5 shadow-2xs dark:bg-primary/20">
          <img
            src="/icons/clay-optimized/calendar_desk.webp"
            alt="Próximos Eventos"
            className="size-full object-contain"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))' }}
            loading="lazy"
          />
        </div>
        <h3 className="font-editorial whitespace-nowrap text-xl font-bold text-foreground">
          Próximos Eventos
        </h3>
      </div>

      {/* Event list */}
      <div className="flex flex-1 flex-col gap-4 pb-2">
        {events.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
            <Calendar size={24} className="mb-2 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="font-ui text-sm font-medium text-muted-foreground">
              Nenhum compromisso esta semana.
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="group relative rounded-xl p-2 pl-6 transition-colors hover:bg-muted/40"
            >
              {/* Colored vertical accent — tonal, no border lines */}
              <div
                className={cn(
                  'absolute bottom-2 left-2 top-2 w-1 rounded-full transition-all group-hover:w-1.5',
                  event.isNext ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span
                  className={cn(
                    'font-ui font-semibold uppercase tracking-[0.6px]',
                    event.isNext ? 'text-primary' : 'text-muted-foreground/80'
                  )}
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  {event.dateLabel}
                </span>
                <span className="font-ui truncate text-sm font-semibold text-foreground">
                  {event.title}
                </span>
                {event.location && (
                  <span
                    className="font-ui truncate text-muted-foreground"
                    style={{ fontSize: 'var(--text-xs)' }}
                  >
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ghost border CTA */}
      <button
        type="button"
        onClick={() => navigate('/calendar')}
        className="font-ui flex min-h-[44px] w-full shrink-0 items-center justify-center rounded-2xl border border-border bg-transparent px-4 font-semibold uppercase tracking-[1.2px] text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground active:scale-[0.98]"
        style={{
          fontSize: 'var(--text-xs)',
        }}
      >
        Abrir Agenda
      </button>
    </div>
  );
}

export default UpcomingEvents;
