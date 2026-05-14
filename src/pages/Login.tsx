import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Logo from '@/components/common/Logo';
import { EyeIcon, EyeOffIcon } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useApp } from '@/contexts/AppContext';
import type { LoginRequest } from '@/schemas/auth';
import { LoginRequestSchema } from '@/schemas/auth';
import { login as loginRequest } from '@/services/authService';

const GOOGLE_ENABLED = import.meta.env.VITE_GOOGLE_ENABLED !== 'false';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

function Login() {
  const navigate = useNavigate();
  const { loadUserProfile } = useApp();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      await loginRequest(data);
      await loadUserProfile();
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível realizar o login, tente novamente.';
      toast.error(message);
    }
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Google Client ID não configurado. Verifique as variáveis de ambiente.');
      return;
    }

    setIsGoogleLoading(true);

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.append('redirect_uri', GOOGLE_REDIRECT_URI);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', 'openid email profile');
    googleAuthUrl.searchParams.append('access_type', 'offline');
    googleAuthUrl.searchParams.append('prompt', 'consent');

    window.location.href = googleAuthUrl.toString();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card p-8 shadow-xl sm:p-12">
        <div className="flex w-full flex-col items-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted transition-transform hover:scale-105 sm:h-24 sm:w-24">
            <Logo size="large" showText={false} />
          </div>

          <div className="mb-8 space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Entrar</p>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Bem-vindo ao Ninho</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Use os dados cadastrados para acessar seu painel.
            </p>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={!GOOGLE_ENABLED || isGoogleLoading || isSubmitting}
            className="mb-6 h-12 w-full border-border bg-card text-base font-medium text-foreground shadow-sm transition-all duration-200 hover:bg-muted hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGoogleLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                Redirecionando...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar com Google
              </div>
            )}
          </Button>

          {/* Divider */}
          <div className="mb-6 flex w-full items-center gap-4">
            <div className="h-px flex-1 bg-border"></div>
            <span className="text-sm font-medium text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail" className="text-sm font-medium text-foreground">
                Email ou usuário
              </Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="ninho@ninho.com"
                autoComplete="email"
                {...register('usernameOrEmail')}
                className="focus:ring-shadow-sm h-10 border-border bg-input text-foreground transition-all duration-200 focus:border-terracotta-600 focus:ring-2 focus:ring-terracotta-600"
              />
              {errors.usernameOrEmail && (
                <p className="text-xs text-destructive">{errors.usernameOrEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  autoComplete="current-password"
                  {...register('password')}
                  className="h-10 border-border bg-input pr-10 text-foreground transition-all duration-200 focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isValid || isSubmitting || isGoogleLoading}
              className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:opacity-90 hover:shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-8 w-full space-y-2 text-center text-sm text-muted-foreground">
            <p>
              Ainda não tem conta?{' '}
              <Link
                to="/register"
                className="font-semibold text-primary transition-colors hover:underline"
              >
                Crie agora mesmo
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Login;
