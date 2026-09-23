import { ChevronRight, Moon, Search, Sun } from 'lucide-react';
import { Fragment, lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { TourHelpButton } from '@/components/onboarding';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n';
import { cn } from '@/lib/utils';

import NotificationsMenu from './NotificationsMenu';

// Lazy loading dos modais sob demanda para reduzir o bundle inicial
const GlobalSearchModal = lazy(() =>
  import('@/components/modals/GlobalSearchModal').then((m) => ({ default: m.GlobalSearchModal }))
);
const ProfileModal = lazy(() =>
  import('@/components/modals/ProfileModal').then((m) => ({ default: m.ProfileModal }))
);
const SettingsModal = lazy(() =>
  import('@/components/modals/SettingsModal').then((m) => ({ default: m.SettingsModal }))
);
const NestManagerModal = lazy(() =>
  import('@/components/modals/NestManagerModal').then((m) => ({ default: m.NestManagerModal }))
);
const NotificationCenterSheet = lazy(() =>
  import('@/components/modules/notifications').then((m) => ({ default: m.NotificationCenterSheet }))
);

interface BreadcrumbItem {
  label: string;
  path?: string;
}

function getBreadcrumbs(
  pathname: string,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
): BreadcrumbItem[] {
  if (pathname === '/' || pathname === '/dashboard') {
    return [{ label: t('nav.dashboard') }];
  }
  if (pathname.startsWith('/notifications')) {
    return [{ label: 'Central de Notificações' }];
  }
  if (pathname.startsWith('/tasks')) {
    return [{ label: t('nav.tasks') }];
  }
  if (pathname.startsWith('/shopping')) {
    return [{ label: t('nav.shopping') }];
  }
  if (pathname.startsWith('/calendar')) {
    return [{ label: t('nav.calendar') }];
  }
  if (pathname.startsWith('/financial')) {
    const sub = pathname.replace('/financial', '');
    if (!sub || sub === '/') {
      return [{ label: t('nav.financial'), path: '/financial' }, { label: t('nav.financialTransactions') }];
    }
    if (sub.startsWith('/goals')) {
      return [{ label: t('nav.financial'), path: '/financial' }, { label: t('nav.financialGoals') }];
    }
    if (sub.startsWith('/recurrences')) {
      return [{ label: t('nav.financial'), path: '/financial' }, { label: t('nav.financialRecurrences') }];
    }
    if (sub.startsWith('/account')) {
      return [{ label: t('nav.financial'), path: '/financial' }, { label: t('nav.financialAccounts') }];
    }
    if (sub.startsWith('/card')) {
      return [{ label: t('nav.financial'), path: '/financial' }, { label: t('nav.financialCards') }];
    }
    return [{ label: t('nav.financial') }];
  }
  return [{ label: t('nav.overview') }];
}

function NavSearchBar({ onClick, className }: { onClick?: () => void; className?: string }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex h-9 w-[220px] sm:w-[280px] md:w-[340px] items-center justify-between rounded-xl border border-border/60 bg-muted/25 px-3 text-xs text-muted-foreground transition-all duration-150 hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      aria-label={t('nav.searchInNestAria')}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Search
          size={14}
          className="shrink-0 text-muted-foreground/70 transition-colors group-hover:text-primary"
        />
        <span className="truncate text-xs text-muted-foreground/80 group-hover:text-foreground">
          {t('nav.searchInNest')}
        </span>
      </div>

      <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-border/60 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-2xs group-hover:border-border sm:inline-flex">
        ⌘K
      </kbd>
    </button>
  );
}

function NavbarThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const themeLabel = isDark ? t('common.dark') : t('common.light');
  const toggleAria = t('nav.themeToggleTo', { theme: themeLabel });

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background/60 text-muted-foreground transition-all hover:bg-accent/60 hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={toggleAria}
      title={toggleAria}
    >
      {isDark ? (
        <Sun size={17} className="text-primary transition-transform hover:rotate-45 duration-300" />
      ) : (
        <Moon size={17} className="text-primary transition-transform hover:-rotate-12 duration-300" />
      )}
    </button>
  );
}

/**
 * TopNavbar — Barra de navegação superior refinada e despoluída.
 *
 * Remove redundâncias com a AppSidebar (perfil duplicado, botões duplicados).
 * Contém:
 * - Esquerda: SidebarTrigger + Separador + Breadcrumb da rota atual
 * - Centro: Busca Global unificada (⌘K)
 * - Direita: Busca mobile + Tour/Guia + Notificações + Toggle de Tema rápido
 */
export function TopNavbar({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { user } = useApp();
  const {
    notifications,
    isCenterOpen,
    openCenter,
    closeCenter,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useNotifications();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nestManagerOpen, setNestManagerOpen] = useState(false);

  const breadcrumbs = getBreadcrumbs(location.pathname, t);

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

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md transition-colors duration-200 sm:px-6',
        className
      )}
    >
      {/* ── ESQUERDA: TRIGGER + BREADCRUMBS ── */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <SidebarTrigger className="-ml-1 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground" />
        <div className="hidden h-4 w-px bg-border/60 sm:block" aria-hidden="true" />

        <nav aria-label={t('nav.structuralNavAria')} className="hidden sm:flex items-center gap-1.5 text-xs font-medium min-w-0">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <Fragment key={crumb.label}>
                {idx > 0 && (
                  <ChevronRight size={13} className="shrink-0 text-muted-foreground/40" />
                )}
                {crumb.path && !isLast ? (
                  <Link
                    to={crumb.path}
                    className="truncate text-muted-foreground/70 transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'truncate',
                      isLast ? 'font-semibold text-foreground' : 'text-muted-foreground/70'
                    )}
                  >
                    {crumb.label}
                  </span>
                )}
              </Fragment>
            );
          })}
        </nav>
      </div>

      {/* ── CENTRO: BUSCA GLOBAL (DESKTOP) ── */}
      <div className="hidden md:flex flex-1 justify-center px-4 max-w-md mx-auto">
        <NavSearchBar onClick={() => setSearchOpen(true)} className="w-full" />
      </div>

      {/* ── DIREITA: AÇÕES UNIFICADAS ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Busca Mobile */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground active:scale-95 md:hidden"
          aria-label={t('nav.searchInNest')}
          title={t('nav.searchShortcut')}
        >
          <Search size={16} />
        </button>

        {/* Guia / Tour da Tela */}
        <TourHelpButton
          className="rounded-xl border-border/60 bg-background/60 text-muted-foreground hover:bg-accent/60 hover:text-foreground active:scale-95"
        />

        {/* Notificações */}
        <NotificationsMenu
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearNotification={clearNotification}
          onClearAll={clearAllNotifications}
          onOpenCenter={openCenter}
        />

        {/* Toggle de Tema Rápido */}
        <NavbarThemeToggle />

        {/* Modais Globais sob demanda com Suspense */}
        <Suspense fallback={null}>
          {searchOpen && (
            <GlobalSearchModal
              open={searchOpen}
              onOpenChange={setSearchOpen}
              onOpenProfile={() => setProfileOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenNestManager={() => setNestManagerOpen(true)}
            />
          )}
          {profileOpen && <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />}
          {settingsOpen && <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />}
          {nestManagerOpen && (
            <NestManagerModal
              open={nestManagerOpen}
              onClose={() => setNestManagerOpen(false)}
              onOpenChange={setNestManagerOpen}
            />
          )}
          {isCenterOpen && (
            <NotificationCenterSheet
              open={isCenterOpen}
              onOpenChange={(open) => (open ? openCenter() : closeCenter())}
            />
          )}
        </Suspense>
      </div>
    </header>
  );
}

export default TopNavbar;
