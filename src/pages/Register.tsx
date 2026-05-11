import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { register as registerRequest } from "@/services/authService";
import * as authService from "@services/authService";
import { RegisterRequestSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Esquema estendido para incluir confirmPassword (campo apenas de UI, não enviado à API)
const RegisterFormSchema = RegisterRequestSchema.extend({
  confirmPassword: z.string().min(1, 'Confirme a senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});
type RegisterForm = z.infer<typeof RegisterFormSchema>;

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    authService.checkSession().then((isAuthenticated) => {
      if (isAuthenticated) {
        navigate("/dashboard");
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
    defaultValues: { firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '' },
  });

  const firstName = watch('firstName');
  const lastName = watch('lastName');

  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGeneratedRef = useRef<string>("");
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

    return () => { if (debounceTimeout.current) clearTimeout(debounceTimeout.current); };
  }, [firstName, lastName, usernameManuallyEdited, setValue]);

  const onSubmit = async (data: RegisterForm) => {
    const { confirmPassword: _, ...payload } = data;
    try {
      const response = await registerRequest(payload);
      const message = response?.message || 'Conta criada com sucesso!';
      toast.success(message);
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível finalizar o registro.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-lg bg-white/90 dark:bg-gray-900/80 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 flex items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-200 via-purple-200 to-cyan-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 transition-transform hover:scale-105">
              <Logo size="large" showText={false} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-indigo-500 dark:text-indigo-300 font-semibold">
                Registrar
              </p>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Crie sua conta no Ninho
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Preencha todos os campos para criar sua conta e começar a
              organizar seu lar.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-3" noValidate>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Nome
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register('firstName')}
                  className="h-10 bg-white text-gray-900 dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Sobrenome
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register('lastName')}
                  className="h-10 bg-white text-gray-900 dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Nome de usuário
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="nome.de.usuario"
                  {...register('username', {
                    onChange: () => setUsernameManuallyEdited(true),
                  })}
                  className="h-10 bg-white text-gray-900 dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800 pr-8"
                />
                {isUsernameLoading && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2"><Spinner className="w-4 h-4" /></span>
                )}
              </div>
              {errors.username && (
                <p className="text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                autoComplete="email"
                {...register('email')}
                className="h-10 bg-white text-gray-900 dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800"
              />
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  {...register('password')}
                  className="h-11 bg-white text-gray-900 dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800 pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none"
                >
                  {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">{errors.password.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Use uma senha segura com no mínimo 6 caracteres.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className={`h-10 bg-white text-gray-900 dark:bg-gray-950 transition-all duration-200 focus:ring-2 border-gray-200 dark:border-gray-800 pr-10 ${
                    errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "focus:ring-indigo-500"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Registrando...
                </div>
              ) : (
                "Criar conta"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já possui cadastro?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
              >
                Voltar para o login
              </Link>
            </p>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default Register;
