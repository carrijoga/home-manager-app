import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/modules/Dashboard';
import Tasks from './components/modules/Tasks';
import ShoppingList from './components/modules/ShoppingList';
import Financial from './components/modules/Financial';
import FutureItems from './components/modules/FutureItems';
import Calendar from './components/modules/Calendar';
import { ModuleIds } from './models/types';

// Serviços
import * as noticeService from './services/noticeService';
import * as taskService from './services/taskService';
import * as shoppingService from './services/shoppingService';
import * as financialService from './services/financialService';
import * as futureItemsService from './services/futureItemsService';

/**
 * Componente principal da aplicação Home Manager
 */
const App = () => {
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
  const handleAddNotice = async (notice) => {
    const newNotice = await noticeService.addNotice(notice);
    setNotices([...notices, newNotice]);
  };

  // Handlers de Tarefas
  const handleAddTask = async (task) => {
    const newTask = await taskService.addTask(task);
    setTasks([...tasks, newTask]);
  };

  const handleToggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = async (id) => {
    await taskService.deleteTask(id);
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Handlers de Lista de Compras
  const handleAddShoppingItem = async (item) => {
    const newItem = await shoppingService.addShoppingItem(item);
    setShoppingList({
      ...shoppingList,
      items: [...shoppingList.items, newItem]
    });
  };

  const handleToggleShoppingItem = (id) => {
    setShoppingList({
      ...shoppingList,
      items: shoppingList.items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    });
  };

  const handleDeleteShoppingItem = async (id) => {
    await shoppingService.deleteShoppingItem(id);
    setShoppingList({
      ...shoppingList,
      items: shoppingList.items.filter(item => item.id !== id)
    });
  };

  // Handlers de Despesas
  const handleAddExpense = async (expense) => {
    const newExpense = await financialService.addExpense(expense);
    setExpenses([...expenses, newExpense]);
  };

  const handleDeleteExpense = async (id) => {
    await financialService.deleteExpense(id);
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  // Handlers de Itens Futuros
  const handleAddFutureItem = async (item) => {
    const newItem = await futureItemsService.addFutureItem(item);
    setFutureItems([...futureItems, newItem]);
  };

  const handleDeleteFutureItem = async (id) => {
    await futureItemsService.deleteFutureItem(id);
    setFutureItems(futureItems.filter(item => item.id !== id));
  };

  // Renderiza o módulo atual
  const renderCurrentModule = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">Carregando...</div>
        </div>
      );
    }

    switch (currentModule) {
      case ModuleIds.DASHBOARD:
        return (
          <Dashboard
            notices={notices}
            tasks={tasks}
            shoppingList={shoppingList}
            expenses={expenses}
            onAddNotice={handleAddNotice}
          />
        );
      case ModuleIds.TASKS:
        return (
          <Tasks
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case ModuleIds.SHOPPING:
        return (
          <ShoppingList
            shoppingList={shoppingList}
            onAddItem={handleAddShoppingItem}
            onToggleItem={handleToggleShoppingItem}
            onDeleteItem={handleDeleteShoppingItem}
          />
        );
      case ModuleIds.FINANCIAL:
        return (
          <Financial
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case ModuleIds.FUTURE:
        return (
          <FutureItems
            futureItems={futureItems}
            onAddItem={handleAddFutureItem}
            onDeleteItem={handleDeleteFutureItem}
          />
        );
      case ModuleIds.CALENDAR:
        return <Calendar />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-aconchego-50 via-ninho-50 to-serenidade-100">
      <Header />
      <Navigation currentModule={currentModule} onModuleChange={setCurrentModule} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderCurrentModule()}
      </main>
    </div>
  );
};

export default App;
