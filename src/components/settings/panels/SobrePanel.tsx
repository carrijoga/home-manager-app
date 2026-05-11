import { ExternalLink, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui';

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0.0';

export function SobrePanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Sobre o Ninho</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Informações sobre o aplicativo e documentos legais.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-sm font-medium">Versão</p>
          <p className="text-sm text-muted-foreground">{APP_VERSION}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Documentos legais</h3>
          <div className="flex flex-col gap-2">
            <a
              href="/termos-de-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Termos de Uso
            </a>
            <a
              href="/politica-de-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Política de Privacidade
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Feedback</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('mailto:contato@ninho.app', '_blank')}
            className="flex items-center gap-2"
          >
            <MessageSquare className="size-4" />
            Enviar feedback
          </Button>
        </div>
      </div>
    </div>
  );
}
