import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, History, KanbanSquare, List, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { TaskFormPayload } from '@/components/modals/TaskFormModal';
import { TaskFormModal } from '@/components/modals/TaskFormModal';
import { TaskHistoryModal } from '@/components/modals/TaskHistoryModal';
import { Button } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { NestMember } from '@/schemas/nest';
import * as nestService from '@/services/nestService';
import * as taskService from '@/services/taskService';
import type { Task } from '@/types';
import { TaskStatus } from '@/types';

import { KanbanBoard } from './tasks/KanbanBoard';
import { TaskListView } from './tasks/TaskListView';

type ViewMode = 'list' | 'kanban';

function Tasks() {
  const { activeNestId } = useApp();
  const { showSuccess, showError } = useToastNotifications();
  const prefersReducedMotion = usePrefersReducedMotion();

  // ── Data ───────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [members, setMembers] = useState<NestMember[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const loadTasks = useCallback(
    async (targetPage: number) => {
      if (!activeNestId) return;
      setTasksLoading(true);
      try {
        const res = await taskService.getActiveTasks(targetPage, pageSize, activeNestId);
        setTasks(res.items);
        setTotalCount(res.totalCount);
        setPage(res.page);
      } catch {
        setTasks([]);
        setTotalCount(0);
      } finally {
        setTasksLoading(false);
      }
    },
    [activeNestId, pageSize]
  );

  useEffect(() => {
    loadTasks(page);
  }, [loadTasks, page]);

  useEffect(() => {
    if (!activeNestId) return;
    let active = true;
    nestService
      .getNestMembers(activeNestId)
      .then((m) => {
        if (active) setMembers(m);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [activeNestId]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);

  // ── Derived metrics for rich header ────────────────────────────────────────
  const pending = useMemo(() => tasks.filter((t) => !t.isCompleted), [tasks]);
  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter(
      (t) => t.isCompleted && t.completedAt && new Date(t.completedAt).toDateString() === today
    );
  }, [tasks]);
  const overdue = useMemo(() => tasks.filter((t) => t.isOverdue && !t.isCompleted), [tasks]);
  const total = pending.length + completedToday.length;
  const progressPct = total > 0 ? Math.round((completedToday.length / total) * 100) : 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // ── Mutations ──────────────────────────────────────────────────────────────
  const restoreTask = useCallback((task: Task) => {
    setTasks((prev) => (prev.find((t) => t.taskId === task.taskId) ? prev : [task, ...prev]));
  }, []);

  const handleComplete = useCallback(
    async (taskId: string) => {
      try {
        const updated = await taskService.completeTask(taskId, activeNestId ?? undefined);
        setTasks((prev) =>
          prev.map((t) => (t.taskId === taskId ? { ...updated, status: TaskStatus.Concluido } : t))
        );
        showSuccess('Tarefa concluída!');
      } catch {
        showError('Erro ao concluir');
      }
    },
    [activeNestId, showSuccess, showError]
  );

  const handleUncomplete = useCallback(
    async (taskId: string) => {
      try {
        const updated = await taskService.uncompleteTask(taskId, activeNestId ?? undefined);
        setTasks((prev) =>
          prev.map((t) => (t.taskId === taskId ? { ...updated, status: TaskStatus.AFazer } : t))
        );
        showSuccess('Tarefa reaberta.');
      } catch {
        showError('Erro ao reabrir tarefa');
      }
    },
    [activeNestId, showSuccess, showError]
  );

  const handleTaskUncompletedFromHistory = useCallback(
    (uncompletedTask: Task) => {
      setTasks((prev) => {
        const exists = prev.find((t) => t.taskId === uncompletedTask.taskId);
        if (exists) {
          return prev.map((t) =>
            t.taskId === uncompletedTask.taskId
              ? { ...uncompletedTask, status: TaskStatus.AFazer }
              : t
          );
        }
        return [{ ...uncompletedTask, status: TaskStatus.AFazer }, ...prev];
      });
      showSuccess('Tarefa reaberta!');
    },
    [showSuccess]
  );

  const handleDelete = useCallback(
    async (taskId: string, snap: Task) => {
      try {
        await taskService.deleteTask(taskId, activeNestId ?? undefined);
        setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
        let restored = false;
        showSuccess('Tarefa excluída', {
          duration: 5000,
          action: {
            label: 'Desfazer',
            onClick: () => {
              if (restored) return;
              restored = true;
              restoreTask(snap);
              showSuccess('Restaurada!');
            },
          },
        });
      } catch {
        showError('Erro ao excluir');
      }
    },
    [activeNestId, showSuccess, showError, restoreTask]
  );

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleModalSubmit = useCallback(
    async (payload: TaskFormPayload) => {
      if (editingTask) {
        await taskService.updateTask(editingTask.taskId, payload, activeNestId ?? undefined);
        setTasks((prev) =>
          prev.map((t) =>
            t.taskId === editingTask.taskId
              ? {
                  ...t,
                  ...payload,
                  status: payload.status,
                  isCompleted: payload.status === TaskStatus.Concluido,
                }
              : t
          )
        );
        showSuccess('Tarefa atualizada!');
      } else {
        const newTask = await taskService.createTask(payload, activeNestId ?? undefined);
        setTasks((prev) => [{ ...newTask, status: payload.status }, ...prev]);
        showSuccess('Tarefa criada!');
      }
    },
    [editingTask, activeNestId, showSuccess]
  );

  const handleInlineAdd = useCallback(
    async (title: string, priority: number) => {
      try {
        const newTask = await taskService.createQuickTask(title, activeNestId ?? undefined);
        setTasks((prev) => [{ ...newTask, priority: priority as Task['priority'] }, ...prev]);
        showSuccess('Tarefa criada!');
      } catch {
        showError('Erro ao criar tarefa');
      }
    },
    [activeNestId, showSuccess, showError]
  );

  const handleKanbanInlineAdd = useCallback(
    async (title: string, status: TaskStatus) => {
      try {
        const newTask = await taskService.createQuickTask(title, activeNestId ?? undefined);
        setTasks((prev) => [{ ...newTask, status }, ...prev]);
        showSuccess('Tarefa criada!');
      } catch {
        showError('Erro ao criar tarefa');
      }
    },
    [activeNestId, showSuccess, showError]
  );

  const handleMoveTask = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.taskId === taskId
            ? {
                ...t,
                status: newStatus,
                isCompleted: newStatus === TaskStatus.Concluido,
                completedAt:
                  newStatus === TaskStatus.Concluido ? new Date().toISOString() : t.completedAt,
              }
            : t
        )
      );
      if (newStatus === TaskStatus.Concluido) {
        await taskService.completeTask(taskId, activeNestId ?? undefined).catch(() => {});
      } else {
        await taskService.uncompleteTask(taskId, activeNestId ?? undefined).catch(() => {});
      }
    },
    [activeNestId]
  );

  const handleReorderTasks = useCallback((reordered: Task[]) => {
    setTasks(reordered);
  }, []);

  const handleUrgentClick = useCallback((taskId: string) => {
    setHighlightedTaskId(taskId);
    setTimeout(() => setHighlightedTaskId(null), 2000);
  }, []);

  const openNewTask = useCallback(() => {
    setEditingTask(null);
    setModalOpen(true);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex max-w-full flex-col gap-6 overflow-x-hidden">
      {/* Rich header — only in list mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' && (
          <motion.div
            key="list-header"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border bg-card p-5"
          >
            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="font-editorial text-2xl font-bold text-foreground">
                Quadro de Tarefas
              </h1>

              {/* Progress bar */}
              <div className="max-w-sm space-y-1.5">
                <div className="font-ui flex justify-between text-xs text-muted-foreground">
                  <span>
                    {completedToday.length} de {total} concluídas hoje
                  </span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                  />
                </div>
              </div>

              {/* Alert chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-ui inline-flex items-center gap-1 rounded-full bg-honey-100 px-2 py-0.5 text-xs font-medium text-honey-700 dark:bg-honey-900/30 dark:text-honey-300">
                  <List size={11} /> {pending.length} pendentes
                </span>
                {overdue.length > 0 && (
                  <span className="font-ui inline-flex items-center gap-1 rounded-full bg-terracotta-100 px-2 py-0.5 text-xs font-medium text-terracotta-700 dark:bg-terracotta-900/30 dark:text-terracotta-300">
                    <AlertCircle size={11} /> {overdue.length} atrasada
                    {overdue.length > 1 ? 's' : ''}
                  </span>
                )}
                {completedToday.length > 0 && (
                  <span className="font-ui inline-flex items-center gap-1 rounded-full bg-sage-100 px-2 py-0.5 text-xs font-medium text-sage-700 dark:bg-sage-900/30 dark:text-sage-300">
                    <CheckCircle2 size={11} /> {completedToday.length} hoje
                  </span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setHistoryOpen(true)}
                className="font-ui flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Ver histórico de tarefas concluídas"
              >
                <History size={14} /> <span className="hidden sm:inline">Histórico</span>
              </button>

              <div className="font-ui flex overflow-hidden rounded-lg border border-border text-sm">
                <button
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-1.5 bg-primary px-3 py-1.5 text-primary-foreground"
                >
                  <List size={14} /> <span className="hidden sm:inline">Lista</span>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <KanbanSquare size={14} /> <span className="hidden sm:inline">Kanban</span>
                </button>
              </div>
              <button
                onClick={openNewTask}
                className="font-ui hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-105 active:scale-[0.98] sm:inline-flex"
              >
                <Plus size={16} strokeWidth={2} /> Nova Tarefa
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list-view"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TaskListView
              tasks={tasks}
              onComplete={handleComplete}
              onUncomplete={handleUncomplete}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onInlineAdd={handleInlineAdd}
              onUrgentClick={handleUrgentClick}
              highlightedTaskId={highlightedTaskId}
            />
          </motion.div>
        ) : (
          <motion.div
            key="kanban-view"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="-mx-4 -mb-4 sm:-mx-6 sm:-mb-6 lg:-mx-8 lg:-mb-8"
          >
            <KanbanBoard
              tasks={tasks}
              onMoveTask={handleMoveTask}
              onReorderTasks={handleReorderTasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onNewTask={openNewTask}
              onSwitchToList={() => setViewMode('list')}
              onInlineAdd={handleKanbanInlineAdd}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
          <span className="font-ui text-xs text-muted-foreground">
            Página {page} de {totalPages} ({totalCount} {totalCount === 1 ? 'tarefa' : 'tarefas'})
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || tasksLoading}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || tasksLoading}
            >
              Próxima <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* FAB mobile */}
      <button
        type="button"
        aria-label="Nova tarefa"
        onClick={openNewTask}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 sm:hidden"
      >
        <Plus size={24} strokeWidth={2} />
      </button>

      {/* Form Modal */}
      <TaskFormModal
        open={modalOpen || editingTask !== null}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        initialTask={editingTask}
        members={members}
        onSubmit={handleModalSubmit}
      />

      {/* History Modal */}
      <TaskHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        nestId={activeNestId ?? undefined}
        members={members}
        onTaskUncompleted={handleTaskUncompletedFromHistory}
      />
    </div>
  );
}

Tasks.displayName = 'Tasks';
export default Tasks;
