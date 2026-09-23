import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ProfileNotificationsPanel } from '@/components/profile/ProfileNotificationsPanel';
import { AparenciaPanel } from '@/components/settings/panels/AparenciaPanel';
import { DadosPrivacidadePanel } from '@/components/settings/panels/DadosPrivacidadePanel';
import { GeralPanel } from '@/components/settings/panels/GeralPanel';
import { LocalizacaoClimaPanel } from '@/components/settings/panels/LocalizacaoClimaPanel';
import { SobrePanel } from '@/components/settings/panels/SobrePanel';
import { SettingsNav,type SettingsSectionId } from '@/components/settings/SettingsNav';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSection?: SettingsSectionId;
}

const SECTION_HEADER_META: Record<SettingsSectionId, { title: string; description: string }> = {
  notificacoes: {
    title: 'Preferências de Alertas',
    description: 'Configure os tipos de notificações e avisos do sistema',
  },
  aparencia: {
    title: 'Aparência & Tema',
    description: 'Personalize o tema e estilo visual da plataforma',
  },
  geral: {
    title: 'Configurações Gerais',
    description: 'Ajuste o idioma e preferências gerais do aplicativo',
  },
  'localizacao-clima': {
    title: 'Localização & Clima',
    description: 'Configure a origem dos dados meteorológicos e geolocalização',
  },
  'dados-privacidade': {
    title: 'Dados & Privacidade',
    description: 'Gerencie opções de compartilhamento, exportação e dados salvos',
  },
  sobre: {
    title: 'Sobre o Ninho',
    description: 'Informações sobre a versão do app, documentos legais e suporte',
  },
};

function PanelContent({ section }: { section: SettingsSectionId }) {
  switch (section) {
    case 'notificacoes':
      return <ProfileNotificationsPanel />;
    case 'aparencia':
      return <AparenciaPanel />;
    case 'geral':
      return <GeralPanel />;
    case 'localizacao-clima':
      return <LocalizacaoClimaPanel />;
    case 'dados-privacidade':
      return <DadosPrivacidadePanel />;
    case 'sobre':
      return <SobrePanel />;
  }
}

export function SettingsModal({
  open,
  onOpenChange,
  initialSection = 'notificacoes',
}: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(initialSection);

  useEffect(() => {
    if (open) {
      setActiveSection(initialSection);
    }
  }, [open, initialSection]);

  const currentMeta = SECTION_HEADER_META[activeSection];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideBuiltinClose
        className="inset-0 flex h-dvh w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none p-0 md:inset-auto md:left-[50%] md:top-[50%] md:h-[88vh] md:max-w-5xl md:translate-x-[-50%] md:translate-y-[-50%] md:flex-row md:rounded-2xl border-border/60 shadow-2xl"
      >
        <VisuallyHidden.Root>
          <DialogTitle>Configurações do Aplicativo</DialogTitle>
        </VisuallyHidden.Root>

        {/* Mobile header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-4 py-3 md:hidden">
          <span className="text-base font-semibold text-foreground">Configurações</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
          >
            <X className="size-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </div>

        {/* Desktop sidebar navigation */}
        <SettingsNav active={activeSection} onSelect={setActiveSection} />

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {/* Desktop Header & Close */}
          <div className="mb-6 hidden items-center justify-between border-b border-border/40 pb-3 md:flex">
            <div>
              <h2 className="text-base font-semibold text-foreground">{currentMeta.title}</h2>
              <p className="text-xs text-muted-foreground">{currentMeta.description}</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              <X className="size-4" />
              <span className="sr-only">Fechar</span>
            </button>
          </div>

          <PanelContent section={activeSection} />
        </main>
      </DialogContent>
    </Dialog>
  );
}


