import type { Variants } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { Task } from '@/types';

import { CATEGORIES, PRIORITY_CONFIG } from './constants';
import { TaskCard } from './TaskCard';
import { TaskInlineAdd } from './TaskInlineAdd';
import { TaskProgressCard } from './TaskProgressCard';
import { TaskUrgentCard } from './TaskUrgentCard';

const cardSlide: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] } },
};

interface TaskListViewProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onUncomplete: (taskId: string) => void;
  onDelete: (taskId: string, snap: Task) => void;
  onEdit: (task: Task) => void;
  onInlineAdd: (title: string, priority: number) => Promise<void>;
  onUrgentClick: (taskId: string) => void;
  highlightedTaskId: string | null;
}

function PriorityGroup({
  priority,
  tasks,
  onComplete,
  onUncomplete,
  onDelete,
  onEdit,
}: {
  priority: number;
  tasks: Task[];
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
  onComplete,
  onUncomplete,
  onDelete,
  onEdit,
}: {
  tasks: Task[];
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onDelete: (id: string, snap: Task) => void;
  onEdit: (task: Task) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-sage-200 dark:border-sage-800/40">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between bg-sage-50 px-4 py-2.5 transition-colors hover:bg-sage-100 dark:bg-sage-900/20 dark:hover:bg-sage-900/30"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-sage-600 dark:text-sage-400" />
          <span className="font-ui text-sm font-bold text-sage-700 dark:text-sage-300">
            Concluídas hoje
          </span>
          <span className="font-ui rounded-full bg-sage-100 px-1.5 py-0.5 text-xs font-semibold text-sage-700 dark:bg-sage-900/40 dark:text-sage-300">
            {tasks.length}
          </span>
        </div>
        {open ? (
          <ChevronUp size={15} className="text-sage-500" />
        ) : (
          <ChevronDown size={15} className="text-sage-500" />
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
  onComplete,
  onUncomplete,
  onDelete,
  onEdit,
  onInlineAdd,
  onUrgentClick,
}: TaskListViewProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [categoryFilter, setCategoryFilter] = useState('all');

  const pending = useMemo(() => tasks.filter((t) => !t.isCompleted), [tasks]);
  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter(
      (t) => t.isCompleted && t.completedAt && new Date(t.completedAt).toDateString() === today
    );
  }, [tasks]);
  const overdue = useMemo(() => tasks.filter((t) => t.isOverdue && !t.isCompleted), [tasks]);
  const urgentAndOverdue = useMemo(
    () =>
      tasks
        .filter((t) => !t.isCompleted && (t.priority === 0 || t.isOverdue))
        .sort((a, b) => a.priority - b.priority),
    [tasks]
  );
  const dueThisWeek = useMemo(() => {
    const limit = new Date();
    limit.setDate(limit.getDate() + 7);
    return tasks.filter((t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) <= limit).length;
  }, [tasks]);

  const tasksByPriority = useMemo(() => {
    const filtered =
      categoryFilter === 'all'
        ? pending
        : pending.filter((t) => String(t.category) === categoryFilter);
    const sortByDate = (a: Task, b: Task) =>
      new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime();
    return {
      0: filtered.filter((t) => t.priority === 0).sort(sortByDate),
      1: filtered.filter((t) => t.priority === 1).sort(sortByDate),
      2: filtered.filter((t) => t.priority === 2).sort(sortByDate),
      3: filtered.filter((t) => t.priority === 3).sort(sortByDate),
    };
  }, [pending, categoryFilter]);

  const totalFiltered = Object.values(tasksByPriority).reduce((s, arr) => s + arr.length, 0);

  return (
    <motion.div
      className="grid grid-cols-1 items-start gap-3 md:gap-6 lg:grid-cols-3"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="show"
    >
      {/* Sidebar */}
      <div className="order-1 flex flex-col gap-3 md:gap-6 lg:order-2 lg:col-span-1">
        <motion.div variants={cardSlide}>
          <TaskProgressCard
            pending={pending.length}
            completedToday={completedToday.length}
            overdue={overdue.length}
            dueThisWeek={dueThisWeek}
          />
        </motion.div>
        <motion.div variants={cardSlide}>
          <TaskUrgentCard tasks={urgentAndOverdue} onTaskClick={onUrgentClick} />
        </motion.div>
      </div>

      {/* Main column */}
      <motion.div
        variants={cardSlide}
        className="order-2 flex flex-col gap-3 lg:order-1 lg:col-span-2"
      >
        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: 'all', label: 'Todas' },
            ...CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
          ].map((cat) => {
            const count =
              cat.value === 'all'
                ? pending.length
                : pending.filter((t) => String(t.category) === cat.value).length;
            return (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`font-ui rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  categoryFilter === cat.value
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.label}
                {count > 0 && <span className="ml-1 opacity-60">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Inline add */}
        <TaskInlineAdd onAdd={onInlineAdd} />

        {/* Priority groups */}
        <div className="space-y-4">
          {([0, 1, 2, 3] as const).map((p) => (
            <PriorityGroup
              key={p}
              priority={p}
              tasks={tasksByPriority[p]}
              onComplete={onComplete}
              onUncomplete={onUncomplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}

          {totalFiltered === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-sage-200/60 bg-gradient-to-br from-sage-100 to-sage-50 dark:border-sage-800/30 dark:from-sage-900/30 dark:to-muted">
                <CheckCircle2 size={28} className="text-sage-500 dark:text-sage-400" />
              </div>
              <p className="font-ui text-base font-semibold text-foreground">Tudo em dia!</p>
              <p className="font-ui mt-1 text-sm">Nenhuma tarefa pendente nesta categoria.</p>
            </div>
          )}
        </div>

        {/* Completed today */}
        {completedToday.length > 0 && (
          <CompletedTodaySection
            tasks={completedToday}
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
