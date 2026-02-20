import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { login as loginRequest } from "@/services/authService";
import { useApp } from "@/contexts/AppContext";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
// Constantes de ambiente
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
const MIN_PASSWORD_LENGTH = 6;

function Login() {
  const navigate = useNavigate();
  const { loadUserProfile } = useApp();
  const [formState, setFormState] = useState({
    UsernameOrEmail: "",
    Password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Não verificamos sessão na página de login
  // Se o usuário já estiver autenticado, o RequireAuth vai redirecioná-lo

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginRequest(formState);
      await loadUserProfile();

      const message = response?.message || "Login realizado com sucesso!";
      toast.success(message);

      // Se o login foi bem-sucedido, os cookies HttpOnly foram configurados
      // Redireciona para o dashboard imediatamente
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível realizar o login, tente novamente.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error("Google Client ID não configurado. Verifique as variáveis de ambiente.");
      return;
    }

    setIsGoogleLoading(true);

    // Build Google OAuth URL
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.append("redirect_uri", GOOGLE_REDIRECT_URI);
    googleAuthUrl.searchParams.append("response_type", "code");
    googleAuthUrl.searchParams.append("scope", "openid email profile");
    googleAuthUrl.searchParams.append("access_type", "offline");
    googleAuthUrl.searchParams.append("prompt", "consent");

    // Redirect to Google OAuth
    window.location.href = googleAuthUrl.toString();
  };

  const isFormValid =
    formState.UsernameOrEmail.trim() !== "" &&
    formState.Password.trim().length >= MIN_PASSWORD_LENGTH;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md p-8 sm:p-12 shadow-xl backdrop-blur-lg bg-white/90 dark:bg-gray-900/80 border border-white/20">
        <div className="flex flex-col items-center w-full">
          <div className="mb-6 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-cyan-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 transition-transform hover:scale-105">
            <Logo size="large" showText={false} />
          </div>

          <div className="text-center mb-8 space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-500 dark:text-indigo-300 font-semibold">
              Entrar
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Bem-vindo ao Ninho
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Use os dados cadastrados para acessar seu painel.
            </p>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-12 mb-6 text-base font-medium bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-900 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {isGoogleLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner className="w-4 h-4" />
                Redirecionando...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <div className="w-full flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="UsernameOrEmail" className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</Label>
              <Input
                id="UsernameOrEmail"
                name="UsernameOrEmail"
                type="email"
                placeholder="ninho@ninho.com"
                autoComplete="email"
                required
                value={formState.UsernameOrEmail}
                onChange={handleChange}
                className="h-10 bg-white text-gray-700 dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Password" className="text-sm font-medium text-gray-700 dark:text-gray-200">Senha</Label>
              <div className="relative">
                <Input
                  id="Password"
                  name="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  autoComplete="current-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={formState.Password}
                  onChange={handleChange}
                  className="h-10 bg-white text-gray-700 dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800 pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isLoading || isGoogleLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 w-full rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-900/10 p-3 text-sm text-red-700 dark:text-red-300 animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          <div className="mt-8 w-full text-center text-sm text-muted-foreground space-y-2">
            <p>
              Ainda não tem conta?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
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

