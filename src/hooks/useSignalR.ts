import * as signalR from '@microsoft/signalr';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export interface SignalRHandle {
  connectionRef: React.MutableRefObject<signalR.HubConnection | null>;
  isConnected: boolean;
}

export function useSignalR(url: string | null): SignalRHandle {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!url) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(
        import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning,
      )
      .build();

    connectionRef.current = connection;

    connection.onreconnected(() => setIsConnected(true));
    connection.onreconnecting(() => setIsConnected(false));
    connection.onclose(() => setIsConnected(false));

    connection.start()
      .then(() => setIsConnected(true))
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.warn('[useSignalR] failed to connect:', err);
        }
      });

    return () => {
      connection.stop().catch(() => {});
      connectionRef.current = null;
      setIsConnected(false);
    };
  }, [url]);

  return { connectionRef, isConnected };
}
