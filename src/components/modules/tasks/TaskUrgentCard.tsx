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
    <div className="flex flex-col gap-4 p-6 rounded-3xl bg-card border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className="text-terracotta-600 dark:text-terracotta-400" strokeWidth={1.5} />
          <h3 className="font-editorial font-bold text-foreground text-lg">Atenção imediata</h3>
        </div>
        <span className="font-ui text-xs font-semibold px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="font-ui text-sm text-muted-foreground text-center py-2">Nenhuma tarefa urgente</p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map(task => {
            const cfg = PRIORITY_CONFIG[task.priority as 0 | 1 | 2 | 3] ?? PRIORITY_CONFIG[3];
            return (
              <button
                key={task.taskId}
                onClick={() => onTaskClick(task.taskId)}
                className="flex items-start gap-2 text-left hover:bg-muted/50 rounded-xl px-2 py-1.5 -mx-2 transition-colors"
              >
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-sm font-medium text-foreground truncate">{task.title}</p>
                  {task.dueDate && (
                    <span className="inline-flex items-center gap-0.5 font-ui text-xs text-muted-foreground">
                      <CalendarDays size={9} />
                      {task.isOverdue
                        ? <span className="text-terracotta-600 dark:text-terracotta-400">
                            {Math.max(1, Math.floor((Date.now() - new Date(task.dueDate).getTime()) / 86400000))}d atraso
                          </span>
                        : new Date(task.dueDate).toLocaleDateString('pt-BR')
                      }
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {tasks.length > 5 && (
            <p className="font-ui text-xs text-muted-foreground text-center pt-1">
              +{tasks.length - 5} mais
            </p>
          )}
        </div>
      )}
    </div>
  );
}
