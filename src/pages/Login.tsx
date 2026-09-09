import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Logo from '@/components/common/Logo';
import { EyeIcon, EyeOffIcon } from '@/components/ui';
import { Button } from '@/components/ui/button';
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

interface Slide {
  headline: string;
  subheadline: string;
  image: string;
}

const SLIDES: Slide[] = [
  {
    headline: 'O refúgio da sua família em perfeita harmonia.',
    subheadline: 'Organize tarefas, finanças e o dia a dia do lar com leveza e colaboração.',
    image:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85',
  },
  {
    headline: 'Menos sobrecarga na rotina, mais presença com quem importa.',
    subheadline: 'Distribua os cuidados da casa com transparência e cooperação mútua.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
  },
  {
    headline: 'Planejem e celebrem juntos cada conquista do lar.',
    subheadline: 'Acompanhe metas financeiras e projetos familiares passo a passo.',
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
  },
];

function Login() {
  const navigate = useNavigate();
  const { loadUserProfile } = useApp();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  // Password Recovery Modal State
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [isRecoverySubmitting, setIsRecoverySubmitting] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // Auto-rotate showcase slides every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

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
  const isEmailDetected = usernameOrEmailValue?.includes('@');

  const onSubmit = async (data: LoginRequest) => {
    try {
      await loginRequest(data);
      await loadUserProfile();
      toast.success('Bem-vindo ao seu Ninho!');

      const searchInviteToken = new URLSearchParams(window.location.search).get('inviteToken');
      const searchInviteCode = new URLSearchParams(window.location.search).get('inviteCode');
      const pendingInviteToken =
        searchInviteToken || sessionStorage.getItem('pending_invite_token');
      const pendingInviteCode =
        searchInviteCode || sessionStorage.getItem('pending_invite_code');

      if (pendingInviteCode) {
        navigate(`/invite?code=${encodeURIComponent(pendingInviteCode)}`, { replace: true });
        return;
      }

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

  const currentSlide = SLIDES[activeSlide];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 antialiased sm:p-6 lg:p-10 selection:bg-primary/20">
      {/* Main Split-Screen Container Card */}
      <div className="grid min-h-[640px] w-full max-w-5xl overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl lg:grid-cols-12">
        
        {/* Left Column: Visual Showcase & Brand Essence (Hidden on small mobile, 6 cols on lg) */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-neutral-900 p-8 sm:p-12 lg:col-span-6 lg:flex">
          {/* Animated Background Image */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide.image}
              src={currentSlide.image}
              alt="Ambiente acolhedor Ninho"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </AnimatePresence>

          {/* Gradients for contrast and atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />

          {/* Top Subtle Brand Watermark */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-white/20 text-white backdrop-blur-md">
              <svg viewBox="0 0 60 60" className="h-5 w-5 fill-none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="30" r="28" fill="#ffffff" fillOpacity="0.2" />
                <ellipse cx="30" cy="36" rx="16" ry="7" fill="#f8fafc" />
                <ellipse cx="26" cy="34" rx="3.5" ry="4.5" fill="#facc15" />
                <ellipse cx="34" cy="34" rx="3.5" ry="4.5" fill="#facc15" />
                <ellipse cx="30" cy="32" rx="3.5" ry="4.5" fill="#fef08a" />
                <path d="M 15 28 Q 12 26 14 24" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-white">Ninho</span>
          </div>

          {/* Bottom Editorial Content */}
          <div className="relative z-10 mt-auto pt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="font-display text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
                  {currentSlide.headline}
                </h2>
                <p className="mt-2.5 max-w-md text-sm leading-relaxed text-neutral-200">
                  {currentSlide.subheadline}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Minimalist Dash Pagination Indicators */}
            <div className="mt-8 flex items-center gap-2">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === activeSlide
                      ? 'w-8 bg-white'
                      : 'w-3 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Form (12 cols on mobile, 6 cols on lg) */}
        <div className="flex flex-col justify-between bg-card p-7 sm:p-12 lg:col-span-6 lg:p-14">
          <div className="mx-auto my-auto w-full max-w-sm">
            {/* Logo & Header */}
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="mb-2">
                <Logo size="default" showText={false} />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Bem-vindo de volta
              </h1>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Acesse sua conta para organizar seu lar.
              </p>
            </div>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={!GOOGLE_ENABLED || isGoogleLoading || isSubmitting}
              className="mb-5 h-11 w-full border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.99]"
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
                  <span>Continuar com o Google</span>
                </div>
              )}
            </Button>

            {/* Divider */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/80" />
              </div>
              <div className="relative bg-card px-3 text-xs text-muted-foreground">
                ou
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Field 1: Email ou Usuário (Detectável ao preenchimento) */}
              <div className="space-y-1.5">
                <Label htmlFor="usernameOrEmail" className="text-xs font-medium text-foreground">
                  E-mail ou Usuário
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {isEmailDetected ? (
                      <Mail className="h-4 w-4 text-foreground/90 transition-colors" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground transition-colors" />
                    )}
                  </div>
                  <Input
                    id="usernameOrEmail"
                    type="text"
                    placeholder="seu@email.com ou usuario"
                    autoComplete="username"
                    {...register('usernameOrEmail')}
                    className="h-11 border-border bg-background pl-9 pr-3 text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
                {errors.usernameOrEmail && (
                  <p className="text-xs text-destructive">{errors.usernameOrEmail.message}</p>
                )}
              </div>

              {/* Field 2: Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                    className="h-11 border-border bg-background pl-9 pr-9 text-sm text-foreground focus:ring-1 focus:ring-primary"
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

              {/* Options: Lembrar de Mim & Esqueceu sua senha? */}
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="cursor-pointer text-xs font-normal text-muted-foreground"
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
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  Esqueceu sua senha?
                </button>
              </div>

              {/* Submit CTA Button */}
              <Button
                type="submit"
                disabled={!isValid || isSubmitting || isGoogleLoading}
                className="mt-2 h-11 w-full text-sm font-semibold transition-opacity disabled:opacity-50"
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

            {/* Registration Link */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>
                Não tem uma conta?{' '}
                <Link to="/register" className="font-semibold text-foreground hover:underline">
                  Criar uma conta
                </Link>
              </p>
            </div>

            {/* Test Credentials Helper - Exclusively visible in Local Development */}
            {import.meta.env.DEV && (
              <div className="mt-8 border-t border-border/50 pt-3 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-[11px] text-muted-foreground/70 transition-colors hover:text-foreground hover:underline"
                >
                  [Dev: Preencher credenciais de teste]
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

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
                className="w-full text-xs font-semibold"
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
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                  className="text-xs font-semibold"
                >
                  {isRecoverySubmitting ? <Spinner className="h-3.5 w-3.5" /> : 'Enviar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Login;
