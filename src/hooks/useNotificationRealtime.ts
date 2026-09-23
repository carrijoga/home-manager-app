import * as signalR from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';

import { ENDPOINTS } from '@/services/api/endpoints';
import { tokenStorage } from '@/services/api/httpClient';
import type { AppNotification } from '@/types';

export interface UseNotificationRealtimeOptions {
  enabled?: boolean;
  onNotificationReceived?: (notification: AppNotification) => void;
}

export interface NotificationRealtimeHandle {
  connectionRef: React.MutableRefObject<signalR.HubConnection | null>;
  isConnected: boolean;
}

/**
 * Hook para conexão em tempo real com o hub SignalR de notificações (/hubs/notifications).
 * Registra o listener do evento 'ReceiveNotification' antes de iniciar a conexão.
 */
export function useNotificationRealtime({
  enabled = true,
  onNotificationReceived,
}: UseNotificationRealtimeOptions = {}): NotificationRealtimeHandle {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const onNotificationRef = useRef(onNotificationReceived);
  useEffect(() => {
    onNotificationRef.current = onNotificationReceived;
  }, [onNotificationReceived]);

  useEffect(() => {
    if (!enabled) return;

    const url = ENDPOINTS.notificationsHub();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => tokenStorage.getAccessToken() ?? '',
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(
        import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning
      )
      .build();

    connectionRef.current = connection;

    // Registrar o listener do evento ANTES de iniciar a conexão
    connection.on('ReceiveNotification', (raw: Record<string, unknown>) => {
      const notification: AppNotification = {
        notificationId: String(
          raw?.notificationId ?? raw?.NotificationId ?? raw?.id ?? Math.random().toString()
        ),
        title: String(raw?.title ?? raw?.Title ?? 'Nova Notificação'),
        message: String(raw?.message ?? raw?.Message ?? ''),
        type: Number(raw?.type ?? raw?.Type ?? 0),
        isRead: Boolean(raw?.isRead ?? raw?.IsRead ?? false),
        isEnabled: Boolean(raw?.isEnabled ?? raw?.IsEnabled ?? true),
      };

      if (import.meta.env.DEV) {
        console.info('[useNotificationRealtime] Received notification:', notification);
      }

      onNotificationRef.current?.(notification);
    });

    connection.onreconnected(() => setIsConnected(true));
    connection.onreconnecting(() => setIsConnected(false));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.warn('[useNotificationRealtime] failed to connect to notifications hub:', err);
        }
      });

    return () => {
      connection.stop().catch(() => {});
      connectionRef.current = null;
      setIsConnected(false);
    };
  }, [enabled]);

  return { connectionRef, isConnected };
}
