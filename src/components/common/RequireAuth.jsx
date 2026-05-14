import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { useApp } from '@/contexts/AppContext';

import { DashboardSkeleton } from '../skeletons';

export default function RequireAuth({ children }) {
  const { user, sessionChecked, checkSession } = useApp();

  useEffect(() => {
    if (!sessionChecked) {
      checkSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!sessionChecked) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
