import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';
import {
  AnimatedCurrency,
  AnimatedNumber,
  AnimatedPercent,
} from '@/components/common/AnimatedNumber';

interface DashboardHeroKpisV2Props {
  financial: {
    totalMonthSpent: number;
    totalLastMonthSpent: number;
    monthVariation: number;
  };
  tasks: {
    totalDayTasks: number;
    totalDayFinishedTasks: number;
    rateTasks: number;
  };
  shopping: {
    totalMonthItems: number;
    totalMonthEstimatedValue: number;
  };
  events: {
    totalWeekEvents: number;
    nextEventDate: string | null;
    nextEventName: string;
  };
  className?: string;
  isLoading?: boolean;
}

const cardSlide = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
  },
};

export function DashboardHeroKpisV2({
  financial,
  tasks,
  shopping,
  events,
  className,
  isLoading = false,
}: DashboardHeroKpisV2Props) {
  const navigate = useNavigate();

  const pendingTasks = Math.max(0, tasks.totalDayTasks - tasks.totalDayFinishedTasks);
  const isVariationPositive = financial.monthVariation > 0;

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 md:gap-4.5',
        className
      )}
    >
      {/* ── CARD 1: FINANÇAS & DESPESAS ── */}
      <motion.div
        variants={cardSlide}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        onClick={() => navigate('/financial-v2')}
        className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-card transition-all duration-200 hover:border-border/90 hover:shadow-card-hover active:scale-[0.98]"
      >
        <div className="flex flex-col gap-3">
          {/* Header do Card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-105">
                <DollarSign size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Finanças
                </span>
                <h4 className="font-editorial text-sm font-bold text-foreground">Gasto do Mês</h4>
              </div>
            </div>

            <div className="flex size-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Valor Principal */}
          <div className="flex flex-col gap-1">
            {isLoading ? (
              <div className="my-1 h-8 w-32 animate-pulse rounded-md bg-muted/60" />
            ) : (
              <AnimatedCurrency
                value={financial.totalMonthSpent}
                className="font-ui text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl tabular-nums"
              />
            )}

            {/* Badge de variação vs mês anterior */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {isLoading ? (
                <div className="h-4 w-28 animate-pulse rounded bg-muted/50" />
              ) : (
                <>
                  <span
                    className={cn(
                      'font-ui inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
                      isVariationPositive
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-chart-2/10 text-chart-2'
                    )}
                  >
                    {isVariationPositive ? (
                      <TrendingUp size={12} strokeWidth={2.5} />
                    ) : (
                      <TrendingDown size={12} strokeWidth={2.5} />
                    )}
                    <span>
                      <AnimatedPercent
                        value={financial.monthVariation}
                        showSign
                      />
                    </span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">vs. mês ant.</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé informativo */}
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-border/70 pt-3 text-[11px] text-muted-foreground">
          {isLoading ? (
            <div className="h-3 w-36 animate-pulse rounded bg-muted/50" />
          ) : (
            <>
              <span>Anterior: <AnimatedCurrency value={financial.totalLastMonthSpent} /></span>
              <span className="font-medium text-primary group-hover:underline">Ver Lançamentos →</span>
            </>
          )}
        </div>
      </motion.div>

      {/* ── CARD 2: TAREFAS DE HOJE ── */}
      <motion.div
        variants={cardSlide}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        onClick={() => navigate('/tasks')}
        className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-card transition-all duration-200 hover:border-border/90 hover:shadow-card-hover active:scale-[0.98]"
      >
        <div className="flex flex-col gap-3">
          {/* Header do Card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-chart-2/15 text-chart-2 transition-transform group-hover:scale-105">
                <CheckCircle2 size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Tarefas
                </span>
                <h4 className="font-editorial text-sm font-bold text-foreground">Rotina Diária</h4>
              </div>
            </div>

            <div className="flex size-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-all group-hover:bg-chart-2 group-hover:text-white">
              <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Valor Principal */}
          <div className="flex flex-col gap-1">
            {isLoading ? (
              <div className="my-1 h-8 w-24 animate-pulse rounded-md bg-muted/60" />
            ) : (
              <div className="flex items-baseline gap-2">
                <AnimatedNumber
                  value={pendingTasks}
                  className="font-ui text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl tabular-nums"
                />
                <span className="font-ui text-sm font-semibold text-muted-foreground">
                  {pendingTasks === 1 ? 'pendente' : 'pendentes'}
                </span>
              </div>
            )}

            {/* Barra de Progresso */}
            <div className="flex flex-col gap-1 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Ritmo de conclusão</span>
                <span className="font-bold text-chart-2 tabular-nums">
                  {isLoading ? '--' : <AnimatedPercent value={tasks.rateTasks} />}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-2 transition-all duration-500"
                  style={{ width: isLoading ? '0%' : `${tasks.rateTasks}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé informativo */}
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-border/70 pt-3 text-[11px] text-muted-foreground">
          {isLoading ? (
            <div className="h-3 w-32 animate-pulse rounded bg-muted/50" />
          ) : (
            <>
              <span><AnimatedNumber value={tasks.totalDayFinishedTasks} /> concluídas hoje</span>
              <span className="font-medium text-chart-2 group-hover:underline">Abrir Quadro →</span>
            </>
          )}
        </div>
      </motion.div>

      {/* ── CARD 3: LISTA DE COMPRAS ── */}
      <motion.div
        variants={cardSlide}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        onClick={() => navigate('/shopping')}
        className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-card transition-all duration-200 hover:border-border/90 hover:shadow-card-hover active:scale-[0.98]"
      >
        <div className="flex flex-col gap-3">
          {/* Header do Card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary transition-transform group-hover:scale-105">
                <ShoppingCart size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Despensa
                </span>
                <h4 className="font-editorial text-sm font-bold text-foreground">Lista de Compras</h4>
              </div>
            </div>

            <div className="flex size-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-all group-hover:bg-secondary group-hover:text-black">
              <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Valor Principal */}
          <div className="flex flex-col gap-1">
            {isLoading ? (
              <div className="my-1 h-8 w-24 animate-pulse rounded-md bg-muted/60" />
            ) : (
              <div className="flex items-baseline gap-2">
                <AnimatedNumber
                  value={shopping.totalMonthItems}
                  className="font-ui text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl tabular-nums"
                />
                <span className="font-ui text-sm font-semibold text-muted-foreground">
                  {shopping.totalMonthItems === 1 ? 'item para comprar' : 'itens para comprar'}
                </span>
              </div>
            )}

            {/* Custo estimado */}
            <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-muted-foreground">
              {isLoading ? (
                <div className="h-3 w-28 animate-pulse rounded bg-muted/50" />
              ) : (
                <>
                  <span>Custo estimado:</span>
                  <span className="font-bold text-foreground tabular-nums">
                    <AnimatedCurrency value={shopping.totalMonthEstimatedValue} />
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé informativo */}
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-border/70 pt-3 text-[11px] text-muted-foreground">
          {isLoading ? (
            <div className="h-3 w-28 animate-pulse rounded bg-muted/50" />
          ) : (
            <>
              <span>{shopping.totalMonthItems > 0 ? 'Itens a repor' : 'Despensa abastecida'}</span>
              <span className="font-medium text-secondary group-hover:underline">Ver Lista →</span>
            </>
          )}
        </div>
      </motion.div>

      {/* ── CARD 4: AGENDA & COMPROMISSOS ── */}
      <motion.div
        variants={cardSlide}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        onClick={() => navigate('/calendar')}
        className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-card transition-all duration-200 hover:border-border/90 hover:shadow-card-hover active:scale-[0.98]"
      >
        <div className="flex flex-col gap-3">
          {/* Header do Card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-chart-5/15 text-chart-5 transition-transform group-hover:scale-105">
                <Calendar size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Agenda
                </span>
                <h4 className="font-editorial text-sm font-bold text-foreground">Compromissos</h4>
              </div>
            </div>

            <div className="flex size-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-all group-hover:bg-chart-5 group-hover:text-white">
              <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Valor Principal */}
          <div className="flex flex-col gap-1">
            {isLoading ? (
              <div className="my-1 h-8 w-24 animate-pulse rounded-md bg-muted/60" />
            ) : (
              <div className="flex items-baseline gap-2">
                <AnimatedNumber
                  value={events.totalWeekEvents}
                  className="font-ui text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl tabular-nums"
                />
                <span className="font-ui text-sm font-semibold text-muted-foreground">
                  {events.totalWeekEvents === 1 ? 'evento na semana' : 'eventos na semana'}
                </span>
              </div>
            )}

            {/* Próximo evento */}
            <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-muted-foreground truncate">
              {isLoading ? (
                <div className="h-3 w-32 animate-pulse rounded bg-muted/50" />
              ) : events.nextEventName ? (
                <>
                  <Clock size={11} className="shrink-0 text-primary" />
                  <span className="truncate font-medium text-foreground">
                    {events.nextEventName}
                  </span>
                </>
              ) : (
                <span>Nenhum evento urgente hoje</span>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé informativo */}
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-border/70 pt-3 text-[11px] text-muted-foreground">
          {isLoading ? (
            <div className="h-3 w-28 animate-pulse rounded bg-muted/50" />
          ) : (
            <>
              <span>Organização semanal</span>
              <span className="font-medium text-chart-5 group-hover:underline">Abrir Agenda →</span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
