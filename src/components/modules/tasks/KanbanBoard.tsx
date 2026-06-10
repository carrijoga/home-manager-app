import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
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
  tasks, onMoveTask, onReorderTasks, onEdit, onDelete, onNewTask, onSwitchToList, onInlineAdd,
}: KanbanBoardProps) {
  const [search, setSearch] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const tasksByStatus = useMemo(() => {
    const filtered = search.trim()
      ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
      : tasks;
    return {
      [TaskStatus.AFazer]: filtered.filter(t => !t.isCompleted && (t.status ?? TaskStatus.AFazer) === TaskStatus.AFazer),
      [TaskStatus.EmAndamento]: filtered.filter(t => !t.isCompleted && t.status === TaskStatus.EmAndamento),
      [TaskStatus.Concluido]: filtered.filter(t => t.isCompleted || t.status === TaskStatus.Concluido),
    };
  }, [tasks, search]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find(t => t.taskId === String(event.active.id));
    setActiveTask(task ?? null);
  }, [tasks]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
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
        if ((colTasks as Task[]).some(t => t.taskId === overId)) {
          targetStatus = Number(status) as TaskStatus;
          break;
        }
      }
    }

    if (targetStatus === null) return;

    const sourceTask = tasks.find(t => t.taskId === activeId);
    if (!sourceTask) return;

    const currentStatus = sourceTask.isCompleted
      ? TaskStatus.Concluido
      : (sourceTask.status ?? TaskStatus.AFazer);

    if (currentStatus !== targetStatus) {
      await onMoveTask(activeId, targetStatus);
    } else if (activeId !== overId) {
      const colTasks = tasksByStatus[targetStatus] as Task[];
      const oldIndex = tasks.findIndex(t => t.taskId === activeId);
      const newIndex = tasks.findIndex(t => t.taskId === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderTasks(arrayMove(tasks, oldIndex, newIndex));
      }
    }
  }, [tasks, tasksByStatus, onMoveTask, onReorderTasks]);

  return (
    <div className="flex flex-col h-full">
      {/* Minimal sticky header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-background border-b border-border">
        <span className="font-editorial font-bold text-foreground text-lg mr-2 shrink-0">Quadro de Tarefas</span>

        <div className="relative flex-1 max-w-xs">
          <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full font-ui text-sm bg-card border border-border rounded-full pl-8 pr-4 py-1.5 text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className="flex rounded-lg border border-border overflow-hidden font-ui text-sm">
            <button
              onClick={onSwitchToList}
              className="px-3 py-1.5 flex items-center gap-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <List size={14} /> <span className="hidden sm:inline">Lista</span>
            </button>
            <button className="px-3 py-1.5 flex items-center gap-1.5 bg-primary text-primary-foreground">
              <KanbanSquare size={14} /> <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>

          <button
            onClick={onNewTask}
            className="hidden sm:inline-flex items-center gap-2 font-ui text-sm font-semibold bg-primary text-primary-foreground rounded-full px-4 py-2 hover:brightness-105 active:scale-[0.98] transition-all"
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
          <div className="flex gap-4" style={{ minWidth: 'max-content', minHeight: 'calc(100vh - 120px)' }}>
            {KANBAN_COLUMNS.map(col => (
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
