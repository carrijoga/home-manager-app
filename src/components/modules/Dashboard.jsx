import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Card from '../common/Card';
import Input from '../common/Input';

/**
 * Módulo Dashboard - Visão geral da casa
 */
const Dashboard = ({ notices, tasks, shoppingList, expenses, onAddNotice }) => {
  const [newNotice, setNewNotice] = useState('');

  const handleAddNotice = () => {
    if (newNotice.trim()) {
      onAddNotice({
        text: newNotice,
        author: 'Você',
        date: new Date().toISOString().split('T')[0]
      });
      setNewNotice('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddNotice();
    }
  };

  const myTasks = tasks.filter(t => !t.completed).slice(0, 3);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const pendingItems = shoppingList.items.filter(i => !i.checked).length;

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-lg font-semibold text-ninho-700 dark:text-dark-text-primary mb-3">Tarefas Pendentes</h3>
          <div className="text-3xl font-bold text-serenidade-600 dark:text-dark-accent-serenidade">{pendingTasks}</div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-ninho-700 dark:text-dark-text-primary mb-3">Gastos do Mês</h3>
          <div className="text-3xl font-bold text-natureza-600 dark:text-dark-accent-natureza">R$ {totalExpenses.toFixed(2)}</div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-ninho-700 dark:text-dark-text-primary mb-3">Itens na Lista</h3>
          <div className="text-3xl font-bold text-aconchego-600 dark:text-dark-accent-aconchego">{pendingItems}</div>
        </Card>
      </div>

      {/* Quadro de Avisos e Minhas Tarefas lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quadro de Avisos - Ocupa 2 colunas */}
        <div className="lg:col-span-2">
          <Card title="Quadro de Avisos" headerAction={
            <button className="text-ninho-600 dark:text-dark-accent-ninho hover:text-ninho-700 dark:hover:text-dark-accent-aconchego transition-colors duration-300">
              <Plus size={24} />
            </button>
          }>
            <div className="space-y-3">
              {notices.map(notice => (
                <div key={notice.id} className="bg-aviso-50 dark:bg-dark-bg-tertiary border-l-4 border-aviso-400 dark:border-dark-accent-aviso p-4 rounded transition-colors duration-300">
                  <p className="text-ninho-800 dark:text-dark-text-primary">{notice.text}</p>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-600 dark:text-dark-text-tertiary">
                    <span>Por: {notice.author}</span>
                    <span>{new Date(notice.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Input
                placeholder="Adicionar novo aviso..."
                value={newNotice}
                onChange={(e) => setNewNotice(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </Card>
        </div>

        {/* Minhas Tarefas - Ocupa 1 coluna */}
        <div className="lg:col-span-1">
          <Card title="Minhas Tarefas">
            <div className="space-y-2">
              {myTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-serenidade-50 dark:bg-dark-bg-tertiary rounded-lg border-l-2 border-serenidade-300 dark:border-dark-accent-serenidade transition-colors duration-300">
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" className="w-5 h-5 accent-serenidade-500 dark:accent-dark-accent-serenidade" />
                    <span className="text-ninho-800 dark:text-dark-text-primary">{task.title}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-dark-text-tertiary">{task.assignedTo}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
