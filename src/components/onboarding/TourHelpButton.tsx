import { HelpCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { cn } from '@/lib/utils';

interface TourHelpButtonProps {
  tourId?: string;
  className?: string;
  variant?: 'icon' | 'button' | 'ghost';
  label?: string;
}

export function TourHelpButton({
  tourId,
  className,
  variant = 'icon',
  label = 'Ver tour da tela',
}: TourHelpButtonProps) {
  const { startTour } = useOnboarding();
  const location = useLocation();

  const getEffectiveTourId = (): string => {
    if (tourId) return tourId;
    const pathname = location.pathname.toLowerCase();
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/tasks')) return 'tasks';
    if (pathname.includes('/financial')) return 'financial';
    if (pathname.includes('/shopping')) return 'shopping';
    return 'dashboard';
  };

  const handleStart = () => {
    const targetTourId = getEffectiveTourId();
    startTour(targetTourId, true);
  };

  if (variant === 'button') {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleStart}
        className={cn('gap-1.5 text-xs', className)}
      >
        <HelpCircle className="h-3.5 w-3.5" />
        <span>{label}</span>
      </Button>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleStart}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
              className
            )}
            aria-label="Ver guia explicativo desta tela"
          >
            <HelpCircle size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
