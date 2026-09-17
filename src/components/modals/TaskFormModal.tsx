import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { CATEGORIES, PRIORITIES } from '@/components/modules/tasks/constants';
import {
  Button,
  DatePicker,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
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
  initialTitle?: string;
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
  initialTitle,
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
      setForm({
        ...EMPTY_FORM,
        title: initialTitle ?? '',
      });
    }
  }, [open, initialTask, initialTitle]);

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
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        hideBuiltinClose
        className="flex max-h-[92dvh] flex-col rounded-t-3xl border-t border-border bg-card p-0 sm:max-w-lg sm:mx-auto sm:rounded-3xl sm:border dark:bg-[#181818]"
      >
        <SheetHeader className="border-b border-border/40 px-6 py-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-bold text-foreground">
                {initialTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground pt-0.5">
                {initialTask
                  ? 'Atualize as informações e o status desta tarefa.'
                  : 'Preencha os dados para criar uma nova tarefa.'}
              </SheetDescription>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground shrink-0"
              aria-label="Fechar"
            >
              <X className="size-4" />
              <span className="sr-only">Fechar</span>
            </button>
          </div>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="task-title"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-title"
                type="text"
                placeholder="Ex: Pagar conta de luz, Comprar ração..."
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                maxLength={200}
                required
                autoFocus
                className="h-12 rounded-2xl bg-muted/30 px-4 text-base font-medium shadow-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prioridade
                </Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-muted/30 px-4 text-base border-border/40 focus:ring-2 focus:ring-primary">
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Categoria
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-muted/30 px-4 text-base border-border/40 focus:ring-2 focus:ring-primary">
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
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-muted/30 px-4 text-base border-border/40 focus:ring-2 focus:ring-primary">
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Data Limite
                </Label>
                <DatePicker
                  value={form.dueDate}
                  onChange={(date) => setForm((f) => ({ ...f, dueDate: date }))}
                  fromDate={today}
                  placeholder="Sem data"
                  className="h-12 rounded-2xl bg-muted/30 px-4 text-base border-border/40 text-foreground"
                />
              </div>
            </div>

            {members.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Atribuído a (Responsável)
                </Label>
                <Select
                  value={form.assignedTo}
                  onValueChange={(v) => setForm((f) => ({ ...f, assignedTo: v }))}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-muted/30 px-4 text-base border-border/40 focus:ring-2 focus:ring-primary">
                    <SelectValue placeholder="Selecione um membro..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum membro atribuído</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {m.name || 'Membro'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="task-description"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Descrição <span className="text-[11px] font-normal lowercase">(opcional)</span>
              </Label>
              <Textarea
                id="task-description"
                placeholder="Resumo ou descrição simples..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="rounded-2xl bg-muted/30 p-3.5 text-base shadow-none border-border/40 focus-visible:ring-2 focus-visible:ring-primary resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="task-details"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Detalhes adicionais <span className="text-[11px] font-normal lowercase">(opcional)</span>
              </Label>
              <Textarea
                id="task-details"
                placeholder="Instruções ou notas detalhadas sobre a tarefa..."
                value={form.details}
                onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                rows={2}
                className="rounded-2xl bg-muted/30 p-3.5 text-base shadow-none border-border/40 focus-visible:ring-2 focus-visible:ring-primary resize-none"
              />
            </div>
          </div>

          <div className="border-t border-border/40 bg-card p-4 pb-6 dark:bg-[#181818]">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !form.title.trim()}
                className="h-12 flex-[2] rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Salvando...
                  </span>
                ) : initialTask ? (
                  'Salvar alterações'
                ) : (
                  'Criar tarefa'
                )}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

