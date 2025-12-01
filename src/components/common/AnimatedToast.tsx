/**
 * Componente AnimatedToast
 *
 * Sistema de notificações toast com animações suaves.
 * Suporta múltiplos tipos (sucesso, erro, aviso, info) e posições.
 */

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, createContext, useContext, useState, useCallback } from "react";
import { toastVariants, toastFromRightVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

// ============================================================================
// TIPOS
// ============================================================================

type ToastType = "success" | "error" | "warning" | "info";
type ToastPosition = "top-center" | "top-right" | "bottom-center" | "bottom-right";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = "top-right",
  maxToasts = 3,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration || 5000,
      };

      setToasts((prev) => {
        // Limita o número de toasts
        const updated = [...prev, newToast];
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });

      // Auto-remove após duration
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }
    },
    [maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ============================================================================
// CONTAINER
// ============================================================================

interface ToastContainerProps {
  toasts: Toast[];
  position: ToastPosition;
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, position, onRemove }: ToastContainerProps) {
  const positionClasses = {
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "top-right": "top-4 right-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
  };

  // Usa variantes diferentes baseado na posição
  const variants = position.includes("right")
    ? toastFromRightVariants
    : toastVariants;

  return (
    <div
      className={cn(
        "fixed z-[100] flex flex-col gap-2 pointer-events-none",
        positionClasses[position]
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            className="pointer-events-auto"
          >
            <ToastItem toast={toast} onClose={() => onRemove(toast.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ITEM
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colorClasses = {
    success: "bg-natureza-100 dark:bg-natureza-900/30 border-natureza-500 text-natureza-900 dark:text-natureza-100",
    error: "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-900 dark:text-red-100",
    warning: "bg-aviso-100 dark:bg-aviso-900/30 border-aviso-500 text-aviso-900 dark:text-aviso-100",
    info: "bg-serenidade-100 dark:bg-serenidade-900/30 border-serenidade-500 text-serenidade-900 dark:text-serenidade-100",
  };

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg",
        "min-w-[320px] max-w-md",
        "backdrop-blur-sm",
        colorClasses[toast.type]
      )}
    >
      {/* Ícone */}
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-xs opacity-90 leading-tight">
            {toast.description}
          </p>
        )}
      </div>

      {/* Botão de fechar */}
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Funções auxiliares para criar toasts rapidamente
 */
export const toast = {
  success: (title: string, description?: string, duration?: number) => ({
    type: "success" as const,
    title,
    description,
    duration,
  }),
  error: (title: string, description?: string, duration?: number) => ({
    type: "error" as const,
    title,
    description,
    duration,
  }),
  warning: (title: string, description?: string, duration?: number) => ({
    type: "warning" as const,
    title,
    description,
    duration,
  }),
  info: (title: string, description?: string, duration?: number) => ({
    type: "info" as const,
    title,
    description,
    duration,
  }),
};

/**
 * Exemplo de uso:
 *
 * ```tsx
 * function MyComponent() {
 *   const { addToast } = useToast();
 *
 *   const handleClick = () => {
 *     addToast(toast.success("Tarefa concluída!", "A tarefa foi marcada como concluída."));
 *   };
 *
 *   return <button onClick={handleClick}>Concluir</button>;
 * }
 * ```
 */
