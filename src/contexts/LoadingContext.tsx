import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { useApp } from '@/contexts/AppContext';

interface LoadingContextValue {
  appReady: boolean;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const { sessionChecked } = useApp();
  const [appReady, setAppReady] = useState(false);
  const latchedRef = useRef(false);

  useEffect(() => {
    if (sessionChecked && !latchedRef.current) {
      latchedRef.current = true;
      setAppReady(true);
    }
  }, [sessionChecked]);

  return (
    <LoadingContext.Provider value={{ appReady }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useAppReady(): boolean {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useAppReady must be used inside LoadingProvider');
  return ctx.appReady;
}
