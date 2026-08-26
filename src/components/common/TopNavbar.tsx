import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GlobalSearchModal } from '@/components/modals/GlobalSearchModal';
import { NestManagerModal } from '@/components/modals/NestManagerModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import * as authService from '@/services/authService';

import type { Notification } from './NotificationsMenu';
import NotificationsMenu from './NotificationsMenu';
import ProfileMenu from './ProfileMenu';

interface SearchBarProps {
  className?: string;
  onClick?: () => void;
}

function NavSearchBar({ className, onClick }: SearchBarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex h-10 w-[220px] max-w-full items-center justify-between rounded-full border border-border bg-card px-4 text-sm text-muted-foreground shadow-none transition-all duration-200 hover:border-primary/50 hover:bg-accent/40 sm:w-[416px]',
        className
      )}

    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <Search
          size={16}
          className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
        />
        <span className="truncate text-sm font-normal text-muted-foreground group-hover:text-foreground">
          Buscar no Ninho…
        </span>
      </div>

      <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-xs sm:flex">
        ⌘K
      </kbd>
    </button>
  );
}

const TYPE_MAP: Record<number, Notification['type']> = {
  0: 'notice',
  1: 'notice',
  2: 'reminder',
  3: 'task',
};

/**
 * TopNavbar — barra de navegação superior fixa.
 *
 * Contém: SidebarTrigger (mobile) | SearchBar (⌘K) | Sino de notificações | Menu do usuário
 * Fundo: color-mix(background 80%) + backdrop-blur para sensação de profundidade
 */
export function TopNavbar({ className }: { className?: string }) {
  const { user, notifications, markAllAsRead, clearUser } = useApp();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nestManagerOpen, setNestManagerOpen] = useState(false);

  // Atalho global Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!user) return null;

  const menuNotifications: Notification[] = notifications.map((n) => ({
    id: n.notificationId,
    type: TYPE_MAP[n.type] ?? 'notice',
    title: n.title,
    message: n.message,
    timestamp: new Date(),
    read: n.isRead,
  }));

  const handleLogout = async () => {
    await authService.logout();
    clearUser();
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex w-full items-center justify-between px-4 py-3 sm:px-6 md:px-12',
        'border-b border-border',
        'text-foreground',
        className
      )}
      style={{
        background: 'color-mix(in srgb, var(--background) 80%, transparent)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Esquerda: trigger da sidebar + search */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <NavSearchBar onClick={() => setSearchOpen(true)} className="hidden sm:flex" />
      </div>

      {/* Direita: busca mobile + sino + perfil */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Botão de Busca Mobile */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden"
          aria-label="Buscar no Ninho"
        >
          <Search size={18} />
        </button>

        <NotificationsMenu notifications={menuNotifications} onMarkAllAsRead={markAllAsRead} />
        <ProfileMenu
          user={user}
          currentTheme={theme}
          onThemeChange={setTheme}
          onProfileClick={() => setProfileOpen(true)}
          onSettingsClick={() => setSettingsOpen(true)}
          onLogoutClick={handleLogout}
        />

        {/* Modais Globais */}
        <GlobalSearchModal
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenNestManager={() => setNestManagerOpen(true)}
        />
        <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        <NestManagerModal
          open={nestManagerOpen}
          onClose={() => setNestManagerOpen(false)}
          onOpenChange={setNestManagerOpen}
        />
      </div>
    </header>
  );
}

export default TopNavbar;
