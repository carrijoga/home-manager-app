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
  const col = KANBAN_COLUMNS.find(c => c.status === status)!;
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
    <div className="flex flex-col min-w-[280px] w-[280px] lg:min-w-0 lg:w-auto lg:flex-1">
      {/* Column header */}
      <div className={`px-4 py-3 rounded-t-2xl flex items-center justify-between ${col.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`font-ui text-sm font-bold ${col.color}`}>{col.label}</span>
          <span className="font-ui text-xs font-semibold px-2 py-0.5 rounded-full bg-background/60 text-foreground">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setInputActive(true)}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors"
          title="Adicionar tarefa"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Column body */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-2xl border border-t-0 border-border p-2 space-y-2 min-h-[200px] transition-colors ${
          isOver ? 'bg-primary/5' : 'bg-muted/20'
        }`}
      >
        {/* Inline add input */}
        {inputActive && (
          <div className="p-2 rounded-xl border border-border bg-card">
            <input
              autoFocus
              type="text"
              value={addValue}
              onChange={e => setAddValue(e.target.value)}
              onKeyDown={async e => {
                if (e.key === 'Enter') await handleAdd();
                if (e.key === 'Escape') { setAddValue(''); setInputActive(false); }
              }}
              placeholder="Nome da tarefa..."
              maxLength={200}
              className="w-full font-ui text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAdd}
                disabled={adding || !addValue.trim()}
                className="font-ui text-xs font-semibold px-3 py-1 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 transition-colors"
              >
                Adicionar
              </button>
              <button
                onClick={() => { setAddValue(''); setInputActive(false); }}
                className="font-ui text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <SortableContext items={tasks.map(t => t.taskId)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanCard key={task.taskId} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !inputActive && (
          <p className="text-center font-ui text-xs text-muted-foreground py-6">
            Sem tarefas
          </p>
        )}
      </div>
    </div>
  );
}
