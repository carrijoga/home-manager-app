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
  onInlineAdd: (title: string, status: TaskStatus) => Promise<void>;
}

export function KanbanBoard({
  tasks,
  onMoveTask,
  onReorderTasks,
  onEdit,
  onDelete,
  onInlineAdd,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const tasksByStatus = useMemo(() => {
    return {
      [TaskStatus.AFazer]: tasks.filter(
        (t) => !t.isCompleted && (t.status ?? TaskStatus.AFazer) === TaskStatus.AFazer
      ),
      [TaskStatus.EmAndamento]: tasks.filter(
        (t) => !t.isCompleted && t.status === TaskStatus.EmAndamento
      ),
      [TaskStatus.Concluido]: tasks.filter((t) => {
        const isComp = t.isCompleted || t.status === TaskStatus.Concluido;
        if (!isComp) return false;
        if (!t.completedAt) return true;
        return new Date(t.completedAt).toDateString() === new Date().toDateString();
      }),
    };
  }, [tasks]);

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
    <div className="flex-1 overflow-x-auto p-3 sm:p-4 pb-6 w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="flex gap-4 min-w-full w-max pb-2 pr-4"
          style={{ minHeight: 'calc(100vh - 280px)' }}
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
  );
}
