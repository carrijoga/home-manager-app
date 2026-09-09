/**
 * Componente AnimatedToast
 *
 * Sistema de notificações toast customizado com animações Framer Motion,
 * suporte a temas do Tailwind CSS, ícones vibrantes e barra de progresso.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

import { toastFromRightVariants, toastVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';

// ============================================================================
// TIPOS
// ============================================================================

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
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
    throw new Error('useToast deve ser usado dentro de ToastProvider');
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
  position = 'bottom-right',
  maxToasts = 4,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration || 4500,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }
    },
    [maxToasts, removeToast]
  );

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
    'top-center': 'top-4 left-1/2 -translate-x-1/2 w-full max-w-[calc(100vw-24px)] sm:w-auto',
    'top-right': 'top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 w-full max-w-[calc(100vw-24px)] sm:w-auto',
    'bottom-center': 'bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-full max-w-[calc(100vw-24px)] sm:w-auto',
    'bottom-right': 'bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 w-full max-w-[calc(100vw-24px)] sm:w-auto',
  };

  const variants = position.includes('right') ? toastFromRightVariants : toastVariants;

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-[100] flex flex-col gap-2.5 items-center sm:items-end px-3 sm:px-0',
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
            className="pointer-events-auto w-full sm:w-auto"
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

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    barBg: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-rose-500',
    barBg: 'bg-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    barBg: 'bg-amber-500',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    barBg: 'bg-blue-500',
  },
};

function ToastItem({ toast, onClose }: ToastItemProps) {
  const config = TYPE_CONFIG[toast.type];
  const IconComponent = config.icon;
  const duration = toast.duration || 4500;

  return (
    <div
      className={cn(
        'relative overflow-hidden flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-lg transition-all',
        'w-full sm:w-[356px] max-w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
        'shadow-black/[0.04] dark:shadow-black/40'
      )}
    >
      {/* Ícone */}
      <IconComponent className={cn('size-4 shrink-0', config.iconColor)} />

      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium leading-snug text-slate-900 dark:text-slate-100">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{toast.description}</p>
        )}
      </div>

      {/* Botão de fechar */}
      <button
        onClick={onClose}
        className="shrink-0 rounded-lg p-1.5 sm:p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        aria-label="Fechar notificação"
      >
        <X size={15} />
      </button>

      {/* Barra de Progresso de tempo */}
      {duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={cn('absolute bottom-0 left-0 h-[2px] opacity-40', config.barBg)}
        />
      )}
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

export const toast = {
  success: (title: string, description?: string, duration?: number) => ({
    type: 'success' as const,
    title,
    description,
    duration,
  }),
  error: (title: string, description?: string, duration?: number) => ({
    type: 'error' as const,
    title,
    description,
    duration,
  }),
  warning: (title: string, description?: string, duration?: number) => ({
    type: 'warning' as const,
    title,
    description,
    duration,
  }),
  info: (title: string, description?: string, duration?: number) => ({
    type: 'info' as const,
    title,
    description,
    duration,
  }),
};
