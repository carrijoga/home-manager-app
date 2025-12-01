import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardSkeleton } from '../skeletons';
import * as authService from '@/services/authService';

export default function RequireAuth({ children }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    authService.checkSession()
      .then((ok) => {
        if (!mounted) return;
        setAuthenticated(!!ok);
      })
      .catch(() => setAuthenticated(false))
      .finally(() => mounted && setChecking(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return <DashboardSkeleton />;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
