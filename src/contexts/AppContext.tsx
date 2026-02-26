import * as authService from '@/services/authService';
import * as financialService from '@/services/financialService';
import * as futureItemsService from '@/services/futureItemsService';
import * as noticeService from '@/services/noticeService';
import * as shoppingService from '@/services/shoppingService';
import * as taskService from '@/services/taskService';
import * as userService from '@/services/userService';
import { userProfileToAppUser } from '@/types';
import type {
  AppNotification,
  AppUser,
  AppUserNest,
  FutureItem,
  Notice,
  ShoppingItem,
  ShoppingList,
  Task,
} from '@/types';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

// ---------- Types ----------

interface AppContextValue {
  // States
  notices: Notice[];
  tasks: Task[];
  shoppingList: ShoppingList;
  expenses: unknown[];
  futureItems: FutureItem[];
  loading: boolean;
  user: AppUser | null;
  userLoading: boolean;
  sessionChecked: boolean;
  activeNestId: string | null;
  notifications: AppNotification[];

  // User actions
  checkSession: () => Promise<void>;
  loadUserProfile: () => Promise<AppUser>;
  clearUser: () => void;
  setActiveNestId: (id: string | null) => void;
  refreshNests: () => Promise<void>;

  // Notification actions (local-optimistic; TODO: wire to API/WebSocket)
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  /** WebSocket integration point — call this from a WS listener to push a new notification */
  pushNotification: (notification: AppNotification) => void;

  // Notice actions
  addNotice: (notice: Omit<Notice, 'id'>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;

  // Task actions
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  restoreTask: (task: Task) => void;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Shopping actions
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => Promise<void>;
  toggleShoppingItem: (id: string) => Promise<void>;
  deleteShoppingItem: (id: string) => Promise<void>;

  // Financial actions
  addExpense: (expense: unknown) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Future item actions
  addFutureItem: (item: Omit<FutureItem, 'id'>) => Promise<void>;
  deleteFutureItem: (id: string) => Promise<void>;
}

// ---------- Context ----------

export const AppContext = createContext<AppContextValue | null>(null);

// ---------- Provider ----------

export function AppProvider({ children }: { children: React.ReactNode }) {
  // ========== ESTADOS ==========
  const [notices, setNotices] = useState<Notice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingList>({ id: '', month: '', items: [], createdAt: '' });
  const [expenses, setExpenses] = useState<unknown[]>([]);
  const [futureItems, setFutureItems] = useState<FutureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [activeNestId, setActiveNestId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const hasLoaded = useRef(false);
  const sessionCheckRef = useRef(false);

  // Helper to derive default nestId from an AppUser
  const deriveDefaultNestId = (appUser: AppUser): string | null => {
    const nests = appUser.nests ?? [];
    const defaultNest = nests.find(n => n.isDefault) ?? nests[0];
    return defaultNest?.nestId ?? null;
  };

  // ========== NOTIFICATIONS ==========
  // TODO: Replace initial seeding with WebSocket subscription for real-time notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setNotifications(user.notifications ?? []);
  }, [user]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
    );
    // TODO: API call to mark notification as read
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    // TODO: API call to mark all notifications as read
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
    // TODO: API call to delete notification
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    // TODO: API call to clear all notifications
  };

  const pushNotification = (notification: AppNotification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // ========== NOTICES ==========
  const addNotice = async (notice: Omit<Notice, 'id'>) => {
    const newNotice = await noticeService.addNotice(notice);
    setNotices(prev => [...prev, newNotice]);
  };

  const deleteNotice = async (id: string) => {
    await noticeService.deleteNotice(id);
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  // ========== TASKS ==========
  const addTask = async (task: Omit<Task, 'id'>) => {
    const newTask = await taskService.addTask(task);
    setTasks(prev => [...prev, newTask]);
  };

  const restoreTask = (task: Task) => {
    setTasks(prev => {
      const exists = prev.find(t => t.id === task.id);
      if (exists) return prev;
      return [...prev, task];
    });
  };

  const toggleTask = async (id: string) => {
    const updatedTask = await taskService.toggleTaskCompletion(id);
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
  };

  const deleteTask = async (id: string) => {
    await taskService.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // ========== SHOPPING ==========
  const addShoppingItem = async (item: Omit<ShoppingItem, 'id' | 'checked'>) => {
    const newItem = await shoppingService.addShoppingItem(item);
    setShoppingList(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const toggleShoppingItem = async (id: string) => {
    const updatedItem = await shoppingService.toggleShoppingItem(id);
    setShoppingList(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? updatedItem : i) }));
  };

  const deleteShoppingItem = async (id: string) => {
    await shoppingService.deleteShoppingItem(id);
    setShoppingList(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  // ========== FINANCIAL ==========
  const addExpense = async (expense: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newExpense = await financialService.addExpense(expense as any);
    setExpenses(prev => [...prev, newExpense]);
  };

  const deleteExpense = async (id: string) => {
    await financialService.deleteExpense(id);
    setExpenses(prev => prev.filter(e => (e as { id?: string }).id !== id));
  };

  // ========== FUTURE ITEMS ==========
  const addFutureItem = async (item: Omit<FutureItem, 'id'>) => {
    const newItem = await futureItemsService.addFutureItem(item);
    setFutureItems(prev => [...prev, newItem]);
  };

  const deleteFutureItem = async (id: string) => {
    await futureItemsService.deleteFutureItem(id);
    setFutureItems(prev => prev.filter(i => i.id !== id));
  };

  // ========== USER PROFILE ==========
  const loadUserProfile = async (): Promise<AppUser> => {
    try {
      setUserLoading(true);
      const profileData = await authService.getUserProfile();
      const appUser = userProfileToAppUser(profileData);
      setUser(appUser);
      setActiveNestId(prev => prev ?? deriveDefaultNestId(appUser));
      return appUser;
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      setUser(null);
      throw error;
    } finally {
      setUserLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
    setActiveNestId(null);
    hasLoaded.current = false;
  };

  const refreshNests = async (): Promise<void> => {
    try {
      const nests: AppUserNest[] = (await userService.getNests()).map(n => ({
        nestId: n.nestId,
        name: n.name,
        icon: n.icon,
        isDefault: n.isDefault,
        role: n.role as number,
      }));
      setUser(prev => prev ? { ...prev, nests } : prev);
    } catch (error) {
      console.error('Erro ao atualizar ninhos:', error);
    }
  };

  // ========== CHECK SESSION ==========
  const checkSession = async () => {
    if (sessionCheckRef.current) return;
    sessionCheckRef.current = true;
    try {
      const profileData = await authService.getUserProfile();
      const appUser = userProfileToAppUser(profileData);
      setUser(appUser);
      setActiveNestId(prev => prev ?? deriveDefaultNestId(appUser));
    } catch {
      setUser(null);
    } finally {
      setSessionChecked(true);
    }
  };

  // ========== LOAD INITIAL DATA ==========
  useEffect(() => {
    if (!user) return;
    if (hasLoaded.current) return;
    hasLoaded.current = true;

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
  }, [user]);

  // ========== MEMOIZED VALUE ==========
  const value = useMemo<AppContextValue>(() => ({
    notices,
    tasks,
    shoppingList,
    expenses,
    futureItems,
    loading,
    user,
    userLoading,
    sessionChecked,
    activeNestId,
    checkSession,
    loadUserProfile,
    clearUser,
    setActiveNestId,
    refreshNests,
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    pushNotification,
    addNotice,
    deleteNotice,
    addTask,
    restoreTask,
    toggleTask,
    deleteTask,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    addExpense,
    deleteExpense,
    addFutureItem,
    deleteFutureItem,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [notices, tasks, shoppingList, expenses, futureItems, loading, user, userLoading, sessionChecked, activeNestId, notifications]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// ========== HOOK ==========
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
}
