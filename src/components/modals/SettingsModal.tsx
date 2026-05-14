import { useState } from 'react';

import { AparenciaPanel } from '@/components/settings/panels/AparenciaPanel';
import { DadosPrivacidadePanel } from '@/components/settings/panels/DadosPrivacidadePanel';
import { GeralPanel } from '@/components/settings/panels/GeralPanel';
import { LocalizacaoClimaPanel } from '@/components/settings/panels/LocalizacaoClimaPanel';
import { SobrePanel } from '@/components/settings/panels/SobrePanel';
import { type SectionId,SettingsNav } from '@/components/settings/SettingsNav';
import { Dialog, DialogContent } from '@/components/ui';

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
      <DialogContent className="max-w-4xl h-[92vh] sm:h-[85vh] flex flex-col md:flex-row p-0 gap-0 overflow-hidden">
        <SettingsNav active={activeSection} onSelect={setActiveSection} />
        <main className="flex-1 overflow-y-auto p-6">
          <PanelContent section={activeSection} />
        </main>
      </DialogContent>
    </Dialog>
  );
}
