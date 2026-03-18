import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import * as taskService from '@/services/taskService';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  History,
  KanbanSquare,
  List,
  Plus,
  RotateCcw,
  Tag,
  Trash2,
} from 'lucide-react';
import { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import {
  Checkbox,
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
} from '../ui';

// ── Constantes ────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  0: {
    label: 'Urgente', dot: 'bg-terracotta-600',
    text: 'text-terracotta-700 dark:text-terracotta-300',
    dimText: 'text-terracotta-600 dark:text-terracotta-400',
    bg: 'bg-terracotta-50 dark:bg-terracotta-900/20',
    headerBg: 'bg-terracotta-100 dark:bg-terracotta-900/30',
    border: 'border-l-terracotta-600',
    pill: 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300',
  },
  1: {
    label: 'Alta', dot: 'bg-honey-500',
    text: 'text-honey-700 dark:text-honey-300',
    dimText: 'text-honey-600 dark:text-honey-400',
    bg: 'bg-honey-50 dark:bg-honey-900/20',
    headerBg: 'bg-honey-100 dark:bg-honey-900/30',
    border: 'border-l-honey-500',
    pill: 'bg-honey-100 text-honey-700 dark:bg-honey-900/40 dark:text-honey-300',
  },
  2: {
    label: 'Média', dot: 'bg-honey-300',
    text: 'text-honey-600 dark:text-honey-200',
    dimText: 'text-honey-500 dark:text-honey-300',
    bg: 'bg-linen-100 dark:bg-linen-900/20',
    headerBg: 'bg-linen-200 dark:bg-linen-900/30',
    border: 'border-l-honey-300',
    pill: 'bg-linen-200 text-honey-700 dark:bg-linen-900/30 dark:text-honey-200',
  },
  3: {
    label: 'Baixa', dot: 'bg-sage-400',
    text: 'text-sage-700 dark:text-sage-300',
    dimText: 'text-sage-600 dark:text-sage-400',
    bg: 'bg-sage-50 dark:bg-sage-900/20',
    headerBg: 'bg-sage-100 dark:bg-sage-900/30',
    border: 'border-l-sage-400',
    pill: 'bg-sage-100 text-sage-700 dark:bg-sage-900/40 dark:text-sage-300',
  },
};

const PRIORITIES = [
  { value: '0', label: 'Urgente' },
  { value: '1', label: 'Alta' },
  { value: '2', label: 'Média' },
  { value: '3', label: 'Baixa' },
];

const CATEGORIES = [
  { value: '0', label: 'Geral' },
  { value: '1', label: 'Limpeza' },
  { value: '2', label: 'Manutenção' },
  { value: '3', label: 'Finanças' },
  { value: '4', label: 'Outros' },
];

// ── TaskCard ──────────────────────────────────────────────────────────────────

// forwardRef necessário para AnimatePresence (Framer Motion PopChild)
const TaskCard = memo(forwardRef(function TaskCard(
  { task, onComplete, onUncomplete, onDelete, onEdit, compact = false },
  ref
) {
  const cfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG[3];
  const overdueDays = task.isOverdue && task.dueDate
    ? Math.max(1, Math.floor((Date.now() - new Date(task.dueDate).getTime()) / 86400000))
    : 0;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 340, damping: 32 }}
      className={`group relative flex items-start gap-3 px-3 py-2.5 rounded-lg border border-border border-l-4 ${cfg.border} ${
        task.isCompleted ? 'bg-muted/50 dark:bg-muted/30' : cfg.bg
      } transition-colors`}
    >
      {/* Checkbox */}
      <motion.div
        whileTap={{ scale: 0.82 }}
        transition={{ duration: 0.12, ease: [0.25, 1, 0.5, 1] }}
        className="mt-0.5 shrink-0"
      >
        <Checkbox
          checked={task.isCompleted}
          onCheckedChange={() => task.isCompleted ? onUncomplete?.(task.taskId) : onComplete(task.taskId)}
          className={task.isCompleted ? 'data-[state=checked]:bg-sage-400' : ''}
        />
      </motion.div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${compact ? 'line-clamp-2' : 'break-words'} ${
          task.isCompleted
            ? 'line-through text-muted-foreground'
            : 'text-foreground'
        }`}>
          {task.title}
        </p>

        {!compact && task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {task.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {/* Categoria */}
          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
            <Tag size={9} />
            {task.categoryLabel}
          </span>

          {/* Data */}
          {task.dueDate && (
            <span className={`inline-flex items-center gap-0.5 text-xs ${
              task.isOverdue && !task.isCompleted
                ? 'text-terracotta-600 dark:text-terracotta-400 font-medium'
                : 'text-muted-foreground'
            }`}>
              {task.isOverdue && !task.isCompleted
                ? <><AlertCircle size={9} /> {overdueDays}d atrasada</>
                : <><CalendarDays size={9} /> {new Date(task.dueDate).toLocaleDateString('pt-BR')}</>
              }
            </span>
          )}

          {/* Concluída em */}
          {task.isCompleted && task.completedAt && (
            <span className="inline-flex items-center gap-0.5 text-xs text-sage-500 dark:text-sage-400">
              <CheckCircle2 size={9} />
              {new Date(task.completedAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      {/* Ações — visíveis no hover (hover) ou sempre visíveis em touch */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 mt-0.5">
        {onEdit && !task.isCompleted && (
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded text-muted-foreground hover:text-terracotta-600 dark:hover:text-terracotta-400 hover:bg-terracotta-50 dark:hover:bg-terracotta-900/30 transition-colors"
            title="Editar"
          >
            <Edit2 size={13} />
          </button>
        )}
        {task.isCompleted && onUncomplete && (
          <button
            onClick={() => onUncomplete(task.taskId)}
            className="p-1 rounded text-muted-foreground hover:text-honey-600 hover:bg-honey-50 dark:hover:bg-honey-900/30 transition-colors"
            title="Reabrir"
          >
            <RotateCcw size={13} />
          </button>
        )}
        <button
          onClick={() => onDelete(task.taskId, task)}
          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Excluir"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}));

// ── PriorityGroup (List View) ─────────────────────────────────────────────────

const PriorityGroup = memo(({ priority, tasks, onComplete, onUncomplete, onDelete, onEdit }) => {
  const [open, setOpen] = useState(true);
  const cfg = PRIORITY_CONFIG[priority];

  if (tasks.length === 0) return null;

  return (
    <div className="rounded-xl border border-linen-200 dark:border-border overflow-hidden">
      {/* Header do grupo */}
      <button
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center justify-between px-4 py-2.5 ${cfg.headerBg} transition-colors`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
          <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${cfg.pill}`}>
            {tasks.length}
          </span>
        </div>
        {open ? <ChevronUp size={15} className={cfg.dimText} /> : <ChevronDown size={15} className={cfg.dimText} />}
      </button>

      <motion.div
        initial={false}
        animate={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
        style={{ display: 'grid' }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="p-2 space-y-1.5">
            <AnimatePresence mode="popLayout">
              {tasks.map(task => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onComplete={onComplete}
                  onUncomplete={onUncomplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
PriorityGroup.displayName = 'PriorityGroup';

// ── KanbanColumn ──────────────────────────────────────────────────────────────

const KanbanColumn = memo(({ priority, tasks, onComplete, onUncomplete, onDelete, onEdit }) => {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <div className="flex flex-col w-64 lg:w-auto flex-shrink-0 lg:flex-shrink lg:min-w-0">
      {/* Header */}
      <div className={`px-3 py-2 rounded-t-xl flex items-center justify-between ${cfg.headerBg}`}>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
        </div>
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${cfg.pill}`}>
          {tasks.length}
        </span>
      </div>
      {/* Body */}
      <div className={`flex-1 rounded-b-xl border border-t-0 border-border p-2 space-y-1.5 min-h-[100px] ${cfg.bg}`}>
        <AnimatePresence mode="popLayout">
          {tasks.map(task => (
            <TaskCard
              key={task.taskId}
              task={task}
              onComplete={onComplete}
              onUncomplete={onUncomplete}
              onDelete={onDelete}
              onEdit={onEdit}
              compact
            />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">
            Sem tarefas
          </p>
        )}
      </div>
    </div>
  );
});
KanbanColumn.displayName = 'KanbanColumn';

// ── HistoryItem ───────────────────────────────────────────────────────────────

const HistoryItem = memo(({ task }) => {
  const cfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG[3];
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border">
      <CheckCircle2 size={15} className="text-sage-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-through text-muted-foreground break-words line-clamp-2">{task.title}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.pill}`}>{task.priorityLabel}</span>
          <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">{task.categoryLabel}</span>
          {task.completedAt && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 size={9} />
              {new Date(task.completedAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
HistoryItem.displayName = 'HistoryItem';

// ── TaskFormDialog ────────────────────────────────────────────────────────────

const EMPTY_FORM = { title: '', description: '', details: '', dueDate: undefined, priority: '3', category: '0' };

const TaskFormDialog = memo(({ open, onOpenChange, onSubmit, initialTask, dialogTitle }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const { showError } = useToastNotifications();

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  useEffect(() => {
    if (!open) return;
    setForm(initialTask ? {
      title: initialTask.title ?? '',
      description: initialTask.description ?? '',
      details: initialTask.details ?? '',
      dueDate: initialTask.dueDate ? new Date(initialTask.dueDate) : undefined,
      priority: String(initialTask.priority ?? 3),
      category: String(initialTask.category ?? 0),
    } : EMPTY_FORM);
  }, [open, initialTask]);

  const handleSubmit = async () => {
    if (!form.title.trim()) { showError('Digite um título para a tarefa'); return; }
    setLoading(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description || null,
        details: form.details || null,
        dueDate: form.dueDate ? form.dueDate.toISOString() : null,
        priority: Number(form.priority),
        category: Number(form.category),
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle ?? 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* Título */}
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

          {/* Prioridade + Categoria (lado a lado) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Prioridade</label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data limite */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Data limite
            </label>
            <DatePicker
              value={form.dueDate}
              onChange={date => setForm(f => ({ ...f, dueDate: date }))}
              fromDate={today}
              placeholder="Sem data limite"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Descrição</label>
            <Textarea
              placeholder="Detalhes da tarefa..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Detalhes adicionais */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Informações extras</label>
            <Textarea
              placeholder="Observações, links, referências..."
              value={form.details}
              onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              onClick={() => onOpenChange(false)}
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
});
TaskFormDialog.displayName = 'TaskFormDialog';

// ── Página principal ──────────────────────────────────────────────────────────

function Tasks() {
  const { tasks, addTask, updateTask, createQuickTask, completeTask, uncompleteTask, restoreTask, deleteTask } = useApp();
  const { showSuccess, showError } = useToastNotifications();

  const [quickInput, setQuickInput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');  // 'all' | category string
  const [viewMode, setViewMode] = useState('list');

  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [history, setHistory] = useState({ items: [], totalCount: 0, page: 1, pageSize: 20 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const historyLoaded = useRef(false);

  const [completedExpanded, setCompletedExpanded] = useState(false);

  // Tarefas pendentes agrupadas por prioridade
  const tasksByPriority = useMemo(() => {
    const pending = tasks.filter(t => !t.isCompleted);
    return {
      0: pending.filter(t => t.priority === 0).sort((a, b) => new Date(a.dueDate ?? 0) - new Date(b.dueDate ?? 0)),
      1: pending.filter(t => t.priority === 1).sort((a, b) => new Date(a.dueDate ?? 0) - new Date(b.dueDate ?? 0)),
      2: pending.filter(t => t.priority === 2).sort((a, b) => new Date(a.dueDate ?? 0) - new Date(b.dueDate ?? 0)),
      3: pending.filter(t => t.priority === 3).sort((a, b) => new Date(a.dueDate ?? 0) - new Date(b.dueDate ?? 0)),
    };
  }, [tasks]);

  // Tarefas pendentes filtradas (para kanban, não usa filtro de categoria)
  const filteredByPriority = useMemo(() => {
    if (categoryFilter === 'all') return tasksByPriority;
    const cat = Number(categoryFilter);
    return {
      0: tasksByPriority[0].filter(t => t.category === cat),
      1: tasksByPriority[1].filter(t => t.category === cat),
      2: tasksByPriority[2].filter(t => t.category === cat),
      3: tasksByPriority[3].filter(t => t.category === cat),
    };
  }, [tasksByPriority, categoryFilter]);

  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return tasks
      .filter(t => t.isCompleted && t.completedAt && new Date(t.completedAt).toDateString() === today)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [tasks]);

  const pendingCount = useMemo(() => tasks.filter(t => !t.isCompleted).length, [tasks]);
  const overdueCount = useMemo(() => tasks.filter(t => t.isOverdue && !t.isCompleted).length, [tasks]);

  // Histórico — carrega na primeira abertura
  const handleToggleHistory = useCallback(() => {
    setShowHistory(prev => {
      if (!prev && !historyLoaded.current) {
        historyLoaded.current = true;
        setHistoryLoading(true);
        taskService.getTaskHistory(1, 20)
          .then(r => { setHistory(r); setHistoryPage(1); })
          .catch(() => showError('Erro ao carregar histórico'))
          .finally(() => setHistoryLoading(false));
      }
      return !prev;
    });
  }, [showError]);

  const loadHistoryPage = useCallback((page) => {
    setHistoryLoading(true);
    taskService.getTaskHistory(page, 20)
      .then(r => { setHistory(r); setHistoryPage(page); })
      .catch(() => showError('Erro ao carregar histórico'))
      .finally(() => setHistoryLoading(false));
  }, [showError]);

  const [quickLoading, setQuickLoading] = useState(false);

  const handleQuickCreate = useCallback(async (e) => {
    if (e.key !== 'Enter' || !quickInput.trim() || quickLoading) return;
    e.preventDefault();
    setQuickLoading(true);
    try {
      await createQuickTask(quickInput.trim());
      setQuickInput('');
      showSuccess('Tarefa criada!');
    } catch {
      showError('Erro ao criar tarefa');
    } finally {
      setQuickLoading(false);
    }
  }, [quickInput, quickLoading, createQuickTask, showSuccess, showError]);

  const handleAddTask = useCallback(async (payload) => {
    try { await addTask(payload); showSuccess('Tarefa criada!'); }
    catch { showError('Erro ao criar tarefa'); throw new Error('fail'); }
  }, [addTask, showSuccess, showError]);

  const handleUpdateTask = useCallback(async (payload) => {
    if (!editingTask) return;
    try { await updateTask(editingTask.taskId, payload); showSuccess('Tarefa atualizada!'); }
    catch { showError('Erro ao atualizar tarefa'); throw new Error('fail'); }
  }, [editingTask, updateTask, showSuccess, showError]);

  const handleComplete = useCallback(async (taskId) => {
    try { await completeTask(taskId); showSuccess('Tarefa concluída!'); }
    catch { showError('Erro ao concluir'); }
  }, [completeTask, showSuccess, showError]);

  const handleUncomplete = useCallback(async (taskId) => {
    try { await uncompleteTask(taskId); showSuccess('Tarefa reaberta.'); }
    catch { showError('Erro ao reabrir tarefa'); }
  }, [uncompleteTask, showSuccess, showError]);

  const handleDelete = useCallback(async (taskId, snap) => {
    try {
      await deleteTask(taskId);
      let restored = false;
      showSuccess('Tarefa excluída', {
        duration: 5000,
        action: {
          label: 'Desfazer',
          onClick: () => { if (restored) return; restored = true; restoreTask(snap); showSuccess('Restaurada!'); },
        },
      });
    } catch { showError('Erro ao excluir'); }
  }, [deleteTask, restoreTask, showSuccess, showError]);

  const handleEditOpen = useCallback((task) => { setEditingTask(task); }, []);

  const totalPending = Object.values(filteredByPriority).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="space-y-5">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap rounded-xl bg-gradient-to-r from-linen-400 to-linen-200 dark:from-muted dark:to-background border border-linen-200 dark:border-muted px-5 py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Quadro de Tarefas</h1>
          <p className="text-honey-700 dark:text-honey-300 text-sm mt-0.5 font-medium">Organize suas tarefas</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Stats chips */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-honey-100 text-honey-700 dark:bg-honey-900/30 dark:text-honey-300">
              <List size={11} /> {pendingCount} pendentes
            </span>
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/30 dark:text-terracotta-300">
                <AlertCircle size={11} /> {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}
              </span>
            )}
            {completedToday.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300">
                <CheckCircle2 size={11} /> {completedToday.length} hoje
              </span>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2">
          {/* Toggle Lista / Kanban */}
          <div className="flex rounded-lg border border-border overflow-hidden text-sm">
            {[
              { mode: 'list',   Icon: List,          label: 'Lista'  },
              { mode: 'kanban', Icon: KanbanSquare,  label: 'Kanban' },
            ].map(({ mode, Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  viewMode === mode
                    ? 'bg-primary text-primary-foreground dark:bg-honey-900/30 dark:text-honey-300'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Nova Tarefa */}
          <button
            onClick={() => { setEditingTask(null); setIsDialogOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} /> Nova Tarefa
          </button>
        </div>
      </div>

      {/* ── Barra de adição rápida ─────────────────────────────────────────── */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Adicionar tarefa rápida... (Enter para criar com prioridade Baixa)"
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            onKeyDown={handleQuickCreate}
            disabled={quickLoading}
            maxLength={200}
          />
        </div>
      </div>

      {/* ── Filtro por categoria ───────────────────────────────────────────── */}
      <div className="flex gap-1.5 flex-wrap">
        {[{ value: 'all', label: 'Todas' }, ...CATEGORIES.map(c => ({ value: c.value, label: c.label }))].map(cat => {
          const count = cat.value === 'all'
            ? totalPending
            : tasks.filter(t => !t.isCompleted && String(t.category) === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === cat.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {cat.label} {count > 0 && <span className="ml-0.5 opacity-75">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* ── LISTA: grupos por prioridade ───────────────────────────────────── */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(p => (
            <PriorityGroup
              key={p}
              priority={p}
              tasks={filteredByPriority[p]}
              onComplete={handleComplete}
              onUncomplete={handleUncomplete}
              onDelete={handleDelete}
              onEdit={handleEditOpen}
            />
          ))}

          {totalPending === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sage-100 to-sage-50 dark:from-sage-900/30 dark:to-muted border border-sage-200/60 dark:border-sage-800/30 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={28} className="text-sage-500 dark:text-sage-400" />
              </div>
              <p className="font-semibold text-base text-foreground">Tudo em dia!</p>
              <p className="text-sm mt-1">Nenhuma tarefa pendente. Adicione uma nova para começar.</p>
            </div>
          )}
        </div>
      )}

      {/* ── KANBAN: colunas por prioridade ────────────────────────────────── */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex gap-3 lg:grid lg:grid-cols-4" style={{ minWidth: 'max-content' }}>
            {[0, 1, 2, 3].map(p => (
              <KanbanColumn
                key={p}
                priority={p}
                tasks={filteredByPriority[p]}
                onComplete={handleComplete}
                onUncomplete={handleUncomplete}
                onDelete={handleDelete}
                onEdit={handleEditOpen}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Concluídas hoje ────────────────────────────────────────────────── */}
      {completedToday.length > 0 && (
        <div className="rounded-xl border border-sage-200 dark:border-sage-800/40 overflow-hidden">
          <button
            onClick={() => setCompletedExpanded(p => !p)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-sage-50 dark:bg-sage-900/20 hover:bg-sage-100 dark:hover:bg-sage-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-sage-600 dark:text-sage-400" />
              <span className="text-sm font-bold text-sage-700 dark:text-sage-300">
                Concluídas hoje
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-sage-100 text-sage-700 dark:bg-sage-900/40 dark:text-sage-300">
                {completedToday.length}
              </span>
            </div>
            {completedExpanded
              ? <ChevronUp size={15} className="text-sage-500" />
              : <ChevronDown size={15} className="text-sage-500" />}
          </button>

          <motion.div
            initial={false}
            animate={{ gridTemplateRows: completedExpanded ? '1fr' : '0fr' }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            style={{ display: 'grid' }}
          >
            <div style={{ overflow: 'hidden' }}>
              <div className="p-2 space-y-1.5 bg-sage-50/50 dark:bg-sage-900/10">
                <AnimatePresence mode="popLayout">
                  {completedToday.map(task => (
                    <TaskCard
                      key={task.taskId}
                      task={task}
                      onComplete={handleComplete}
                      onUncomplete={handleUncomplete}
                      onDelete={handleDelete}
                      onEdit={handleEditOpen}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Histórico ─────────────────────────────────────────────────────── */}
      <Card>
        <button
          onClick={handleToggleHistory}
          className="flex items-center justify-between w-full text-left rounded-lg px-1 py-0.5 -mx-1 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History size={17} className="text-muted-foreground" />
            <span className="font-semibold text-sm text-foreground">Histórico de Tarefas</span>
          </div>
          {showHistory ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>

        <motion.div
          initial={false}
          animate={{ gridTemplateRows: showHistory ? '1fr' : '0fr' }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          style={{ display: 'grid' }}
        >
          <div style={{ overflow: 'hidden' }}>
            {showHistory && (
              <div className="mt-3 pt-3 border-t border-border">
                {historyLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock size={28} className="mx-auto mb-2 text-honey-400 animate-spin opacity-70" />
                    <p className="text-sm">Carregando...</p>
                  </div>
                ) : history.items.length === 0 ? (
                  <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-honey-100 to-linen-200 dark:from-honey-900/30 dark:to-muted border border-honey-200/60 dark:border-honey-800/30 flex items-center justify-center">
                      <Clock size={18} className="text-honey-600 dark:text-honey-400" />
                    </div>
                    <p className="text-sm">Nenhuma tarefa no histórico</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      {history.items.map(task => (
                        <HistoryItem key={task.taskId} task={task} />
                      ))}
                    </div>
                    {history.totalCount > history.pageSize && (
                      <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-border">
                        <button
                          onClick={() => loadHistoryPage(historyPage - 1)}
                          disabled={historyPage === 1}
                          className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
                        >
                          ← Anterior
                        </button>
                        <span className="px-3 py-1.5 text-xs text-muted-foreground">
                          {historyPage}/{Math.ceil(history.totalCount / history.pageSize)}
                        </span>
                        <button
                          onClick={() => loadHistoryPage(historyPage + 1)}
                          disabled={historyPage >= Math.ceil(history.totalCount / history.pageSize)}
                          className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
                        >
                          Próxima →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </Card>

      {/* ── Dialog de criação / edição ─────────────────────────────────────── */}
      <TaskFormDialog
        open={isDialogOpen || editingTask !== null}
        onOpenChange={open => { if (!open) { setIsDialogOpen(false); setEditingTask(null); } }}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        initialTask={editingTask}
        dialogTitle={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
      />
    </div>
  );
}

Tasks.displayName = 'Tasks';

export default Tasks;
