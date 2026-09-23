import { AlertCircle, CalendarDays, CheckCircle2, ListTodo } from 'lucide-react';

import { AnimatedNumber, AnimatedPercent, SpringProgress } from '@/components/ui';

interface TaskSideSummaryProps {
  totalActive: number;
  completedToday: number;
  overdue: number;
  totalPending: number;
  urgentCount: number;
  weekCount: number;
}

export function TaskSideSummary({
  totalActive,
  completedToday,
  overdue,
  totalPending,
  urgentCount,
  weekCount,
}: TaskSideSummaryProps) {
  const percent = totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Progresso Diário */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-subtle">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CheckCircle2 size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Progresso Diário</h3>
            <p className="text-xs font-medium text-muted-foreground">Tarefas concluídas hoje</p>
          </div>
        </div>

        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-bold tracking-tight text-foreground">
              <AnimatedPercent value={percent} />
            </span>
          </div>
          <span className="text-xs font-bold text-muted-foreground/80 mb-1">
            <AnimatedNumber value={completedToday} /> de <AnimatedNumber value={totalActive} />
          </span>
        </div>

        <SpringProgress
          value={percent}
          className="h-2.5 bg-primary/15"
          indicatorClassName="bg-primary"
        />
      </div>

      {/* Resumo */}
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-subtle flex flex-col gap-3">
        <h3 className="text-sm font-bold text-foreground px-1">Resumo</h3>
        
        <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ListTodo size={14} />
            <span className="text-sm font-medium">Pendentes</span>
          </div>
          <span className="text-sm font-bold text-foreground">
            {totalPending}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-amber-500/10 px-3 py-2 dark:bg-amber-500/10">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <CalendarDays size={14} />
            <span className="text-sm font-medium">Para esta semana</span>
          </div>
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
            {weekCount}
          </span>
        </div>

        {overdue > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-terracotta-500/10 px-3 py-2 dark:bg-terracotta-500/10">
            <div className="flex items-center gap-2 text-terracotta-700 dark:text-terracotta-400">
              <AlertCircle size={14} />
              <span className="text-sm font-medium">Atrasadas</span>
            </div>
            <span className="text-sm font-bold text-terracotta-700 dark:text-terracotta-400">
              {overdue}
            </span>
          </div>
        )}

        {urgentCount > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-destructive/10 px-3 py-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle size={14} />
              <span className="text-sm font-medium">Urgentes</span>
            </div>
            <span className="text-sm font-bold text-destructive">
              {urgentCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
