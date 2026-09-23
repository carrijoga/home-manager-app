import { AnimatePresence, motion } from 'framer-motion';
import { CheckSquare,History } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { TaskFormPayload } from '@/components/modals/TaskFormModal';
import { TaskFormModal } from '@/components/modals/TaskFormModal';
import { TaskHistoryModal } from '@/components/modals/TaskHistoryModal';
import { TaskListSkeleton } from '@/components/skeletons';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useCategories } from '@/hooks/useCategories';
import { usePolling } from '@/hooks/usePolling';
import { buildCategoryChips, rootCategoryId } from '@/lib/taskCategories';
import { cn } from '@/lib/utils';
import { CategoryScope } from '@/schemas/category';
import type { NestMember } from '@/schemas/nest';
import * as nestService from '@/services/nestService';
import * as taskService from '@/services/taskService';
import type { Task } from '@/types';
import { TaskStatus } from '@/types';

import { KanbanBoard } from './tasks/KanbanBoard';
import { QuickAddTaskBar } from './tasks/QuickAddTaskBar';
import { TaskAssigneeActionsContext } from './tasks/TaskAssigneeActionsContext';
import { TaskBulkActionsBar } from './tasks/TaskBulkActionsBar';
import { TaskFilterBar, TaskSortOrder,TaskStatusFilter } from './tasks/TaskFilterBar';
import { TaskListView } from './tasks/TaskListView';
import { getMyPart, NOT_ASSIGNEE_HINT, partitionForMyPart, partProgressMessage, skippedMessage, toErrorMessage } from './tasks/taskParts';
import { TaskSideSummary } from './tasks/TaskSideSummary';
import { useTaskViewer } from './tasks/useTaskViewer';

type ViewMode = 'list' | 'kanban';

function Tasks() {
  const { activeNestId } = useApp();
  const { showSuccess, showError, showInfo } = useToastNotifications();
  const viewer = useTaskViewer();

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

  const { tree: taskCategoryTree } = useCategories(CategoryScope.Task);

  // ── Filters & Bulk State ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
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

    // Category filter (sempre pela categoria principal)
    if (categoryFilter !== null) {
      result = result.filter((t) => rootCategoryId(t.category) === categoryFilter);
    }

    return result;
  }, [tasks, searchQuery, statusFilter, categoryFilter]);

  // Categorias principais presentes nas tarefas visíveis
  const categoriesInView = useMemo(
    () => buildCategoryChips(filteredTasks.map((t) => t.category), taskCategoryTree),
    [filteredTasks, taskCategoryTree]
  );

  // ── Mutations ──────────────────────────────────────────────────────────────
  const restoreTask = useCallback((task: Task) => {
    setTasks((prev) => (prev.find((t) => t.taskId === task.taskId) ? prev : [task, ...prev]));
  }, []);

  /** Troca a tarefa pela versão relida; a coluna "Concluído" só vale se a tarefa inteira fechou. */
  const replaceTask = useCallback((updated: Task) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.taskId !== updated.taskId) return t;
        const status = updated.isCompleted
          ? TaskStatus.Concluido
          : t.status === TaskStatus.Concluido
            ? TaskStatus.AFazer
            : t.status;
        return { ...updated, status };
      })
    );
  }, []);

  /** Conclui/reabre a parte de `assigneeId` (ausente = minha parte). Devolve true em caso de sucesso. */
  const setPart = useCallback(
    async (taskId: string, done: boolean, assigneeId?: string, silent = false): Promise<boolean> => {
      const nestId = activeNestId ?? undefined;
      try {
        const updated = done
          ? await taskService.completeTask(taskId, nestId, assigneeId)
          : await taskService.uncompleteTask(taskId, nestId, assigneeId);
        replaceTask(updated);
        if (done && !silent && !assigneeId) {
          const progress = partProgressMessage(updated);
          if (progress) showSuccess(progress);
        }
        return true;
      } catch (err) {
        showError(toErrorMessage(err, done ? 'Erro ao concluir' : 'Erro ao reabrir tarefa'));
        return false;
      }
    },
    [activeNestId, replaceTask, showSuccess, showError]
  );

  const handleComplete = useCallback((taskId: string) => {
    void setPart(taskId, true);
  }, [setPart]);

  const handleUncomplete = useCallback((taskId: string) => {
    void setPart(taskId, false);
  }, [setPart]);

  const handleToggleAssignee = useCallback(
    (taskId: string, assigneeUserId: string, done: boolean) => {
      void setPart(taskId, done, assigneeUserId === viewer.userId ? undefined : assigneeUserId);
    },
    [setPart, viewer.userId]
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
      const { status, ...request } = payload;
      const nestId = activeNestId ?? undefined;
      try {
        const boardStatus = status === TaskStatus.Concluido ? TaskStatus.AFazer : status;
        let saved: Task;
        if (editingTask) {
          await taskService.updateTask(editingTask.taskId, request, nestId);
          saved = await taskService.getTaskById(editingTask.taskId, nestId);
          const current = saved;
          setTasks((prev) =>
            prev.map((t) =>
              t.taskId === current.taskId
                ? { ...current, status: current.isCompleted ? TaskStatus.Concluido : boardStatus }
                : t
            )
          );
          showSuccess('Tarefa atualizada!');
        } else {
          saved = await taskService.createTask(request, nestId);
          const current = saved;
          setTasks((prev) => [
            { ...current, status: current.isCompleted ? TaskStatus.Concluido : boardStatus },
            ...prev,
          ]);
          showSuccess('Tarefa criada!');
        }
        // "Concluído" no formulário segue a regra do checkbox: conclui a minha parte.
        const myPart = getMyPart(saved, viewer.userId);
        if (status === TaskStatus.Concluido && !saved.isCompleted && myPart && !myPart.isCompleted) {
          await setPart(saved.taskId, true);
        }
      } catch (err) {
        showError(toErrorMessage(err, 'Erro ao salvar tarefa'));
        throw err;
      }
    },
    [editingTask, activeNestId, viewer.userId, setPart, showSuccess, showError]
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

  const runBulkMyPart = async (done: boolean) => {
    const selected = tasks.filter((t) => selectedTaskIds.includes(t.taskId));
    const { actionable, notAssignee } = partitionForMyPart(selected, viewer.userId, done);
    let ok = 0;
    for (const t of actionable) {
      if (await setPart(t.taskId, done, undefined, true)) ok++;
    }
    if (ok > 0) {
      const noun = ok === 1 ? 'tarefa' : 'tarefas';
      showSuccess(
        done ? `Sua parte foi concluída em ${ok} ${noun}.` : `Sua parte foi reaberta em ${ok} ${noun}.`
      );
    }
    if (notAssignee > 0) showInfo(skippedMessage(notAssignee));
    setSelectedTaskIds([]);
    setIsBulkMode(false);
  };

  const handleBulkComplete = () => runBulkMyPart(true);
  const handleBulkReopen = () => runBulkMyPart(false);

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
    <TaskAssigneeActionsContext.Provider value={handleToggleAssignee}>
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
            onAddTask={async (title, _detectedCategory, pri) => {
              const nestId = activeNestId ?? undefined;
              let created = await taskService.createQuickTask(title, nestId);
              if (pri !== null) {
                await taskService.updateTask(
                  created.taskId,
                  taskService.taskToUpdateRequest(created, { priority: pri }),
                  nestId
                );
                created = await taskService.getTaskById(created.taskId, nestId);
              }
              setTasks((prev) => [created, ...prev]);
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
                    const task = tasks.find((t) => t.taskId === taskId);
                    if (!task) return;
                    const touchesCompletion = newStatus === TaskStatus.Concluido || task.isCompleted;
                    if (!touchesCompletion) {
                      setTasks((prev) =>
                        prev.map((t) => (t.taskId === taskId ? { ...t, status: newStatus } : t))
                      );
                      return;
                    }
                    if (!getMyPart(task, viewer.userId)) {
                      showInfo(`${NOT_ASSIGNEE_HINT}.`);
                      return;
                    }
                    if (newStatus === TaskStatus.Concluido) {
                      await setPart(taskId, true);
                    } else if (await setPart(taskId, false)) {
                      setTasks((prev) =>
                        prev.map((t) =>
                          t.taskId === taskId && !t.isCompleted ? { ...t, status: newStatus } : t
                        )
                      );
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
    </TaskAssigneeActionsContext.Provider>
  );
}

Tasks.displayName = 'Tasks';
export default Tasks;
