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
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  const variants = position.includes('right') ? toastFromRightVariants : toastVariants;

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-[100] flex flex-col gap-2.5 max-w-full px-4 sm:px-0',
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

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    barBg: 'bg-emerald-500',
    borderColor: 'border-emerald-500/30',
  },
  error: {
    icon: XCircle,
    badgeBg: 'bg-destructive/15 text-destructive',
    barBg: 'bg-destructive',
    borderColor: 'border-destructive/30',
  },
  warning: {
    icon: AlertTriangle,
    badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    barBg: 'bg-amber-500',
    borderColor: 'border-amber-500/30',
  },
  info: {
    icon: Info,
    badgeBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    barBg: 'bg-blue-500',
    borderColor: 'border-blue-500/30',
  },
};

function ToastItem({ toast, onClose }: ToastItemProps) {
  const config = TYPE_CONFIG[toast.type];
  const IconComponent = config.icon;
  const duration = toast.duration || 4500;

  return (
    <div
      className={cn(
        'relative overflow-hidden flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl',
        'w-[340px] max-w-full bg-popover/95 text-popover-foreground',
        config.borderColor
      )}
    >
      {/* Ícone */}
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl font-medium',
          config.badgeBg
        )}
      >
        <IconComponent size={20} />
      </div>

      {/* Conteúdo */}
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold leading-tight text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{toast.description}</p>
        )}
      </div>

      {/* Botão de fechar */}
      <button
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>

      {/* Barra de Progresso de tempo */}
      {duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={cn('absolute bottom-0 left-0 h-1', config.barBg)}
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
