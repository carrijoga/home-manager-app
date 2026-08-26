import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import Logo from '@/components/common/Logo';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useApp } from '@/contexts/AppContext';
import { loginWithGoogle } from '@/services/authService';

export const GoogleCallback = () => {
  const navigate = useNavigate();
  const { loadUserProfile } = useApp();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage('Autenticação cancelada ou negada pelo Google.');
        toast.error('Autenticação cancelada');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('Código de autorização não encontrado.');
        toast.error('Erro na autenticação');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      try {
        const response = await loginWithGoogle(code);
        await loadUserProfile();
        toast.success(
          (response as { message?: string }).message || 'Login com Google realizado com sucesso!'
        );
        const pendingInviteToken = sessionStorage.getItem('pending_invite_token');
        if (pendingInviteToken) {
          navigate(`/invite?token=${encodeURIComponent(pendingInviteToken)}`, { replace: true });
          return;
        }
        navigate('/dashboard', { replace: true });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Não foi possível completar o login com Google.';
        setStatus('error');
        setErrorMessage(message);
        toast.error(message);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, loadUserProfile]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="w-full max-w-md border border-white/20 bg-white/90 p-8 shadow-xl backdrop-blur-lg dark:bg-gray-900/80 sm:p-12">
        <div className="flex w-full flex-col items-center space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-cyan-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 sm:h-24 sm:w-24">
            <Logo size="large" showText={false} />
          </div>

          {status === 'loading' ? (
            <>
              <div className="flex flex-col items-center gap-4">
                <Spinner className="h-12 w-12 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Autenticando com Google...
                </h2>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Aguarde enquanto processamos sua autenticação.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <svg
                    className="h-8 w-8 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Erro na Autenticação
                </h2>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {errorMessage}
                </p>
                <p className="text-xs text-muted-foreground">Redirecionando para o login...</p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GoogleCallback;
