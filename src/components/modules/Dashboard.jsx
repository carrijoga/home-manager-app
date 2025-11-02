import {
  calculateAverage,
  calculatePercentageChange,
  formatCurrency,
  generateTrendData,
  getCurrentMonth,
  getPreviousMonth,
  groupExpensesByMonth,
  groupTasksByMonth
} from '@/utils/dashboardMetrics';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  DollarSign,
  Plus,
  ShoppingCart,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import MetricCard from '../common/MetricCard';

/**
 * Módulo Dashboard - Visão geral da casa
 */
const Dashboard = ({ notices, tasks, shoppingList, expenses, futureItems, onAddNotice }) => {
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

  // Cálculos das métricas
  const metrics = useMemo(() => {
    const currentMonth = getCurrentMonth();
    const previousMonth = getPreviousMonth();
    
    // Gastos do mês
    const expensesByMonth = groupExpensesByMonth(expenses);
    const currentExpenses = expensesByMonth[currentMonth] || 0;
    const previousExpenses = expensesByMonth[previousMonth] || 0;
    const expenseChange = calculatePercentageChange(currentExpenses, previousExpenses);
    const expenseTrend = generateTrendData(expensesByMonth, 6);
    
    // Média de gastos dos últimos 6 meses
    const last6MonthsExpenses = expenseTrend.map(d => d.value);
    const averageExpenses = calculateAverage(last6MonthsExpenses);
    const isAboveAverage = currentExpenses > averageExpenses;
    
    // Tarefas
    const tasksByMonth = groupTasksByMonth(tasks);
    const currentTaskStats = tasksByMonth[currentMonth] || { total: 0, completed: 0, completionRate: 0 };
    const previousTaskStats = tasksByMonth[previousMonth] || { total: 0, completed: 0, completionRate: 0 };
    const taskCompletionChange = calculatePercentageChange(
      currentTaskStats.completionRate, 
      previousTaskStats.completionRate
    );
    
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    
    // Lista de compras
    const pendingItems = shoppingList.items.filter(i => !i.checked).length;
    const totalItems = shoppingList.items.length;
    const estimatedValue = shoppingList.items
      .filter(i => !i.checked && i.price)
      .reduce((sum, item) => sum + (item.price || 0), 0);
    
    // Categoria com mais itens pendentes
    const categoryCount = {};
    shoppingList.items.filter(i => !i.checked).forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    const topCategory = Object.keys(categoryCount).length > 0
      ? Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0][0]
      : 'Nenhuma';
    
    // Compras futuras
    const prioritizedItems = futureItems?.filter(item => 
      item.priority === 'alta' && item.status !== 'purchased'
    ).length || 0;
    
    const totalFutureValue = futureItems?.reduce((sum, item) => {
      const value = typeof item.estimatedValue === 'number' 
        ? item.estimatedValue 
        : parseFloat(item.estimatedCost?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
      return sum + value;
    }, 0) || 0;
    
    const highestPriorityItem = futureItems?.find(item => 
      item.priority === 'alta' && item.status !== 'purchased'
    )?.name || 'Nenhum';
    
    return {
      expenses: {
        current: currentExpenses,
        change: expenseChange,
        trend: expenseTrend,
        isAboveAverage
      },
      tasks: {
        pending: pendingTasks,
        completed: completedTasks,
        total: totalTasks,
        completionRate: currentTaskStats.completionRate,
        change: taskCompletionChange
      },
      shopping: {
        pending: pendingItems,
        total: totalItems,
        estimatedValue,
        topCategory
      },
      future: {
        prioritized: prioritizedItems,
        totalValue: totalFutureValue,
        topItem: highestPriorityItem
      }
    };
  }, [expenses, tasks, shoppingList, futureItems]);

  const myTasks = tasks.filter(t => !t.completed).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total de Gastos do Mês */}
        <MetricCard
          icon={DollarSign}
          title="Gastos do Mês"
          value={formatCurrency(metrics.expenses.current)}
          color="#10b981" // emerald-500
          chartData={metrics.expenses.trend}
          comparison={{
            value: metrics.expenses.change,
            label: 'vs mês anterior'
          }}
          alertType={metrics.expenses.isAboveAverage ? 'warning' : undefined}
          animationDelay={0.1}
          footer={
            metrics.expenses.isAboveAverage && (
              <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
                <TrendingUp size={14} />
                <span>Acima da média mensal</span>
              </div>
            )
          }
        />

        {/* Card 2: Tarefas Concluídas */}
        <MetricCard
          icon={CheckCircle2}
          title="Tarefas Concluídas"
          value={`${metrics.tasks.completed}/${metrics.tasks.total}`}
          color="#6366f1" // indigo-500
          comparison={{
            value: metrics.tasks.change,
            label: 'taxa de conclusão'
          }}
          animationDelay={0.2}
          footer={
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-dark-text-tertiary">
                <span>Progresso</span>
                <span className="font-semibold">{metrics.tasks.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2">
                <div 
                  className="bg-indigo-500 dark:bg-dark-accent-indigo h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.tasks.completionRate}%` }}
                />
              </div>
            </div>
          }
        />

        {/* Card 3: Itens a Comprar */}
        <MetricCard
          icon={ShoppingCart}
          title="Itens a Comprar"
          value={metrics.shopping.pending}
          color="#06b6d4" // cyan-500
          animationDelay={0.3}
          footer={
            <div className="space-y-1 text-xs">
              {metrics.shopping.estimatedValue > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-dark-text-tertiary">
                  <span>Valor estimado:</span>
                  <span className="font-semibold">{formatCurrency(metrics.shopping.estimatedValue)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-dark-text-tertiary">
                <span>Categoria principal:</span>
                <span className="font-semibold">{metrics.shopping.topCategory}</span>
              </div>
            </div>
          }
        />

        {/* Card 4: Compras Futuras */}
        <MetricCard
          icon={Sparkles}
          title="Compras Futuras"
          value={metrics.future.prioritized}
          color="#a855f7" // purple-500
          animationDelay={0.4}
          footer={
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-dark-text-tertiary">
                <span>Valor total:</span>
                <span className="font-semibold">{formatCurrency(metrics.future.totalValue)}</span>
              </div>
              <div className="text-gray-600 dark:text-dark-text-tertiary">
                <span className="font-semibold">Prioridade:</span> {metrics.future.topItem}
              </div>
            </div>
          }
        />
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
