import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import {
  calculateAverage,
  calculateMonthlySavings,
  calculatePercentageChange,
  formatCurrency,
  generateTrendData,
  getCurrentMonth,
  getDailyAverageExpense,
  getDaysUntilNextBill,
  getMonthlyExpenseProjection,
  getOverdueTasks,
  getPreviousMonth,
  getTopExpenseCategory,
  groupExpensesByMonth,
  groupTasksByMonth
} from '@/utils/dashboardMetrics';
import { AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Pin,
  Plus,
  ShoppingCart,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  DailyAverageCard,
  MonthProjectionCard,
  NextBillCard,
  OverdueTasksCard,
  SavingsCard,
  TopCategoryCard
} from '../common/AdditionalMetricCards';
import Card from '../common/Card';
import CarouselMetrics from '../common/CarouselMetrics';
import MetricCard from '../common/MetricCard';
import PostIt from '../common/PostIt';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui';
import DashboardTasksSection from './DashboardTasksSection';

/**
 * Módulo Dashboard - Visão geral da casa
 */
const Dashboard = () => {
  // Obtém estados e ações do contexto global
  const {
    notices,
    tasks,
    shoppingList,
    expenses,
    futureItems,
    user,
    addNotice,
    deleteNotice,
    addTask,
    toggleTask,
    deleteTask
  } = useApp();

  const { showSuccess, showError } = useToastNotifications();
  const [newNotice, setNewNotice] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNewNoticeOpen, setIsNewNoticeOpen] = useState(false);
  const MAX_NOTICE_LENGTH = 200;

  const handleAddNotice = useCallback(() => {
    const trimmedNotice = newNotice.trim();

    if (!trimmedNotice) {
      showError('Digite um aviso para adicionar');
      return;
    }

    if (trimmedNotice.length > MAX_NOTICE_LENGTH) {
      showError(`O aviso deve ter no máximo ${MAX_NOTICE_LENGTH} caracteres`);
      return;
    }

    addNotice({
      text: trimmedNotice,
      author: 'Você',
      createdBy: 'Você',
      date: new Date().toISOString().split('T')[0]
    });

    setNewNotice('');
    setIsNewNoticeOpen(false);
    showSuccess('Aviso adicionado!');
  }, [newNotice, addNotice, showSuccess, showError]);

  const handleRemoveNotice = useCallback((id) => {
    deleteNotice(id);
    showSuccess('Aviso removido!');
  }, [deleteNotice, showSuccess]);

  // Separar avisos atuais (últimos 4) e histórico
  const currentNotices = useMemo(() => notices.slice(0, 4), [notices]);
  const historicalNotices = useMemo(() => notices.slice(4), [notices]);

  // Cálculos das métricas - Separados para melhor performance
  const expenseMetrics = useMemo(() => {
    const currentMonth = getCurrentMonth();
    const previousMonth = getPreviousMonth();
    
    const expensesByMonth = groupExpensesByMonth(expenses);
    const currentExpenses = expensesByMonth[currentMonth] || 0;
    const previousExpenses = expensesByMonth[previousMonth] || 0;
    const expenseChange = calculatePercentageChange(currentExpenses, previousExpenses);
    const expenseTrend = generateTrendData(expensesByMonth, 6);
    
    // Média de gastos dos últimos 6 meses
    const last6MonthsExpenses = expenseTrend.map(d => d.value);
    const averageExpenses = calculateAverage(last6MonthsExpenses);
    const isAboveAverage = currentExpenses > averageExpenses;
    
    return {
      current: currentExpenses,
      change: expenseChange,
      trend: expenseTrend,
      isAboveAverage
    };
  }, [expenses]);

  const taskMetrics = useMemo(() => {
    const currentMonth = getCurrentMonth();
    const previousMonth = getPreviousMonth();
    
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
    
    return {
      pending: pendingTasks,
      completed: completedTasks,
      total: totalTasks,
      completionRate: currentTaskStats.completionRate,
      change: taskCompletionChange
    };
  }, [tasks]);

  const shoppingMetrics = useMemo(() => {
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
    
    return {
      pending: pendingItems,
      total: totalItems,
      estimatedValue,
      topCategory
    };
  }, [shoppingList.items]);

  const futureMetrics = useMemo(() => {
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
      prioritized: prioritizedItems,
      totalValue: totalFutureValue,
      topItem: highestPriorityItem
    };
  }, [futureItems]);

  // Agrega todas as métricas
  const metrics = useMemo(() => ({
    expenses: expenseMetrics,
    tasks: taskMetrics,
    shopping: shoppingMetrics,
    future: futureMetrics
  }), [expenseMetrics, taskMetrics, shoppingMetrics, futureMetrics]);

  // Métricas adicionais para o carrossel
  const additionalMetrics = useMemo(() => {
    const savings = calculateMonthlySavings(expenses);
    const topCategory = getTopExpenseCategory(expenses);
    const nextBill = getDaysUntilNextBill(expenses);
    const overdueTasks = getOverdueTasks(tasks);
    const dailyAverage = getDailyAverageExpense(expenses);
    const monthProjection = getMonthlyExpenseProjection(expenses);

    return {
      savings,
      topCategory,
      nextBill,
      overdueTasks,
      dailyAverage,
      monthProjection
    };
  }, [expenses, tasks]);

  // Obtém a saudação de acordo com o horário
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  // Obtém mensagem motivacional aleatória
  const getMotivationalMessage = useCallback(() => {
    const messages = [
      'Vamos organizar o dia de hoje?',
      'Seu lar merece o melhor!',
      'Pronto para conquistar suas metas?',
      'Juntos, a organização fica mais fácil!',
      'Um dia produtivo começa aqui!',
      'Vamos manter tudo em ordem?',
      'Sua família conta com você!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Saudação Personalizada */}
      <div className="bg-gradient-to-r from-gray-50 to-indigo-50/30 dark:from-gray-800/50 dark:to-indigo-900/10 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {getGreeting()}, {user?.name || 'Usuário'}!
                <span className="text-2xl animate-wave inline-block">👋</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {getMotivationalMessage()}
              </p>
            </div>
          </div>
          <div className="hidden sm:block opacity-60">
            <Sparkles className="text-indigo-500 dark:text-indigo-400" size={20} />
          </div>
        </div>
      </div>

      {/* Carrossel de Métricas */}
      <div className="group max-w-full">
        <CarouselMetrics autoPlayDelay={5000}>
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
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span className="font-semibold">{metrics.tasks.completionRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
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

          {/* Cards Adicionais do Carrossel */}
          <SavingsCard 
            savings={additionalMetrics.savings.savings}
            percentage={additionalMetrics.savings.percentage}
            animationDelay={0.5}
          />

          <TopCategoryCard
            category={additionalMetrics.topCategory.category}
            value={additionalMetrics.topCategory.value}
            animationDelay={0.6}
          />

          <NextBillCard
            days={additionalMetrics.nextBill.days}
            bill={additionalMetrics.nextBill.bill}
            animationDelay={0.7}
          />

          <OverdueTasksCard
            count={additionalMetrics.overdueTasks}
            animationDelay={0.8}
          />

          <DailyAverageCard
            average={additionalMetrics.dailyAverage}
            animationDelay={0.9}
          />

          <MonthProjectionCard
            projection={additionalMetrics.monthProjection}
            current={metrics.expenses.current}
            animationDelay={1.0}
          />
        </CarouselMetrics>
      </div>

      {/* Quadro de Avisos e Minhas Tarefas lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quadro de Avisos - Ocupa 1 coluna */}
        <div className="lg:col-span-1">
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Pin size={20} className="text-indigo-600 dark:text-dark-accent-indigo" />
                <span>Quadro de Avisos</span>
              </div>
            }
            headerAction={
              <div className="flex items-center gap-2">
              {/* Dialog para Novo Aviso */}
              <Dialog open={isNewNoticeOpen} onOpenChange={setIsNewNoticeOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors">
                    <Plus size={16} />
                    Novo Aviso
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md p-0 overflow-hidden border-yellow-200 dark:border-yellow-300">
                  <div className="bg-yellow-50 dark:bg-yellow-100 p-6 rounded-lg border-2 border-yellow-200 dark:border-yellow-300 shadow-lg">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-gray-800 dark:text-gray-900 font-semibold text-lg">
                        📝 Novo Aviso
                      </DialogTitle>
                    </DialogHeader>
                    
                    {/* Textarea estilizada como Post-It */}
                    <div className="space-y-3">
                      <textarea
                        placeholder="Digite seu aviso aqui..."
                        value={newNotice}
                        onChange={(e) => setNewNotice(e.target.value.slice(0, MAX_NOTICE_LENGTH))}
                        className="w-full min-h-[120px] p-3 bg-yellow-50 dark:bg-yellow-50 text-gray-800 dark:text-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-600 border-2 border-yellow-300 dark:border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 resize-none"
                        autoFocus
                      />
                      
                      {/* Contador de caracteres */}
                      <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-700">
                        <span className="font-medium">
                          {newNotice.length}/{MAX_NOTICE_LENGTH} caracteres
                        </span>
                        {newNotice.length > MAX_NOTICE_LENGTH * 0.9 && (
                          <span className="text-amber-600 dark:text-amber-700 font-semibold">
                            ⚠️ Limite próximo
                          </span>
                        )}
                      </div>
                      
                      {/* Rodapé com autor e data (preview) */}
                      <div className="pt-3 border-t border-yellow-300 dark:border-yellow-400 flex justify-between items-center text-xs text-gray-600 dark:text-gray-700">
                        <span className="font-medium flex items-center gap-1">
                          <span className="inline-block">👤</span>
                          Você
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block">📅</span>
                          {new Date().toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>
                      
                      {/* Botões de ação */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            setNewNotice('');
                            setIsNewNoticeOpen(false);
                          }}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-800 bg-white dark:bg-yellow-200 border border-yellow-300 dark:border-yellow-400 rounded-md hover:bg-gray-50 dark:hover:bg-yellow-300 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleAddNotice}
                          disabled={!newNotice.trim()}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogTrigger className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors border border-border">
                  <Clock size={16} />
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Histórico de Avisos</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    {historicalNotices.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-dark-text-tertiary">
                        <Clock className="mx-auto mb-2" size={32} />
                        <p>Nenhum aviso no histórico</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {historicalNotices.map((notice, index) => (
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
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            }
          >
            {/* Grid de Post-its - Mostra apenas os 4 mais recentes */}
            {currentNotices.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-dark-text-tertiary">
                <p className="text-lg mb-2">📝</p>
                <p>Nenhum aviso no momento</p>
                <p className="text-sm mt-1">Adicione o primeiro aviso acima!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
                <AnimatePresence mode="popLayout">
                  {currentNotices.map((notice, index) => (
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
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
