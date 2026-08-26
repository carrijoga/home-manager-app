import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/common/ThemeToggle';
import { EyeIcon, EyeOffIcon } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      const pendingInviteToken =
        searchInviteToken || sessionStorage.getItem('pending_invite_token');
      const loginUrl = pendingInviteToken
        ? `/login?inviteToken=${encodeURIComponent(pendingInviteToken)}`
        : '/login';

      setTimeout(() => navigate(loginUrl, { replace: true }), 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível finalizar o registro.';
      toast.error(message);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Top Header */}
      <header className="flex w-full items-center justify-between px-6 py-6 sm:px-10">
        <Logo size="default" showText={true} />
        <ThemeToggle />
      </header>

      {/* Main Form Container */}
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
                Criar sua conta
              </h1>
              <p className="text-sm text-muted-foreground">
                Comece a organizar seu lar com o Ninho
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* First Name & Last Name Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-medium text-foreground">
                    Nome
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="João"
                    {...register('firstName')}
                    className="h-10 border-border/80 bg-background text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-medium text-foreground">
                    Sobrenome
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Silva"
                    {...register('lastName')}
                    className="h-10 border-border/80 bg-background text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-medium text-foreground">
                  Nome de usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="joao.silva"
                    {...register('username', {
                      onChange: () => setUsernameManuallyEdited(true),
                    })}
                    className="h-10 border-border/80 bg-background pl-9 pr-9 text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                  {isUsernameLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Spinner className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    autoComplete="email"
                    {...register('email')}
                    className="h-10 border-border/80 bg-background pl-9 text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
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
                    placeholder="Mínimo de 6 caracteres"
                    autoComplete="new-password"
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

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className="h-10 border-border/80 bg-background pl-9 pr-9 text-sm text-foreground focus:ring-1 focus:ring-primary"
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
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit CTA Button */}
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="mt-2 h-11 w-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
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
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Entrar
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </main>

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

export default Register;
