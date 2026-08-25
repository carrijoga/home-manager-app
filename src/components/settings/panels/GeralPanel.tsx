import { toast } from 'sonner';

import {
  Badge,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';

const LANGUAGES = [
  { value: 'pt-BR', label: 'Português (BR)', available: true },
  { value: 'en', label: 'English', available: false },
  { value: 'es', label: 'Español', available: false },
];

export function GeralPanel() {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'América/São Paulo';

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="rounded-3xl border border-border/50 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--secondary)_8%,var(--card))_100%)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
          Preferências Gerais
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Configurações Gerais</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie o idioma principal e o comportamento regional do Ninho.
        </p>
      </div>

      {/* Language Section Card */}
      <section className="space-y-4 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Idioma da Interface</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Defina o idioma principal utilizado nos textos e navegação do Ninho.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="language-select"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Idioma
          </Label>
          <Select defaultValue="pt-BR" onValueChange={() => toast.success('Idioma atualizado!')}>
            <SelectTrigger
              id="language-select"
              className="w-full sm:w-72 bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(({ value, label, available }) => (
                <SelectItem key={value} value={value} disabled={!available}>
                  <span className="flex items-center gap-2">
                    {label}
                    {!available && (
                      <Badge variant="secondary" className="text-[10px] rounded-md">
                        Em breve
                      </Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Timezone Section Card */}
      <section className="space-y-3 rounded-2xl border border-border/50 bg-card/60 p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Fuso Horário & Região</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Sincronizado automaticamente com as configurações do seu dispositivo.
            </p>
          </div>
          <Badge variant="secondary" className="rounded-md text-[10px]">
            Automático
          </Badge>
        </div>
        <div className="rounded-xl border border-border/40 bg-muted/20 p-3 text-xs text-muted-foreground">
          Fuso Horário Detectado:{' '}
          <span className="font-semibold text-foreground">{userTimeZone}</span>
        </div>
      </section>
    </div>
  );
}

