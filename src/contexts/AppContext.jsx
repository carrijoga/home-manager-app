import * as financialService from '@/services/financialService';
import * as futureItemsService from '@/services/futureItemsService';
import * as noticeService from '@/services/noticeService';
import * as shoppingService from '@/services/shoppingService';
import * as taskService from '@/services/taskService';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  // ========== ESTADOS ==========
  const [notices, setNotices] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [futureItems, setFutureItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========== NOTICES ==========
  const addNotice = async (notice) => {
    const newNotice = await noticeService.addNotice(notice);
    setNotices([...notices, newNotice]);
  };

  const deleteNotice = async (id) => {
    await noticeService.deleteNotice(id);
    setNotices(notices.filter(n => n.id !== id));
  };

  // ========== TASKS ==========
  const addTask = async (task) => {
    const newTask = await taskService.addTask(task);
    setTasks([...tasks, newTask]);
  };

  const toggleTask = async (id) => {
    const updatedTask = await taskService.toggleTaskCompletion(id);
    setTasks(tasks.map(t => t.id === id ? updatedTask : t));
  };

  const deleteTask = async (id) => {
    await taskService.deleteTask(id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  // ========== SHOPPING ==========
  const addShoppingItem = async (item) => {
    const newItem = await shoppingService.addShoppingItem(item);
    setShoppingList([...shoppingList, newItem]);
  };

  const toggleShoppingItem = async (id) => {
    const updatedItem = await shoppingService.toggleShoppingItem(id);
    setShoppingList(shoppingList.map(i => i.id === id ? updatedItem : i));
  };

  const deleteShoppingItem = async (id) => {
    await shoppingService.deleteShoppingItem(id);
    setShoppingList(shoppingList.filter(i => i.id !== id));
  };

  // ========== FINANCIAL ==========
  const addExpense = async (expense) => {
    const newExpense = await financialService.addExpense(expense);
    setExpenses([...expenses, newExpense]);
  };

  const deleteExpense = async (id) => {
    await financialService.deleteExpense(id);
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // ========== FUTURE ITEMS ==========
  const addFutureItem = async (item) => {
    const newItem = await futureItemsService.addFutureItem(item);
    setFutureItems([...futureItems, newItem]);
  };

  const deleteFutureItem = async (id) => {
    await futureItemsService.deleteFutureItem(id);
    setFutureItems(futureItems.filter(i => i.id !== id));
  };

  // ========== LOAD INITIAL DATA ==========
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [noticesData, tasksData, shoppingData, expensesData, futureData] = 
          await Promise.all([
            noticeService.getAllNotices(),
            taskService.getAllTasks(),
            shoppingService.getShoppingList(),
            financialService.getAllExpenses(),
            futureItemsService.getAllFutureItems(),
          ]);
        
        setNotices(noticesData);
        setTasks(tasksData);
        setShoppingList(shoppingData);
        setExpenses(expensesData);
        setFutureItems(futureData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ========== MEMOIZED VALUE ==========
  const value = useMemo(() => ({
    // States
    notices,
    tasks,
    shoppingList,
    expenses,
    futureItems,
    loading,
    
    // Notices actions
    addNotice,
    deleteNotice,
    
    // Tasks actions
    addTask,
    toggleTask,
    deleteTask,
    
    // Shopping actions
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    
    // Financial actions
    addExpense,
    deleteExpense,
    
    // Future items actions
    addFutureItem,
    deleteFutureItem,
  }), [notices, tasks, shoppingList, expenses, futureItems, loading]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// ========== HOOK CUSTOMIZADO ==========
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
}
