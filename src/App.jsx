import { useCallback, useEffect, useState } from 'react';
import { FadeIn } from './components/common/FadeIn';
import Calendar from './components/modules/Calendar';
import Dashboard from './components/modules/Dashboard';
import Financial from './components/modules/Financial';
import FutureItems from './components/modules/FutureItems';
import ShoppingList from './components/modules/ShoppingList';
import Tasks from './components/modules/Tasks';
import Navigation from './components/Navigation';
import { DashboardSkeleton, ExpenseListSkeleton, ShoppingListSkeleton, TaskListSkeleton } from './components/skeletons';
import { useTheme } from './contexts/ThemeContext';
import { ModuleIds } from './models/types';

// Serviços
import * as financialService from './services/financialService';
import * as futureItemsService from './services/futureItemsService';
import * as noticeService from './services/noticeService';
import * as shoppingService from './services/shoppingService';
import * as taskService from './services/taskService';

/**
 * Componente principal da aplicação Home Manager
 */
const App = () => {
  // Tema
  const { theme, setTheme } = useTheme();

  // Estado do módulo atual
  const [currentModule, setCurrentModule] = useState(ModuleIds.DASHBOARD);

  // Estados dos dados
  const [notices, setNotices] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [shoppingList, setShoppingList] = useState({ month: '', items: [] });
  const [expenses, setExpenses] = useState([]);
  const [futureItems, setFutureItems] = useState([]);

  // Estado de loading
  const [loading, setLoading] = useState(true);

  // Carrega dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [noticesData, tasksData, shoppingData, expensesData, futureItemsData] = await Promise.all([
        noticeService.getAllNotices(),
        taskService.getAllTasks(),
        shoppingService.getShoppingList(),
        financialService.getAllExpenses(),
        futureItemsService.getAllFutureItems()
      ]);

      setNotices(noticesData);
      setTasks(tasksData);
      setShoppingList(shoppingData);
      setExpenses(expensesData);
      setFutureItems(futureItemsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers de Avisos
  const handleAddNotice = useCallback(async (notice) => {
    const newNotice = await noticeService.addNotice(notice);
    setNotices(prev => [...prev, newNotice]);
  }, []);

  const handleRemoveNotice = useCallback(async (id) => {
    await noticeService.deleteNotice(id);
    setNotices(prev => prev.filter(notice => notice.id !== id));
  }, []);

  // Handlers de Tarefas
  const handleAddTask = useCallback(async (task) => {
    const newTask = await taskService.addTask(task);
    setTasks(prev => [...prev, newTask]);
  }, []);

  const handleToggleTask = useCallback((id) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }, []);

  const handleDeleteTask = useCallback(async (id) => {
    await taskService.deleteTask(id);
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  // Handlers de Lista de Compras
  const handleAddShoppingItem = useCallback(async (item) => {
    const newItem = await shoppingService.addShoppingItem(item);
    setShoppingList(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  }, []);

  const handleToggleShoppingItem = useCallback((id) => {
    setShoppingList(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    }));
  }, []);

  const handleDeleteShoppingItem = useCallback(async (id) => {
    await shoppingService.deleteShoppingItem(id);
    setShoppingList(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  }, []);

  // Handlers de Despesas
  const handleAddExpense = useCallback(async (expense) => {
    const newExpense = await financialService.addExpense(expense);
    setExpenses(prev => [...prev, newExpense]);
  }, []);

  const handleDeleteExpense = useCallback(async (id) => {
    await financialService.deleteExpense(id);
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  }, []);

  // Handlers de Itens Futuros
  const handleAddFutureItem = useCallback(async (item) => {
    const newItem = await futureItemsService.addFutureItem(item);
    setFutureItems(prev => [...prev, newItem]);
  }, []);

  const handleDeleteFutureItem = useCallback(async (id) => {
    await futureItemsService.deleteFutureItem(id);
    setFutureItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Renderiza o módulo atual
  const renderCurrentModule = () => {
    if (loading) {
      // Mostra skeleton apropriado para cada módulo
      switch (currentModule) {
        case ModuleIds.DASHBOARD:
          return <DashboardSkeleton />;
        case ModuleIds.TASKS:
          return (
            <div className="space-y-4">
              <div className="h-10 w-full" />
              <TaskListSkeleton items={5} />
            </div>
          );
        case ModuleIds.SHOPPING:
          return (
            <div className="space-y-4">
              <div className="h-10 w-full" />
              <ShoppingListSkeleton items={5} />
            </div>
          );
        case ModuleIds.FINANCIAL:
          return (
            <div className="space-y-4">
              <div className="h-10 w-full" />
              <ExpenseListSkeleton items={5} />
            </div>
          );
        case ModuleIds.FUTURE_ITEMS:
          return (
            <div className="space-y-4">
              <div className="h-10 w-full" />
              <ExpenseListSkeleton items={5} />
            </div>
          );
        default:
          return <DashboardSkeleton />;
      }
    }

    switch (currentModule) {
      case ModuleIds.DASHBOARD:
        return (
          <FadeIn>
            <Dashboard
              notices={notices}
              tasks={tasks}
              shoppingList={shoppingList}
              expenses={expenses}
              futureItems={futureItems}
              onAddNotice={handleAddNotice}
              onRemoveNotice={handleRemoveNotice}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onNavigateToTasks={() => setCurrentModule(ModuleIds.TASKS)}
            />
          </FadeIn>
        );
      case ModuleIds.TASKS:
        return (
          <FadeIn>
            <Tasks
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          </FadeIn>
        );
      case ModuleIds.SHOPPING:
        return (
          <FadeIn>
            <ShoppingList
              shoppingList={shoppingList}
              onAddItem={handleAddShoppingItem}
              onToggleItem={handleToggleShoppingItem}
              onDeleteItem={handleDeleteShoppingItem}
            />
          </FadeIn>
        );
      case ModuleIds.FINANCIAL:
        return (
          <FadeIn>
            <Financial
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          </FadeIn>
        );
      case ModuleIds.FUTURE:
        return (
          <FadeIn>
            <FutureItems
              futureItems={futureItems}
              onAddItem={handleAddFutureItem}
              onDeleteItem={handleDeleteFutureItem}
            />
          </FadeIn>
        );
      case ModuleIds.CALENDAR:
        return (
          <FadeIn>
            <Calendar />
          </FadeIn>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <Navigation
        currentModule={currentModule}
        onModuleChange={setCurrentModule}
        currentTheme={theme}
        onThemeChange={setTheme}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="animate-fade-in">
          {renderCurrentModule()}
        </div>
      </main>
    </div>
  );
};

export default App;
