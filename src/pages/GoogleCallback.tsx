import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginWithGoogle } from "@/services/authService";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import Logo from "@/components/common/Logo";

export const GoogleCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<"loading" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");
            const error = searchParams.get("error");

            if (error) {
                setStatus("error");
                setErrorMessage("Autenticação cancelada ou negada pelo Google.");
                toast.error("Autenticação cancelada");
                setTimeout(() => navigate("/login", { replace: true }), 3000);
                return;
            }

            if (!code) {
                setStatus("error");
                setErrorMessage("Código de autorização não encontrado.");
                toast.error("Erro na autenticação");
                setTimeout(() => navigate("/login", { replace: true }), 3000);
                return;
            }

            try {
                const response = await loginWithGoogle(code);
                toast.success(
                    response.message || "Login com Google realizado com sucesso!"
                );
                navigate("/dashboard", { replace: true });
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Não foi possível completar o login com Google.";
                setStatus("error");
                setErrorMessage(message);
                toast.error(message);
                setTimeout(() => navigate("/login", { replace: true }), 3000);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <Card className="w-full max-w-md p-8 sm:p-12 shadow-xl backdrop-blur-lg bg-white/90 dark:bg-gray-900/80 border border-white/20">
                <div className="flex flex-col items-center w-full space-y-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-cyan-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
                        <Logo size="large" showText={false} />
                    </div>

                    {status === "loading" ? (
                        <>
                            <div className="flex flex-col items-center gap-4">
                                <Spinner className="w-12 h-12 text-indigo-600" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Autenticando com Google...
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    Aguarde enquanto processamos sua autenticação.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-red-600 dark:text-red-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Erro na Autenticação
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    {errorMessage}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Redirecionando para o login...
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default GoogleCallback;
