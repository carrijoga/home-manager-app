import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import type { Task } from '@/types';
import { TaskStatus } from '@/types';

import { KANBAN_COLUMNS } from './constants';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, snap: Task) => void;
  onInlineAdd: (title: string, status: TaskStatus) => Promise<void>;
}

export function KanbanColumn({ status, tasks, onEdit, onDelete, onInlineAdd }: KanbanColumnProps) {
  const col = KANBAN_COLUMNS.find((c) => c.status === status)!;
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` });
  const [addValue, setAddValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [inputActive, setInputActive] = useState(false);

  const handleAdd = async () => {
    if (!addValue.trim() || adding) return;
    setAdding(true);
    try {
      await onInlineAdd(addValue.trim(), status);
      setAddValue('');
      setInputActive(false);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex w-[280px] min-w-[280px] flex-col lg:w-auto lg:min-w-0 lg:flex-1">
      {/* Column header */}
      <div className={`flex items-center justify-between rounded-t-2xl px-4 py-3 ${col.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`font-ui text-sm font-bold ${col.color}`}>{col.label}</span>
          <span className="font-ui rounded-full bg-background/60 px-2 py-0.5 text-xs font-semibold text-foreground">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setInputActive(true)}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
          title="Adicionar tarefa"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Column body */}
      <div
        ref={setNodeRef}
        className={`min-h-[200px] flex-1 space-y-2 rounded-b-2xl border border-t-0 border-border p-2 transition-colors ${
          isOver ? 'bg-primary/5' : 'bg-muted/20'
        }`}
      >
        {/* Inline add input */}
        {inputActive && (
          <div className="rounded-xl border border-border bg-card p-2">
            <input
              autoFocus
              type="text"
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') await handleAdd();
                if (e.key === 'Escape') {
                  setAddValue('');
                  setInputActive(false);
                }
              }}
              placeholder="Nome da tarefa..."
              maxLength={200}
              className="font-ui w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleAdd}
                disabled={adding || !addValue.trim()}
                className="font-ui rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-colors disabled:opacity-50"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setAddValue('');
                  setInputActive(false);
                }}
                className="font-ui text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <SortableContext items={tasks.map((t) => t.taskId)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.taskId} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !inputActive && (
          <p className="font-ui py-6 text-center text-xs text-muted-foreground">Sem tarefas</p>
        )}
      </div>
    </div>
  );
}
