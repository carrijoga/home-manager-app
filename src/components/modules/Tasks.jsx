import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

/**
 * Módulo de Tarefas
 */
const Tasks = ({ tasks, onAddTask, onToggleTask, onDeleteTask }) => {
  const [newTask, setNewTask] = useState({
    title: '',
    assignedTo: '',
    dueDate: ''
  });

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      onAddTask({
        title: newTask.title,
        assignedTo: newTask.assignedTo || 'Geral',
        dueDate: newTask.dueDate || new Date().toISOString().split('T')[0]
      });
      setNewTask({ title: '', assignedTo: '', dueDate: '' });
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-6">
      <Card title="Tarefas da Casa">
        {/* Formulário de Nova Tarefa */}
        <div className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg">
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
            <Input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
          </div>
          <Button variant="primary" fullWidth onClick={handleAddTask}>
            Adicionar Tarefa
          </Button>
        </div>

        {/* Tarefas Pendentes */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Pendentes</h3>
          {pendingTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 bg-serenidade-50 rounded-lg border-l-4 border-serenidade-500"
            >
              <div className="flex items-center space-x-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="w-5 h-5 cursor-pointer"
                />
                <div>
                  <p className="text-gray-800 font-medium">{task.title}</p>
                  <p className="text-sm text-gray-600">
                    {task.assignedTo} • {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Tarefas Concluídas */}
        <div className="space-y-3 mt-6">
          <h3 className="font-semibold text-gray-700">Concluídas</h3>
          {completedTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 bg-natureza-50 rounded-lg border-l-4 border-natureza-500 opacity-60"
            >
              <div className="flex items-center space-x-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="w-5 h-5 cursor-pointer"
                />
                <div>
                  <p className="text-gray-800 line-through">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.assignedTo}</p>
                </div>
              </div>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Tasks;
