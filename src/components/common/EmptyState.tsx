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
    <div className={cn(
      'flex flex-col items-center justify-center py-10 px-4 text-center gap-3',
      className
    )}>
      {Icon && (
        <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border" style={{ background: "var(--primary-subtle)" }}>
          <Icon size={22} className="text-primary" />
        </div>
      )}
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

export default EmptyState;
export type { EmptyStateProps };
