import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/common/ThemeToggle';
import { EyeIcon, EyeOffIcon } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useApp } from '@/contexts/AppContext';
import type { LoginRequest } from '@/schemas/auth';
import { LoginRequestSchema, RequestPasswordRecoverySchema } from '@/schemas/auth';
import { login as loginRequest, requestPasswordRecovery } from '@/services/authService';


const GOOGLE_ENABLED = import.meta.env.VITE_GOOGLE_ENABLED !== 'false';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

function Login() {
  const navigate = useNavigate();
  const { loadUserProfile } = useApp();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Password Recovery Modal State
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [isRecoverySubmitting, setIsRecoverySubmitting] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    mode: 'onChange',
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  });

  const usernameOrEmailValue = watch('usernameOrEmail');

  const onSubmit = async (data: LoginRequest) => {
    try {
      await loginRequest(data);
      await loadUserProfile();
      toast.success('Bem-vindo ao seu Ninho!');

      const searchInviteToken = new URLSearchParams(window.location.search).get('inviteToken');
      const pendingInviteToken =
        searchInviteToken || sessionStorage.getItem('pending_invite_token');

      if (pendingInviteToken) {
        navigate(`/invite?token=${encodeURIComponent(pendingInviteToken)}`, { replace: true });
        return;
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível realizar o login. Tente novamente.';
      toast.error(message);
    }
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Google Client ID não configurado.');
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

  const handleQuickDemoFill = () => {
    setValue('usernameOrEmail', 'ninho@ninho.com', { shouldValidate: true, shouldDirty: true });
    setValue('password', 'senha123', { shouldValidate: true, shouldDirty: true });
    toast.info('Dados da conta demo preenchidos.', { duration: 2500 });
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    const payload = { userEmail: recoveryEmail };
    const parsed = RequestPasswordRecoverySchema.safeParse(payload);
    if (!parsed.success) {
      setRecoveryError(parsed.error.issues[0]?.message || 'E-mail inválido.');
      return;
    }

    setIsRecoverySubmitting(true);
    try {
      await requestPasswordRecovery(payload);
      setRecoverySuccess(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível solicitar a recuperação de senha. Tente novamente.';
      setRecoveryError(message);
    } finally {
      setIsRecoverySubmitting(false);
    }
  };


  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Top Header */}
      <header className="flex w-full items-center justify-between px-6 py-6 sm:px-10">
        <Logo size="default" showText={true} />
        <ThemeToggle />
      </header>

      {/* Centered Minimalist Login Container */}
      <main className="flex w-full flex-1 items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm sm:max-w-md"
        >
          <Card className="border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            {/* Header Text */}
            <div className="mb-6 space-y-1.5 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Entrar no Ninho
              </h1>
              <p className="text-sm text-muted-foreground">
                Acesse sua conta para organizar seu lar
              </p>
            </div>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={!GOOGLE_ENABLED || isGoogleLoading || isSubmitting}
              className="mb-5 h-11 w-full border-border/80 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {isGoogleLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  <span>Conectando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2.5">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                  <span>Continuar com Google</span>
                </div>
              )}
            </Button>

            {/* Divider */}
            <div className="mb-5 flex w-full items-center gap-3">
              <div className="h-px flex-1 bg-border/60"></div>
              <span className="text-xs font-medium text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border/60"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email / Username Field */}
              <div className="space-y-1.5">
                <Label htmlFor="usernameOrEmail" className="text-xs font-medium text-foreground">
                  E-mail ou usuário
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="usernameOrEmail"
                    type="text"
                    placeholder="ninho@ninho.com"
                    autoComplete="email"
                    {...register('usernameOrEmail')}
                    className="h-10 border-border/80 bg-background pl-9 text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
                {errors.usernameOrEmail && (
                  <p className="text-xs text-destructive">{errors.usernameOrEmail.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                    className="h-10 border-border/80 bg-background pl-9 pr-9 text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Options: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="cursor-pointer text-xs text-muted-foreground"
                  >
                    Lembrar de mim
                  </Label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRecoverySuccess(false);
                    setRecoveryError(null);
                    setRecoveryEmail(
                      usernameOrEmailValue?.includes('@') ? usernameOrEmailValue : ''
                    );
                    setIsRecoveryOpen(true);
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Submit CTA Button */}
              <Button
                type="submit"
                disabled={!isValid || isSubmitting || isGoogleLoading}
                className="h-11 w-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="h-4 w-4" />
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Entrar</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Quick Demo Access Link (Minimalist Pill) */}
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Usar credenciais de teste (Demo)</span>
              </button>
            </div>

            {/* Registration Footer Link */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>
                Não tem uma conta?{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Criar conta
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Password Recovery Modal Dialog */}
      <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Recuperar senha</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enviaremos um link de redefinição para o seu e-mail cadastrado.
            </DialogDescription>
          </DialogHeader>

          {recoverySuccess ? (
            <div className="space-y-4 py-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-xs text-muted-foreground">
                Instruções enviadas para <strong>{recoveryEmail}</strong>. Verifique sua caixa de
                entrada.
              </p>
              <Button
                type="button"
                onClick={() => setIsRecoveryOpen(false)}
                className="w-full bg-primary text-xs font-semibold text-primary-foreground"
              >
                Entendi
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRecoverySubmit} className="space-y-3 pt-1">
              <div className="space-y-1">
                <Label htmlFor="recoveryEmail" className="text-xs font-medium">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="recoveryEmail"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="h-9 pl-9 text-xs"
                    required
                  />
                </div>
                {recoveryError && <p className="text-xs text-destructive">{recoveryError}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRecoveryOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isRecoverySubmitting}
                  className="bg-primary text-xs font-semibold text-primary-foreground"
                >
                  {isRecoverySubmitting ? <Spinner className="h-3.5 w-3.5" /> : 'Enviar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Minimal Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-muted-foreground">
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Ambiente seguro • Ninho Home</span>
        </div>
      </footer>
    </div>
  );
}

export default Login;
