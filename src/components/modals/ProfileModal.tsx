import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ProfileNav, type ProfileSectionId } from '@/components/profile/ProfileNav';
import { ProfileOverviewPanel } from '@/components/profile/ProfileOverviewPanel';
import { ContaPanel } from '@/components/settings/panels/ContaPanel';
import { SegurancaPanel } from '@/components/settings/panels/SegurancaPanel';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SECTION_HEADER_META: Record<ProfileSectionId, { title: string; description: string }> = {
  perfil: {
    title: 'Visão Geral do Perfil',
    description: 'Resumo da sua conta, apelido e dados de acesso no Ninho',
  },
  conta: {
    title: 'Dados da Conta & Avatar',
    description: 'Gerencie suas informações pessoais, e-mail e avatar exclusivo',
  },
  seguranca: {
    title: 'Segurança & Senha',
    description: 'Gerencie sua senha de acesso e sessões ativas no aplicativo',
  },
};

function PanelContent({ section }: { section: ProfileSectionId }) {
  switch (section) {
    case 'perfil':
      return <ProfileOverviewPanel />;
    case 'conta':
      return <ContaPanel />;
    case 'seguranca':
      return <SegurancaPanel />;
  }
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const [activeSection, setActiveSection] = useState<ProfileSectionId>('perfil');

  useEffect(() => {
    if (open) setActiveSection('perfil');
  }, [open]);

  const currentMeta = SECTION_HEADER_META[activeSection];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideBuiltinClose
        className="inset-0 flex h-dvh w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none p-0 md:inset-auto md:left-[50%] md:top-[50%] md:h-[88vh] md:max-w-5xl md:translate-x-[-50%] md:translate-y-[-50%] md:flex-row md:rounded-2xl border-border/60 shadow-2xl"
      >
        <VisuallyHidden.Root>
          <DialogTitle>Meu Perfil</DialogTitle>
        </VisuallyHidden.Root>

        {/* Mobile header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-4 py-3 md:hidden">
          <span className="text-base font-semibold text-foreground">Meu Perfil</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
          >
            <X className="size-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </div>

        {/* Desktop sidebar */}
        <ProfileNav active={activeSection} onSelect={setActiveSection} />

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {/* Desktop Close & Header */}
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


