import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import * as taskService from '@/services/taskService';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
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
  Trash2,
  X,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  0: { label: 'Urgente', dot: 'bg-red-500',    text: 'text-red-700 dark:text-red-300',    bg: 'bg-red-50 dark:bg-red-950/20',     border: 'border-l-red-500',    pill: 'bg-red-100 dark:bg-red-900/40' },
  1: { label: 'Alta',    dot: 'bg-orange-400',  text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-l-orange-400', pill: 'bg-orange-100 dark:bg-orange-900/40' },
  2: { label: 'Média',   dot: 'bg-yellow-400',  text: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-l-yellow-400', pill: 'bg-yellow-100 dark:bg-yellow-900/40' },
  3: { label: 'Baixa',   dot: 'bg-green-500',   text: 'text-green-700 dark:text-green-300',  bg: 'bg-green-50 dark:bg-green-950/20',  border: 'border-l-green-500',  pill: 'bg-green-100 dark:bg-green-900/40' },
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

const FILTER_TABS = [
  { key: 'all', label: 'Todas' },
  { key: '0', label: 'Urgente' },
  { key: '1', label: 'Alta' },
  { key: '2', label: 'Média' },
  { key: '3', label: 'Baixa' },
];

// ── PriorityBadge ─────────────────────────────────────────────────────────────

const PriorityBadge = memo(({ priority, label }) => {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG[3];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${cfg.text} ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
});
PriorityBadge.displayName = 'PriorityBadge';

// ── TaskCard ──────────────────────────────────────────────────────────────────

const TaskCard = memo(({ task, onComplete, onUncomplete, onDelete, onEdit, compact = false }) => {
  const cfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG[3];
  const overdueDays = task.isOverdue && task.dueDate
    ? Math.max(1, Math.floor((Date.now() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className={`group flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-dark-border-secondary border-l-4 ${cfg.border} ${task.isCompleted ? 'bg-gray-50 dark:bg-dark-bg-tertiary opacity-70' : cfg.bg} transition-colors`}
    >
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={() => task.isCompleted ? onUncomplete?.(task.taskId) : onComplete(task.taskId)}
        className={`mt-0.5 shrink-0 ${task.isCompleted ? 'data-[state=checked]:bg-emerald-500' : ''}`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-snug ${
            task.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-dark-text-primary'
          }`}>
            {task.title}
          </p>

          {/* Ações */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Editar"
              >
                <Edit2 size={13} />
              </button>
            )}
            {task.isCompleted && onUncomplete && (
              <button
                onClick={() => onUncomplete(task.taskId)}
                className="p-1 rounded text-gray-400 hover:text-amber-600 transition-colors"
                title="Desmarcar como concluída"
              >
                <RotateCcw size={13} />
              </button>
            )}
            <button
              onClick={() => onDelete(task.taskId, task)}
              className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
              title="Excluir"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {!compact && task.description && (
          <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-0.5 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <PriorityBadge priority={task.priority} label={task.priorityLabel} />

          <span className="text-xs text-gray-400 dark:text-dark-text-tertiary px-1.5 py-0.5 bg-gray-100 dark:bg-dark-bg-tertiary rounded">
            {task.categoryLabel}
          </span>

          {task.dueDate && (
            <span className={`flex items-center gap-0.5 text-xs ${
              task.isOverdue && !task.isCompleted
                ? 'text-red-600 dark:text-red-400 font-medium'
                : 'text-gray-500 dark:text-dark-text-tertiary'
            }`}>
              {task.isOverdue && !task.isCompleted
                ? <><AlertCircle size={10} /> Atrasada {overdueDays}d</>
                : <><Clock size={10} /> {new Date(task.dueDate).toLocaleDateString('pt-BR')}</>
              }
            </span>
          )}

          {task.isCompleted && task.completedAt && (
            <span className="flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={10} />
              {new Date(task.completedAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});
TaskCard.displayName = 'TaskCard';

// ── TaskFormDialog ────────────────────────────────────────────────────────────

const EMPTY_FORM = { title: '', description: '', details: '', dueDate: undefined, priority: '3', category: '0' };

const TaskFormDialog = memo(({ open, onOpenChange, onSubmit, initialTask, dialogTitle }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const { showError } = useToastNotifications();

  // Preenche o form quando abre em modo de edição
  useEffect(() => {
    if (!open) return;
    if (initialTask) {
      setForm({
        title: initialTask.title ?? '',
        description: initialTask.description ?? '',
        details: initialTask.details ?? '',
        dueDate: initialTask.dueDate ? new Date(initialTask.dueDate) : undefined,
        priority: String(initialTask.priority ?? 3),
        category: String(initialTask.category ?? 0),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, initialTask]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const handleSubmit = async () => {
    if (!form.title.trim()) { showError('Digite um título'); return; }
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
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Título *</label>
            <Input
              placeholder="Nome da tarefa..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Descrição</label>
            <Textarea
              placeholder="Descreva a tarefa..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Detalhes adicionais</label>
            <Textarea
              placeholder="Informações extras..."
              value={form.details}
              onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">
                Data limite
              </label>
              <DatePicker
                value={form.dueDate}
                onChange={date => setForm(f => ({ ...f, dueDate: date }))}
                fromDate={today}
                placeholder="Selecione..."
              />
            </div>
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

          <div className="flex justify-end gap-2 pt-3 border-t dark:border-dark-border-secondary">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary dark:text-dark-text-secondary rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md transition-colors"
            >
              {loading ? 'Salvando...' : (initialTask ? 'Salvar' : 'Criar Tarefa')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
TaskFormDialog.displayName = 'TaskFormDialog';

// ── HistoryItem ───────────────────────────────────────────────────────────────

const HistoryItem = memo(({ task }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-secondary">
    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium line-through text-gray-500 dark:text-gray-400">{task.title}</p>
      <div className="flex flex-wrap gap-1.5 mt-1">
        <PriorityBadge priority={task.priority} label={task.priorityLabel} />
        <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-200 dark:bg-dark-bg-secondary rounded">{task.categoryLabel}</span>
        {task.completedAt && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <CheckCircle2 size={10} />
            {new Date(task.completedAt).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
    </div>
  </div>
));
HistoryItem.displayName = 'HistoryItem';

// ── Kanban View ───────────────────────────────────────────────────────────────

const KanbanColumn = memo(({ priority, tasks, onComplete, onUncomplete, onDelete, onEdit }) => {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <div className="flex flex-col min-w-0">
      <div className={`px-3 py-2 rounded-t-lg flex items-center justify-between ${cfg.bg} border border-gray-200 dark:border-dark-border-secondary border-b-0`}>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-dark-text-tertiary bg-white/50 dark:bg-black/20 px-1.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className={`flex-1 rounded-b-lg border border-gray-200 dark:border-dark-border-secondary border-t-0 p-2 space-y-2 min-h-[120px] ${cfg.bg}`}>
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
          <div className="flex items-center justify-center h-16 text-xs text-gray-400 dark:text-dark-text-tertiary">
            Sem tarefas
          </div>
        )}
      </div>
    </div>
  );
});
KanbanColumn.displayName = 'KanbanColumn';

// ── Página principal ──────────────────────────────────────────────────────────

const Tasks = () => {
  const { tasks, addTask, updateTask, createQuickTask, completeTask, uncompleteTask, restoreTask, deleteTask } = useApp();
  const { showSuccess, showError } = useToastNotifications();

  const [quickInput, setQuickInput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [history, setHistory] = useState({ items: [], totalCount: 0, page: 1, pageSize: 20 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const historyLoaded = useRef(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);

  // Tarefas pendentes filtradas
  const activeTasks = useMemo(() => {
    const pending = tasks.filter(t => !t.isCompleted);
    const sorted = pending.sort((a, b) => a.priority - b.priority);
    if (activeFilter === 'all') return sorted;
    return sorted.filter(t => String(t.priority) === activeFilter);
  }, [tasks, activeFilter]);

  // Kanban: tarefas agrupadas por prioridade
  const tasksByPriority = useMemo(() => {
    const pending = tasks.filter(t => !t.isCompleted);
    return {
      0: pending.filter(t => t.priority === 0),
      1: pending.filter(t => t.priority === 1),
      2: pending.filter(t => t.priority === 2),
      3: pending.filter(t => t.priority === 3),
    };
  }, [tasks]);

  // Tarefas concluídas hoje
  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return tasks
      .filter(t => t.isCompleted && t.completedAt && new Date(t.completedAt).toDateString() === today)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [tasks]);

  const overdueTasks = useMemo(() => tasks.filter(t => t.isOverdue && !t.isCompleted).length, [tasks]);
  const pendingCount = useMemo(() => tasks.filter(t => !t.isCompleted).length, [tasks]);

  // Carregar histórico (uma vez quando abrir)
  const loadHistory = useCallback(async (page) => {
    setHistoryLoading(true);
    try {
      const result = await taskService.getTaskHistory(page, 20);
      setHistory(result);
      setHistoryPage(page);
    } catch {
      showError('Erro ao carregar histórico');
    } finally {
      setHistoryLoading(false);
    }
  }, [showError]);

  const handleToggleHistory = useCallback(() => {
    setShowHistory(prev => {
      if (!prev && !historyLoaded.current) {
        historyLoaded.current = true;
        loadHistory(1);
      }
      return !prev;
    });
  }, [loadHistory]);

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
    try {
      await addTask(payload);
      showSuccess('Tarefa criada!');
    } catch {
      showError('Erro ao criar tarefa');
      throw new Error('create failed');
    }
  }, [addTask, showSuccess, showError]);

  const handleUpdateTask = useCallback(async (payload) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.taskId, payload);
      showSuccess('Tarefa atualizada!');
    } catch {
      showError('Erro ao atualizar tarefa');
      throw new Error('update failed');
    }
  }, [editingTask, updateTask, showSuccess, showError]);

  const handleComplete = useCallback(async (taskId) => {
    try {
      await completeTask(taskId);
      showSuccess('Tarefa concluída!');
    } catch {
      showError('Erro ao concluir tarefa');
    }
  }, [completeTask, showSuccess, showError]);

  const handleUncomplete = useCallback(async (taskId) => {
    try {
      await uncompleteTask(taskId);
      showSuccess('Tarefa reaberta.');
    } catch {
      showError('Erro ao reabrir tarefa');
    }
  }, [uncompleteTask, showSuccess, showError]);

  const handleDelete = useCallback(async (taskId, taskSnapshot) => {
    try {
      await deleteTask(taskId);
      let restored = false;
      showSuccess('Tarefa excluída', {
        duration: 5000,
        action: {
          label: 'Desfazer',
          onClick: () => {
            if (restored) return;
            restored = true;
            restoreTask(taskSnapshot);
            showSuccess('Tarefa restaurada!');
          },
        },
      });
    } catch {
      showError('Erro ao excluir tarefa');
    }
  }, [deleteTask, restoreTask, showSuccess, showError]);

  const handleEditOpen = useCallback((task) => {
    setEditingTask(task);
    setIsDialogOpen(false); // garante que o dialog de criação feche
  }, []);

  const countByPriority = useCallback((priority) =>
    tasks.filter(t => !t.isCompleted && t.priority === priority).length,
    [tasks]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">Quadro de Tarefas</h1>
          <div className="flex items-center gap-3 mt-1 text-sm flex-wrap">
            <span className="text-gray-500 dark:text-dark-text-tertiary">
              <span className="font-semibold text-gray-700 dark:text-dark-text-secondary">{pendingCount}</span> pendentes
            </span>
            {overdueTasks > 0 && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                <AlertCircle size={13} />
                {overdueTasks} atrasada{overdueTasks > 1 ? 's' : ''}
              </span>
            )}
            {completedToday.length > 0 && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={13} />
                {completedToday.length} concluída{completedToday.length > 1 ? 's' : ''} hoje
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle de visualização */}
          <div className="flex rounded-lg border border-gray-200 dark:border-dark-border-secondary overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 flex items-center gap-1.5 text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
              }`}
              title="Visualização em lista"
            >
              <List size={15} />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 flex items-center gap-1.5 text-sm transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
              }`}
              title="Visualização Kanban"
            >
              <KanbanSquare size={15} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>

          <button
            onClick={() => { setEditingTask(null); setIsDialogOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
          >
            <Plus size={16} />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Quick add */}
      <Card>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Adicionar tarefa rápida... (Enter para criar)"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={handleQuickCreate}
            className="flex-1"
          />
          <button
            onClick={() => { setEditingTask(null); setIsDialogOpen(true); }}
            className="shrink-0 flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-dark-border-secondary rounded-md hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors text-gray-600 dark:text-dark-text-secondary"
          >
            <Plus size={14} />
            Completa
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-dark-text-tertiary mt-1.5">
          Tarefa rápida usa Prioridade Baixa. Para mais opções, clique em "Completa".
        </p>
      </Card>

      {/* ── LISTA ─────────────────────────────────────────────────────────── */}
      {viewMode === 'list' && (
        <>
          {/* Filtros por prioridade */}
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === tab.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-bg-secondary'
                }`}
              >
                {tab.label}
                {tab.key !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-70">({countByPriority(Number(tab.key))})</span>
                )}
              </button>
            ))}
          </div>

          {/* Lista de tarefas ativas */}
          <Card title={`Pendentes${activeFilter !== 'all' ? ` — ${PRIORITY_CONFIG[Number(activeFilter)]?.label}` : ''}`}>
            {activeTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-dark-text-tertiary">
                <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-500 opacity-60" />
                <p className="font-medium">Sem tarefas pendentes!</p>
                <p className="text-sm mt-1 opacity-70">Ótimo trabalho, ou adicione uma nova tarefa.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {activeTasks.map(task => (
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
            )}
          </Card>

          {/* Concluídas hoje */}
          {completedToday.length > 0 && (
            <Card>
              <button
                onClick={() => setCompletedExpanded(p => !p)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span className="font-semibold text-gray-700 dark:text-dark-text-primary">
                    Concluídas hoje ({completedToday.length})
                  </span>
                </div>
                {completedExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>

              <AnimatePresence>
                {completedExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 mt-3 pt-3 border-t dark:border-dark-border-secondary">
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
            </Card>
          )}
        </>
      )}

      {/* ── KANBAN ────────────────────────────────────────────────────────── */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(priority => (
            <KanbanColumn
              key={priority}
              priority={priority}
              tasks={tasksByPriority[priority]}
              onComplete={handleComplete}
              onUncomplete={handleUncomplete}
              onDelete={handleDelete}
              onEdit={handleEditOpen}
            />
          ))}
        </div>
      )}

      {/* Histórico */}
      <Card>
        <button
          onClick={handleToggleHistory}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <History size={18} className="text-gray-500" />
            <span className="font-semibold text-gray-700 dark:text-dark-text-primary">Histórico de Tarefas</span>
          </div>
          {showHistory ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t dark:border-dark-border-secondary">
                {historyLoading ? (
                  <div className="text-center py-8 text-gray-500">Carregando...</div>
                ) : history.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-dark-text-tertiary">
                    <Clock size={32} className="mx-auto mb-2 opacity-40" />
                    <p>Nenhuma tarefa no histórico</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {history.items.map(task => (
                        <HistoryItem key={task.taskId} task={task} />
                      ))}
                    </div>

                    {history.totalCount > history.pageSize && (
                      <div className="flex justify-center gap-2 mt-4 pt-3 border-t dark:border-dark-border-secondary">
                        <button
                          onClick={() => loadHistory(historyPage - 1)}
                          disabled={historyPage === 1}
                          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-border-secondary rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
                        >
                          Anterior
                        </button>
                        <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-dark-text-secondary">
                          {historyPage} / {Math.ceil(history.totalCount / history.pageSize)}
                        </span>
                        <button
                          onClick={() => loadHistory(historyPage + 1)}
                          disabled={historyPage >= Math.ceil(history.totalCount / history.pageSize)}
                          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-border-secondary rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
                        >
                          Próxima
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

      {/* Dialog de criação / edição */}
      <TaskFormDialog
        open={isDialogOpen || editingTask !== null}
        onOpenChange={(open) => {
          if (!open) { setIsDialogOpen(false); setEditingTask(null); }
        }}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        initialTask={editingTask}
        dialogTitle={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
      />
    </div>
  );
};

Tasks.displayName = 'Tasks';

export default Tasks;
