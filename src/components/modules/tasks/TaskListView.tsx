import type { Variants } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp, CheckSquare } from 'lucide-react';
import { useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { Task } from '@/types';
import { TaskSortOrder } from './TaskFilterBar';
import { PRIORITY_CONFIG } from './constants';
import { TaskCard } from './TaskCard';

const cardSlide: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] } },
};

interface TaskListViewProps {
  tasks: Task[];
  isBulkMode: boolean;
  selectedTaskIds: string[];
  sortOrder: TaskSortOrder;
  onToggleSelection: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onUncomplete: (taskId: string) => void;
  onDelete: (taskId: string, snap: Task) => void;
  onEdit: (task: Task) => void;
  onNewTaskClick: () => void;
}

function PriorityGroup({
  priority,
  tasks,
  isBulkMode,
  selectedTaskIds,
  onToggleSelection,
  onComplete,
  onUncomplete,
  onDelete,
  onEdit,
}: {
  priority: number;
  tasks: Task[];
  isBulkMode: boolean;
  selectedTaskIds: string[];
  onToggleSelection: (id: string) => void;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onDelete: (id: string, snap: Task) => void;
  onEdit: (task: Task) => void;
}) {
  const [open, setOpen] = useState(true);
  const cfg = PRIORITY_CONFIG[priority as 0 | 1 | 2 | 3];
  if (tasks.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className="mb-2 flex w-full items-center gap-2 text-left"
      >
        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
        <span className={`font-ui text-xs font-semibold uppercase tracking-wide ${cfg.text}`}>
          {cfg.label}
        </span>
        <span className={`font-ui rounded-full px-1.5 py-0.5 text-xs font-semibold ${cfg.pill}`}>
          {tasks.length}
        </span>
        <span className="ml-auto text-muted-foreground">
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
        style={{ display: 'grid' }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="space-y-1.5 pb-1">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  isBulkMode={isBulkMode}
                  isSelected={selectedTaskIds.includes(task.taskId)}
                  onToggleSelection={onToggleSelection}
                  onComplete={onComplete}
                  onUncomplete={onUncomplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CompletedTodaySection({
  tasks,
  isBulkMode,
  selectedTaskIds,
  onToggleSelection,
  onComplete,
  onUncomplete,
  onDelete,
  onEdit,
}: {
  tasks: Task[];
  isBulkMode: boolean;
  selectedTaskIds: string[];
  onToggleSelection: (id: string) => void;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onDelete: (id: string, snap: Task) => void;
  onEdit: (task: Task) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-500/20 dark:border-emerald-500/30">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between bg-emerald-50/70 px-4 py-2.5 transition-colors hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span className="font-ui text-sm font-bold text-emerald-800 dark:text-emerald-300">
            Concluídas hoje
          </span>
          <span className="font-ui rounded-full border border-emerald-500/20 bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300">
            {tasks.length}
          </span>
        </div>
        {open ? (
          <ChevronUp size={15} className="text-emerald-600 dark:text-emerald-400" />
        ) : (
          <ChevronDown size={15} className="text-emerald-600 dark:text-emerald-400" />
        )}
      </button>
      <motion.div
        initial={false}
        animate={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
        style={{ display: 'grid' }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="space-y-1.5 p-2">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  isBulkMode={isBulkMode}
                  isSelected={selectedTaskIds.includes(task.taskId)}
                  onToggleSelection={onToggleSelection}
                  onComplete={onComplete}
                  onUncomplete={onUncomplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function TaskListView({
  tasks,
  isBulkMode,
  selectedTaskIds,
  sortOrder,
  onToggleSelection,
  onComplete,
  onUncomplete,
  onDelete,
  onEdit,
  onNewTaskClick,
}: TaskListViewProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTodayTasks = tasks.filter(
    (t) => t.isCompleted && t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString()
  );

  const getSortedTasks = (taskArray: Task[]) => {
    return [...taskArray].sort((a, b) => {
      if (sortOrder === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (dateA !== dateB) return dateA - dateB;
      }
      if (sortOrder === 'title') {
        return a.title.localeCompare(b.title);
      }
      return a.priority - b.priority;
    });
  };

  const sortedActiveTasks = getSortedTasks(activeTasks);

  const tasksByPriority = {
    0: sortedActiveTasks.filter((t) => t.priority === 0),
    1: sortedActiveTasks.filter((t) => t.priority === 1),
    2: sortedActiveTasks.filter((t) => t.priority === 2),
    3: sortedActiveTasks.filter((t) => t.priority === 3),
  };

  return (
    <motion.div
      className="flex flex-col gap-4 max-w-full"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="show"
    >
      <motion.div variants={cardSlide} className="flex flex-col gap-3">
        {/* Priority groups */}
        <div className="space-y-4">
          {sortOrder === 'priority' || sortOrder === 'dueDate' ? (
            ([0, 1, 2, 3] as const).map((p) => (
              <PriorityGroup
                key={p}
                priority={p}
                tasks={tasksByPriority[p]}
                isBulkMode={isBulkMode}
                selectedTaskIds={selectedTaskIds}
                onToggleSelection={onToggleSelection}
                onComplete={onComplete}
                onUncomplete={onUncomplete}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))
          ) : (
            <div className="space-y-1.5 pb-1">
              <AnimatePresence mode="popLayout">
                {sortedActiveTasks.map((task) => (
                  <TaskCard
                    key={task.taskId}
                    task={task}
                    isBulkMode={isBulkMode}
                    isSelected={selectedTaskIds.includes(task.taskId)}
                    onToggleSelection={onToggleSelection}
                    onComplete={onComplete}
                    onUncomplete={onUncomplete}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {activeTasks.length === 0 && completedTodayTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-dashed border-border/80 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CheckSquare size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">
                  Nenhuma tarefa encontrada
                </p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Tudo em dia! Crie uma nova tarefa ou ajuste os filtros.
                </p>
              </div>
              <button
                onClick={onNewTaskClick}
                className="h-10 rounded-xl bg-primary px-5 font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                Nova Tarefa
              </button>
            </div>
          )}
        </div>

        {/* Completed today */}
        {completedTodayTasks.length > 0 && (
          <CompletedTodaySection
            tasks={completedTodayTasks}
            isBulkMode={isBulkMode}
            selectedTaskIds={selectedTaskIds}
            onToggleSelection={onToggleSelection}
            onComplete={onComplete}
            onUncomplete={onUncomplete}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
