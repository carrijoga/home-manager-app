import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-subtle hover:bg-primary/90 hover:shadow-card',
        destructive:
          'bg-destructive text-white shadow-subtle hover:bg-destructive/90',
        outline:
          'border border-border/80 bg-background/80 shadow-subtle hover:bg-muted/60 hover:text-foreground hover:border-border',
        secondary:
          'bg-secondary text-secondary-foreground shadow-subtle hover:bg-secondary/80',
        ghost: 'hover:bg-muted/60 hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        warm: 'border border-primary/20 bg-primary/10 text-primary hover:bg-primary/15',
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

