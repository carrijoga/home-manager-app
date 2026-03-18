import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui';
import { SettingsNav, type SectionId } from '@/components/settings/SettingsNav';
import { GeralPanel } from '@/components/settings/panels/GeralPanel';
import { ContaPanel } from '@/components/settings/panels/ContaPanel';
import { SegurancaPanel } from '@/components/settings/panels/SegurancaPanel';
import { AparenciaPanel } from '@/components/settings/panels/AparenciaPanel';
import { DadosPrivacidadePanel } from '@/components/settings/panels/DadosPrivacidadePanel';
import { SobrePanel } from '@/components/settings/panels/SobrePanel';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PanelContent({ section }: { section: SectionId }) {
  switch (section) {
    case 'geral': return <GeralPanel />;
    case 'conta': return <ContaPanel />;
    case 'seguranca': return <SegurancaPanel />;
    case 'aparencia': return <AparenciaPanel />;
    case 'dados-privacidade': return <DadosPrivacidadePanel />;
    case 'sobre': return <SobrePanel />;
  }
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('geral');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col md:flex-row p-0 gap-0 overflow-hidden">
        <SettingsNav active={activeSection} onSelect={setActiveSection} />
        <main className="flex-1 overflow-y-auto p-6">
          <PanelContent section={activeSection} />
        </main>
      </DialogContent>
    </Dialog>
  );
}
