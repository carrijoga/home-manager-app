import { useState } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';

import { AparenciaPanel } from '@/components/settings/panels/AparenciaPanel';
import { DadosPrivacidadePanel } from '@/components/settings/panels/DadosPrivacidadePanel';
import { GeralPanel } from '@/components/settings/panels/GeralPanel';
import { LocalizacaoClimaPanel } from '@/components/settings/panels/LocalizacaoClimaPanel';
import { SobrePanel } from '@/components/settings/panels/SobrePanel';
import { type SectionId, SettingsNav } from '@/components/settings/SettingsNav';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PanelContent({ section }: { section: SectionId }) {
  switch (section) {
    case 'geral': return <GeralPanel />;
    case 'aparencia': return <AparenciaPanel />;
    case 'localizacao-clima': return <LocalizacaoClimaPanel />;
    case 'dados-privacidade': return <DadosPrivacidadePanel />;
    case 'sobre': return <SobrePanel />;
  }
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('geral');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        flex flex-col p-0 gap-0 overflow-hidden
        inset-0 translate-x-0 translate-y-0 rounded-none h-dvh w-full max-w-full
        md:inset-auto md:left-[50%] md:top-[50%] md:translate-x-[-50%] md:translate-y-[-50%]
        md:rounded-lg md:max-w-4xl md:h-[85vh] md:flex-row
      ">
        <VisuallyHidden.Root>
          <DialogTitle>Configurações</DialogTitle>
        </VisuallyHidden.Root>

        {/* Mobile header */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b shrink-0">
          <span className="font-semibold text-base">Configurações</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="size-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </div>

        <SettingsNav active={activeSection} onSelect={setActiveSection} />
        <main className="flex-1 overflow-y-auto p-6 pb-safe">
          <PanelContent section={activeSection} />
        </main>
      </DialogContent>
    </Dialog>
  );
}
