import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, Edit2, MoreHorizontal, Trash2, User } from 'lucide-react';
import { memo } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import type { Task } from '@/types';

import { PRIORITY_CONFIG } from './constants';

interface KanbanCardProps {
  task: Task;
  assignedName?: string;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, snap: Task) => void;
  isDragOverlay?: boolean;
}

export const KanbanCard = memo(function KanbanCard({
  task,
  assignedName,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-grab select-none rounded-2xl border border-border bg-card px-3 py-2.5 transition-shadow active:cursor-grabbing ${
        isDragOverlay ? 'rotate-1 scale-[1.03] shadow-xl' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
        <div className="min-w-0 flex-1">
          <p
            className={`font-ui break-words text-sm font-medium leading-snug text-foreground ${
              task.isCompleted ? 'text-muted-foreground line-through' : ''
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          )}
          {task.details && (
            <p className="mt-0.5 line-clamp-2 text-xs italic text-muted-foreground/80">
              {task.details}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`font-ui rounded px-1.5 py-0.5 text-xs font-medium ${cfg.pill}`}>
              {cfg.label}
            </span>
            <span className="font-ui text-xs text-muted-foreground">{task.categoryLabel}</span>
            {assignedName && (
              <span className="font-ui inline-flex items-center gap-1 text-xs text-muted-foreground">
                <User size={10} /> {assignedName}
              </span>
            )}
            {task.dueDate && (
              <span
                className={`font-ui inline-flex items-center gap-0.5 text-xs ${
                  task.isOverdue
                    ? 'font-medium text-terracotta-600 dark:text-terracotta-400'
                    : 'text-muted-foreground'
                }`}
              >
                <CalendarDays size={9} />
                {new Date(task.dueDate).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
            >
              <MoreHorizontal size={13} />
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
  );
});
