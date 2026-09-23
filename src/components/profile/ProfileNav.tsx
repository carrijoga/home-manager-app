import { LayoutGrid, Lock, User } from 'lucide-react';

import { cn } from '@/lib/utils';

export type ProfileSectionId = 'perfil' | 'conta' | 'seguranca';

export const PROFILE_SECTIONS: { id: ProfileSectionId; label: string; icon: React.ElementType }[] = [
  { id: 'perfil', label: 'Visão Geral', icon: LayoutGrid },
  { id: 'conta', label: 'Dados da Conta', icon: User },
  { id: 'seguranca', label: 'Segurança & Senha', icon: Lock },
];

interface ProfileNavProps {
  active: ProfileSectionId;
  onSelect: (id: ProfileSectionId) => void;
}

export function ProfileNav({ active, onSelect }: ProfileNavProps) {
  return (
    <>
      {/* Desktop: vertical sidebar */}
      <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-border/40 bg-muted/20 p-3 md:flex">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          Meu Perfil
        </p>
        <div className="space-y-0.5">
          {PROFILE_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all duration-150',
                active === id
                  ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile: bottom tab bar */}
      <nav className="order-last flex shrink-0 border-t border-border/40 bg-background/95 pb-safe md:hidden">
        {PROFILE_SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors',
              active === id
                ? 'border-t-2 border-primary font-semibold text-primary'
                : 'border-t-2 border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-4" />
            <span className="text-[11px]">{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}


