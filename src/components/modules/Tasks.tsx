import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, KanbanSquare, List, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { TaskFormModal } from '@/components/modals/TaskFormModal';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
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

  // â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [tasks, setTasks] = useState<Task[]>([]);
  const [, setTasksLoading] = useState(true);

  useEffect(() => {
    if (!activeNestId) return;
    let active = true;
    setTasksLoading(true);
    taskService.getActiveTasks(activeNestId)
      .then(data => { if (active) setTasks(data); })
      .catch(() => {})
      .finally(() => { if (active) setTasksLoading(false); });
    return () => { active = false; };
  }, [activeNestId]);

  // â”€â”€ UI state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);

  // â”€â”€ Derived metrics for rich header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const pending = useMemo(() => tasks.filter(t => !t.isCompleted), [tasks]);
  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter(t => t.isCompleted && t.completedAt && new Date(t.completedAt).toDateString() === today);
  }, [tasks]);
  const overdue = useMemo(() => tasks.filter(t => t.isOverdue && !t.isCompleted), [tasks]);
  const total = pending.length + completedToday.length;
  const progressPct = total > 0 ? Math.round((completedToday.length / total) * 100) : 0;

  // â”€â”€ Mutations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const restoreTask = useCallback((task: Task) => {
    setTasks(prev => prev.find(t => t.taskId === task.taskId) ? prev : [task, ...prev]);
  }, []);

  const handleComplete = useCallback(async (taskId: string) => {
    try {
      const updated = await taskService.completeTask(taskId, activeNestId ?? undefined);
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...updated, status: TaskStatus.Concluido } : t));
      showSuccess('Tarefa concluÃ­da!');
    } catch { showError('Erro ao concluir'); }
  }, [activeNestId, showSuccess, showError]);

  const handleUncomplete = useCallback(async (taskId: string) => {
    try {
      const updated = await taskService.uncompleteTask(taskId, activeNestId ?? undefined);
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...updated, status: TaskStatus.AFazer } : t));
      showSuccess('Tarefa reaberta.');
    } catch { showError('Erro ao reabrir tarefa'); }
  }, [activeNestId, showSuccess, showError]);

  const handleDelete = useCallback(async (taskId: string, snap: Task) => {
    try {
      await taskService.deleteTask(taskId, activeNestId ?? undefined);
      setTasks(prev => prev.filter(t => t.taskId !== taskId));
      let restored = false;
      showSuccess('Tarefa excluÃ­da', {
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
    } catch { showError('Erro ao excluir'); }
  }, [activeNestId, showSuccess, showError, restoreTask]);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleModalSubmit = useCallback(async (payload: {
    title: string;
    description: string | null;
    dueDate: string | null;
    priority: number;
    category: number;
    status: TaskStatus;
  }) => {
    if (editingTask) {
      await taskService.updateTask(editingTask.taskId, payload, activeNestId ?? undefined);
      setTasks(prev => prev.map(t =>
        t.taskId === editingTask.taskId
          ? { ...t, ...payload, status: payload.status, isCompleted: payload.status === TaskStatus.Concluido }
          : t
      ));
      showSuccess('Tarefa atualizada!');
    } else {
      const newTask = await taskService.createTask(payload, activeNestId ?? undefined);
      setTasks(prev => [{ ...newTask, status: payload.status }, ...prev]);
      showSuccess('Tarefa criada!');
    }
  }, [editingTask, activeNestId, showSuccess]);

  const handleInlineAdd = useCallback(async (title: string, priority: number) => {
    try {
      const newTask = await taskService.createQuickTask(title, activeNestId ?? undefined);
      setTasks(prev => [{ ...newTask, priority: priority as Task['priority'] }, ...prev]);
      showSuccess('Tarefa criada!');
    } catch { showError('Erro ao criar tarefa'); }
  }, [activeNestId, showSuccess, showError]);

  const handleKanbanInlineAdd = useCallback(async (title: string, status: TaskStatus) => {
    try {
      const newTask = await taskService.createQuickTask(title, activeNestId ?? undefined);
      setTasks(prev => [{ ...newTask, status }, ...prev]);
      showSuccess('Tarefa criada!');
    } catch { showError('Erro ao criar tarefa'); }
  }, [activeNestId, showSuccess, showError]);

  const handleMoveTask = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t =>
      t.taskId === taskId
        ? {
            ...t,
            status: newStatus,
            isCompleted: newStatus === TaskStatus.Concluido,
            completedAt: newStatus === TaskStatus.Concluido ? new Date().toISOString() : t.completedAt,
          }
        : t
    ));
    if (newStatus === TaskStatus.Concluido) {
      await taskService.completeTask(taskId, activeNestId ?? undefined).catch(() => {});
    } else {
      await taskService.uncompleteTask(taskId, activeNestId ?? undefined).catch(() => {});
    }
  }, [activeNestId]);

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

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="flex flex-col gap-6 max-w-full overflow-x-hidden">

      {/* Rich header â€” only in list mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' && (
          <motion.div
            key="list-header"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-wrap items-start justify-between gap-4 p-5 rounded-3xl bg-card border border-border"
          >
            <div className="flex-1 min-w-0 space-y-3">
              <h1 className="font-editorial font-bold text-foreground text-2xl">Quadro de Tarefas</h1>

              {/* Progress bar */}
              <div className="space-y-1.5 max-w-sm">
                <div className="flex justify-between font-ui text-xs text-muted-foreground">
                  <span>{completedToday.length} de {total} concluÃ­das hoje</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
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
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-ui text-xs font-medium bg-honey-100 text-honey-700 dark:bg-honey-900/30 dark:text-honey-300">
                  <List size={11} /> {pending.length} pendentes
                </span>
                {overdue.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-ui text-xs font-medium bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/30 dark:text-terracotta-300">
                    <AlertCircle size={11} /> {overdue.length} atrasada{overdue.length > 1 ? 's' : ''}
                  </span>
                )}
                {completedToday.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-ui text-xs font-medium bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300">
                    <CheckCircle2 size={11} /> {completedToday.length} hoje
                  </span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex rounded-lg border border-border overflow-hidden font-ui text-sm">
                <button
                  onClick={() => setViewMode('list')}
                  className="px-3 py-1.5 flex items-center gap-1.5 bg-primary text-primary-foreground"
                >
                  <List size={14} /> <span className="hidden sm:inline">Lista</span>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className="px-3 py-1.5 flex items-center gap-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <KanbanSquare size={14} /> <span className="hidden sm:inline">Kanban</span>
                </button>
              </div>
              <button
                onClick={openNewTask}
                className="hidden sm:inline-flex items-center gap-2 font-ui text-sm font-semibold bg-primary text-primary-foreground rounded-full px-4 py-2 hover:brightness-105 active:scale-[0.98] transition-all"
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

      {/* FAB mobile */}
      <button
        type="button"
        aria-label="Nova tarefa"
        onClick={openNewTask}
        className="sm:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <Plus size={24} strokeWidth={2} />
      </button>

      {/* Modal */}
      <TaskFormModal
        open={modalOpen || editingTask !== null}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        initialTask={editingTask}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}

Tasks.displayName = 'Tasks';
export default Tasks;
