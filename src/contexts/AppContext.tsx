import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useNotificationRealtime } from '@/hooks/useNotificationRealtime';
import { DATA_MODE } from '@/services/api/config';
import * as authService from '@/services/authService';
import * as nestService from '@/services/nestService';
import * as notificationService from '@/services/notificationService';
import * as userService from '@/services/userService';
import { apiLocaleToLanguage, setCurrentLanguage } from '@/i18n';
import type { AppNotification, AppUser, AppUserNest } from '@/types';
import { userProfileToAppUser } from '@/types';

// ---------- Types ----------

interface AppContextValue {
  // States
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
  refreshNests: () => Promise<AppUserNest[]>;

  // Nest actions
  createNest: (payload: import('@/schemas/nest').CreateNestRequest) => Promise<void>;
  updateNest: (
    nestId: string,
    payload: Omit<import('@/schemas/nest').UpdateNestRequest, 'nestId'>
  ) => Promise<void>;
  setDefaultNest: (nestId: string) => Promise<void>;
  deleteNest: (nestId: string) => Promise<void>;
  leaveNest: (nestId: string) => Promise<void>;

  // Notification actions (local-optimistic; TODO: wire to API/WebSocket)
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  /** WebSocket integration point — call this from a WS listener to push a new notification */
  pushNotification: (notification: AppNotification) => void;
}

// ---------- Context ----------

export const AppContext = createContext<AppContextValue | null>(null);

// ---------- Provider ----------

export function AppProvider({ children }: { children: React.ReactNode }) {
  // ========== ESTADOS ==========
  const [user, setUser] = useState<AppUser | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [activeNestId, setActiveNestId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const sessionCheckRef = useRef(false);

  // Helper to derive default nestId from an AppUser
  const deriveDefaultNestId = (appUser: AppUser): string | null => {
    const nests = appUser.nests ?? [];
    const defaultNest = nests.find((n) => n.isDefault) ?? nests[0];
    return defaultNest?.nestId ?? null;
  };

  // ========== NOTIFICATIONS ==========
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    let isMounted = true;

    if (DATA_MODE === 'mock') {
      setNotifications(user.notifications ?? []);
      return;
    }

    notificationService
      .getNotifications()
      .then((items) => {
        if (isMounted) setNotifications(items);
      })
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.warn('[AppContext] Erro ao carregar notificações da API:', err);
        }
        if (isMounted) setNotifications(user.notifications ?? []);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
    );

    notificationService.markAsRead(notificationId).catch((err) => {
      const msg = err instanceof Error ? err.message : 'Notificação não encontrada';
      toast.error(msg);
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const unreadIds = prev.filter((n) => !n.isRead).map((n) => n.notificationId);
      if (unreadIds.length > 0) {
        Promise.allSettled(unreadIds.map((id) => notificationService.markAsRead(id))).catch(
          () => {}
        );
      }
      return prev.map((n) => ({ ...n, isRead: true }));
    });
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));

    notificationService.deleteNotification(notificationId).catch((err) => {
      const msg = err instanceof Error ? err.message : 'Notificação não encontrada';
      toast.error(msg);
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications((prev) => {
      const allIds = prev.map((n) => n.notificationId);
      if (allIds.length > 0) {
        Promise.allSettled(allIds.map((id) => notificationService.deleteNotification(id))).catch(
          () => {}
        );
      }
      return [];
    });
  }, []);

  const pushNotification = useCallback((notification: AppNotification) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.notificationId === notification.notificationId)) {
        return prev;
      }
      return [notification, ...prev];
    });
  }, []);

  // ========== SIGNALR REALTIME NOTIFICATIONS ==========
  useNotificationRealtime({
    enabled: Boolean(user) && DATA_MODE !== 'mock',
    onNotificationReceived: pushNotification,
  });

  // ========== USER PROFILE ==========
  const loadUserProfile = async (): Promise<AppUser> => {
    try {
      setUserLoading(true);
      const profileData = await authService.getUserProfile();
      const serverLocale =
        profileData?.profile?.configuration?.locale ??
        profileData?.profile?.configuration?.language;
      if (serverLocale !== undefined && serverLocale !== null) {
        const lang = apiLocaleToLanguage(serverLocale);
        setCurrentLanguage(lang);
      }
      const appUser = userProfileToAppUser(profileData);
      setUser(appUser);
      setActiveNestId((prev) => prev ?? deriveDefaultNestId(appUser));
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
  };

  const refreshNests = async (): Promise<AppUserNest[]> => {
    try {
      const nests: AppUserNest[] = (await userService.getNests()).map((n) => ({
        nestId: n.nestId,
        name: n.name,
        icon: n.icon,
        isDefault: n.isDefault,
        role: n.role as number,
      }));
      setUser((prev) => (prev ? { ...prev, nests } : prev));
      return nests;
    } catch (error) {
      console.error('Erro ao atualizar ninhos:', error);
      return [];
    }
  };

  const createNest = async (payload: import('@/schemas/nest').CreateNestRequest): Promise<void> => {
    await nestService.createNest(payload);
    await refreshNests();
  };

  const updateNest = async (
    nestId: string,
    payload: Omit<import('@/schemas/nest').UpdateNestRequest, 'nestId'>
  ): Promise<void> => {
    await nestService.updateNest(nestId, payload);
    await refreshNests();
  };

  const setDefaultNest = async (nestId: string): Promise<void> => {
    await userService.setDefaultNest(nestId);
    setUser((prev) => {
      if (!prev) return prev;
      const updatedNests = (prev.nests ?? []).map((n) => ({
        ...n,
        isDefault: n.nestId === nestId,
      }));
      return { ...prev, nests: updatedNests };
    });
    await refreshNests();
  };

  const deleteNest = async (nestId: string): Promise<void> => {
    await nestService.deleteNest(nestId);
    if (activeNestId === nestId) {
      setActiveNestId(null);
    }
    await refreshNests();
  };

  const leaveNest = async (nestId: string): Promise<void> => {
    await nestService.leaveNest(nestId);
    const updatedNests = await refreshNests();
    if (activeNestId === nestId) {
      const defaultNest = updatedNests.find((n) => n.isDefault) ?? updatedNests[0];
      setActiveNestId(defaultNest?.nestId ?? null);
    }
  };

  // ========== CHECK SESSION ==========
  const checkSession = async () => {
    if (sessionCheckRef.current) return;
    sessionCheckRef.current = true;
    try {
      const hasSession = await authService.checkSession();
      if (!hasSession) {
        setUser(null);
        return;
      }
      const profileData = await authService.getUserProfile();
      const appUser = userProfileToAppUser(profileData);
      setUser(appUser);
      setActiveNestId((prev) => prev ?? deriveDefaultNestId(appUser));
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
      authService.logout();
      setUser(null);
      setActiveNestId(null);
      sessionCheckRef.current = false;
      setSessionChecked(true);
      toast.error('Sessão expirada. Faça login novamente.');
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  // ========== MEMOIZED VALUE ==========
  const value = useMemo<AppContextValue>(
    () => ({
      user,
      userLoading,
      sessionChecked,
      activeNestId,
      notifications,
      checkSession,
      loadUserProfile,
      clearUser,
      setActiveNestId,
      refreshNests,
      createNest,
      updateNest,
      setDefaultNest,
      deleteNest,
      leaveNest,
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAllNotifications,
      pushNotification,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [user, userLoading, sessionChecked, activeNestId, notifications]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ========== HOOK ==========
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
}
