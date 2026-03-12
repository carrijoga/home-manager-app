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
  History,
  Plus,
  Trash2,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import {
  Badge,
  Checkbox,
  DatePicker,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  Textarea,
} from '../ui';

// ── Constantes ────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  0: { label: 'Urgente', color: 'bg-red-500', text: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-l-red-500' },
  1: { label: 'Alta',    color: 'bg-orange-400', text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-l-orange-400' },
  2: { label: 'Média',   color: 'bg-yellow-400', text: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-l-yellow-400' },
  3: { label: 'Baixa',   color: 'bg-green-500',  text: 'text-green-700 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-l-green-500' },
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

// ── Sub-components ────────────────────────────────────────────────────────────

const PriorityBadge = memo(({ priority, label }) => {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG[3];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${cfg.text} ${
      priority === 0 ? 'bg-red-100 dark:bg-red-900/40' :
      priority === 1 ? 'bg-orange-100 dark:bg-orange-900/40' :
      priority === 2 ? 'bg-yellow-100 dark:bg-yellow-900/40' :
      'bg-green-100 dark:bg-green-900/40'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.color}`} />
      {label}
    </span>
  );
});
PriorityBadge.displayName = 'PriorityBadge';

const TaskCard = memo(({ task, onComplete, onDelete, savedTask }) => {
  const cfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG[3];
  const overdueDays = task.isOverdue && task.dueDate
    ? Math.floor((Date.now() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-dark-border-secondary border-l-4 ${cfg.border} ${cfg.bg} transition-colors`}
    >
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={() => !task.isCompleted && onComplete(task.taskId)}
        disabled={task.isCompleted}
        className="mt-0.5 shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-snug ${
            task.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-dark-text-primary'
          }`}>
            {task.title}
          </p>
          <button
            onClick={() => onDelete(task.taskId, savedTask ?? task)}
            className="shrink-0 text-gray-400 hover:text-red-500 transition-colors mt-0.5"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {task.description && (
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
                ? <><AlertCircle size={11} /> Atrasada {overdueDays}d</>
                : <><Clock size={11} /> {new Date(task.dueDate).toLocaleDateString('pt-BR')}</>
              }
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});
TaskCard.displayName = 'TaskCard';

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

// ── Formulário de criação ─────────────────────────────────────────────────────

const CreateTaskDialog = memo(({ open, onOpenChange, onSubmit }) => {
  const [form, setForm] = useState({ title: '', description: '', details: '', dueDate: '', priority: '3', category: '0' });
  const [loading, setLoading] = useState(false);
  const { showError } = useToastNotifications();

  const handleSubmit = async () => {
    if (!form.title.trim()) { showError('Digite um título'); return; }
    setLoading(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description || null,
        details: form.details || null,
        dueDate: form.dueDate || null,
        priority: Number(form.priority),
        category: Number(form.category),
      });
      setForm({ title: '', description: '', details: '', dueDate: '', priority: '3', category: '0' });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Título *</label>
            <Input placeholder="Nome da tarefa..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Descrição</label>
            <Textarea placeholder="Descreva a tarefa..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Detalhes adicionais</label>
            <Textarea placeholder="Informações extras..." value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Data limite</label>
              <DatePicker value={form.dueDate} onChange={date => setForm({ ...form, dueDate: date })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Prioridade</label>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Categoria</label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t dark:border-dark-border-secondary">
            <button onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md transition-colors">
              {loading ? 'Criando...' : 'Criar Tarefa'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
CreateTaskDialog.displayName = 'CreateTaskDialog';

// ── Página principal ─────────────────────────────────────────────────────────

const Tasks = memo(() => {
  const { tasks, addTask, createQuickTask, completeTask, restoreTask, deleteTask } = useApp();
  const { showSuccess, showError } = useToastNotifications();

  const [quickInput, setQuickInput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [history, setHistory] = useState({ items: [], totalCount: 0, page: 1, pageSize: 20 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);

  // Tarefas ativas filtradas
  const activeTasks = useMemo(() => {
    const pending = tasks.filter(t => !t.isCompleted);
    if (activeFilter === 'all') return pending.sort((a, b) => a.priority - b.priority);
    return pending.filter(t => String(t.priority) === activeFilter).sort((a, b) => a.priority - b.priority);
  }, [tasks, activeFilter]);

  // Tarefas concluídas (hoje e recentes no estado local)
  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return tasks
      .filter(t => t.isCompleted && t.completedAt && new Date(t.completedAt).toDateString() === today)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [tasks]);

  const overdueTasks = useMemo(() => tasks.filter(t => t.isOverdue && !t.isCompleted).length, [tasks]);
  const pendingCount = useMemo(() => tasks.filter(t => !t.isCompleted).length, [tasks]);

  // Carregar histórico
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

  useEffect(() => {
    if (showHistory) loadHistory(1);
  }, [showHistory, loadHistory]);

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
      showSuccess('Tarefa criada com sucesso!');
    } catch {
      showError('Erro ao criar tarefa');
      throw new Error('create failed');
    }
  }, [addTask, showSuccess, showError]);

  const handleComplete = useCallback(async (taskId) => {
    try {
      await completeTask(taskId);
      showSuccess('Tarefa concluída!', { soundVariant: 'update' });
    } catch {
      showError('Erro ao concluir tarefa');
    }
  }, [completeTask, showSuccess, showError]);

  const handleDelete = useCallback(async (taskId, taskSnapshot) => {
    try {
      await deleteTask(taskId);
      let restored = false;
      showSuccess('Tarefa excluída', {
        duration: 5000,
        soundVariant: 'delete',
        action: {
          label: 'Desfazer',
          onClick: () => {
            if (restored) return;
            restored = true;
            restoreTask(taskSnapshot);
            showSuccess('Tarefa restaurada!', { soundVariant: 'add' });
          },
        },
      });
    } catch {
      showError('Erro ao excluir tarefa');
    }
  }, [deleteTask, restoreTask, showSuccess, showError]);

  return (
    <div className="space-y-6">
      {/* Header com stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">Quadro de Tarefas</h1>
          <div className="flex items-center gap-3 mt-1 text-sm">
            <span className="text-gray-500 dark:text-dark-text-tertiary">
              <span className="font-semibold text-gray-700 dark:text-dark-text-secondary">{pendingCount}</span> pendentes
            </span>
            {overdueTasks > 0 && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                <AlertCircle size={14} />
                {overdueTasks} atrasada{overdueTasks > 1 ? 's' : ''}
              </span>
            )}
            {completedToday.length > 0 && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} />
                {completedToday.length} hoje
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
        >
          <Plus size={16} />
          Nova Tarefa
        </button>
      </div>

      {/* Quick add */}
      <Card>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Adicionar tarefa rápida... (Enter para criar)"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyPress={handleQuickCreate}
            className="flex-1"
          />
          <button
            onClick={() => setIsDialogOpen(true)}
            className="shrink-0 flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-dark-border-secondary rounded-md hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors text-gray-600 dark:text-dark-text-secondary"
          >
            <Plus size={14} />
            Completa
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-dark-text-tertiary mt-1.5">
          Tarefa rápida usa Prioridade Baixa e Categoria Geral. Para mais opções, clique em "Completa".
        </p>
      </Card>

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
              <span className="ml-1.5 text-xs opacity-70">
                ({tasks.filter(t => !t.isCompleted && String(t.priority) === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de tarefas ativas */}
      <Card title={`Pendentes ${activeFilter !== 'all' ? `— ${PRIORITY_CONFIG[Number(activeFilter)]?.label}` : ''}`}>
        {activeTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-dark-text-tertiary">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-500 opacity-60" />
            <p className="font-medium">Sem tarefas pendentes</p>
            <p className="text-sm mt-1 opacity-70">Ótimo trabalho ou adicione uma nova tarefa!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {activeTasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  savedTask={task}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
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
            onClick={() => setCompletedExpanded(prev => !prev)}
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
                  {completedToday.map(task => (
                    <HistoryItem key={task.taskId} task={task} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Histórico */}
      <Card>
        <button
          onClick={() => setShowHistory(prev => !prev)}
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

                    {/* Paginação */}
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

      <CreateTaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleAddTask} />
    </div>
  );
});

Tasks.displayName = 'Tasks';

export default Tasks;
