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
    <div className="flex w-[300px] min-w-[280px] sm:w-[320px] flex-col flex-1 shrink-0">
      {/* Column header */}
      <div className={`flex items-center justify-between rounded-t-2xl px-4 py-3 ${col.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
          <span className="inline-flex h-5 items-center justify-center rounded-full bg-background/60 px-2 text-xs font-semibold text-foreground">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setInputActive(true)}
          className="rounded-lg p-1.5 text-muted-foreground/80 transition-colors hover:bg-background/60 hover:text-foreground"
          title="Adicionar tarefa"
        >
          <Plus size={15} strokeWidth={2.5} />
        </button>
      </div>

      {/* Column body */}
      <div
        ref={setNodeRef}
        className={`min-h-[200px] flex-1 space-y-3 rounded-b-2xl border border-t-0 border-border p-3 transition-colors ${
          isOver ? 'bg-primary/5' : 'bg-muted/30'
        }`}
      >
        {/* Inline add input */}
        {inputActive && (
          <div className="rounded-xl border border-border/80 bg-card p-3 shadow-sm animate-in fade-in zoom-in-95">
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
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setAddValue('');
                  setInputActive(false);
                }}
                className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground px-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={adding || !addValue.trim()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                Adicionar
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
          <div className="flex flex-col items-center justify-center py-8 opacity-60">
            <p className="text-xs font-medium text-muted-foreground">Arraste tarefas para cá</p>
          </div>
        )}
      </div>
    </div>
  );
}
