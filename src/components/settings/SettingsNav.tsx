import { Database, Globe, Info, MapPin, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SectionId = 'geral' | 'aparencia' | 'localizacao-clima' | 'dados-privacidade' | 'sobre';

export const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: 'geral', label: 'Geral', icon: Globe },
  { id: 'aparencia', label: 'Aparência', icon: Palette },
  { id: 'localizacao-clima', label: 'Localização & Clima', icon: MapPin },
  { id: 'dados-privacidade', label: 'Dados & Privacidade', icon: Database },
  { id: 'sobre', label: 'Sobre', icon: Info },
];

interface SettingsNavProps {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}

export function SettingsNav({ active, onSelect }: SettingsNavProps) {
  return (
    <>
      {/* Desktop: vertical sidebar */}
      <nav className="hidden md:flex flex-col w-52 shrink-0 border-r p-3 gap-0.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
          Configurações
        </p>
        {SECTIONS.map(({ id, label, icon: Icon }) => (
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

      {/* Mobile: horizontal tab strip */}
      <nav className="flex md:hidden border-b overflow-x-auto shrink-0">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
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
