import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useApp } from '@/contexts/AppContext';
import { useNotificationRealtime } from '@/hooks/useNotificationRealtime';
import { DATA_MODE } from '@/services/api/config';
import * as notificationService from '@/services/notificationService';
import type { AppNotification, NotificationAction } from '@/types';

interface NotificationContextValue {
  notifications: AppNotification[];
  isCenterOpen: boolean;
  openCenter: () => void;
  closeCenter: () => void;
  toggleCenter: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  pushNotification: (notification: AppNotification) => void;
  executeAction: (notificationId: string, action: NotificationAction) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user } = useApp();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isCenterOpen, setIsCenterOpen] = useState(false);

  const openCenter = useCallback(() => setIsCenterOpen(true), []);
  const closeCenter = useCallback(() => setIsCenterOpen(false), []);
  const toggleCenter = useCallback(() => setIsCenterOpen((prev) => !prev), []);

  // ========== CARREGAMENTO INICIAL DE NOTIFICAÇÕES ==========
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
          console.warn('[NotificationContext] Erro ao carregar notificações:', err);
        }
        if (isMounted) setNotifications(user.notifications ?? []);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // ========== AÇÕES ==========
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

  // ========== EXECUÇÃO DE AÇÕES DE NOTIFICAÇÃO ==========
  const executeAction = useCallback(
    async (notificationId: string, action: NotificationAction) => {
      markAsRead(notificationId);

      if (action.actionType === 'navigate' && action.url) {
        setIsCenterOpen(false);
        navigate(action.url);
        return;
      }

      if (action.actionType === 'complete_task') {
        toast.success('Tarefa concluída com sucesso!');
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notificationId
              ? {
                  ...n,
                  isRead: true,
                  actions: n.actions?.filter((a) => a.actionType !== 'complete_task'),
                }
              : n
          )
        );
        return;
      }

      if (action.url) {
        setIsCenterOpen(false);
        navigate(action.url);
      } else {
        toast.success(`Ação "${action.label}" realizada com sucesso.`);
      }
    },
    [markAsRead, navigate]
  );

  const value = useMemo(
    () => ({
      notifications,
      isCenterOpen,
      openCenter,
      closeCenter,
      toggleCenter,
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAllNotifications,
      pushNotification,
      executeAction,
    }),
    [
      notifications,
      isCenterOpen,
      openCenter,
      closeCenter,
      toggleCenter,
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAllNotifications,
      pushNotification,
      executeAction,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider');
  }
  return context;
}
