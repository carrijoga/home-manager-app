import { Check, RotateCcw } from 'lucide-react';
import { type SyntheticEvent, useState } from 'react';

import { partProgress } from '@/components/modules/tasks/taskParts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { resolveUserAvatar } from '@/constants/koboyoAvatars';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

export interface AssigneesPopoverProps {
  task: Task;
  currentUserId: string;
  canCompleteOthers: boolean;
  /** Ausente = popover só informativo. */
  onToggleAssignee?: (assigneeUserId: string, done: boolean) => void;
  size?: 'sm' | 'xs';
}

function formatDoneAt(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Impede que clique/arraste no popover chegue ao card (dnd-kit do Kanban, clique do card).
// Eventos React atravessam o portal do Radix, por isso o conteúdo também precisa parar.
const stop = (e: SyntheticEvent) => e.stopPropagation();

export function AssigneesPopover({
  task,
  currentUserId,
  canCompleteOthers,
  onToggleAssignee,
  size = 'sm',
}: AssigneesPopoverProps) {
  const [open, setOpen] = useState(false);
  const { done, total } = partProgress(task);
  if (total === 0) return null;

  const avatarSize = size === 'xs' ? 'size-4' : 'size-5';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onPointerDown={stop}
          onClick={stop}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-0.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Responsáveis: ${done} de ${total} concluíram`}
          title={`${done} de ${total} concluíram`}
        >
          <span className="flex items-center -space-x-1.5">
            {task.assignees.map((a) => {
              const avatarSrc = resolveUserAvatar(a.photoUrl, null);
              return (
                <span key={a.userId} className="relative">
                  <Avatar
                    className={cn(
                      avatarSize,
                      'border-2 border-background',
                      a.isCompleted ? 'ring-2 ring-emerald-500 shadow-xs' : 'opacity-70 grayscale-[30%]'
                    )}
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
                </span>
              );
            })}
          </span>
          {total > 1 && (
            <span
              className={cn(
                'rounded-full px-1.5 text-[9px] font-extrabold tabular-nums',
                done === total
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : done > 0
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {done}/{total}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2" onPointerDown={stop} onClick={stop}>
        <p className="px-2 pb-1.5 text-xs font-semibold text-muted-foreground">
          {done} de {total} concluíram
        </p>
        <ul className="space-y-0.5">
          {task.assignees.map((a) => {
            const isMe = a.userId === currentUserId;
            const doneAt = formatDoneAt(a.completedAt);
            const canAct = !!onToggleAssignee && canCompleteOthers && !isMe;
            const avatarSrc = resolveUserAvatar(a.photoUrl, null);
            return (
              <li key={a.userId} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                <Avatar className="size-7">
                  {avatarSrc && <AvatarImage src={avatarSrc} alt={a.name} />}
                  <AvatarFallback className="text-[10px] font-bold">
                    {a.name?.substring(0, 1).toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {a.name}
                    {isMe && <span className="font-normal text-muted-foreground"> (você)</span>}
                  </p>
                  <p
                    className={cn(
                      'text-[11px]',
                      a.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                    )}
                  >
                    {a.isCompleted ? (doneAt ? `Concluído em ${doneAt}` : 'Concluído') : 'Pendente'}
                  </p>
                </div>
                {canAct && (
                  <button
                    type="button"
                    onClick={() => onToggleAssignee?.(a.userId, !a.isCompleted)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border/70 px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {a.isCompleted ? (
                      <>
                        <RotateCcw size={12} /> Reabrir
                      </>
                    ) : (
                      <>
                        <Check size={12} /> Marcar como feito
                      </>
                    )}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
