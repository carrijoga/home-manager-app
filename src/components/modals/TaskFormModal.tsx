import { useEffect, useMemo, useState } from 'react';

import Input from '@/components/common/Input';
import {
  DatePicker,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { CATEGORIES, PRIORITIES } from '@/components/modules/tasks/constants';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import type { Task } from '@/types';
import { TaskStatus } from '@/types';

interface TaskFormPayload {
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: number;
  category: number;
  status: TaskStatus;
}

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  initialTask?: Task | null;
  onSubmit: (payload: TaskFormPayload) => Promise<void>;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  dueDate: undefined as Date | undefined,
  priority: '3',
  category: '0',
  status: String(TaskStatus.AFazer),
};

const STATUS_OPTIONS = [
  { value: String(TaskStatus.AFazer), label: 'A Fazer' },
  { value: String(TaskStatus.EmAndamento), label: 'Em Andamento' },
  { value: String(TaskStatus.Concluido), label: 'Concluído' },
];

export function TaskFormModal({ open, onClose, initialTask, onSubmit }: TaskFormModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const { showError } = useToastNotifications();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    if (!open) return;
    if (initialTask) {
      const inferredStatus = initialTask.isCompleted
        ? TaskStatus.Concluido
        : (initialTask.status ?? TaskStatus.AFazer);
      setForm({
        title: initialTask.title ?? '',
        description: initialTask.description ?? '',
        dueDate: initialTask.dueDate ? new Date(initialTask.dueDate) : undefined,
        priority: String(initialTask.priority ?? 3),
        category: String(initialTask.category ?? 0),
        status: String(inferredStatus),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, initialTask]);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showError('Digite um título para a tarefa');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description || null,
        dueDate: form.dueDate ? form.dueDate.toISOString() : null,
        priority: Number(form.priority),
        category: Number(form.category),
        status: Number(form.status) as TaskStatus,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Título <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Nome da tarefa..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Prioridade</label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Categoria</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Status</label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Data limite</label>
              <DatePicker
                value={form.dueDate}
                onChange={date => setForm(f => ({ ...f, dueDate: date }))}
                fromDate={today}
                placeholder="Sem data"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Descrição</label>
            <Textarea
              placeholder="Detalhes da tarefa..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-lg transition-colors"
            >
              {loading ? 'Salvando...' : (initialTask ? 'Salvar alterações' : 'Criar tarefa')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
