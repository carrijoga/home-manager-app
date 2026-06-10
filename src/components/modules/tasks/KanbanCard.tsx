import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, Edit2, MoreHorizontal, Trash2 } from 'lucide-react';
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
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, snap: Task) => void;
  isDragOverlay?: boolean;
}

export const KanbanCard = memo(function KanbanCard({ task, onEdit, onDelete, isDragOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.taskId });
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
      className={`group bg-card border border-border rounded-2xl px-3 py-2.5 cursor-grab active:cursor-grabbing select-none transition-shadow ${
        isDragOverlay ? 'shadow-xl scale-[1.03] rotate-1' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
        <div className="flex-1 min-w-0">
          <p className={`font-ui text-sm font-medium text-foreground leading-snug break-words ${
            task.isCompleted ? 'line-through text-muted-foreground' : ''
          }`}>
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={`font-ui text-xs px-1.5 py-0.5 rounded font-medium ${cfg.pill}`}>
              {cfg.label}
            </span>
            <span className="font-ui text-xs text-muted-foreground">{task.categoryLabel}</span>
            {task.dueDate && (
              <span className={`inline-flex items-center gap-0.5 font-ui text-xs ${
                task.isOverdue ? 'text-terracotta-600 dark:text-terracotta-400 font-medium' : 'text-muted-foreground'
              }`}>
                <CalendarDays size={9} />
                {new Date(task.dueDate).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onPointerDown={e => e.stopPropagation()}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
