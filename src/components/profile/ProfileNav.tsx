import { cn } from '@/lib/utils';
import { BellRing, LayoutGrid, Lock, User } from 'lucide-react';

export type ProfileSectionId = 'perfil' | 'conta' | 'seguranca' | 'notificacoes';

export const PROFILE_SECTIONS: { id: ProfileSectionId; label: string; icon: React.ElementType }[] = [
  { id: 'perfil', label: 'Perfil', icon: LayoutGrid },
  { id: 'conta', label: 'Conta', icon: User },
  { id: 'seguranca', label: 'Segurança', icon: Lock },
  { id: 'notificacoes', label: 'Notificações', icon: BellRing },
];

interface ProfileNavProps {
  active: ProfileSectionId;
  onSelect: (id: ProfileSectionId) => void;
}

export function ProfileNav({ active, onSelect }: ProfileNavProps) {
  return (
    <>
      <nav className="hidden md:flex flex-col w-52 shrink-0 border-r p-3 gap-0.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
          Perfil
        </p>
        {PROFILE_SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left',
              active === id
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground'
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <nav className="flex md:hidden border-b overflow-x-auto shrink-0">
        {PROFILE_SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 text-xs whitespace-nowrap transition-colors shrink-0',
              active === id
                ? 'border-b-2 border-primary text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}