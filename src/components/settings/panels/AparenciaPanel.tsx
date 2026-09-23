import { Monitor, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { cn } from '@/lib/utils';

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Claro', description: 'Tema com fundo claro e alto contraste', icon: Sun },
  { value: 'dark' as const, label: 'Escuro', description: 'Ideal para ambientes com pouca luz', icon: Moon },
  { value: 'system' as const, label: 'Sistema', description: 'Acompanha o tema do seu sistema operacional', icon: Monitor },
];

export function AparenciaPanel() {
  const { theme, setTheme } = useTheme();
  const { enableSound, disableSound, isSoundEnabled } = useToastNotifications();
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setSoundEnabled(isSoundEnabled());
  }, [isSoundEnabled]);

  const handleToggleSound = () => {
    if (soundEnabled) {
      disableSound();
      setSoundEnabled(false);
    } else {
      enableSound();
      setSoundEnabled(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="rounded-3xl border border-border/50 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--secondary)_8%,var(--card))_100%)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
          Preferências Visuais
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Aparência & Tema</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize as cores, o modo escuro e as preferências visuais do aplicativo.
        </p>
      </div>

      {/* Theme Cards */}
      <section className="space-y-4 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Modo de Exibição</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Escolha como o Ninho é exibido no seu dispositivo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => {
            const isActive = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200',
                  isActive
                    ? 'border-primary bg-primary/10 text-primary shadow-xs font-medium'
                    : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={cn(
                      'flex size-8 items-center justify-center rounded-lg border',
                      isActive ? 'border-primary/40 bg-primary/20' : 'border-border/60 bg-card'
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  {isActive && (
                    <span className="flex size-2 rounded-full bg-primary" title="Ativo" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                    {description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sound Effects Section Card */}
      <section className="space-y-3 rounded-2xl border border-border/50 bg-card/60 p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Sons de Notificação</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Sinais sonoros ao receber alertas ou concluir tarefas no aplicativo.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleSound}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors',
              soundEnabled
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60'
            )}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="size-4 text-primary" />
                <span>Ativado</span>
              </>
            ) : (
              <>
                <VolumeX className="size-4" />
                <span>Desativado</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Custom Theme Preview Card */}
      <section className="space-y-3 rounded-2xl border border-border/50 bg-card/60 p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Paleta Customizada</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Crie combinações de cores exclusivas para seu ninho familiar.
            </p>
          </div>
          <Badge variant="secondary" className="rounded-md text-[10px]">
            Em breve
          </Badge>
        </div>
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Temas personalizados e esquemas de cores sob medida estão sendo desenvolvidos.
          </p>
        </div>
      </section>
    </div>
  );
}

