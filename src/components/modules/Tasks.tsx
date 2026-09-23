import { AnimatePresence, motion } from 'framer-motion';
import { CheckSquare,History } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { TaskFormPayload } from '@/components/modals/TaskFormModal';
import { TaskFormModal } from '@/components/modals/TaskFormModal';
import { TaskHistoryModal } from '@/components/modals/TaskHistoryModal';
import { TaskListSkeleton } from '@/components/skeletons';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { usePolling } from '@/hooks/usePolling';
import { cn } from '@/lib/utils';
import type { NestMember } from '@/schemas/nest';
import * as nestService from '@/services/nestService';
import * as taskService from '@/services/taskService';
import type { ApiCategory,Task } from '@/types';
import { TaskStatus } from '@/types';

import { KanbanBoard } from './tasks/KanbanBoard';
import { QuickAddTaskBar } from './tasks/QuickAddTaskBar';
import { TaskBulkActionsBar } from './tasks/TaskBulkActionsBar';
import { TaskFilterBar, TaskSortOrder,TaskStatusFilter } from './tasks/TaskFilterBar';
import { TaskListView } from './tasks/TaskListView';
import { TaskSideSummary } from './tasks/TaskSideSummary';

type ViewMode = 'list' | 'kanban';

function Tasks() {
  const { activeNestId } = useApp();
  const { showSuccess, showError } = useToastNotifications();

  // ── Data ───────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [members, setMembers] = useState<NestMember[]>([]);
  
  // Since we don't have server-side pagination for filtering yet, we load a large chunk or rely on the existing pagination if needed.
  // For the sake of this redesign following the Shopping List pattern (which loads all active lists), we will load active tasks.
  const loadTasks = useCallback(
    async (silent = false) => {
      if (!activeNestId) return;
      if (!silent) setTasksLoading(true);
      try {
        const res = await taskService.getActiveTasks(1, 500, activeNestId); // Fetch a large number to support client-side filtering
        setTasks(res.items);
      } catch {
        if (!silent) setTasks([]);
      } finally {
        if (!silent) setTasksLoading(false);
      }
    },
    [activeNestId]
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  usePolling(
    useCallback(() => loadTasks(true), [loadTasks]),
    { intervalMs: 10000, enabled: Boolean(activeNestId) }
  );

  useEffect(() => {
    if (!activeNestId) return;
    let active = true;
    nestService
      .getNestMembers(activeNestId)
      .then((m) => {
        if (active) setMembers(m);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [activeNestId]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialTaskTitle, setInitialTaskTitle] = useState('');

  // ── Filters & Bulk State ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<ApiCategory | null>(null);
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('dueDate');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // ── Derived metrics for Hero Summary ───────────────────────────────────────
  const pending = useMemo(() => tasks.filter((t) => !t.isCompleted), [tasks]);
  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter(
      (t) => t.isCompleted && t.completedAt && new Date(t.completedAt).toDateString() === today
    );
  }, [tasks]);
  const overdue = useMemo(() => tasks.filter((t) => t.isOverdue && !t.isCompleted), [tasks]);
  const urgentCount = useMemo(() => pending.filter(t => t.priority === 0).length, [pending]);
  const dueThisWeek = useMemo(() => {
    const limit = new Date();
    limit.setDate(limit.getDate() + 7);
    return pending.filter((t) => t.dueDate && new Date(t.dueDate) <= limit).length;
  }, [pending]);
  
  const totalActive = pending.length + completedToday.length;

  // ── Filter Data for View ───────────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter === 'pending') {
      result = result.filter(t => !t.isCompleted);
    } else if (statusFilter === 'in_progress') {
      result = result.filter(t => !t.isCompleted && t.status === TaskStatus.EmAndamento);
    } else if (statusFilter === 'overdue') {
      result = result.filter(t => t.isOverdue && !t.isCompleted);
    } else if (statusFilter === 'completed_today') {
      const today = new Date().toDateString();
      result = result.filter(t => t.isCompleted && t.completedAt && new Date(t.completedAt).toDateString() === today);
    }

    // Category filter
    if (categoryFilter !== null) {
      result = result.filter(t => t.category === categoryFilter);
    }

    return result;
  }, [tasks, searchQuery, statusFilter, categoryFilter]);

  // Categories in view
  const categoriesInView = useMemo(() => {
    const set = new Set(filteredTasks.map(t => t.category));
    return Array.from(set).sort();
  }, [filteredTasks]);

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
      } catch {
        showError('Erro ao concluir');
      }
    },
    [activeNestId, showError]
  );

  const handleUncomplete = useCallback(
    async (taskId: string) => {
      try {
        const updated = await taskService.uncompleteTask(taskId, activeNestId ?? undefined);
        setTasks((prev) =>
          prev.map((t) => (t.taskId === taskId ? { ...updated, status: TaskStatus.AFazer } : t))
        );
      } catch {
        showError('Erro ao reabrir tarefa');
      }
    },
    [activeNestId, showError]
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

  const openNewTask = useCallback(() => {
    setEditingTask(null);
    setInitialTaskTitle('');
    setModalOpen(true);
  }, []);

  // ── Bulk Actions ───────────────────────────────────────────────────────────
  const toggleSelection = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBulkComplete = async () => {
    for (const id of selectedTaskIds) {
      await handleComplete(id);
    }
    showSuccess(`${selectedTaskIds.length} tarefas concluídas!`);
    setSelectedTaskIds([]);
    setIsBulkMode(false);
  };

  const handleBulkReopen = async () => {
    for (const id of selectedTaskIds) {
      await handleUncomplete(id);
    }
    showSuccess(`${selectedTaskIds.length} tarefas reabertas!`);
    setSelectedTaskIds([]);
    setIsBulkMode(false);
  };

  const handleBulkDelete = async () => {
    const snaps = tasks.filter(t => selectedTaskIds.includes(t.taskId));
    for (const snap of snaps) {
      await taskService.deleteTask(snap.taskId, activeNestId ?? undefined).catch(() => {});
    }
    setTasks(prev => prev.filter(t => !selectedTaskIds.includes(t.taskId)));
    showSuccess(`${selectedTaskIds.length} tarefas excluídas!`);
    setSelectedTaskIds([]);
    setIsBulkMode(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      key="tasks-module"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="max-w-5xl mx-auto space-y-6 pb-28 px-1 sm:px-4"
    >
      {/* ── App Bar / Header Mobile ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <CheckSquare size={14} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Módulo de Tarefas
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Quadro de Tarefas
          </h1>
        </div>

        {/* View Switcher and History */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-subtle transition-colors hover:bg-muted hover:text-foreground"
            title="Ver histórico de tarefas concluídas"
          >
            <History size={14} /> <span className="hidden sm:inline">Histórico</span>
          </button>

          <div className="flex overflow-hidden rounded-xl border border-border/70 bg-card p-0.5 shadow-subtle text-xs font-semibold">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-colors ${
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-colors ${
                viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout (Sidebar + Content) ────────────────────────── */}
      <div className={cn("items-start gap-6", viewMode === 'list' ? "grid grid-cols-1 lg:grid-cols-3" : "flex flex-col")}>
        {/* Sidebar */}
        {viewMode === 'list' && (
          <div className="order-1 flex w-full flex-col gap-4 lg:order-2 lg:col-span-1">
            <TaskSideSummary 
              totalActive={totalActive}
              completedToday={completedToday.length}
              overdue={overdue.length}
              totalPending={pending.length}
              urgentCount={urgentCount}
              weekCount={dueThisWeek}
            />
          </div>
        )}

        {/* Main Column */}
        <div className={cn("order-2 flex min-w-0 w-full flex-col gap-4 lg:order-1", viewMode === 'list' ? "lg:col-span-2" : "")}>
          {/* ── Task Filter Bar ────────────────────────────────────────── */}
          <TaskFilterBar
            isBulkMode={isBulkMode}
            selectedCount={selectedTaskIds.length}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categoriesInView={categoriesInView}
            searchTerm={searchQuery}
            setSearchTerm={setSearchQuery}
            isSearchPending={false}
            onExitBulkMode={() => { setIsBulkMode(false); setSelectedTaskIds([]); }}
            onEnterBulkMode={() => setIsBulkMode(true)}
          />

          {/* ── Quick Add Bar ──────────────────────────────────────────── */}
          <QuickAddTaskBar
            onAddTask={async (title, cat, pri) => {
              const newTask = await taskService.createQuickTask(title, activeNestId ?? undefined);
              if (cat !== null || pri !== null) {
                await taskService.updateTask(newTask.taskId, {
                  ...newTask,
                  category: cat ?? newTask.category,
                  priority: pri ?? newTask.priority
                }, activeNestId ?? undefined);
                setTasks(prev => [{
                  ...newTask,
                  category: cat ?? newTask.category,
                  priority: pri ?? newTask.priority
                }, ...prev]);
              } else {
                setTasks(prev => [newTask, ...prev]);
              }
              showSuccess('Tarefa criada!');
            }}
            onOpenDetailedForm={(title) => {
              setInitialTaskTitle(title || '');
              setEditingTask(null);
              setModalOpen(true);
            }}
          />

          {/* ── Main content ───────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {tasksLoading && tasks.length === 0 ? (
              <motion.div key="tasks-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TaskListSkeleton items={6} />
              </motion.div>
            ) : viewMode === 'list' ? (
              <motion.div key="list-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TaskListView
                  tasks={filteredTasks}
                  isBulkMode={isBulkMode}
                  selectedTaskIds={selectedTaskIds}
                  sortOrder={sortOrder}
                  onToggleSelection={toggleSelection}
                  onComplete={handleComplete}
                  onUncomplete={handleUncomplete}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onNewTaskClick={openNewTask}
                />
              </motion.div>
            ) : (
              <motion.div key="kanban-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <KanbanBoard
                  tasks={filteredTasks}
                  onMoveTask={async (taskId, newStatus) => {
                    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus, isCompleted: newStatus === TaskStatus.Concluido, completedAt: newStatus === TaskStatus.Concluido ? new Date().toISOString() : t.completedAt } : t));
                    if (newStatus === TaskStatus.Concluido) {
                      await taskService.completeTask(taskId, activeNestId ?? undefined).catch(() => {});
                    } else {
                      await taskService.uncompleteTask(taskId, activeNestId ?? undefined).catch(() => {});
                    }
                  }}
                  onReorderTasks={(reordered) => setTasks(reordered)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onInlineAdd={async (title, status) => {
                    const newTask = await taskService.createQuickTask(title, activeNestId ?? undefined);
                    setTasks(prev => [{ ...newTask, status }, ...prev]);
                    showSuccess('Tarefa criada!');
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <TaskBulkActionsBar
        isVisible={isBulkMode}
        selectedCount={selectedTaskIds.length}
        onClose={() => { setIsBulkMode(false); setSelectedTaskIds([]); }}
        onCompleteSelected={handleBulkComplete}
        onReopenSelected={handleBulkReopen}
        onDeleteSelected={handleBulkDelete}
      />

      {/* Form Modal */}
      <TaskFormModal
        open={modalOpen || editingTask !== null}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
          setInitialTaskTitle('');
        }}
        initialTask={editingTask}
        initialTitle={initialTaskTitle}
        members={members}
        onSubmit={handleModalSubmit}
      />

      {/* History Modal */}
      <TaskHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        nestId={activeNestId ?? undefined}
        members={members}
        onTaskUncompleted={(uncompletedTask) => {
          setTasks(prev => {
            const exists = prev.find(t => t.taskId === uncompletedTask.taskId);
            if (exists) return prev.map(t => t.taskId === uncompletedTask.taskId ? { ...uncompletedTask, status: TaskStatus.AFazer } : t);
            return [{ ...uncompletedTask, status: TaskStatus.AFazer }, ...prev];
          });
          showSuccess('Tarefa reaberta!');
        }}
      />
    </motion.div>
  );
}

Tasks.displayName = 'Tasks';
export default Tasks;
