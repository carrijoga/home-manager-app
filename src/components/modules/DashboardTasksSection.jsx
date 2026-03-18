import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  MoreVertical,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '../ui';

// Mapeamentos de prioridade e categoria (refletem os enums da API)
const PRIORITY_COLORS = {
  0: { label: 'Urgente', bg: 'bg-terracotta-50 dark:bg-terracotta-900/20', border: 'border-terracotta-600' },
  1: { label: 'Alta',    bg: 'bg-honey-50 dark:bg-honey-900/20', border: 'border-honey-500' },
  2: { label: 'Média',   bg: 'bg-linen-100 dark:bg-linen-900/20', border: 'border-honey-300' },
  3: { label: 'Baixa',   bg: 'bg-sage-50 dark:bg-sage-900/20', border: 'border-sage-400' },
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
const TaskItem = memo(({ task, onComplete, onEdit, onDelete, onNavigate }) => {
  const p = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS[3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: task.isCompleted ? 0.7 : 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center justify-between p-3 rounded-lg border-l-4 border transition-all duration-200 ${
        task.isCompleted
          ? 'bg-muted/50 border-sage-400'
          : `${p.bg} ${p.border}`
      } border-r border-t border-b border-border`}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Checkbox
          checked={task.isCompleted}
          onCheckedChange={() => !task.isCompleted && onComplete(task.taskId)}
          disabled={task.isCompleted}
          className={task.isCompleted ? 'data-[state=checked]:bg-sage-400' : ''}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className={`text-sm font-medium ${
              task.isCompleted
                ? 'line-through text-muted-foreground'
                : 'text-foreground'
            }`}>
              {task.title}
            </p>
            {task.isOverdue && !task.isCompleted && (
              <AlertCircle size={12} className="text-terracotta-500 dark:text-terracotta-400 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
              task.priority === 0 ? 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300' :
              task.priority === 1 ? 'bg-honey-100 text-honey-700 dark:bg-honey-900/40 dark:text-honey-300' :
              task.priority === 2 ? 'bg-linen-200 text-honey-700 dark:bg-linen-900/30 dark:text-honey-200' :
              'bg-sage-100 text-sage-700 dark:bg-sage-900/40 dark:text-sage-300'
            }`}>
              {task.priorityLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              {task.categoryLabel}
            </span>
            {task.dueDate && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className={`text-xs ${task.isOverdue && !task.isCompleted ? 'text-terracotta-600 dark:text-terracotta-400 font-medium' : 'text-muted-foreground'}`}>
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </span>
              </>
            )}
          </div>
        </div>
        {task.isCompleted && <Badge variant="success" className="ml-2 shrink-0">Concluída</Badge>}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="ml-2 p-1 hover:bg-muted rounded transition-colors shrink-0">
          <MoreVertical size={16} className="text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onNavigate}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Ir para a tarefa
          </DropdownMenuItem>
          {!task.isCompleted && (
            <DropdownMenuItem onClick={() => onComplete(task.taskId)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Marcar como concluída
            </DropdownMenuItem>
          )}

          {!task.isCompleted && (
            <DropdownMenuItem onClick={() => onEdit(task.taskId)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => onDelete(task.taskId)}
            className="text-destructive dark:text-destructive"
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
  onEditTask,
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
    dueDate: undefined,   // Date | undefined
    priority: '3',
    category: '0',
  });

  const [editingTask, setEditingTask] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    dueDate: undefined,
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
    if (e.key !== 'Enter' || !quickTaskInput.trim()) return;
    e.preventDefault();
    try {
      // onQuickAddTask espera apenas uma string; onAddTask espera objeto completo
      if (onQuickAddTask) {
        await onQuickAddTask(quickTaskInput.trim());
      } else {
        await onAddTask({ title: quickTaskInput.trim(), priority: 3, category: 0 });
      }
      setQuickTaskInput('');
      showSuccess('Tarefa criada!');
    } catch {
      showError('Erro ao criar tarefa');
    }
  }, [quickTaskInput, onQuickAddTask, onAddTask, showSuccess, showError]);

  const handleFullCreate = useCallback(async () => {
    if (!newTask.title.trim()) { showError('Digite um título'); return; }
    try {
      await onAddTask({
        title: newTask.title.trim(),
        description: newTask.description || null,
        dueDate: newTask.dueDate ? newTask.dueDate.toISOString() : null,
        priority: Number(newTask.priority),
        category: Number(newTask.category),
      });
      setNewTask({ title: '', description: '', dueDate: undefined, priority: '3', category: '0' });
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

  const handleEditOpen = useCallback((taskId) => {
    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return;
    setEditingTask(task);
    setEditForm({
      title: task.title ?? '',
      description: task.description ?? '',
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      priority: String(task.priority ?? 3),
      category: String(task.category ?? 0),
    });
    setIsEditDialogOpen(true);
  }, [tasks]);

  const handleEditSubmit = useCallback(async () => {
    if (!editForm.title.trim()) { showError('Digite um título'); return; }
    try {
      await onEditTask(editingTask.taskId, {
        title: editForm.title.trim(),
        description: editForm.description || null,
        dueDate: editForm.dueDate ? editForm.dueDate.toISOString() : null,
        priority: Number(editForm.priority),
        category: Number(editForm.category),
      });
      setIsEditDialogOpen(false);
      setEditingTask(null);
      showSuccess('Tarefa atualizada!');
    } catch {
      showError('Erro ao atualizar tarefa');
    }
  }, [editForm, editingTask, onEditTask, showSuccess, showError]);

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <ClipboardList size={20} className="text-primary" />
          <span>Minhas Tarefas</span>
        </div>
      }
      headerAction={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors">
            <Plus size={16} />
            Nova Tarefa
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Título *</label>
                <Input
                  placeholder="Nome da tarefa..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Descrição</label>
                <Textarea
                  placeholder="Detalhes opcionais..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Data limite</label>
                  <DatePicker
                    value={newTask.dueDate}
                    onChange={(date) => setNewTask({ ...newTask, dueDate: date })}
                    fromDate={new Date()}
                    placeholder="Selecione..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Prioridade</label>
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
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
                <label className="text-sm font-medium text-foreground mb-1 block">Categoria</label>
                <Select value={newTask.category} onValueChange={(v) => setNewTask({ ...newTask, category: v })}>
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
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button onClick={() => setIsDialogOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors">
                  Cancelar
                </button>
                <button onClick={handleFullCreate} className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors">
                  Criar Tarefa
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setEditingTask(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Título *</label>
              <Input
                placeholder="Nome da tarefa..."
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Descrição</label>
              <Textarea
                placeholder="Detalhes opcionais..."
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Data limite</label>
                <DatePicker
                  value={editForm.dueDate}
                  onChange={(date) => setEditForm({ ...editForm, dueDate: date })}
                  fromDate={new Date()}
                  placeholder="Selecione..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Prioridade</label>
                <Select value={editForm.priority} onValueChange={(v) => setEditForm({ ...editForm, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Categoria</label>
              <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick add */}
      <div className="mb-4">
        <Input
          placeholder="Tarefa rápida... (Enter para criar)"
          value={quickTaskInput}
          onChange={(e) => setQuickTaskInput(e.target.value)}
          onKeyDown={handleQuickTask}
          maxLength={200}
        />
      </div>

      {/* Lista de tarefas pendentes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-sm text-foreground">Pendentes</span>
          <Badge variant="secondary">{totalPending}</Badge>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sage-100 to-sage-50 dark:from-sage-900/30 dark:to-muted border border-sage-200/60 dark:border-sage-800/30 flex items-center justify-center">
              <CheckCircle2 size={22} className="text-sage-500 dark:text-sage-400" />
            </div>
            <p className="text-sm">Nenhuma tarefa pendente!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {pendingTasks.map((task) => (
                <TaskItem
                  key={task.taskId}
                  task={task}
                  onComplete={handleComplete}
                  onEdit={handleEditOpen}
                  onDelete={handleDelete}
                  onNavigate={() => navigate('/tasks')}
                />
              ))}
            </AnimatePresence>
            {hasMore && (
              <button
                onClick={() => navigate('/tasks')}
                className="w-full py-2 text-sm text-primary font-medium transition-colors hover:underline"
              >
                Ver mais ({totalPending - 5} tarefas)...
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});

DashboardTasksSection.displayName = 'DashboardTasksSection';

export default DashboardTasksSection;
