import { createContext, useContext } from 'react';
import { useApp } from '@/contexts/AppContext';

interface LoadingContextValue {
  appReady: boolean;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const { sessionChecked, loading } = useApp();
  const appReady = sessionChecked && !loading;

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
