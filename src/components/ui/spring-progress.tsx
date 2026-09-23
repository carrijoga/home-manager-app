import { motion } from 'framer-motion';
import * as React from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

export interface SpringProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Valor do progresso (0 a 100) */
  value: number;
  /** Valor máximo (padrão: 100) */
  max?: number;
  /** Variante de cor */
  variant?: 'primary' | 'sage' | 'amber' | 'destructive' | 'secondary';
  /** Classe adicional para o preenchimento */
  indicatorClassName?: string;
  /** Se deve animar com mola (padrão: true) */
  spring?: boolean;
}

const variantStyles: Record<NonNullable<SpringProgressProps['variant']>, string> = {
  primary: 'bg-primary',
  sage: 'bg-sage-600 dark:bg-sage-400',
  amber: 'bg-amber-500',
  destructive: 'bg-destructive',
  secondary: 'bg-secondary-foreground/60',
};

/**
 * SpringProgress — Barra de progresso com animação de mola fluida (estilo Apple/iOS).
 * Ajusta a largura com amortecimento contínuo sem saltos secos.
 */
export const SpringProgress = React.forwardRef<HTMLDivElement, SpringProgressProps>(
  (
    {
      value,
      max = 100,
      variant = 'primary',
      className,
      indicatorClassName,
      spring = true,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    const clampedValue = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), max);
    const percentage = max > 0 ? (clampedValue / max) * 100 : 0;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
        {...props}
      >
        <motion.div
          className={cn('h-full rounded-full', variantStyles[variant], indicatorClassName)}
          initial={prefersReducedMotion ? false : { width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={
            prefersReducedMotion || !spring
              ? { duration: 0.2 }
              : { type: 'spring', stiffness: 140, damping: 22, mass: 0.8 }
          }
        />
      </div>
    );
  }
);

SpringProgress.displayName = 'SpringProgress';
