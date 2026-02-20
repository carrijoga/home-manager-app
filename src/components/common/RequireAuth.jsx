import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardSkeleton } from '../skeletons';
import { useApp } from '@/contexts/AppContext';

export default function RequireAuth({ children }) {
  const { user, sessionChecked, checkSession } = useApp();

  useEffect(() => {
    if (!sessionChecked) {
      checkSession();
    }
  }, []);

  if (!sessionChecked) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
