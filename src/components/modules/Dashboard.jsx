import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-dark-text-primary mb-3">Tarefas Pendentes</h3>
            <motion.div
              key={pendingTasks}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-indigo-600 dark:text-dark-accent-indigo"
            >
              {pendingTasks}
            </motion.div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-dark-text-primary mb-3">Gastos do Mês</h3>
            <motion.div
              key={totalExpenses}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-emerald-600 dark:text-dark-accent-emerald"
            >
              R$ {totalExpenses.toFixed(2)}
            </motion.div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-dark-text-primary mb-3">Itens na Lista</h3>
            <motion.div
              key={pendingItems}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-cyan-600 dark:text-dark-accent-cyan"
            >
              {pendingItems}
            </motion.div>
          </Card>
        </motion.div>
      </div>

      {/* Quadro de Avisos e Minhas Tarefas lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quadro de Avisos - Ocupa 2 colunas */}
        <div className="lg:col-span-2">
          <Card title="Quadro de Avisos" headerAction={
            <button className="text-indigo-600 dark:text-dark-accent-indigo hover:text-indigo-700 dark:hover:text-purple-400 transition-colors duration-300">
              <Plus size={24} />
            </button>
          }>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {notices.map((notice, index) => (
                  <motion.div
                    key={notice.id}
                    layout
                    initial={{ opacity: 0, x: -50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9, height: 0 }}
                    transition={{
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.3 },
                      delay: index * 0.05
                    }}
                    className="bg-amber-50 dark:bg-dark-bg-tertiary border-l-4 border-amber-400 dark:border-dark-accent-amber p-4 rounded transition-colors duration-300"
                  >
                    <p className="text-slate-800 dark:text-dark-text-primary">{notice.text}</p>
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-600 dark:text-dark-text-tertiary">
                      <span>Por: {notice.author}</span>
                      <span>{new Date(notice.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
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
              <AnimatePresence mode="popLayout">
                {myTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                      delay: index * 0.05
                    }}
                    className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-dark-bg-tertiary rounded-lg border-l-2 border-indigo-300 dark:border-dark-accent-indigo transition-colors duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="w-5 h-5 accent-indigo-500 dark:accent-dark-accent-indigo" />
                      <span className="text-slate-800 dark:text-dark-text-primary">{task.title}</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-dark-text-tertiary">{task.assignedTo}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
