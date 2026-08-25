import { Crown, Shield, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { NestRole } from '@/schemas/enums';

interface RoleBadgeProps {
  role: number;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  if (role === NestRole.Owner) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'inline-flex items-center gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/50 font-semibold shadow-2xs',
          className
        )}
      >
        <Crown className="size-3 text-amber-500 fill-amber-500/30 shrink-0" />
        <span>Dono</span>
      </Badge>
    );
  }

  if (role === NestRole.Admin) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'inline-flex items-center gap-1 border-blue-500/40 bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/50 font-semibold shadow-2xs',
          className
        )}
      >
        <Shield className="size-3 text-blue-500 fill-blue-500/30 shrink-0" />
        <span>Admin</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold shadow-2xs',
        className
      )}
    >
      <User className="size-3 text-slate-500 dark:text-slate-400 shrink-0" />
      <span>Membro</span>
    </Badge>
  );
}
