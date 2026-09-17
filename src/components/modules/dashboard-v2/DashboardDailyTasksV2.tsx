import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import React, { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveUserAvatar } from '@/constants/koboyoAvatars';
import { AnimatedNumber } from '@/components/common/AnimatedNumber';
import { cn } from '@/lib/utils';
import type { NestMember } from '@/schemas/nest';
import type { Task } from '@/types';

interface DashboardDailyTasksV2Props {
  tasks?: Task[];
  members?: NestMember[];
  onAddTask?: () => void;
  onQuickAddTask?: (title: string) => Promise<void>;
  onCompleteTask?: (taskId: string) => Promise<void>;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => Promise<void>;
  className?: string;
}

const PRIORITY_BADGES: Record<
  number,
  { label: string; bg: string; text: string; dot: string }
> = {
  0: {
    label: 'Urgente',
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    dot: 'bg-destructive',
  },
  1: {
    label: 'Alta',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  2: {
    label: 'Média',
    bg: 'bg-primary/10',
    text: 'text-primary',
    dot: 'bg-primary',
  },
  3: {
    label: 'Baixa',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
};

export function DashboardDailyTasksV2({
  tasks = [],
  members = [],
  onAddTask,
  onQuickAddTask,
  onCompleteTask,
  onEditTask,
  onDeleteTask,
  className,
}: DashboardDailyTasksV2Props) {
  const navigate = useNavigate();
  const [quickInput, setQuickInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'urgent'>('pending');

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickInput.trim() && !submitting && onQuickAddTask) {
      e.preventDefault();
      setSubmitting(true);
      try {
        await onQuickAddTask(quickInput.trim());
        setQuickInput('');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (activeFilter === 'pending') {
      list = list.filter((t) => !t.isCompleted);
    } else if (activeFilter === 'urgent') {
      list = list.filter((t) => !t.isCompleted && (t.priority === 0 || t.priority === 1));
    }
    // Ordenar: urgentes primeiro, depois por data
    return list
      .sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return (a.priority ?? 3) - (b.priority ?? 3);
      })
      .slice(0, 6);
  }, [tasks, activeFilter]);

  const totalPending = useMemo(() => tasks.filter((t) => !t.isCompleted).length, [tasks]);
  const totalCompleted = useMemo(() => tasks.filter((t) => t.isCompleted).length, [tasks]);

  return (
    <div
      className={cn(
        'relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-card',
        className
      )}
    >
      <div>
        {/* Furos do espiral decorativos no topo (estilo caderno de anotações do lar) */}
        <div className="flex items-center justify-around pb-3.5 border-b border-dashed border-border/70 -mt-1" aria-hidden="true">
          <div className="size-2 sm:size-2.5 rounded-full bg-muted/80 shadow-inner" />
          <div className="size-2 sm:size-2.5 rounded-full bg-muted/80 shadow-inner" />
          <div className="size-2 sm:size-2.5 rounded-full bg-muted/80 shadow-inner" />
          <div className="size-2 sm:size-2.5 rounded-full bg-muted/80 shadow-inner" />
          <div className="size-2 sm:size-2.5 rounded-full bg-muted/80 shadow-inner" />
          <div className="size-2 sm:size-2.5 rounded-full bg-muted/80 shadow-inner" />
        </div>

        {/* Header da Seção */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50/80 p-1 dark:bg-emerald-950/30">
              <img
                src="/icons/clay-optimized/tasks_pencil.webp"
                alt="Quadro de Tarefas"
                className="size-full object-contain"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))' }}
                loading="lazy"
              />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-foreground">
                Quadro de Tarefas
              </h3>
              <p className="font-ui text-xs text-muted-foreground">
                <AnimatedNumber value={totalPending} /> {totalPending === 1 ? 'restante' : 'restantes'} •{' '}
                <AnimatedNumber value={totalCompleted} /> concluídas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center rounded-full bg-muted/60 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveFilter('pending')}
                className={cn(
                  'rounded-full px-2.5 py-1 transition-all',
                  activeFilter === 'pending'
                    ? 'bg-card text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Pendentes
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('urgent')}
                className={cn(
                  'rounded-full px-2.5 py-1 transition-all',
                  activeFilter === 'urgent'
                    ? 'bg-card text-destructive shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Urgentes
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={cn(
                  'rounded-full px-2.5 py-1 transition-all',
                  activeFilter === 'all'
                    ? 'bg-card text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Todas
              </button>
            </div>

            {onAddTask && (
              <button
                type="button"
                onClick={onAddTask}
                aria-label="Criar nova tarefa"
                className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Input de Adição Rápida */}
        <div className="relative mb-3.5">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Adicionar tarefa rápida... (pressione Enter)"
            className="w-full rounded-2xl border border-border/80 bg-muted/30 px-4 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={submitting}
          />
          {quickInput.trim() && (
            <button
              type="button"
              onClick={() => {
                if (onQuickAddTask) {
                  setSubmitting(true);
                  onQuickAddTask(quickInput.trim()).finally(() => {
                    setQuickInput('');
                    setSubmitting(false);
                  });
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-xs hover:brightness-105"
            >
              Criar
            </button>
          )}
        </div>

        {/* Lista de Tarefas */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-chart-2/10 text-chart-2 mb-2">
              <CheckCircle2 size={20} />
            </div>
            <p className="font-ui text-sm font-semibold text-foreground">
              {activeFilter === 'urgent'
                ? 'Nenhuma tarefa urgente no momento!'
                : 'Nenhuma tarefa pendente por aqui!'}
            </p>
            <p className="font-ui text-xs text-muted-foreground mt-0.5">
              Bom trabalho! O lar está organizado.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <TaskRowItem
                  key={task.taskId}
                  task={task}
                  members={members}
                  onComplete={onCompleteTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer com link direto */}
      <div className="mt-4 pt-3 border-t border-dashed border-border/70 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Mostrando {filteredTasks.length} de {tasks.length} tarefas
        </span>
        <button
          type="button"
          onClick={() => navigate('/tasks')}
          className="font-ui inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline"
        >
          <span>Abrir gerenciador completo</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

const TaskRowItem = memo(
  ({
    task,
    members = [],
    onComplete,
    onEdit,
    onDelete,
  }: {
    task: Task;
    members?: NestMember[];
    onComplete?: (id: string) => Promise<void>;
    onEdit?: (task: Task) => void;
    onDelete?: (id: string) => Promise<void>;
  }) => {
    const priority = PRIORITY_BADGES[task.priority ?? 3] ?? PRIORITY_BADGES[3];

    const assignedMember = useMemo(() => {
      if (!task.assignedTo || !members?.length) return null;
      return members.find((m) => m.userId === task.assignedTo);
    }, [task.assignedTo, members]);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: task.isCompleted ? 0.6 : 1, y: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'group flex items-center justify-between gap-2.5 sm:gap-3 rounded-2xl border p-2.5 sm:p-3 transition-all duration-150',
          task.isCompleted
            ? 'border-transparent bg-muted/40'
            : 'border-border/60 bg-card shadow-subtle hover:border-border/90 hover:shadow-card'
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          {/* Checkbox customizado */}
          <button
            type="button"
            onClick={() => !task.isCompleted && onComplete?.(task.taskId)}
            disabled={task.isCompleted}
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer',
              task.isCompleted
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-border/80 bg-muted/40 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            )}
            title={task.isCompleted ? 'Tarefa concluída' : 'Marcar como concluída'}
          >
            {task.isCompleted ? (
              <CheckCircle2 size={13} strokeWidth={3} />
            ) : (
              <Circle size={10} className="text-transparent" />
            )}
          </button>

          {/* Conteúdo */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  'font-ui text-xs font-semibold transition-all truncate',
                  task.isCompleted
                    ? 'line-through text-muted-foreground'
                    : 'text-foreground font-medium'
                )}
              >
                {task.title}
              </span>
              {task.isOverdue && !task.isCompleted && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-destructive">
                  <AlertCircle size={10} />
                  Atrasada
                </span>
              )}
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px]">
              {/* Badge {Avatar} + Nome */}
              {assignedMember && (() => {
                const avatarSrc = resolveUserAvatar(assignedMember.photoUrl, assignedMember.avatarSlug);
                return (
                  <div className="flex items-center gap-1 rounded-full border border-amber-200/70 bg-amber-50/90 pl-1 pr-2 py-0.2 shadow-2xs dark:border-amber-800/40 dark:bg-amber-950/40">
                    <Avatar className="size-3.5 rounded-full bg-white">
                      {avatarSrc && (
                        <AvatarImage
                          src={avatarSrc}
                          alt={assignedMember.name}
                          className="size-full object-contain filter contrast-125 dark:brightness-105"
                        />
                      )}
                      <AvatarFallback className="bg-primary/20 text-[7px] font-bold text-primary">
                        {assignedMember.name.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-ui text-[9px] font-bold text-amber-900 dark:text-amber-200">
                      {assignedMember.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })()}

              <span
                className={cn(
                  'rounded-md px-1.5 py-0.5 font-bold uppercase tracking-wider',
                  priority.bg,
                  priority.text
                )}
              >
                {priority.label}
              </span>
              {task.categoryLabel && (
                <span className="text-muted-foreground">{task.categoryLabel}</span>
              )}
              {task.dueDate && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-muted-foreground">
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Menu de Ações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
            >
              <MoreVertical size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {!task.isCompleted && onComplete && (
              <DropdownMenuItem onClick={() => onComplete(task.taskId)}>
                <CheckCircle2 className="mr-2 size-3.5" />
                Concluir
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="mr-2 size-3.5" />
                Editar
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(task.taskId)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-3.5" />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    );
  }
);

TaskRowItem.displayName = 'TaskRowItem';
