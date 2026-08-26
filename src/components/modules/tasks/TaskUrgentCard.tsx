import { AlertTriangle, CalendarDays } from 'lucide-react';

import type { Task } from '@/types';

import { PRIORITY_CONFIG } from './constants';

interface TaskUrgentCardProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export function TaskUrgentCard({ tasks, onTaskClick }: TaskUrgentCardProps) {
  const visible = tasks.slice(0, 5);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle
            size={18}
            className="text-terracotta-600 dark:text-terracotta-400"
            strokeWidth={1.5}
          />
          <h3 className="font-editorial text-lg font-bold text-foreground">Atenção imediata</h3>
        </div>
        <span className="font-ui rounded-full bg-terracotta-100 px-2 py-0.5 text-xs font-semibold text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="font-ui py-2 text-center text-sm text-muted-foreground">
          Nenhuma tarefa urgente
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((task) => {
            const cfg = PRIORITY_CONFIG[task.priority as 0 | 1 | 2 | 3] ?? PRIORITY_CONFIG[3];
            return (
              <button
                key={task.taskId}
                onClick={() => onTaskClick(task.taskId)}
                className="-mx-2 flex items-start gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-muted/50"
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-ui truncate text-sm font-medium text-foreground">
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <span className="font-ui inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                      <CalendarDays size={9} />
                      {task.isOverdue ? (
                        <span className="text-terracotta-600 dark:text-terracotta-400">
                          {Math.max(
                            1,
                            Math.floor((Date.now() - new Date(task.dueDate).getTime()) / 86400000)
                          )}
                          d atraso
                        </span>
                      ) : (
                        new Date(task.dueDate).toLocaleDateString('pt-BR')
                      )}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {tasks.length > 5 && (
            <p className="font-ui pt-1 text-center text-xs text-muted-foreground">
              +{tasks.length - 5} mais
            </p>
          )}
        </div>
      )}
    </div>
  );
}
