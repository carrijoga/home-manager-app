import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { register as registerRequest } from "@/services/authService";
import * as authService from "@services/authService";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MIN_PASSWORD_LENGTH = 6;

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

  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev: typeof formState) => ({
      ...prev,
      [name]: value ?? ""
    }));
    if (name === "username") {
      setUsernameError(null);
      setUsernameManuallyEdited(true);
    }
    if (name === "firstName" || name === "lastName") {
      setUsernameManuallyEdited(false);
    }
  };

  // Gera username automaticamente ao preencher nome e sobrenome
  // Debounce para evitar múltiplas requisições
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastGeneratedRef = useRef<string>("");
  const isGeneratingRef = useRef<boolean>(false);
  
  useEffect(() => {
    const { firstName = "", lastName = "" } = formState;
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    if (firstName?.trim() && lastName?.trim() && !usernameManuallyEdited) {
      debounceTimeout.current = setTimeout(async () => {
        const currentKey = `${firstName.trim()}_${lastName.trim()}`;
        
        // Evita requisições duplicadas para os mesmos valores
        if (lastGeneratedRef.current === currentKey || isGeneratingRef.current) {
          return;
        }
        
        isGeneratingRef.current = true;
        setIsUsernameLoading(true);
        setUsernameError(null);
        
        try {
          const res = await authService.generateUsername(firstName.trim(), lastName.trim());
          lastGeneratedRef.current = currentKey;
          console.log('Resposta completa da API:', res);
          let username = "";
          if (typeof res === "string") {
            username = res;
          } else {
            username = res?.username || res?.result || "";
          }
          console.log('Username sugerido pela API:', username);
          // Sempre atualiza o campo username se não foi editado manualmente
          if (!usernameManuallyEdited) {
            setFormState((prev) => ({ ...prev, username }));
          }
        } catch (err: any) {
          console.error("Erro ao gerar username:", err);
          // Não mostra erro para não atrapalhar a experiência, apenas não preenche
          // setUsernameError(err.message || "Erro ao gerar username");
        } finally {
          setIsUsernameLoading(false);
          isGeneratingRef.current = false;
        }
      }, 500); // 500ms debounce
    } else if (!firstName?.trim() || !lastName?.trim()) {
      lastGeneratedRef.current = "";
      if (!usernameManuallyEdited) {
        setFormState((prev) => ({ ...prev, username: "" })); // já é string
      }
      setUsernameError(null);
    }
    
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [formState.firstName, formState.lastName, usernameManuallyEdited]);

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
      // Envia todos os campos necessários para API, incluindo username
      const { confirmPassword, ...payload } = formState;
      const response = await registerRequest(payload);
      const message = response?.message || "Conta criada com sucesso!";
      setSuccessMessage(message);
      toast.success(message);

      setTimeout(() => {
        navigate("/login", { replace: true });
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
  const showPasswordMismatch =
    formState.confirmPassword && formState.confirmPassword.length > 0 && !passwordsMatch;

  const isFormValid =
    formState.firstName?.trim() !== "" &&
    formState.lastName?.trim() !== "" &&
    formState.username?.trim() !== "" &&
    formState.email?.trim() !== "" &&
    (formState.password?.trim().length ?? 0) >= MIN_PASSWORD_LENGTH &&
    (formState.confirmPassword?.trim().length ?? 0) >= MIN_PASSWORD_LENGTH &&
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
              Preencha todos os campos para criar sua conta e começar a
              organizar seu lar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 space-y-3" noValidate>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Nome
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  value={formState.firstName}
                  onChange={handleChange}
                  className="h-10 bg-white text-gray-900 dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Sobrenome
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  value={formState.lastName}
                  onChange={handleChange}
                  className="h-10 bg-white text-gray-900 dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Nome de usuário
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  placeholder="nome.de.usuario"
                  required
                  value={formState.username}
                  onChange={handleChange}
                  className="h-10 bg-white text-gray-900 dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800 pr-8"
                />
                {isUsernameLoading && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2"><Spinner className="w-4 h-4" /></span>
                )}
              </div>
              {usernameError && (
                <p className="text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">{usernameError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                autoComplete="email"
                required
                value={formState.email}
                onChange={handleChange}
                className="h-10 bg-white text-gray-900 dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                  value={formState.password}
                  onChange={handleChange}
                  className="h-11 bg-white text-gray-900 dark:bg-gray-950 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-800 pr-10"
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
              <p className="text-xs text-muted-foreground">
                Use uma senha segura com no mínimo 6 caracteres.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                  value={formState.confirmPassword}
                  onChange={handleChange}
                  className={`h-10 bg-white text-gray-900 dark:bg-gray-950 transition-all duration-200 focus:ring-2 border-gray-200 dark:border-gray-800 pr-10 ${
                    showPasswordMismatch
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-indigo-500"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
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
