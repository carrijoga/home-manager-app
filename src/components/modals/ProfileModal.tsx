import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui';
import { ProfileNav, type ProfileSectionId } from '@/components/profile/ProfileNav';
import { ProfileOverviewPanel } from '@/components/profile/ProfileOverviewPanel';
import { ContaPanel } from '@/components/settings/panels/ContaPanel';
import { ProfileNotificationsPanel } from '@/components/profile/ProfileNotificationsPanel';
import { SegurancaPanel } from '@/components/settings/panels/SegurancaPanel';

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
    if (open) {
      setActiveSection('perfil');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[92vh] sm:h-[85vh] flex flex-col md:flex-row p-0 gap-0 overflow-hidden">
        <ProfileNav active={activeSection} onSelect={setActiveSection} />
        <main className="flex-1 overflow-y-auto p-6">
          <PanelContent section={activeSection} />
        </main>
      </DialogContent>
    </Dialog>
  );
}