import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';

export interface DashboardHeroWidgetsV2Props {
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
  onTasksClick?: () => void;
  onShoppingClick?: () => void;
  onCalendarClick?: () => void;
  className?: string;
  isLoading?: boolean;
}

const widgetSlide = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
  },
};

export function DashboardHeroWidgetsV2({
  tasks,
  shopping,
  events,
  onTasksClick,
  onShoppingClick,
  onCalendarClick,
  className,
  isLoading = false,
}: DashboardHeroWidgetsV2Props) {
  const navigate = useNavigate();

  const pendingTasks = Math.max(0, tasks.totalDayTasks - tasks.totalDayFinishedTasks);

  const monthName = useMemo(() => {
    const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date());
    return month.charAt(0).toUpperCase() + month.slice(1);
  }, []);

  const nextEventLabel = useMemo(() => {
    if (!events.nextEventName) {
      return events.totalWeekEvents > 0
        ? `${events.totalWeekEvents} na semana`
        : 'Tudo livre hoje';
    }
    return events.nextEventName;
  }, [events]);

  const nextEventBadge = useMemo(() => {
    if (!events.nextEventDate) return 'Hoje';
    const d = new Date(events.nextEventDate);
    if (Number.isNaN(d.getTime())) return 'Em breve';
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `Hoje ${hours}:${mins}`;
  }, [events.nextEventDate]);

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-4',
        className
      )}
    >
      {/* ── WIDGET 1: TAREFAS DE HOJE ── */}
      <motion.div
        variants={widgetSlide}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (onTasksClick) onTasksClick();
          else navigate('/tasks');
        }}
        role="button"
        tabIndex={0}
        aria-label="Ver tarefas de hoje"
        className="group relative flex cursor-pointer items-center justify-between gap-3.5 rounded-3xl border border-[#d2e2ce] bg-[#e8f1e6] p-4.5 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md dark:border-[#2f552c]/50 dark:bg-[#1a2e19]/40"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative flex size-12 sm:size-13 shrink-0 items-center justify-center rounded-2xl bg-white/95 p-1 shadow-2xs transition-transform duration-300 group-hover:scale-105 dark:bg-stone-900/90">
            <img
              src="/icons/clay-optimized/tasks_clipboard.webp"
              alt="Prancheta de Tarefas"
              className="size-full object-contain"
              style={{ filter: 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.08))' }}
              loading="lazy"
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-display font-bold text-sm text-[#244222] dark:text-[#a3d99e] truncate">
              Tarefas de Hoje
            </h3>
            {isLoading ? (
              <div className="mt-1 h-3 w-24 animate-pulse rounded bg-stone-300/60 dark:bg-stone-700/60" />
            ) : (
              <p className="font-ui text-xs font-medium text-[#41693e] dark:text-[#84b880] mt-0.5 truncate">
                {pendingTasks === 1 ? '1 pendente' : `${pendingTasks} pendentes`} •{' '}
                {tasks.totalDayFinishedTasks} prontas
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="h-6 w-10 animate-pulse rounded-full bg-white/60 dark:bg-black/30" />
        ) : (
          <span className="font-ui text-xs font-bold text-[#2d562b] bg-white/90 dark:bg-stone-900/90 dark:text-[#a3d99e] px-2.5 py-1 rounded-full shadow-2xs tabular-nums shrink-0">
            {tasks.rateTasks}%
          </span>
        )}
      </motion.div>

      {/* ── WIDGET 2: DESPENSA DO NINHO ── */}
      <motion.div
        variants={widgetSlide}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (onShoppingClick) onShoppingClick();
          else navigate('/shopping');
        }}
        role="button"
        tabIndex={0}
        aria-label="Ver lista de compras da despensa"
        className="group relative flex cursor-pointer items-center justify-between gap-3.5 rounded-3xl border border-[#f7d0bd] bg-[#fde9df] p-4.5 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md dark:border-[#6a3324]/50 dark:bg-[#3d1c14]/40"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative flex size-12 sm:size-13 shrink-0 items-center justify-center rounded-2xl bg-white/95 p-1 shadow-2xs transition-transform duration-300 group-hover:scale-105 dark:bg-stone-900/90">
            <img
              src="/icons/clay-optimized/shopping_basket.webp"
              alt="Cesta da Despensa"
              className="size-full object-contain"
              style={{ filter: 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.08))' }}
              loading="lazy"
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-display font-bold text-sm text-[#612818] dark:text-[#f8a892] truncate">
              Despensa do Ninho
            </h3>
            {isLoading ? (
              <div className="mt-1 h-3 w-28 animate-pulse rounded bg-stone-300/60 dark:bg-stone-700/60" />
            ) : (
              <p className="font-ui text-xs font-medium text-[#8c3f2b] dark:text-[#e08873] mt-0.5 truncate">
                {shopping.totalMonthItems === 1
                  ? '1 item para comprar'
                  : `${shopping.totalMonthItems} itens para comprar`}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="h-6 w-14 animate-pulse rounded-full bg-white/60 dark:bg-black/30" />
        ) : (
          <span className="font-ui text-xs font-bold text-[#74301d] bg-white/90 dark:bg-stone-900/90 dark:text-[#f8a892] px-2.5 py-1 rounded-full shadow-2xs shrink-0">
            {monthName}
          </span>
        )}
      </motion.div>

      {/* ── WIDGET 3: AGENDA FAMILIAR ── */}
      <motion.div
        variants={widgetSlide}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (onCalendarClick) onCalendarClick();
          else navigate('/calendar');
        }}
        role="button"
        tabIndex={0}
        aria-label="Ver agenda familiar"
        className="group relative flex cursor-pointer items-center justify-between gap-3.5 rounded-3xl border border-[#fae2a4] bg-[#fef3d6] p-4.5 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md dark:border-[#6c5118]/50 dark:bg-[#3d2e0e]/40"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative flex size-12 sm:size-13 shrink-0 items-center justify-center rounded-2xl bg-white/95 p-1 shadow-2xs transition-transform duration-300 group-hover:scale-105 dark:bg-stone-900/90">
            <img
              src="/icons/clay-optimized/calendar_desk.webp"
              alt="Calendário Familiar"
              className="size-full object-contain"
              style={{ filter: 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.08))' }}
              loading="lazy"
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-display font-bold text-sm text-[#5f410d] dark:text-[#f3cd78] truncate">
              Agenda Familiar
            </h3>
            {isLoading ? (
              <div className="mt-1 h-3 w-28 animate-pulse rounded bg-stone-300/60 dark:bg-stone-700/60" />
            ) : (
              <p className="font-ui text-xs font-medium text-[#8b6319] dark:text-[#dab055] mt-0.5 truncate">
                {nextEventLabel}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="h-6 w-14 animate-pulse rounded-full bg-white/60 dark:bg-black/30" />
        ) : (
          <span className="font-ui text-xs font-bold text-[#6a490e] bg-white/90 dark:bg-stone-900/90 dark:text-[#f3cd78] px-2.5 py-1 rounded-full shadow-2xs shrink-0">
            {nextEventBadge}
          </span>
        )}
      </motion.div>
    </div>
  );
}
