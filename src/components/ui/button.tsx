import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[colors,transform] duration-[length:var(--dur-base)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-terracotta-500 text-white shadow hover:bg-terracotta-600 dark:bg-terracotta-600 dark:hover:bg-terracotta-700',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-honey-400 text-foreground shadow-sm hover:bg-honey-500 dark:bg-honey-600 dark:text-white dark:hover:bg-honey-700',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        warm: 'border border-terracotta-300 bg-terracotta-50 text-terracotta-700 hover:bg-terracotta-100 dark:border-terracotta-700 dark:bg-terracotta-900/30 dark:text-terracotta-300 dark:hover:bg-terracotta-900/50',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-10 rounded-xl px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  isLoading?: boolean;
  loadingText?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      isLoading = false,
      loadingText,
      disabled,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const [isAsyncPending, setIsAsyncPending] = React.useState(false);
    const isBusy = loading || isLoading || isAsyncPending;
    const isDisabled = disabled || isBusy;

    const handleClick = React.useCallback(
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isDisabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        if (onClick) {
          const result: unknown = (
            onClick as (e: React.MouseEvent<HTMLButtonElement>) => unknown
          )(e);
          if (
            result !== null &&
            typeof result === 'object' &&
            'then' in result &&
            typeof (result as Promise<unknown>).then === 'function'
          ) {
            setIsAsyncPending(true);
            try {
              await result;
            } finally {
              setIsAsyncPending(false);
            }
          }
        }
      },
      [isDisabled, onClick]
    );

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          aria-busy={isBusy ? 'true' : undefined}
          aria-disabled={isDisabled ? 'true' : undefined}
          {...props}
          onClick={onClick ? handleClick : undefined}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={isBusy ? 'true' : undefined}
        onClick={onClick ? handleClick : undefined}
        {...props}
      >
        {isBusy ? (
          <>
            <Loader2 className="animate-spin shrink-0" />
            {loadingText ?? children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

