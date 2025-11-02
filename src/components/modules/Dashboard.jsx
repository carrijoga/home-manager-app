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
import { AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  DollarSign,
  Plus,
  ShoppingCart,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Card from '../common/Card';
import Input from '../common/Input';
import MetricCard from '../common/MetricCard';
import PostIt from '../common/PostIt';
import DashboardTasksSection from './DashboardTasksSection';

/**
 * Módulo Dashboard - Visão geral da casa
 */
const Dashboard = ({ 
  notices, 
  tasks, 
  shoppingList, 
  expenses, 
  futureItems, 
  onAddNotice,
  onRemoveNotice,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onNavigateToTasks
}) => {
  const [newNotice, setNewNotice] = useState('');
  const MAX_NOTICE_LENGTH = 200;

  const handleAddNotice = () => {
    const trimmedNotice = newNotice.trim();
    
    if (!trimmedNotice) {
      toast.error('Digite um aviso para adicionar');
      return;
    }
    
    if (trimmedNotice.length > MAX_NOTICE_LENGTH) {
      toast.error(`O aviso deve ter no máximo ${MAX_NOTICE_LENGTH} caracteres`);
      return;
    }
    
    onAddNotice({
      text: trimmedNotice,
      author: 'Você',
      createdBy: 'Você',
      date: new Date().toISOString().split('T')[0]
    });
    
    setNewNotice('');
    toast.success('Aviso adicionado!');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNotice();
    }
  };

  const handleRemoveNotice = (id) => {
    onRemoveNotice(id);
    toast.success('Aviso removido!');
  };

  const remainingChars = MAX_NOTICE_LENGTH - newNotice.length;

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quadro de Avisos - Ocupa 1 coluna */}
        <div className="lg:col-span-1">
          <Card 
            title="Quadro de Avisos" 
            headerAction={
              <button 
                onClick={handleAddNotice}
                disabled={!newNotice.trim()}
                className="text-indigo-600 dark:text-dark-accent-indigo hover:text-indigo-700 dark:hover:text-purple-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Adicionar aviso"
              >
                <Plus size={24} />
              </button>
            }
          >
            {/* Input para novo aviso */}
            <div className="mb-6 space-y-2">
              <div className="relative">
                <Input
                  placeholder="Digite um aviso... (pressione Enter para adicionar)"
                  value={newNotice}
                  onChange={(e) => setNewNotice(e.target.value.slice(0, MAX_NOTICE_LENGTH))}
                  onKeyPress={handleKeyPress}
                  className="pr-16"
                />
                <span 
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                    remainingChars < 20 
                      ? 'text-red-500 dark:text-red-400 font-semibold' 
                      : 'text-gray-400 dark:text-dark-text-tertiary'
                  }`}
                >
                  {remainingChars}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-dark-text-tertiary">
                <span>📝 Digite até {MAX_NOTICE_LENGTH} caracteres</span>
                <button
                  onClick={handleAddNotice}
                  disabled={!newNotice.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-dark-accent-indigo dark:hover:bg-purple-600 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 dark:disabled:hover:bg-dark-accent-indigo text-xs font-medium"
                >
                  + Novo Aviso
                </button>
              </div>
            </div>

            {/* Grid de Post-its */}
            {notices.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-dark-text-tertiary">
                <p className="text-lg mb-2">📝</p>
                <p>Nenhum aviso no momento</p>
                <p className="text-sm mt-1">Adicione o primeiro aviso acima!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
                <AnimatePresence mode="popLayout">
                  {notices.map((notice, index) => (
                    <PostIt
                      key={notice.id}
                      id={notice.id}
                      text={notice.text}
                      author={notice.author}
                      date={notice.date}
                      createdBy={notice.createdBy || notice.author}
                      currentUser="Você"
                      onRemove={handleRemoveNotice}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </div>

        {/* Minhas Tarefas - Ocupa 1 coluna */}
        <div className="lg:col-span-1">
          <DashboardTasksSection
            tasks={tasks}
            onAddTask={onAddTask}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            onNavigateToTasks={onNavigateToTasks}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
