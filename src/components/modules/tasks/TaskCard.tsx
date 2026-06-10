import { motion } from 'framer-motion';
import { AlertCircle, CalendarDays, CheckCircle2, Edit2, MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react';
import { forwardRef, memo } from 'react';

import {
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import type { Task } from '@/types';

import { PRIORITY_CONFIG } from './constants';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onUncomplete: (taskId: string) => void;
  onDelete: (taskId: string, snap: Task) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard = memo(forwardRef<HTMLDivElement, TaskCardProps>(
  function TaskCard({ task, onComplete, onUncomplete, onDelete, onEdit }, ref) {
    const cfg = PRIORITY_CONFIG[task.priority as 0 | 1 | 2 | 3] ?? PRIORITY_CONFIG[3];
    const overdueDays = task.isOverdue && task.dueDate
      ? Math.max(1, Math.floor((Date.now() - new Date(task.dueDate).getTime()) / 86400000))
      : 0;

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -40, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="group relative flex items-start gap-3 px-3 py-2.5 rounded-2xl border border-border bg-card transition-colors hover:bg-accent/30"
      >
        {/* Priority dot */}
        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />

        {/* Checkbox */}
        <motion.div whileTap={{ scale: 0.82 }} className="mt-0.5 shrink-0">
          <Checkbox
            checked={task.isCompleted}
            onCheckedChange={() =>
              task.isCompleted ? onUncomplete(task.taskId) : onComplete(task.taskId)
            }
            className={task.isCompleted ? 'data-[state=checked]:bg-sage-400' : ''}
          />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-ui text-sm font-medium leading-snug break-words ${
            task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
          }`}>
            {task.title}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`font-ui text-xs px-1.5 py-0.5 rounded font-medium ${cfg.pill}`}>
              {cfg.label}
            </span>
            <span className="font-ui text-xs text-muted-foreground">
              {task.categoryLabel}
            </span>
            {task.dueDate && (
              <span className={`inline-flex items-center gap-0.5 font-ui text-xs ${
                task.isOverdue && !task.isCompleted
                  ? 'text-terracotta-600 dark:text-terracotta-400 font-medium'
                  : 'text-muted-foreground'
              }`}>
                {task.isOverdue && !task.isCompleted
                  ? <><AlertCircle size={9} />{overdueDays}d atraso</>
                  : <><CalendarDays size={9} />{new Date(task.dueDate).toLocaleDateString('pt-BR')}</>
                }
              </span>
            )}
            {task.isCompleted && task.completedAt && (
              <span className="inline-flex items-center gap-0.5 font-ui text-xs text-sage-500 dark:text-sage-400">
                <CheckCircle2 size={9} />
                {new Date(task.completedAt).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>

        {/* Action menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mt-0.5">
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!task.isCompleted && (
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit2 size={13} className="mr-2" /> Editar
              </DropdownMenuItem>
            )}
            {task.isCompleted && (
              <DropdownMenuItem onClick={() => onUncomplete(task.taskId)}>
                <RotateCcw size={13} className="mr-2" /> Reabrir
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(task.taskId, task)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 size={13} className="mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    );
  }
));
