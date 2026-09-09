import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';

export interface UpcomingEventV2 {
  id: string;
  title: string;
  dateLabel: string;
  location?: string;
  isNext?: boolean;
}

interface DashboardUpcomingEventsV2Props {
  events?: UpcomingEventV2[];
  className?: string;
}

export function DashboardUpcomingEventsV2({
  events = [],
  className,
}: DashboardUpcomingEventsV2Props) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'flex h-full flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs',
        className
      )}
    >
      <div>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-2.5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-chart-5/15 text-chart-5">
              <Calendar size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-foreground">
                Próximos Eventos
              </h3>
              <p className="font-ui text-xs text-muted-foreground">
                Compromissos agendados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="font-ui inline-flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:underline"
          >
            <span>Ver agenda</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Lista de Eventos / Linha do Tempo */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-chart-5/10 text-chart-5 mb-2">
              <Calendar size={20} />
            </div>
            <p className="font-ui text-sm font-semibold text-foreground">
              Nenhum evento próximo
            </p>
            <p className="font-ui text-xs text-muted-foreground mt-0.5">
              Sua agenda está livre pelos próximos dias.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {events.map((event, idx) => {
              const [dayPart, timePart] = event.dateLabel.includes('•')
                ? event.dateLabel.split('•').map((s) => s.trim())
                : [event.dateLabel, ''];

              return (
                <motion.div
                  key={event.id || idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'group relative flex items-start gap-3 rounded-2xl border p-3 transition-all hover:bg-muted/40',
                    event.isNext
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border/60 bg-card'
                  )}
                >
                  {/* Date chip */}
                  <div
                    className={cn(
                      'flex size-10 shrink-0 flex-col items-center justify-center rounded-xl font-bold leading-none',
                      event.isNext
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-tight">
                      {dayPart.slice(0, 3)}
                    </span>
                    <span className="text-xs font-extrabold mt-0.5">
                      {event.isNext ? '★' : idx + 1}
                    </span>
                  </div>

                  {/* Informações do evento */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-ui text-xs font-bold text-foreground truncate">
                        {event.title}
                      </span>
                      {event.isNext && (
                        <span className="rounded-md bg-primary/20 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-primary">
                          A Seguir
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={11} className="text-primary" />
                        <span>{timePart || dayPart}</span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-1 truncate max-w-[160px]">
                          <MapPin size={11} className="text-secondary shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="mt-4 pt-3 border-t border-dashed border-border/70 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{events.length} compromissos no radar</span>
        <button
          type="button"
          onClick={() => navigate('/calendar')}
          className="font-medium text-primary hover:underline"
        >
          + Adicionar evento
        </button>
      </div>
    </div>
  );
}
