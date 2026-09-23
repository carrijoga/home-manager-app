import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { AlertCircle, CalendarDays, Check, Edit2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { memo } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { resolveUserAvatar } from '@/constants/koboyoAvatars';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

import { PRIORITY_CONFIG } from './constants';

interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, snap: Task) => void;
  isDragOverlay?: boolean;
}

export const KanbanCard = memo(function KanbanCard({
  task,
  onEdit,
  onDelete,
  isDragOverlay,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.taskId,
  });
  const cfg = PRIORITY_CONFIG[task.priority as 0 | 1 | 2 | 3] ?? PRIORITY_CONFIG[3];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdueDays =
    task.isOverdue && task.dueDate
      ? Math.max(1, Math.floor((Date.now() - new Date(task.dueDate).getTime()) / 86400000))
      : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group cursor-grab select-none rounded-xl border px-3.5 py-3 transition-shadow active:cursor-grabbing',
        isDragOverlay ? 'rotate-1 scale-[1.03] shadow-xl border-border/80 bg-card' : 'hover:shadow-md border-border/60 bg-card'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox Visual Only (Kanban status drives completion) */}
        <div
          className={cn(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors',
            task.isCompleted
              ? 'bg-emerald-600 text-white shadow-2xs dark:bg-emerald-500'
              : 'border-2 border-border/90 bg-card shadow-2xs'
          )}
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
        </div>

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
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          )}
          
          {/* Unified Editorial Metadata Line */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate mt-1">
            <span className={cn('font-ui rounded-md px-1.5 py-0.5 text-[10px] font-bold shrink-0', cfg.pill)}>
              {cfg.label}
            </span>

            <span className="text-muted-foreground/40 font-bold shrink-0">·</span>
            
            <span className="truncate text-muted-foreground/90 font-medium">
              {task.categoryLabel}
            </span>

            {task.assignees && task.assignees.length > 0 && (() => {
              const completedCount = task.assignees.filter((a) => a.isCompleted).length;
              const totalCount = task.assignees.length;
              const isMultiAssignee = totalCount > 1;

              return (
                <>
                  <span className="text-muted-foreground/40 font-bold shrink-0">·</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                      {task.assignees.map((a) => {
                        const avatarSrc = resolveUserAvatar(a.photoUrl, null);
                        return (
                          <div key={a.userId} className="relative group/avatar">
                            <Avatar
                              className={cn(
                                'size-5 border-2 border-background transition-transform hover:scale-110',
                                a.isCompleted
                                  ? 'ring-2 ring-emerald-500 shadow-xs'
                                  : 'opacity-70 grayscale-[30%]'
                              )}
                              title={`${a.name}: ${a.isCompleted ? 'Concluído' : 'Pendente'}`}
                            >
                              {avatarSrc && <AvatarImage src={avatarSrc} alt={a.name} />}
                              <AvatarFallback className="text-[8px] font-bold">
                                {a.name?.substring(0, 1).toUpperCase() || 'M'}
                              </AvatarFallback>
                            </Avatar>
                            {a.isCompleted && (
                              <span className="absolute -bottom-0.5 -right-0.5 flex size-2.5 items-center justify-center rounded-full bg-emerald-600 text-white ring-1 ring-background dark:bg-emerald-500">
                                <Check size={7} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {isMultiAssignee && (
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.2 text-[9px] font-extrabold tabular-nums',
                          completedCount === totalCount
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : completedCount > 0
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground'
                        )}
                        title={`${completedCount} de ${totalCount} concluíram`}
                      >
                        {completedCount}/{totalCount}
                      </span>
                    )}
                  </div>
                </>
              );
            })()}

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
                      {overdueDays}d
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

        {/* Hover actions */}
        <div
          className="hidden shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 sm:flex"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
            onClick={() => onEdit(task)}
            title="Editar tarefa"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95"
            onClick={() => onDelete(task.taskId, task)}
            title="Excluir tarefa"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className="sm:hidden shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Mais opções"
              >
                <MoreHorizontal size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(task)}>
                <Edit2 size={13} className="mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onDelete(task.taskId, task)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 size={13} className="mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});
