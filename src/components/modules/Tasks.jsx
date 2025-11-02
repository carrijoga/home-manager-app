import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
// import Input from '../common/Input';
import { DatePicker, Input } from '../ui';

/**
 * Módulo de Tarefas
 */
const Tasks = ({ tasks, onAddTask, onToggleTask, onDeleteTask }) => {
  const [newTask, setNewTask] = useState({
    title: '',
    assignedTo: '',
    dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTask = async () => {
    if (newTask.title.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddTask({
          title: newTask.title,
          assignedTo: newTask.assignedTo || 'Geral',
          dueDate: newTask.dueDate || new Date().toISOString().split('T')[0]
        });
        setNewTask({ title: '', assignedTo: '', dueDate: '' });
      } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-6">
      <Card title="Tarefas da Casa">
        {/* Formulário de Nova Tarefa */}
        <div className="mb-6 space-y-3 p-4 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg transition-colors duration-300">
          <Input
            placeholder="Nome da tarefa..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Responsável..."
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
            />
            <DatePicker
              className='dark:bg-dark-bg-elevated dark:text-dark-text-primary dark:placeholder-dark-text-muted'
              value={newTask.dueDate}
              onChange={(date) => setNewTask({ ...newTask, dueDate: date })}
              onChange={(date) => setNewTask({ ...newTask, dueDate: date?.toISOString().split('T')[0] || '' })}
              defaultToToday
            />
          </div>
          <Button variant="primary" fullWidth onClick={handleAddTask} loading={isSubmitting} disabled={isSubmitting}>
            Adicionar Tarefa
          </Button>
        </div>

        {/* Tarefas Pendentes */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 dark:text-dark-text-primary">Pendentes</h3>
          <AnimatePresence mode="popLayout">
            {pendingTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.2 }
                }}
                className="flex items-center justify-between p-4 bg-serenidade-50 dark:bg-dark-bg-tertiary rounded-lg border-l-4 border-serenidade-500 dark:border-dark-accent-serenidade transition-colors duration-300"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="w-5 h-5 cursor-pointer accent-serenidade-500 dark:accent-dark-accent-serenidade"
                  />
                  <div>
                    <p className="text-gray-800 dark:text-dark-text-primary font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600 dark:text-dark-text-tertiary">
                      {task.assignedTo} • {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDeleteTask(task.id)}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-300"
                >
                  <Trash2 size={18} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Tarefas Concluídas */}
        <div className="space-y-3 mt-6">
          <h3 className="font-semibold text-gray-700 dark:text-dark-text-primary">Concluídas</h3>
          <AnimatePresence mode="popLayout">
            {completedTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 0.6, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.2 }
                }}
                className="flex items-center justify-between p-4 bg-natureza-50 dark:bg-dark-bg-tertiary rounded-lg border-l-4 border-natureza-500 dark:border-dark-accent-natureza transition-colors duration-300"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="w-5 h-5 cursor-pointer accent-natureza-500 dark:accent-dark-accent-natureza"
                  />
                  <div>
                    <p className="text-gray-800 dark:text-dark-text-primary line-through">{task.title}</p>
                    <p className="text-sm text-gray-600 dark:text-dark-text-tertiary">{task.assignedTo}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDeleteTask(task.id)}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-300"
                >
                  <Trash2 size={18} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};

export default Tasks;
