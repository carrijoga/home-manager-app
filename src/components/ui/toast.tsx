import React from 'react';
import { toast as sonnerToast } from 'sonner';
import { cn } from '@/lib/utils';
import { Toaster } from './sonner';

export { Toaster };

export interface ToastPromiseOptions<T> {
  loading: React.ReactNode;
  success: React.ReactNode | ((data: T) => React.ReactNode);
  error: React.ReactNode | ((error: any) => React.ReactNode);
  description?: React.ReactNode | ((data: T) => React.ReactNode);
  duration?: number;
}

/**
 * Utilitário de Toast do Ninho com suporte a Promises e barra de progresso CreateUI
 */
export const toast = Object.assign(
  (message: React.ReactNode, options?: Parameters<typeof sonnerToast>[1]) => {
    return sonnerToast(message, options);
  },
  {
    success: (message: React.ReactNode, options?: Parameters<typeof sonnerToast.success>[1]) =>
      sonnerToast.success(message, options),
    error: (message: React.ReactNode, options?: Parameters<typeof sonnerToast.error>[1]) =>
      sonnerToast.error(message, options),
    warning: (message: React.ReactNode, options?: Parameters<typeof sonnerToast.warning>[1]) =>
      sonnerToast.warning(message, options),
    info: (message: React.ReactNode, options?: Parameters<typeof sonnerToast.info>[1]) =>
      sonnerToast.info(message, options),
    loading: (message: React.ReactNode, options?: Parameters<typeof sonnerToast.loading>[1]) =>
      sonnerToast.loading(message, options),
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
    custom: sonnerToast.custom,
    message: sonnerToast.message,

    /**
     * Executa uma Promise assíncrona exibindo o ciclo completo:
     * Loading (indeterminado) ➔ Morphing para Sucesso ou Erro com início da barra de progresso.
     */
    promise<T>(promise: Promise<T> | (() => Promise<T>), options: ToastPromiseOptions<T>) {
      const p = typeof promise === 'function' ? promise() : promise;
      return sonnerToast.promise(p, {
        loading: options.loading,
        success: options.success,
        error: options.error,
        description: options.description,
        duration: options.duration ?? 4000,
      });
    },
  }
);

// ── Componentes Compostos Declarativos no padrão CreateUI ──

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          'relative flex flex-col overflow-hidden select-none',
          'w-full sm:w-[370px] max-w-[calc(100vw-24px)]',
          'rounded-2xl border bg-card border-border',
          'shadow-xl shadow-black/[0.05] dark:shadow-black/50',
          'p-3.5 pr-10 gap-3 text-card-foreground',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export const ToastBody = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-start gap-3', className)} {...props}>
    {children}
  </div>
);

export const ToastIcon = ({
  className,
  variant = 'default',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: ToastProps['variant'] }) => {
  const variantStyles = {
    default: 'border-primary/30 bg-primary/15 text-primary',
    success: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-500',
    error: 'border-rose-500/30 bg-rose-500/15 text-rose-500',
    warning: 'border-amber-500/30 bg-amber-500/15 text-amber-500',
    info: 'border-blue-500/30 bg-blue-500/15 text-blue-500',
  };

  return (
    <div
      className={cn(
        'size-8 rounded-xl border flex items-center justify-center shrink-0',
        variantStyles[variant ?? 'default'],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const ToastContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 min-w-0 pr-1', className)} {...props}>
    {children}
  </div>
);

export const ToastTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4 className={cn('text-xs sm:text-[13px] font-semibold leading-tight text-foreground truncate', className)} {...props}>
    {children}
  </h4>
);

export const ToastDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-xs text-muted-foreground mt-0.5 leading-relaxed', className)} {...props}>
    {children}
  </p>
);

export const ToastAction = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className={cn(
      'shrink-0 text-xs font-semibold rounded-xl px-3 py-1.5 transition-all',
      'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-[0.98]',
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export const ToastClose = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    aria-label="Fechar notificação"
    className={cn(
      'absolute right-2.5 top-1/2 -translate-y-1/2',
      'size-7 sm:size-6 flex items-center justify-center rounded-lg',
      'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
      className
    )}
    {...props}
  >
    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);

export const ToastProgress = ({
  className,
  variant = 'default',
  duration = 4000,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: ToastProps['variant']; duration?: number }) => {
  const barColors = {
    default: 'bg-primary',
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="absolute inset-x-0 bottom-0 h-[3px] bg-muted overflow-hidden pointer-events-none">
      <div
        className={cn('h-full w-full', barColors[variant ?? 'default'], className)}
        style={{
          animation: `toast-progress-countdown ${duration}ms linear forwards`,
        }}
        {...props}
      />
    </div>
  );
};
