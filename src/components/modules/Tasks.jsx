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
    label: 'Urgente', dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-300',
    dimText: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20',
    headerBg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-l-red-500',
    pill: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  1: {
    label: 'Alta', dot: 'bg-orange-400',
    text: 'text-orange-700 dark:text-orange-300',
    dimText: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    headerBg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-l-orange-400',
    pill: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
  2: {
    label: 'Média', dot: 'bg-yellow-400',
    text: 'text-yellow-700 dark:text-yellow-300',
    dimText: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    headerBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-l-yellow-400',
    pill: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  },
  3: {
    label: 'Baixa', dot: 'bg-green-500',
    text: 'text-green-700 dark:text-green-300',
    dimText: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/20',
    headerBg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-l-green-500',
    pill: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
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
      className={`group relative flex items-start gap-3 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border-secondary border-l-4 ${cfg.border} ${
        task.isCompleted ? 'bg-gray-50 dark:bg-dark-bg-tertiary' : cfg.bg
      } transition-colors`}
    >
      {/* Checkbox */}
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={() => task.isCompleted ? onUncomplete?.(task.taskId) : onComplete(task.taskId)}
        className={`mt-0.5 shrink-0 ${task.isCompleted ? 'data-[state=checked]:bg-emerald-500' : ''}`}
      />

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${
          task.isCompleted
            ? 'line-through text-gray-400 dark:text-gray-500'
            : 'text-gray-900 dark:text-dark-text-primary'
        }`}>
          {task.title}
        </p>

        {!compact && task.description && (
          <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-0.5 line-clamp-1">
            {task.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {/* Categoria */}
          <span className="inline-flex items-center gap-0.5 text-xs text-gray-400 dark:text-dark-text-tertiary">
            <Tag size={9} />
            {task.categoryLabel}
          </span>

          {/* Data */}
          {task.dueDate && (
            <span className={`inline-flex items-center gap-0.5 text-xs ${
              task.isOverdue && !task.isCompleted
                ? 'text-red-600 dark:text-red-400 font-medium'
                : 'text-gray-400 dark:text-dark-text-tertiary'
            }`}>
              {task.isOverdue && !task.isCompleted
                ? <><AlertCircle size={9} /> {overdueDays}d atrasada</>
                : <><CalendarDays size={9} /> {new Date(task.dueDate).toLocaleDateString('pt-BR')}</>
              }
            </span>
          )}

          {/* Concluída em */}
          {task.isCompleted && task.completedAt && (
            <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={9} />
              {new Date(task.completedAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      {/* Ações — visíveis no hover (CSS group) */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-0.5">
        {onEdit && !task.isCompleted && (
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
            title="Editar"
          >
            <Edit2 size={13} />
          </button>
        )}
        {task.isCompleted && onUncomplete && (
          <button
            onClick={() => onUncomplete(task.taskId)}
            className="p-1 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
            title="Reabrir"
          >
            <RotateCcw size={13} />
          </button>
        )}
        <button
          onClick={() => onDelete(task.taskId, task)}
          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
    <div className="rounded-xl border border-gray-200 dark:border-dark-border-secondary overflow-hidden">
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
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
      <div className={`flex-1 rounded-b-xl border border-t-0 border-gray-200 dark:border-dark-border-secondary p-2 space-y-1.5 min-h-[100px] ${cfg.bg}`}>
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
          <p className="text-center text-xs text-gray-400 dark:text-dark-text-tertiary py-4">
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
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-secondary">
      <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-through text-gray-500 dark:text-gray-400">{task.title}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.pill}`}>{task.priorityLabel}</span>
          <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-200 dark:bg-dark-bg-secondary rounded">{task.categoryLabel}</span>
          {task.completedAt && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
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
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">
              Título <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nome da tarefa..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Prioridade + Categoria (lado a lado) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Prioridade</label>
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
              <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Categoria</label>
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
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">
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
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Descrição</label>
            <Textarea
              placeholder="Detalhes da tarefa..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Detalhes adicionais */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Informações extras</label>
            <Textarea
              placeholder="Observações, links, referências..."
              value={form.details}
              onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-2 border-t dark:border-dark-border-secondary">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
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

  const handleQuickCreate = useCallback(async (e) => {
    if (e.key !== 'Enter' || !quickInput.trim()) return;
    e.preventDefault();
    try {
      await createQuickTask(quickInput.trim());
      setQuickInput('');
      showSuccess('Tarefa criada!');
    } catch {
      showError('Erro ao criar tarefa');
    }
  }, [quickInput, createQuickTask, showSuccess, showError]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">Quadro de Tarefas</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {/* Stats chips */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              <List size={11} /> {pendingCount} pendentes
            </span>
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                <AlertCircle size={11} /> {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}
              </span>
            )}
            {completedToday.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle2 size={11} /> {completedToday.length} hoje
              </span>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2">
          {/* Toggle Lista / Kanban */}
          <div className="flex rounded-lg border border-gray-200 dark:border-dark-border-secondary overflow-hidden text-sm">
            {[
              { mode: 'list',   Icon: List,          label: 'Lista'  },
              { mode: 'kanban', Icon: KanbanSquare,  label: 'Kanban' },
            ].map(({ mode, Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  viewMode === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
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
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
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
          />
        </div>
        <button
          onClick={() => { setEditingTask(null); setIsDialogOpen(true); }}
          className="shrink-0 flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-dark-border-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors text-gray-600 dark:text-dark-text-secondary"
        >
          <Plus size={14} /> Completa
        </button>
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
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-bg-secondary'
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
            <div className="text-center py-16 text-gray-500 dark:text-dark-text-tertiary">
              <CheckCircle2 size={44} className="mx-auto mb-3 text-emerald-500 opacity-50" />
              <p className="font-semibold text-base">Tudo em dia!</p>
              <p className="text-sm mt-1 opacity-70">Nenhuma tarefa pendente. Adicione uma nova para começar.</p>
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
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 overflow-hidden">
          <button
            onClick={() => setCompletedExpanded(p => !p)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                Concluídas hoje
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {completedToday.length}
              </span>
            </div>
            {completedExpanded
              ? <ChevronUp size={15} className="text-emerald-500" />
              : <ChevronDown size={15} className="text-emerald-500" />}
          </button>

          <AnimatePresence>
            {completedExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="p-2 space-y-1.5 bg-emerald-50/50 dark:bg-emerald-950/10">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Histórico ─────────────────────────────────────────────────────── */}
      <Card>
        <button
          onClick={handleToggleHistory}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <History size={17} className="text-gray-500" />
            <span className="font-semibold text-sm text-gray-700 dark:text-dark-text-primary">Histórico de Tarefas</span>
          </div>
          {showHistory ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t dark:border-dark-border-secondary">
                {historyLoading ? (
                  <div className="text-center py-8 text-gray-400">
                    <Clock size={28} className="mx-auto mb-2 animate-spin opacity-50" />
                    <p className="text-sm">Carregando...</p>
                  </div>
                ) : history.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-dark-text-tertiary">
                    <Clock size={32} className="mx-auto mb-2 opacity-40" />
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
                      <div className="flex justify-center gap-2 mt-4 pt-3 border-t dark:border-dark-border-secondary">
                        <button
                          onClick={() => loadHistoryPage(historyPage - 1)}
                          disabled={historyPage === 1}
                          className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-dark-border-secondary rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
                        >
                          ← Anterior
                        </button>
                        <span className="px-3 py-1.5 text-xs text-gray-500">
                          {historyPage}/{Math.ceil(history.totalCount / history.pageSize)}
                        </span>
                        <button
                          onClick={() => loadHistoryPage(historyPage + 1)}
                          disabled={historyPage >= Math.ceil(history.totalCount / history.pageSize)}
                          className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-dark-border-secondary rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
                        >
                          Próxima →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
