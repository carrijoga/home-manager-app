import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';

export interface CalendarEvent {
  id: string;
  /** Ex: "Amanhã • 10:00" */
  dateLabel: string;
  title: string;
  location?: string;
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
        <Calendar
          size={20}
          className="shrink-0 text-foreground"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <h3 className="font-editorial whitespace-nowrap text-xl font-bold text-foreground">
          Próximos Eventos
        </h3>
      </div>

      {/* Event list */}
      <div className="flex flex-1 flex-col gap-6 pb-2">
        {events.length === 0 ? (
          <p className="font-ui text-sm leading-relaxed text-muted-foreground/50">
            Nenhum compromisso esta semana.
          </p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="relative pl-6">
              {/* Colored vertical accent — tonal, no border lines */}
              <div
                className={cn(
                  'absolute bottom-1 left-0 top-1 w-0.5 rounded-full',
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
        className="font-ui flex min-h-[44px] w-full shrink-0 items-center justify-center rounded-2xl bg-transparent px-4 font-semibold uppercase tracking-[1.2px] transition-opacity hover:opacity-70 active:scale-[0.98]"
        style={{
          border: '1px solid var(--border)',
          color: 'var(--muted-foreground)',
          fontSize: 'var(--text-xs)',
        }}
      >
        Abrir Agenda
      </button>
    </div>
  );
}

export default UpcomingEvents;
