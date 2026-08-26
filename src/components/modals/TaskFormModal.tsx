import { useEffect, useMemo, useState } from 'react';

import { CATEGORIES, PRIORITIES } from '@/components/modules/tasks/constants';
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
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import type { NestMember } from '@/schemas/nest';
import type { Task } from '@/types';
import { TaskStatus } from '@/types';

export interface TaskFormPayload {
  title: string;
  description: string | null;
  details: string | null;
  assignedTo: string | null;
  dueDate: string | null;
  priority: number;
  category: number;
  status: TaskStatus;
}

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  initialTask?: Task | null;
  members?: NestMember[];
  onSubmit: (payload: TaskFormPayload) => Promise<void>;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  details: '',
  assignedTo: 'none',
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

export function TaskFormModal({
  open,
  onClose,
  initialTask,
  members = [],
  onSubmit,
}: TaskFormModalProps) {
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
        details: initialTask.details ?? '',
        assignedTo: initialTask.assignedTo ?? 'none',
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
        details: form.details || null,
        assignedTo: form.assignedTo && form.assignedTo !== 'none' ? form.assignedTo : null,
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
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Título <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="Nome da tarefa..."
              value={form.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              maxLength={200}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Prioridade</label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Categoria</label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Data limite</label>
              <DatePicker
                value={form.dueDate}
                onChange={(date) => setForm((f) => ({ ...f, dueDate: date }))}
                fromDate={today}
                placeholder="Sem data"
              />
            </div>
          </div>

          {members.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Atribuído a (Responsável)
              </label>
              <Select
                value={form.assignedTo}
                onValueChange={(v) => setForm((f) => ({ ...f, assignedTo: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um membro..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (Sem responsável)</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Descrição</label>
            <Textarea
              placeholder="Resumo ou descrição simples..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Detalhes adicionais
            </label>
            <Textarea
              placeholder="Instruções ou notas detalhadas sobre a tarefa..."
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : initialTask ? 'Salvar alterações' : 'Criar tarefa'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
