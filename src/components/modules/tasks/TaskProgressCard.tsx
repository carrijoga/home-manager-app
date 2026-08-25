import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface TaskProgressCardProps {
  pending: number;
  completedToday: number;
  overdue: number;
  dueThisWeek: number;
}

export function TaskProgressCard({
  pending,
  completedToday,
  overdue,
  dueThisWeek,
}: TaskProgressCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const total = pending + completedToday;
  const pct = total > 0 ? Math.round((completedToday / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <ClipboardList size={18} className="text-foreground" strokeWidth={1.5} />
        <h3 className="font-editorial text-lg font-bold text-foreground">Progresso de Hoje</h3>
      </div>

      <div className="space-y-1.5">
        <div className="font-ui flex justify-between text-xs text-muted-foreground">
          <span>{completedToday} concluídas</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={prefersReducedMotion ? false : { width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          />
        </div>
      </div>

      <div className="font-ui flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Pendentes</span>
          <span className="font-editorial text-xl font-bold text-foreground">{pending}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Concluídas hoje</span>
          <span className="font-editorial text-xl font-bold text-sage-600 dark:text-sage-400">
            {completedToday}
          </span>
        </div>
        {overdue > 0 && (
          <div className="flex items-center justify-between border-t border-dashed border-border pt-1">
            <span className="text-terracotta-600 dark:text-terracotta-400">Atrasadas</span>
            <span className="font-editorial text-xl font-bold text-terracotta-600 dark:text-terracotta-400">
              {overdue}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Esta semana</span>
          <span className="font-editorial text-xl font-bold text-foreground">{dueThisWeek}</span>
        </div>
      </div>
    </div>
  );
}
