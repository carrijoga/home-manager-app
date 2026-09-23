import {
  BellRing,
  Database,
  Globe,
  Info,
  MapPin,
  Palette,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export type SettingsSectionId =
  | 'notificacoes'
  | 'aparencia'
  | 'geral'
  | 'localizacao-clima'
  | 'dados-privacidade'
  | 'sobre';

export interface SectionItem {
  id: SettingsSectionId;
  label: string;
  mobileLabel: string;
  icon: React.ElementType;
}

export const SETTINGS_NAV_ITEMS: SectionItem[] = [
  { id: 'notificacoes', label: 'Alertas & Notificações', mobileLabel: 'Alertas', icon: BellRing },
  { id: 'aparencia', label: 'Aparência & Tema', mobileLabel: 'Aparência', icon: Palette },
  { id: 'geral', label: 'Geral & Idioma', mobileLabel: 'Geral', icon: Globe },
  { id: 'localizacao-clima', label: 'Localização & Clima', mobileLabel: 'Clima', icon: MapPin },
  { id: 'dados-privacidade', label: 'Dados & Privacidade', mobileLabel: 'Dados', icon: Database },
  { id: 'sobre', label: 'Sobre o Ninho', mobileLabel: 'Sobre', icon: Info },
];

interface SettingsNavProps {
  active: SettingsSectionId;
  onSelect: (id: SettingsSectionId) => void;
}

export function SettingsNav({ active, onSelect }: SettingsNavProps) {
  return (
    <>
      {/* Desktop: vertical sidebar */}
      <nav className="hidden w-60 shrink-0 flex-col gap-1 border-r border-border/40 bg-muted/20 p-3 md:flex overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          Configurações do App
        </p>
        <div className="space-y-0.5">
          {SETTINGS_NAV_ITEMS.map(({ id, label, icon: Icon }) => (
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

      {/* Mobile: horizontal scroll bar */}
      <nav className="order-last flex shrink-0 border-t border-border/40 bg-background/95 backdrop-blur-xs overflow-x-auto p-1.5 pb-safe md:hidden no-scrollbar">
        <div className="flex gap-1 min-w-full">
          {SETTINGS_NAV_ITEMS.map(({ id, mobileLabel, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={cn(
                'flex flex-1 min-w-[64px] flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] transition-all',
                active === id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="size-4" />
              <span className="truncate">{mobileLabel}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}


