import { motion } from 'framer-motion';
import {
  AlertCircle,
  CalendarDays,
  Check,
  Edit2,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
  User,
} from 'lucide-react';
import { forwardRef, memo } from 'react';

import {
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

import { PRIORITY_CONFIG } from './constants';

interface TaskCardProps {
  task: Task;
  assignedName?: string;
  isBulkMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onUncomplete: (taskId: string) => void;
  onDelete: (taskId: string, snap: Task) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard = memo(
  forwardRef<HTMLDivElement, TaskCardProps>(function TaskCard(
    { task, assignedName, isBulkMode, isSelected, onToggleSelection, onComplete, onUncomplete, onDelete, onEdit },
    ref
  ) {
    const cfg = PRIORITY_CONFIG[task.priority as 0 | 1 | 2 | 3] ?? PRIORITY_CONFIG[3];
    const overdueDays =
      task.isOverdue && task.dueDate
        ? Math.max(1, Math.floor((Date.now() - new Date(task.dueDate).getTime()) / 86400000))
        : 0;

    if (isBulkMode) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center gap-3.5 px-4 py-3 sm:px-5 sm:py-3.5 transition-colors cursor-pointer select-none rounded-xl border border-border/40',
            isSelected ? 'bg-primary/10 border-primary/30' : 'hover:bg-accent/40 bg-card'
          )}
          onClick={() => onToggleSelection?.(task.taskId)}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection?.(task.taskId)}
            className="shrink-0 rounded-lg h-5 w-5 border-border/80"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold text-foreground">{task.title}</span>
            {task.description && (
              <span className="truncate text-xs text-muted-foreground">{task.description}</span>
            )}
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {task.categoryLabel}
          </span>
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        className={cn(
          "group relative flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-all duration-150 cursor-default select-none",
          task.isCompleted ? 'border-border/40 bg-muted/15 opacity-75 hover:opacity-100 hover:bg-muted/30' : 'border-border/60 bg-card shadow-subtle hover:border-border/90 hover:shadow-card'
        )}
      >
        {/* Tactile Circular Checkbox */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            if (task.isCompleted) onUncomplete(task.taskId);
            else onComplete(task.taskId);
          }}
          className={cn(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors active:scale-90',
            task.isCompleted
              ? 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700 dark:bg-emerald-500'
              : 'border-2 border-border/90 bg-card hover:border-primary hover:bg-primary/10 shadow-2xs'
          )}
          aria-label={task.isCompleted ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
        >
          {task.isCompleted && (
            <motion.span
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 26, bounce: 0.35 }}
              className="flex items-center justify-center"
            >
              <Check size={13} strokeWidth={3} />
            </motion.span>
          )}
        </motion.button>

        {/* Content */}
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <p
            className={cn(
              'truncate text-sm font-medium tracking-tight transition-all duration-200 ease-out select-none',
              task.isCompleted
                ? 'text-muted-foreground line-through decoration-muted-foreground/60 opacity-70'
                : 'text-foreground font-semibold opacity-100'
            )}
          >
            {task.title}
          </p>

          {task.description && !task.isCompleted && (
            <p className="line-clamp-2 text-xs text-muted-foreground mt-0.5">
              {task.description}
            </p>
          )}

          {/* Unified Editorial Metadata Line */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate mt-1">
            {/* Priority Pill */}
            <span className={cn('font-ui rounded-md px-1.5 py-0.5 text-[10px] font-bold shrink-0', cfg.pill)}>
              {cfg.label}
            </span>

            <span className="text-muted-foreground/40 font-bold shrink-0">·</span>
            
            {/* Category */}
            <span className="truncate text-muted-foreground/90 font-medium">
              {task.categoryLabel}
            </span>

            {assignedName && (
              <>
                <span className="text-muted-foreground/40 font-bold shrink-0">·</span>
                <span className="inline-flex items-center gap-1 font-medium text-muted-foreground/90 truncate">
                  <User size={10} className="shrink-0 opacity-70" />
                  <span className="truncate">{assignedName}</span>
                </span>
              </>
            )}

            {task.dueDate && (
              <>
                <span className="text-muted-foreground/40 font-bold shrink-0">·</span>
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-medium shrink-0',
                    task.isOverdue && !task.isCompleted
                      ? 'text-terracotta-600 dark:text-terracotta-400'
                      : 'text-muted-foreground/90'
                  )}
                >
                  {task.isOverdue && !task.isCompleted ? (
                    <>
                      <AlertCircle size={10} />
                      {overdueDays}d atraso
                    </>
                  ) : (
                    <>
                      <CalendarDays size={10} />
                      {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </>
                  )}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Hover Quick Actions */}
        <div
          className="hidden shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 sm:flex"
          onClick={(e) => e.stopPropagation()}
        >
          {!task.isCompleted ? (
            <button
              type="button"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
              onClick={() => onEdit(task)}
              title="Editar tarefa"
            >
              <Pencil size={13} />
            </button>
          ) : (
            <button
              type="button"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
              onClick={() => onUncomplete(task.taskId)}
              title="Reabrir tarefa"
            >
              <RotateCcw size={13} />
            </button>
          )}
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95"
            onClick={() => onDelete(task.taskId, task)}
            title="Excluir tarefa"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Action menu (Mobile fallback) */}
        <div className="sm:hidden shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Mais opções"
              >
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
        </div>
      </motion.div>
    );
  })
);
