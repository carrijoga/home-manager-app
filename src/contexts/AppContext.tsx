import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import * as authService from '@/services/authService';
import * as financialService from '@/services/financialService';
import * as futureItemsService from '@/services/futureItemsService';
import * as noticeService from '@/services/noticeService';
import * as shoppingService from '@/services/shoppingService';
import * as taskService from '@/services/taskService';
import * as userService from '@/services/userService';
import type {
  AppNotification,
  AppShoppingCategory,
  AppShoppingItem,
  AppShoppingList,
  AppShoppingListSummary,
  AppUser,
  AppUserNest,
  FutureItem,
  Notice,
  Task,
} from '@/types';
import { userProfileToAppUser } from '@/types';

// ---------- Types ----------

interface AppContextValue {
  // States
  notices: Notice[];
  tasks: Task[];
  shoppingLists: AppShoppingListSummary[];
  shoppingCategories: AppShoppingCategory[];
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
  addNotice: (message: string, color?: string, expiresAt?: string | null) => Promise<void>;
  updateNotice: (noticeId: string, message: string, color?: string) => Promise<void>;
  deleteNotice: (noticeId: string) => Promise<void>;
  pinNotice: (noticeId: string) => Promise<void>;
  unpinNotice: (noticeId: string) => Promise<void>;

  // Task actions
  addTask: (payload: import('@/schemas/tasks').CreateTaskRequest) => Promise<void>;
  updateTask: (taskId: string, payload: import('@/schemas/tasks').UpdateTaskRequest) => Promise<void>;
  createQuickTask: (title: string) => Promise<void>;
  restoreTask: (task: Task) => void;
  completeTask: (taskId: string) => Promise<void>;
  uncompleteTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Shopping actions
  createShoppingList: (name: string, monthYear: string, notes?: string) => Promise<void>;
  updateShoppingList: (id: string, name: string, monthYear: string, notes?: string) => Promise<void>;
  deleteShoppingList: (id: string) => Promise<void>;
  loadShoppingListDetail: (id: string) => Promise<AppShoppingList>;
  addShoppingItem: (listId: string, name: string, quantity: number, unitType: number, categoryId?: string | null, estimatedPrice?: number | null, notes?: string | null) => Promise<AppShoppingItem>;
  updateShoppingItem: (id: string, listId: string, name: string, quantity: number, unitType: number, categoryId?: string | null, estimatedPrice?: number | null, notes?: string | null) => Promise<void>;
  deleteShoppingItem: (id: string, listId: string, quantity: number, unitType: number, estimatedPrice?: number | null, isPurchased?: boolean, price?: number | null) => Promise<void>;
  markItemAsPurchased: (id: string, listId: string, quantity: number, unitType: number, price: number, purchasedAt: string) => Promise<void>;
  unmarkItemAsPurchased: (id: string, listId: string, quantity: number, unitType: number, price: number) => Promise<void>;
  uploadShoppingItems: (listId: string, file: File) => Promise<AppShoppingList>;
  createShoppingCategory: (name: string, description?: string) => Promise<AppShoppingCategory>;
  deleteShoppingCategory: (id: string) => Promise<void>;

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
  const [shoppingLists, setShoppingLists] = useState<AppShoppingListSummary[]>([]);
  const [shoppingCategories, setShoppingCategories] = useState<AppShoppingCategory[]>([]);
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

  // Helper: unit types where the price entered is per-unit (needs × quantity for totals).
  // UN=0, Dúzia=5, Caixa=6, Pacote=7. Weight/volume types (KG=1,G=2,L=3,mL=4) are totals.
  const isPricePerUnit = (unitType: number): boolean => [0, 5, 6, 7].includes(unitType);

  const buildShoppingSummary = (detail: AppShoppingList): AppShoppingListSummary => {
    const totals = detail.items.reduce(
      (acc, item) => {
        const mult = isPricePerUnit(item.unitType) ? item.quantity : 1;
        acc.totalItems += 1;
        if (item.isPurchased) acc.purchasedItems += 1;
        acc.totalEstimated += (item.estimatedPrice ?? 0) * mult;
        if (item.isPurchased) acc.totalSpent += (item.price ?? 0) * mult;
        return acc;
      },
      { totalItems: 0, purchasedItems: 0, totalEstimated: 0, totalSpent: 0 },
    );

    return {
      shoppingListId: detail.shoppingListId,
      name: detail.name,
      monthYear: detail.monthYear,
      notes: detail.notes ?? null,
      totalItems: totals.totalItems,
      purchasedItems: totals.purchasedItems,
      totalEstimated: totals.totalEstimated,
      totalSpent: totals.totalSpent,
    };
  };

  const dedupeShoppingCategories = (cats: AppShoppingCategory[]): AppShoppingCategory[] => {
    const map = new Map<string, AppShoppingCategory>();
    cats.forEach((cat) => {
      if (!map.has(cat.shoppingCategoryId)) map.set(cat.shoppingCategoryId, cat);
    });
    return Array.from(map.values());
  };

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
  const addNotice = async (message: string, color?: string, expiresAt?: string | null) => {
    const newNotice = await noticeService.createNotice({
      message,
      date: new Date().toISOString(),
      color,
      expiresAt: expiresAt ?? undefined,
    }, activeNestId ?? undefined);
    setNotices(prev => [newNotice, ...prev]);
  };

  const updateNotice = async (noticeId: string, message: string, color?: string) => {
    await noticeService.updateNotice(noticeId, { message, color }, activeNestId ?? undefined);
    setNotices(prev => prev.map(n =>
      n.noticeId === noticeId ? { ...n, message, color } : n
    ));
  };

  const deleteNotice = async (noticeId: string) => {
    await noticeService.deleteNotice(noticeId, activeNestId ?? undefined);
    setNotices(prev => prev.filter(n => n.noticeId !== noticeId));
  };

  const pinNotice = async (noticeId: string) => {
    await noticeService.pinNotice(noticeId, activeNestId ?? undefined);
    setNotices(prev => prev.map(n =>
      n.noticeId === noticeId ? { ...n, isPinned: true, expiresAt: null } : n
    ).sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }));
  };

  const unpinNotice = async (noticeId: string) => {
    await noticeService.unpinNotice(noticeId, activeNestId ?? undefined);
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    setNotices(prev => prev.map(n =>
      n.noticeId === noticeId ? { ...n, isPinned: false, expiresAt: newExpiry } : n
    ));
  };

  // ========== TASKS ==========
  const addTask = async (payload: import('@/schemas/tasks').CreateTaskRequest) => {
    const newTask = await taskService.createTask(payload, activeNestId ?? undefined);
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = async (taskId: string, payload: import('@/schemas/tasks').UpdateTaskRequest) => {
    await taskService.updateTask(taskId, payload, activeNestId ?? undefined);
    setTasks(prev => prev.map(t =>
      t.taskId === taskId
        ? {
            ...t,
            ...payload,
            date: payload.date ?? t.date,
            priorityLabel: t.priorityLabel,
            categoryLabel: t.categoryLabel,
          }
        : t
    ));
  };

  const createQuickTask = async (title: string) => {
    const newTask = await taskService.createQuickTask(title, activeNestId ?? undefined);
    setTasks(prev => [newTask, ...prev]);
  };

  const restoreTask = (task: Task) => {
    setTasks(prev => {
      const exists = prev.find(t => t.taskId === task.taskId);
      if (exists) return prev;
      return [task, ...prev];
    });
  };

  const completeTask = async (taskId: string) => {
    const updatedTask = await taskService.completeTask(taskId, activeNestId ?? undefined);
    setTasks(prev => prev.map(t => t.taskId === taskId ? updatedTask : t));
  };

  const uncompleteTask = async (taskId: string) => {
    const updatedTask = await taskService.uncompleteTask(taskId, activeNestId ?? undefined);
    setTasks(prev => prev.map(t => t.taskId === taskId ? updatedTask : t));
  };

  const deleteTask = async (taskId: string) => {
    await taskService.deleteTask(taskId, activeNestId ?? undefined);
    setTasks(prev => prev.filter(t => t.taskId !== taskId));
  };

  // ========== SHOPPING ==========
  const createShoppingList = async (name: string, monthYear: string, notes?: string) => {
    const detail = await shoppingService.createShoppingList({ name, monthYear, notes }, activeNestId ?? undefined);
    const summary: AppShoppingListSummary = {
      shoppingListId: detail.shoppingListId,
      name: detail.name,
      monthYear: detail.monthYear,
      notes: detail.notes,
      totalItems: 0,
      purchasedItems: 0,
      totalEstimated: 0,
      totalSpent: 0,
    };
    setShoppingLists(prev => [summary, ...prev]);
  };

  const updateShoppingList = async (id: string, name: string, monthYear: string, notes?: string) => {
    await shoppingService.updateShoppingList(id, { name, monthYear, notes }, activeNestId ?? undefined);
    setShoppingLists(prev =>
      prev.map(l => l.shoppingListId === id ? { ...l, name, monthYear, notes: notes ?? null } : l),
    );
  };

  const deleteShoppingList = async (id: string) => {
    await shoppingService.deleteShoppingList(id, activeNestId ?? undefined);
    setShoppingLists(prev => prev.filter(l => l.shoppingListId !== id));
  };

  const loadShoppingListDetail = async (id: string): Promise<AppShoppingList> => {
    return shoppingService.getShoppingListById(id, activeNestId ?? undefined);
  };

  const addShoppingItem = async (
    listId: string, name: string, quantity: number, unitType: number,
    categoryId?: string | null, estimatedPrice?: number | null, notes?: string | null,
  ): Promise<AppShoppingItem> => {
    const newItem = await shoppingService.addShoppingItem(
      { shoppingListId: listId, name, quantity, unitType, shoppingCategoryId: categoryId, estimatedPrice, notes },
      activeNestId ?? undefined,
    );
    const estimatedContrib = (estimatedPrice ?? 0) * (isPricePerUnit(unitType) ? quantity : 1);
    setShoppingLists(prev =>
      prev.map(l =>
        l.shoppingListId === listId
          ? { ...l, totalItems: l.totalItems + 1, totalEstimated: (l.totalEstimated ?? 0) + estimatedContrib }
          : l,
      ),
    );
    return newItem;
  };

  const updateShoppingItem = async (
    id: string, _listId: string, name: string, quantity: number, unitType: number,
    categoryId?: string | null, estimatedPrice?: number | null, notes?: string | null,
  ) => {
    await shoppingService.updateShoppingItem(
      id,
      { name, quantity, unitType, shoppingCategoryId: categoryId, estimatedPrice, notes },
      activeNestId ?? undefined,
    );
  };

  const deleteShoppingItem = async (id: string, listId: string, quantity: number, unitType: number, estimatedPrice?: number | null, isPurchased?: boolean, price?: number | null) => {
    await shoppingService.deleteShoppingItem(id, activeNestId ?? undefined);
    const mult = isPricePerUnit(unitType) ? quantity : 1;
    const estimatedContrib = (estimatedPrice ?? 0) * mult;
    const spentContrib = (price ?? 0) * mult;
    setShoppingLists(prev =>
      prev.map(l =>
        l.shoppingListId === listId
          ? {
              ...l,
              totalItems: Math.max(0, l.totalItems - 1),
              purchasedItems: isPurchased ? Math.max(0, l.purchasedItems - 1) : l.purchasedItems,
              totalEstimated: Math.max(0, (l.totalEstimated ?? 0) - estimatedContrib),
              totalSpent: isPurchased ? Math.max(0, (l.totalSpent ?? 0) - spentContrib) : l.totalSpent,
            }
          : l,
      ),
    );
  };

  const markItemAsPurchased = async (id: string, listId: string, quantity: number, unitType: number, price: number, purchasedAt: string) => {
    await shoppingService.markItemAsPurchased(id, { price, purchasedAt }, activeNestId ?? undefined);
    const spentContrib = price * (isPricePerUnit(unitType) ? quantity : 1);
    setShoppingLists(prev =>
      prev.map(l =>
        l.shoppingListId === listId
          ? {
              ...l,
              purchasedItems: l.purchasedItems + 1,
              totalSpent: (l.totalSpent ?? 0) + spentContrib,
            }
          : l,
      ),
    );
  };

  const unmarkItemAsPurchased = async (id: string, listId: string, quantity: number, unitType: number, price: number) => {
    await shoppingService.unmarkItemAsPurchased(id, activeNestId ?? undefined);
    const spentContrib = price * (isPricePerUnit(unitType) ? quantity : 1);
    setShoppingLists(prev =>
      prev.map(l =>
        l.shoppingListId === listId
          ? {
              ...l,
              purchasedItems: Math.max(0, l.purchasedItems - 1),
              totalSpent: Math.max(0, (l.totalSpent ?? 0) - spentContrib),
            }
          : l,
      ),
    );
  };

  const uploadShoppingItems = async (listId: string, file: File): Promise<AppShoppingList> => {
    await shoppingService.uploadShoppingItems(listId, file, activeNestId ?? undefined);
    const [detail, categories] = await Promise.all([
      shoppingService.getShoppingListById(listId, activeNestId ?? undefined),
      shoppingService.getShoppingCategories(activeNestId ?? undefined),
    ]);
    setShoppingCategories(dedupeShoppingCategories(categories));
    const summary = buildShoppingSummary(detail);
    setShoppingLists(prev => {
      const hasList = prev.some(l => l.shoppingListId === listId);
      if (!hasList) return [summary, ...prev];
      return prev.map(l => l.shoppingListId === listId ? summary : l);
    });
    return detail;
  };

  const createShoppingCategory = async (name: string, description?: string): Promise<AppShoppingCategory> => {
    const cat = await shoppingService.createShoppingCategory({ name, description }, activeNestId ?? undefined);
    setShoppingCategories(prev => dedupeShoppingCategories([...prev, cat]));
    return cat;
  };

  const deleteShoppingCategory = async (id: string) => {
    await shoppingService.deleteShoppingCategory(id, activeNestId ?? undefined);
    setShoppingCategories(prev => prev.filter(c => c.shoppingCategoryId !== id));
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

  // Kick off session check on mount so the splash screen resolves on public routes too.
  useEffect(() => {
    checkSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========== SESSION EXPIRY LISTENER ==========
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setActiveNestId(null);
      hasLoaded.current = false;
      sessionCheckRef.current = false;
      setSessionChecked(false);
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  // ========== LOAD INITIAL DATA ==========
  useEffect(() => {
    if (!user) return;
    if (!activeNestId) return;
    hasLoaded.current = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [noticesResult, tasksResult, shoppingListsResult, shoppingCatsResult, expensesResult, futureResult] =
          await Promise.allSettled([
            noticeService.getActiveNotices(activeNestId),
            taskService.getActiveTasks(activeNestId),
            shoppingService.getShoppingLists(undefined, activeNestId),
            shoppingService.getShoppingCategories(activeNestId),
            financialService.listTransactions(undefined, activeNestId),
            futureItemsService.getAllFutureItems(),
          ]);

        if (noticesResult.status === 'fulfilled') setNotices(noticesResult.value);
        else console.error('Erro ao carregar avisos:', noticesResult.reason);

        if (tasksResult.status === 'fulfilled') setTasks(tasksResult.value);
        else console.error('Erro ao carregar tarefas:', tasksResult.reason);

        if (shoppingListsResult.status === 'fulfilled') setShoppingLists(shoppingListsResult.value);
        else console.error('Erro ao carregar listas de compras:', shoppingListsResult.reason);

        if (shoppingCatsResult.status === 'fulfilled') setShoppingCategories(dedupeShoppingCategories(shoppingCatsResult.value));
        else console.error('Erro ao carregar categorias de compras:', shoppingCatsResult.reason);

        if (expensesResult.status === 'fulfilled') setExpenses(
          expensesResult.value.items.map((t: Record<string, unknown>) => ({
            id: (t.financialTransactionId as string) || (t.id as string) || '',
            description: (t.description as string) || '',
            value: Number(t.value ?? 0),
            date: ((t.transactionDate as string) || (t.date as string) || '').substring(0, 10),
            category: (t.categoryName as string) || (t.category as string) || 'Outros',
          }))
        );
        else console.error('Erro ao carregar gastos:', expensesResult.reason);

        if (futureResult.status === 'fulfilled') setFutureItems(futureResult.value);
        else console.error('Erro ao carregar itens futuros:', futureResult.reason);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, activeNestId]);

  // ========== MEMOIZED VALUE ==========
  const value = useMemo<AppContextValue>(() => ({
    notices,
    tasks,
    shoppingLists,
    shoppingCategories,
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
    updateNotice,
    deleteNotice,
    pinNotice,
    unpinNotice,
    addTask,
    updateTask,
    createQuickTask,
    restoreTask,
    completeTask,
    uncompleteTask,
    deleteTask,
    createShoppingList,
    updateShoppingList,
    deleteShoppingList,
    loadShoppingListDetail,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    markItemAsPurchased,
    unmarkItemAsPurchased,
    uploadShoppingItems,
    createShoppingCategory,
    deleteShoppingCategory,
    addExpense,
    deleteExpense,
    addFutureItem,
    deleteFutureItem,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [notices, tasks, shoppingLists, shoppingCategories, expenses, futureItems, loading, user, userLoading, sessionChecked, activeNestId, notifications]);

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
