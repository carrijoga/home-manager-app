import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface TaskProgressCardProps {
  pending: number;
  completedToday: number;
  overdue: number;
  dueThisWeek: number;
}

export function TaskProgressCard({ pending, completedToday, overdue, dueThisWeek }: TaskProgressCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const total = pending + completedToday;
  const pct = total > 0 ? Math.round((completedToday / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 p-6 rounded-3xl bg-card border border-border">
      <div className="flex items-center gap-3">
        <ClipboardList size={18} className="text-foreground" strokeWidth={1.5} />
        <h3 className="font-editorial font-bold text-foreground text-lg">Progresso de Hoje</h3>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between font-ui text-xs text-muted-foreground">
          <span>{completedToday} concluídas</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={prefersReducedMotion ? false : { width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 font-ui text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Pendentes</span>
          <span className="font-editorial font-bold text-foreground text-xl">{pending}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Concluídas hoje</span>
          <span className="font-editorial font-bold text-sage-600 dark:text-sage-400 text-xl">{completedToday}</span>
        </div>
        {overdue > 0 && (
          <div className="flex items-center justify-between pt-1 border-t border-dashed border-border">
            <span className="text-terracotta-600 dark:text-terracotta-400">Atrasadas</span>
            <span className="font-editorial font-bold text-terracotta-600 dark:text-terracotta-400 text-xl">{overdue}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Esta semana</span>
          <span className="font-editorial font-bold text-foreground text-xl">{dueThisWeek}</span>
        </div>
      </div>
    </div>
  );
}
