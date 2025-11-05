import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ClipboardList, Edit, Eye, MoreVertical, Plus, Trash2 } from 'lucide-react';
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
  Textarea
} from '../ui';

/**
 * Componente de item de tarefa - Memoizado e isolado para evitar re-renders
 */
const TaskItem = memo(({ task, isCompleted = false, onToggle, onDelete, onNavigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ 
      opacity: isCompleted ? 0.7 : 1, 
      y: 0
    }}
    exit={{ opacity: 0, x: -20 }}
    transition={{
      duration: 0.2,
      ease: "easeOut"
    }}
    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
      isCompleted
        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
        : 'bg-white dark:bg-dark-bg-tertiary border-gray-200 dark:border-dark-border-secondary hover:border-indigo-300 dark:hover:border-dark-accent-indigo'
    }`}
  >
    <div className="flex items-center space-x-3 flex-1 min-w-0">
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className={isCompleted ? 'data-[state=checked]:bg-emerald-500' : ''}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${
          isCompleted 
            ? 'line-through text-gray-600 dark:text-gray-400' 
            : 'text-gray-900 dark:text-dark-text-primary'
        }`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
            {task.assignedTo}
          </span>
          <span className="text-xs text-gray-400 dark:text-dark-text-tertiary">•</span>
          <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
            {new Date(task.dueDate).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
      {isCompleted && (
        <Badge variant="success" className="ml-2">
          Concluída
        </Badge>
      )}
    </div>

    {/* Menu de ações */}
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded transition-colors">
        <MoreVertical size={16} className="text-gray-500 dark:text-dark-text-tertiary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onNavigate}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalhes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNavigate}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        {!task.completed && (
          <DropdownMenuItem onClick={() => onToggle(task.id)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Marcar como concluída
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => onDelete(task.id)}
          className="text-red-600 dark:text-red-400"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </motion.div>
));

TaskItem.displayName = 'TaskItem';

/**
 * Componente de seção de Tarefas para o Dashboard
 * Com criação rápida, seções expansíveis e sincronização
 */
const DashboardTasksSection = memo(({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask
}) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastNotifications();
  const [quickTaskInput, setQuickTaskInput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'média',
    category: ''
  });

  // Filtrar tarefas - Memoizado para evitar re-cálculo
  const pendingTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);

  // Limitar a 5 tarefas pendentes - Memoizado
  const displayedPendingTasks = useMemo(() =>
    pendingTasks
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5),
    [pendingTasks]
  );
  const hasMorePendingTasks = pendingTasks.length > 5;

  /**
   * Criar tarefa rápida (Enter)
   */
  const handleQuickTaskCreate = useCallback(async (e) => {
    if (e.key === 'Enter' && quickTaskInput.trim()) {
      e.preventDefault();

      try {
        await onAddTask({
          title: quickTaskInput.trim(),
          assignedTo: 'Você',
          dueDate: new Date().toISOString().split('T')[0],
          description: '',
          priority: 'média'
        });

        setQuickTaskInput('');
        showSuccess('Tarefa criada!');
      } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        showError('Erro ao criar tarefa');
      }
    }
  }, [quickTaskInput, onAddTask, showSuccess, showError]);

  /**
   * Criar tarefa completa via dialog
   */
  const handleFullTaskCreate = useCallback(async () => {
    if (!newTask.title.trim()) {
      showError('Digite um título para a tarefa');
      return;
    }

    try {
      await onAddTask({
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        assignedTo: newTask.assignedTo || 'Geral',
        dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
        priority: newTask.priority,
        category: newTask.category
      });

      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'média',
        category: ''
      });
      setIsDialogOpen(false);
      showSuccess('Tarefa criada!');
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      showError('Erro ao criar tarefa');
    }
  }, [newTask, onAddTask, showSuccess, showError]);

  /**
   * Alternar conclusão de tarefa com animação
   */
  const handleToggleTask = useCallback(async (taskId) => {
    try {
      await onToggleTask(taskId);
      const task = tasks.find(t => t.id === taskId);
      if (task && !task.completed) {
        showSuccess('Tarefa concluída! 🎉');
      }
    } catch (error) {
      console.error('Erro ao alternar tarefa:', error);
      showError('Erro ao atualizar tarefa');
    }
  }, [onToggleTask, tasks, showSuccess, showError]);

  /**
   * Excluir tarefa
   */
  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      await onDeleteTask(taskId);
      showSuccess('Tarefa excluída');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
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
                <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">
                  Descrição *
                </label>
                <Textarea
                  placeholder="Descreva a tarefa..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">
                  Detalhes adicionais
                </label>
                <Textarea
                  placeholder="Detalhes opcionais..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">
                    Data
                  </label>
                  <DatePicker
                    value={newTask.dueDate}
                    onChange={(date) => setNewTask({ ...newTask, dueDate: date })}
                    defaultToToday
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">
                    Responsável
                  </label>
                  <Input
                    placeholder="Ex: João"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">
                    Prioridade
                  </label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <option value="alta">Alta</option>
                    <option value="média">Média</option>
                    <option value="baixa">Baixa</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1 block">
                    Categoria
                  </label>
                  <Input
                    placeholder="Ex: Casa"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t dark:border-dark-border-secondary">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFullTaskCreate}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-dark-accent-indigo dark:hover:bg-purple-600 rounded-md transition-colors"
                >
                  Criar Tarefa
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Input de criação rápida */}
      <div className="mb-4">
        <Input
          placeholder="Digite uma tarefa rápida... (pressione Enter)"
          value={quickTaskInput}
          onChange={(e) => setQuickTaskInput(e.target.value)}
          onKeyPress={handleQuickTaskCreate}
          className="w-full"
        />
        <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
          💡 Pressione Enter para criar rapidamente uma tarefa para hoje
        </p>
      </div>

      {/* Accordion com seções expansíveis */}
      <Accordion type="multiple" defaultValue={["pending"]} className="space-y-3">
        {/* Seção Pendentes */}
        <AccordionItem value="pending" className="border rounded-lg dark:border-dark-border-secondary">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                Pendentes
              </span>
              <Badge variant="secondary">
                {pendingTasks.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            {displayedPendingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-dark-text-tertiary">
                <CheckCircle2 className="mx-auto mb-2 text-emerald-500" size={32} />
                <p>Nenhuma tarefa pendente!</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {displayedPendingTasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      onNavigate={() => navigate('/tasks')}
                    />
                  ))}
                </AnimatePresence>
                
                {hasMorePendingTasks && (
                  <button
                    onClick={() => navigate('/tasks')}
                    className="w-full py-2 text-sm text-indigo-600 dark:text-dark-accent-indigo hover:text-indigo-700 dark:hover:text-purple-400 font-medium transition-colors"
                  >
                    Ver mais ({pendingTasks.length - 5} tarefas)...
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
