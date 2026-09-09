import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import Logo from '@/components/common/Logo';
import { EyeIcon, EyeOffIcon } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { RegisterRequestSchema } from '@/schemas/auth';
import * as authService from '@/services/authService';

const RegisterFormSchema = RegisterRequestSchema.extend({
  confirmPassword: z.string().min(1, 'Confirme a senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof RegisterFormSchema>;

interface Slide {
  headline: string;
  subheadline: string;
  image: string;
}

const SLIDES: Slide[] = [
  {
    headline: 'Comece a construir o ninho da sua família.',
    subheadline: 'Dê o primeiro passo para uma rotina doméstica mais leve, clara e organizada.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
  },
  {
    headline: 'Tudo o que sua casa precisa em perfeita harmonia.',
    subheadline: 'Finanças, tarefas da semana e compras integradas em um só espaço acolhedor.',
    image:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85',
  },
  {
    headline: 'Conquistas conjuntas começam com bons hábitos.',
    subheadline: 'Acompanhe os sonhos da sua família e transformem planos em realidade.',
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
  },
];

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotate showcase slides every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    authService.checkSession().then((isAuthenticated) => {
      if (isAuthenticated) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterFormSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const firstName = watch('firstName');
  const lastName = watch('lastName');

  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGeneratedRef = useRef<string>('');
  const isGeneratingRef = useRef<boolean>(false);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (firstName?.trim() && lastName?.trim() && !usernameManuallyEdited) {
      debounceTimeout.current = setTimeout(async () => {
        const currentKey = `${firstName.trim()}_${lastName.trim()}`;
        if (lastGeneratedRef.current === currentKey || isGeneratingRef.current) return;

        isGeneratingRef.current = true;
        setIsUsernameLoading(true);

        try {
          const res = await authService.generateUsername(firstName.trim(), lastName.trim());
          lastGeneratedRef.current = currentKey;
          const username = typeof res === 'string' ? res : (res?.username ?? '');
          if (!usernameManuallyEdited) setValue('username', username, { shouldValidate: true });
        } catch {
          // Falha silenciosa — usuário pode preencher manualmente
        } finally {
          setIsUsernameLoading(false);
          isGeneratingRef.current = false;
        }
      }, 500);
    } else if (!firstName?.trim() || !lastName?.trim()) {
      lastGeneratedRef.current = '';
      if (!usernameManuallyEdited) setValue('username', '', { shouldValidate: false });
    }

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [firstName, lastName, usernameManuallyEdited, setValue]);

  const onSubmit = async (data: RegisterForm) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword: _, ...payload } = data;
    try {
      const response = await authService.register(payload);
      const message = response?.message || 'Conta criada com sucesso!';
      toast.success(message);

      const searchInviteToken = new URLSearchParams(window.location.search).get('inviteToken');
      const searchInviteCode = new URLSearchParams(window.location.search).get('inviteCode');
      const pendingInviteToken =
        searchInviteToken || sessionStorage.getItem('pending_invite_token');
      const pendingInviteCode =
        searchInviteCode || sessionStorage.getItem('pending_invite_code');

      let loginUrl = '/login';
      if (pendingInviteCode) {
        loginUrl = `/login?inviteCode=${encodeURIComponent(pendingInviteCode)}`;
      } else if (pendingInviteToken) {
        loginUrl = `/login?inviteToken=${encodeURIComponent(pendingInviteToken)}`;
      }

      setTimeout(() => navigate(loginUrl, { replace: true }), 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível finalizar o registro.';
      toast.error(message);
    }
  };

  const currentSlide = SLIDES[activeSlide];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 antialiased sm:p-6 lg:p-10 selection:bg-primary/20">
      {/* Main Split-Screen Container Card */}
      <div className="grid min-h-[680px] w-full max-w-5xl overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl lg:grid-cols-12">
        
        {/* Left Column: Visual Showcase & Brand Essence (Hidden on mobile, 6 cols on lg) */}
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

        {/* Right Column: Registration Form (12 cols on mobile, 6 cols on lg) */}
        <div className="flex flex-col justify-between bg-card p-7 sm:p-12 lg:col-span-6 lg:p-12">
          <div className="mx-auto my-auto w-full max-w-sm">
            {/* Logo & Header */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-2">
                <Logo size="default" showText={false} />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Criar sua conta
              </h1>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Comece a organizar seu lar com o Ninho.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
              {/* First Name & Last Name Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-xs font-medium text-foreground">
                    Nome
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="João"
                    {...register('firstName')}
                    className="h-10 border-border bg-background text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                  {errors.firstName && (
                    <p className="text-[11px] text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-xs font-medium text-foreground">
                    Sobrenome
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Silva"
                    {...register('lastName')}
                    className="h-10 border-border bg-background text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                  {errors.lastName && (
                    <p className="text-[11px] text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-1">
                <Label htmlFor="username" className="text-xs font-medium text-foreground">
                  Nome de usuário
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="joao.silva"
                    {...register('username', {
                      onChange: () => setUsernameManuallyEdited(true),
                    })}
                    className="h-10 border-border bg-background pl-9 pr-9 text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                  {isUsernameLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Spinner className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                {errors.username && (
                  <p className="text-[11px] text-destructive">{errors.username.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    autoComplete="email"
                    {...register('email')}
                    className="h-10 border-border bg-background pl-9 text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-medium text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo de 6 caracteres"
                    autoComplete="new-password"
                    {...register('password')}
                    className="h-10 border-border bg-background pl-9 pr-9 text-sm text-foreground focus:ring-1 focus:ring-primary"
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
                  <p className="text-[11px] text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className="h-10 border-border bg-background pl-9 pr-9 text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit CTA Button */}
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="mt-3 h-11 w-full text-sm font-semibold transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="h-4 w-4" />
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Criar conta</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>
                Já possui uma conta?{' '}
                <Link to="/login" className="font-semibold text-foreground hover:underline">
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;
