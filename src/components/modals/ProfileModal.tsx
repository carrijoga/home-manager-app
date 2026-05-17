import { useEffect, useState } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';

import { ProfileNav, type ProfileSectionId } from '@/components/profile/ProfileNav';
import { ProfileNotificationsPanel } from '@/components/profile/ProfileNotificationsPanel';
import { ProfileOverviewPanel } from '@/components/profile/ProfileOverviewPanel';
import { ContaPanel } from '@/components/settings/panels/ContaPanel';
import { SegurancaPanel } from '@/components/settings/panels/SegurancaPanel';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PanelContent({ section }: { section: ProfileSectionId }) {
  switch (section) {
    case 'perfil': return <ProfileOverviewPanel />;
    case 'conta': return <ContaPanel />;
    case 'seguranca': return <SegurancaPanel />;
    case 'notificacoes': return <ProfileNotificationsPanel />;
  }
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const [activeSection, setActiveSection] = useState<ProfileSectionId>('perfil');

  useEffect(() => {
    if (open) setActiveSection('perfil');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        flex flex-col p-0 gap-0 overflow-hidden
        inset-0 translate-x-0 translate-y-0 rounded-none h-dvh w-full max-w-full
        md:inset-auto md:left-[50%] md:top-[50%] md:translate-x-[-50%] md:translate-y-[-50%]
        md:rounded-lg md:max-w-5xl md:h-[85vh] md:flex-row
      ">
        <VisuallyHidden.Root>
          <DialogTitle>Perfil</DialogTitle>
        </VisuallyHidden.Root>

        {/* Mobile header — hidden on desktop (desktop uses sidebar with no header) */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b shrink-0">
          <span className="font-semibold text-base">Perfil</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="size-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </div>

        {/* Desktop sidebar + content */}
        <ProfileNav active={activeSection} onSelect={setActiveSection} onClose={() => onOpenChange(false)} />
        <main className="flex-1 overflow-y-auto p-6 pb-safe">
          <PanelContent section={activeSection} />
        </main>
      </DialogContent>
    </Dialog>
  );
}