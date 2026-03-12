import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  MoreVertical,
  Plus,
  Trash2
} from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Input from '../common/Input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Checkbox,
  DatePicker,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  Textarea,
} from '../ui';

// Mapeamentos de prioridade e categoria (refletem os enums da API)
const PRIORITY_COLORS = {
  0: { label: 'Urgente', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-500', badge: 'destructive' },
  1: { label: 'Alta',    bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-400', badge: 'warning' },
  2: { label: 'Média',   bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-400', badge: 'secondary' },
  3: { label: 'Baixa',   bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-400', badge: 'success' },
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

/**
 * Item de tarefa memoizado
 */
const TaskItem = memo(({ task, onComplete, onDelete, onNavigate }) => {
  const p = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS[3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: task.isCompleted ? 0.7 : 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center justify-between p-3 rounded-lg border-l-4 border transition-all duration-200 ${
        task.isCompleted
          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400'
          : `${p.bg} ${p.border}`
      } border-r border-t border-b border-gray-200 dark:border-dark-border-secondary`}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Checkbox
          checked={task.isCompleted}
          onCheckedChange={() => !task.isCompleted && onComplete(task.taskId)}
          disabled={task.isCompleted}
          className={task.isCompleted ? 'data-[state=checked]:bg-emerald-500' : ''}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className={`text-sm font-medium ${
              task.isCompleted
                ? 'line-through text-gray-500 dark:text-gray-400'
                : 'text-gray-900 dark:text-dark-text-primary'
            }`}>
              {task.title}
            </p>
            {task.isOverdue && !task.isCompleted && (
              <AlertCircle size={12} className="text-red-500 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
              task.priority === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
              task.priority === 1 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
              task.priority === 2 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
              'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            }`}>
              {task.priorityLabel}
            </span>
            <span className="text-xs text-gray-400 dark:text-dark-text-tertiary">
              {task.categoryLabel}
            </span>
            {task.dueDate && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className={`text-xs ${task.isOverdue && !task.isCompleted ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-dark-text-tertiary'}`}>
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </span>
              </>
            )}
          </div>
        </div>
        {task.isCompleted && <Badge variant="success" className="ml-2 shrink-0">Concluída</Badge>}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded transition-colors shrink-0">
          <MoreVertical size={16} className="text-gray-500 dark:text-dark-text-tertiary" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!task.isCompleted && (
            <DropdownMenuItem onClick={() => onComplete(task.taskId)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Marcar como concluída
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onNavigate}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Ver na página de tarefas
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(task.taskId)}
            className="text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
});

TaskItem.displayName = 'TaskItem';

/**
 * Seção de Tarefas no Dashboard
 */
const DashboardTasksSection = memo(({
  tasks,
  onAddTask,
  onQuickAddTask,
  onCompleteTask,
  onDeleteTask,
}) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastNotifications();
  const [quickTaskInput, setQuickTaskInput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: '3',
    category: '0',
  });

  const pendingTasks = useMemo(() =>
    tasks
      .filter(t => !t.isCompleted)
      .sort((a, b) => a.priority - b.priority || new Date(a.dueDate ?? 0) - new Date(b.dueDate ?? 0))
      .slice(0, 5),
    [tasks]
  );

  const totalPending = useMemo(() => tasks.filter(t => !t.isCompleted).length, [tasks]);
  const hasMore = totalPending > 5;

  const handleQuickTask = useCallback(async (e) => {
    if (e.key === 'Enter' && quickTaskInput.trim()) {
      e.preventDefault();
      try {
        await (onQuickAddTask ?? onAddTask)({ title: quickTaskInput.trim(), priority: 3, category: 0 });
        setQuickTaskInput('');
        showSuccess('Tarefa criada!');
      } catch {
        showError('Erro ao criar tarefa');
      }
    }
  }, [quickTaskInput, onQuickAddTask, onAddTask, showSuccess, showError]);

  const handleFullCreate = useCallback(async () => {
    if (!newTask.title.trim()) { showError('Digite um título'); return; }
    try {
      await onAddTask({
        title: newTask.title.trim(),
        description: newTask.description || null,
        dueDate: newTask.dueDate || null,
        priority: Number(newTask.priority),
        category: Number(newTask.category),
      });
      setNewTask({ title: '', description: '', dueDate: '', priority: '3', category: '0' });
      setIsDialogOpen(false);
      showSuccess('Tarefa criada!');
    } catch {
      showError('Erro ao criar tarefa');
    }
  }, [newTask, onAddTask, showSuccess, showError]);

  const handleComplete = useCallback(async (taskId) => {
    try {
      await onCompleteTask(taskId);
      showSuccess('Tarefa concluída!');
    } catch {
      showError('Erro ao concluir tarefa');
    }
  }, [onCompleteTask, showSuccess, showError]);

  const handleDelete = useCallback(async (taskId) => {
    try {
      await onDeleteTask(taskId);
      showSuccess('Tarefa excluída');
    } catch {
      showError('Erro ao excluir tarefa');
    }
  }, [onDeleteTask, showSuccess, showError]);

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <ClipboardList size={20} className="text-indigo-600 dark:text-dark-accent-indigo" />
          <span>Minhas Tarefas</span>
        </div>
      }
      headerAction={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-dark-accent-indigo dark:hover:bg-purple-600 rounded-md transition-colors">
            <Plus size={16} />
            Nova Tarefa
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Título *</label>
                <Input
                  placeholder="Nome da tarefa..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Descrição</label>
                <Textarea
                  placeholder="Detalhes opcionais..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Data</label>
                  <DatePicker value={newTask.dueDate} onChange={(date) => setNewTask({ ...newTask, dueDate: date })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Prioridade</label>
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">Categoria</label>
                <Select value={newTask.category} onValueChange={(v) => setNewTask({ ...newTask, category: v })}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t dark:border-dark-border-secondary">
                <button onClick={() => setIsDialogOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  Cancelar
                </button>
                <button onClick={handleFullCreate} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">
                  Criar Tarefa
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Quick add */}
      <div className="mb-4">
        <Input
          placeholder="Tarefa rápida... (pressione Enter)"
          value={quickTaskInput}
          onChange={(e) => setQuickTaskInput(e.target.value)}
          onKeyPress={handleQuickTask}
        />
        <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
          Pressione Enter para criar com prioridade Baixa
        </p>
      </div>

      <Accordion type="multiple" defaultValue={['pending']} className="space-y-3">
        <AccordionItem value="pending" className="border rounded-lg dark:border-dark-border-secondary">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold text-primary dark:text-dark-text-primary">Pendentes</span>
              <Badge variant="secondary">{totalPending}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-dark-text-tertiary">
                <CheckCircle2 className="mx-auto mb-2 text-emerald-500" size={32} />
                <p>Nenhuma tarefa pendente!</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {pendingTasks.map((task) => (
                    <TaskItem
                      key={task.taskId}
                      task={task}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      onNavigate={() => navigate('/tasks')}
                    />
                  ))}
                </AnimatePresence>
                {hasMore && (
                  <button
                    onClick={() => navigate('/tasks')}
                    className="w-full py-2 text-sm text-indigo-600 dark:text-dark-accent-indigo font-medium transition-colors hover:underline"
                  >
                    Ver mais ({totalPending - 5} tarefas)...
                  </button>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
});

DashboardTasksSection.displayName = 'DashboardTasksSection';

export default DashboardTasksSection;
