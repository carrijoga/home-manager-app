import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, KeyRound, Lock, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { resetPassword } from '@/services/authService';

const ResetPasswordFormSchema = z
  .object({
    newPassword: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'A confirmação de senha é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof ResetPasswordFormSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawTokenMatch = window.location.search.match(/[?&]token=([^&]+)/);
  const token = rawTokenMatch ? decodeURIComponent(rawTokenMatch[1]) : searchParams.get('token');


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordFormSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setApiError('Token de redefinição inválido ou ausente.');
      return;
    }

    setApiError(null);

    try {
      await resetPassword({
        token,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
      toast.success('Senha redefinida com sucesso!');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível redefinir a senha. Tente novamente.';
      setApiError(message);
      toast.error(message);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between bg-background text-foreground antialiased selection:bg-primary/20">
      <header className="flex w-full items-center justify-between px-6 py-6 sm:px-10">
        <Logo size="default" showText={true} />
        <ThemeToggle />
      </header>

      <main className="flex w-full flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm sm:max-w-md">
          <Card className="border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            {!token ? (
              <div className="space-y-6 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Link inválido ou expirado</h1>
                  <p className="text-sm text-muted-foreground">
                    O link de redefinição de senha não contém um token válido. Solicite uma nova recuperação.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-primary text-sm font-semibold text-primary-foreground"
                >
                  Voltar para o Login
                </Button>
              </div>
            ) : isSuccess ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Senha redefinida!</h1>
                  <p className="text-sm text-muted-foreground">
                    Sua nova senha foi gravada com sucesso. Você já pode fazer login na sua conta.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-primary text-sm font-semibold text-primary-foreground"
                >
                  Fazer Login
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 space-y-1.5 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Redefinir senha</h1>
                  <p className="text-sm text-muted-foreground">
                    Digite a sua nova senha de acesso abaixo
                  </p>
                </div>

                {apiError && (
                  <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                    {apiError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-xs font-medium">
                      Nova Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...register('newPassword')}
                        className="h-10 border-border/80 bg-background pl-9 pr-9 text-sm"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-medium">
                      Confirmar Nova Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...register('confirmPassword')}
                        className="h-10 border-border/80 bg-background pl-9 pr-9 text-sm"
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

                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="h-11 w-full bg-primary text-sm font-semibold text-primary-foreground"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <Spinner className="h-4 w-4" />
                        <span>Redefinindo...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Salvar nova senha</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-xs text-muted-foreground">
                  <Link to="/login" className="font-semibold text-primary hover:underline">
                    Voltar para o Login
                  </Link>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-[11px] text-muted-foreground">
        <span>Ambiente seguro • Ninho Home</span>
      </footer>
    </div>
  );
}
