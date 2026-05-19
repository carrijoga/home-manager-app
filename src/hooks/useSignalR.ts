import type React from 'react';
import * as signalR from '@microsoft/signalr';
import { useEffect, useRef } from 'react';

export function useSignalR(url: string | null): React.MutableRefObject<signalR.HubConnection | null> {
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!url) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(
        import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning,
      )
      .build();

    connectionRef.current = connection;

    connection.start().catch((err) => {
      if (import.meta.env.DEV) {
        console.warn('[useSignalR] failed to connect:', err);
      }
    });

    return () => {
      connection.stop().catch(() => {});
      connectionRef.current = null;
    };
  }, [url]);

  return connectionRef;
}
