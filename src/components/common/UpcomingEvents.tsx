import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";

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
    <div className={cn(
      "flex flex-col gap-6 p-6 rounded-3xl h-full bg-card border border-border outline-none", 
      className
      )}
    >
      {/* Section title */}
      <div className="flex items-center gap-3 shrink-0">
        <Calendar size={20} className="text-foreground shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="font-editorial font-bold text-foreground text-xl whitespace-nowrap">
          Próximos Eventos
        </h3>
      </div>

      {/* Event list */}
      <div className="flex flex-col gap-6 flex-1 pb-2">
        {events.length === 0 ? (
          <p className="font-ui text-sm text-muted-foreground/50 leading-relaxed">
            Nenhum compromisso esta semana.
          </p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="relative pl-6">
              {/* Colored vertical accent — tonal, no border lines */}
              <div
                className={cn(
                  "absolute left-0 top-1 bottom-1 w-0.5 rounded-full",
                  event.isNext ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span
                  className={cn(
                    "font-ui font-semibold uppercase tracking-[0.6px]",
                    event.isNext ? "text-primary" : "text-muted-foreground/80"
                  )}
                  style={{ fontSize: "var(--text-xs)" }}
                >
                  {event.dateLabel}
                </span>
                <span className="font-ui font-semibold text-foreground text-sm truncate">
                  {event.title}
                </span>
                {event.location && (
                  <span className="font-ui text-muted-foreground truncate" style={{ fontSize: "var(--text-xs)" }}>
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
        onClick={() => navigate("/calendar")}
        className="w-full min-h-[44px] px-4 rounded-2xl font-ui font-semibold uppercase tracking-[1.2px] bg-transparent transition-opacity hover:opacity-70 active:scale-[0.98] shrink-0 flex items-center justify-center"
        style={{ border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: "var(--text-xs)" }}
      >
        Abrir Agenda
      </button>
    </div>
  );
}

export default UpcomingEvents;
