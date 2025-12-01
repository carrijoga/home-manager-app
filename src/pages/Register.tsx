import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { register as registerRequest } from "@/services/authService";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import * as authService from "@services/authService";

const MIN_PASSWORD_LENGTH = 6;

function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    authService.checkSession().then((isAuthenticated) => {
      if (isAuthenticated) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev: typeof formState) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    if (formState.password !== formState.confirmPassword) {
      setError("As senhas não coincidem. Por favor, verifique.");
      setIsLoading(false);
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      // Send only required fields to API
      const { confirmPassword, ...payload } = formState;
      const response = await registerRequest(payload);
      const message = response?.message || "Conta criada com sucesso!";
      setSuccessMessage(message);
      toast.success(message);

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível finalizar o registro.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = formState.password === formState.confirmPassword;
  const showPasswordMismatch = formState.confirmPassword.length > 0 && !passwordsMatch;

  const isFormValid =
    formState.firstName.trim() !== "" &&
    formState.lastName.trim() !== "" &&
    formState.email.trim() !== "" &&
    formState.password.trim().length >= MIN_PASSWORD_LENGTH &&
    formState.confirmPassword.trim().length >= MIN_PASSWORD_LENGTH &&
    passwordsMatch;

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
              Preencha todos os campos para criar sua conta e começar a organizar seu lar.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 space-y-3"
            noValidate
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-200">Nome</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  value={formState.firstName}
                  onChange={handleChange}
                  className="h-10 bg-white dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-200">Sobrenome</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  value={formState.lastName}
                  onChange={handleChange}
                  className="h-10 bg-white dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                autoComplete="email"
                required
                value={formState.email}
                onChange={handleChange}
                className="h-10 bg-white dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo de 6 caracteres"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                value={formState.password}
                onChange={handleChange}
                className="h-11 bg-white dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800"
              />
              <p className="text-xs text-muted-foreground">
                Use uma senha segura com no mínimo 6 caracteres.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-200">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                value={formState.confirmPassword}
                onChange={handleChange}
                className={`h-10 bg-white dark:bg-gray-950 transition-all duration-200 focus:ring-2 border-gray-200 dark:border-gray-800 ${showPasswordMismatch
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-indigo-500"
                  }`}
              />
              {showPasswordMismatch && (
                <p className="text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
                  As senhas não coincidem
                </p>
              )}
              {formState.confirmPassword.length > 0 && passwordsMatch && (
                <p className="text-xs text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-top-1 duration-200">
                  ✓ As senhas coincidem
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Registrando...
                </div>
              ) : (
                "Criar conta"
              )}
            </Button>

            {error && (
              <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-900/10 p-3 text-sm text-red-700 dark:text-red-300 animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-900/10 p-3 text-sm text-emerald-700 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-300">
                {successMessage} Redirecionando para o login...
              </div>
            )}

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
