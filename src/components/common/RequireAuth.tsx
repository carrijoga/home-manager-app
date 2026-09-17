import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { DashboardSkeleton } from '@/components/skeletons';
import { useApp } from '@/contexts/AppContext';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, sessionChecked, checkSession } = useApp();

  useEffect(() => {
    if (!sessionChecked) {
      checkSession();
    }
  }, [sessionChecked, checkSession]);

  if (!sessionChecked) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
