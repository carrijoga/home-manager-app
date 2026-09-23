import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-subtle hover:bg-primary/90',
        secondary:
          'border-border/60 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-destructive/20 bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground',
        outline: 'border-border text-foreground bg-card/60',
        success:
          'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 font-semibold',
        warning:
          'border-honey-300/50 bg-honey-50 text-honey-800 dark:bg-honey-950/40 dark:text-honey-300 dark:border-honey-800/50',
        warm: 'border-primary/20 bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary',
        neutral: 'border-border/60 bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
