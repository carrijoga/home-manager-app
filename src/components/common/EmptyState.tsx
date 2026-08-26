import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const EmptyState = ({ icon: Icon, title, description, action, className }: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-4 py-10 text-center',
        className
      )}
    >
      {Icon && (
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border"
          style={{ background: 'var(--primary-subtle)' }}
        >
          <Icon size={22} className="text-primary" />
        </div>
      )}
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mx-auto max-w-[200px] text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

export default EmptyState;
export type { EmptyStateProps };
