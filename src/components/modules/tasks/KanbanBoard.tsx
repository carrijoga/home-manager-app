import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanSquare, List, Plus, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import type { Task } from '@/types';
import { TaskStatus } from '@/types';

import { KANBAN_COLUMNS } from './constants';
import { KanbanCard } from './KanbanCard';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onReorderTasks: (tasks: Task[]) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, snap: Task) => void;
  onNewTask: () => void;
  onSwitchToList: () => void;
  onInlineAdd: (title: string, status: TaskStatus) => Promise<void>;
}

export function KanbanBoard({
  tasks,
  onMoveTask,
  onReorderTasks,
  onEdit,
  onDelete,
  onNewTask,
  onSwitchToList,
  onInlineAdd,
}: KanbanBoardProps) {
  const [search, setSearch] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const tasksByStatus = useMemo(() => {
    const filtered = search.trim()
      ? tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
      : tasks;
    return {
      [TaskStatus.AFazer]: filtered.filter(
        (t) => !t.isCompleted && (t.status ?? TaskStatus.AFazer) === TaskStatus.AFazer
      ),
      [TaskStatus.EmAndamento]: filtered.filter(
        (t) => !t.isCompleted && t.status === TaskStatus.EmAndamento
      ),
      [TaskStatus.Concluido]: filtered.filter((t) => {
        const isComp = t.isCompleted || t.status === TaskStatus.Concluido;
        if (!isComp) return false;
        if (!t.completedAt) return true;
        return new Date(t.completedAt).toDateString() === new Date().toDateString();
      }),
    };
  }, [tasks, search]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.taskId === String(event.active.id));
      setActiveTask(task ?? null);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      let targetStatus: TaskStatus | null = null;
      if (overId.startsWith('column-')) {
        targetStatus = Number(overId.replace('column-', '')) as TaskStatus;
      } else {
        for (const [status, colTasks] of Object.entries(tasksByStatus)) {
          if ((colTasks as Task[]).some((t) => t.taskId === overId)) {
            targetStatus = Number(status) as TaskStatus;
            break;
          }
        }
      }

      if (targetStatus === null) return;

      const sourceTask = tasks.find((t) => t.taskId === activeId);
      if (!sourceTask) return;

      const currentStatus = sourceTask.isCompleted
        ? TaskStatus.Concluido
        : (sourceTask.status ?? TaskStatus.AFazer);

      if (currentStatus !== targetStatus) {
        await onMoveTask(activeId, targetStatus);
      } else if (activeId !== overId) {
        const oldIndex = tasks.findIndex((t) => t.taskId === activeId);
        const newIndex = tasks.findIndex((t) => t.taskId === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          onReorderTasks(arrayMove(tasks, oldIndex, newIndex));
        }
      }
    },
    [tasks, tasksByStatus, onMoveTask, onReorderTasks]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Minimal sticky header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <span className="font-editorial mr-2 shrink-0 text-lg font-bold text-foreground">
          Quadro de Tarefas
        </span>

        <div className="relative max-w-xs flex-1">
          <Search
            size={14}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="font-ui w-full rounded-full border border-border bg-card py-1.5 pl-8 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="font-ui flex overflow-hidden rounded-lg border border-border text-sm">
            <button
              onClick={onSwitchToList}
              className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <List size={14} /> <span className="hidden sm:inline">Lista</span>
            </button>
            <button className="flex items-center gap-1.5 bg-primary px-3 py-1.5 text-primary-foreground">
              <KanbanSquare size={14} /> <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>

          <button
            onClick={onNewTask}
            className="font-ui hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-105 active:scale-[0.98] sm:inline-flex"
          >
            <Plus size={16} strokeWidth={2} /> Nova Tarefa
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className="flex gap-4"
            style={{ minWidth: 'max-content', minHeight: 'calc(100vh - 120px)' }}
          >
            {KANBAN_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                tasks={tasksByStatus[col.status] as Task[]}
                onEdit={onEdit}
                onDelete={onDelete}
                onInlineAdd={onInlineAdd}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <KanbanCard task={activeTask} onEdit={onEdit} onDelete={onDelete} isDragOverlay />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
