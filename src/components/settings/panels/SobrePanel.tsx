import { ExternalLink, Heart, MessageSquare, ShieldCheck } from 'lucide-react';

import { Badge, Button } from '@/components/ui';

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0.0';

export function SobrePanel() {
  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="rounded-3xl border border-border/50 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--secondary)_8%,var(--card))_100%)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
          Sobre a Plataforma
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Sobre o Ninho</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Informações da versão, suporte, termos de uso e política de privacidade.
        </p>
      </div>

      {/* App Information Card */}
      <section className="space-y-4 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta-500 to-honey-400 text-2xl shadow-xs">
            🪺
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">Ninho</h3>
              <Badge variant="secondary" className="rounded-md text-[10px]">
                v{APP_VERSION}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Seu lar, organizado. Gestão familiar completa de tarefas, compras e finanças.
            </p>
          </div>
        </div>
      </section>

      {/* Legal Documents Section Card */}
      <section className="space-y-3 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Documentos Legais</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Consulte as diretrizes legais e termos de serviço da plataforma.
          </p>
        </div>

        <div className="grid gap-2 pt-1 sm:grid-cols-2">
          <a
            href="/termos-de-uso"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-muted/20 p-3 text-xs font-medium text-foreground transition-colors hover:bg-accent/60 hover:text-primary"
          >
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <span className="flex-1">Termos de Uso</span>
            <ExternalLink className="size-3.5 text-muted-foreground" />
          </a>
          <a
            href="/politica-de-privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-muted/20 p-3 text-xs font-medium text-foreground transition-colors hover:bg-accent/60 hover:text-primary"
          >
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <span className="flex-1">Política de Privacidade</span>
            <ExternalLink className="size-3.5 text-muted-foreground" />
          </a>
        </div>
      </section>

      {/* Support & Feedback Section Card */}
      <section className="space-y-3 rounded-2xl border border-border/50 bg-card/60 p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Canal de Atendimento & Feedback</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Sua opinião ajuda a melhorar a experiência para toda a família.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('mailto:contato@ninho.app', '_blank')}
            className="gap-2 rounded-xl border-border/50"
          >
            <MessageSquare className="size-4 text-primary" />
            <span>Enviar Feedback</span>
          </Button>
        </div>
      </section>

      {/* Footer credit */}
      <div className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground pt-2">
        <span>Desenvolvido com</span>
        <Heart className="size-3.5 text-rose-500 fill-rose-500" />
        <span>para organizar lares em todo o Brasil.</span>
      </div>
    </div>
  );
}

