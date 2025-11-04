import { toast } from "sonner";

/**
 * Hook customizado para notificações toast com mensagens padrão em português
 */
export const useToastNotifications = () => {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 3000,
    });
  };

  const showWarning = (message: string) => {
    toast.warning(message, {
      duration: 3000,
    });
  };

  const showInfo = (message: string) => {
    toast.info(message, {
      duration: 3000,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
