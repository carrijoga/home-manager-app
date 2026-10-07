import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  CreditCard,
  History,
  Home,
  LayoutPanelTop,
  LogOut,
  Menu,
  Moon,
  RefreshCw,
  Settings,
  ShoppingCart,
  Sun,
  TrendingUp,
  User as UserIcon,
  Wallet,
  X,
} from 'lucide-react';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { RoleBadge } from '@/components/common/RoleBadge';
import { NestManagerModal } from '@/components/modals/NestManagerModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { NotificationCenterSheet } from '@/components/modules/notifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';
import { getIconComponent } from '@/lib/nestIcons';
import { cn } from '@/lib/utils';
import * as authService from '@/services/authService';

interface BottomNavItem {
  id: string;
  label: string;
  path?: string;
  icon: typeof Home;
  isMore?: boolean;
}

/**
 * Disposição invertida da barra mobile:
 * 1. Compras
 * 2. Tarefas
 * 3. Início (Home) — destaque central elevado
 * 4. Finanças
 * 5. Mais
 */
const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { id: 'shopping', label: 'Compras', path: '/shopping', icon: ShoppingCart },
  { id: 'tasks', label: 'Tarefas', path: '/tasks', icon: CheckSquare },
  { id: 'dashboard', label: 'Início', path: '/dashboard', icon: Home },
  { id: 'financial', label: 'Finanças', path: '/financial', icon: Wallet },
  { id: 'more', label: 'Mais', icon: Menu, isMore: true },
];

/**
 * MobileBottomNav — Barra de navegação inferior exclusiva para mobile.
 *
 * Melhorias de UX:
 * - Fundo com backdrop blur intenso (backdrop-blur-3xl + bloqueio de ponteiro) cobrindo toda a base.
 * - Botão de Início (Home) centralizado com destaque flutuante.
 * - Scroll inteligente no menu "Mais": rola apenas se o conteúdo não couber na tela.
 * - Categorias alinhadas ("Principal", "Gestão Financeira", "Configurações").
 */
export const MobileBottomNav: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activeNestId, clearUser } = useApp();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { notifications, isCenterOpen, openCenter, closeCenter } = useNotifications();

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [nestManagerOpen, setNestManagerOpen] = useState(false);
  const [nestManagerMode, setNestManagerMode] = useState<'list' | 'create' | 'join_code'>('list');
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Trava a rolagem da página quando o menu "Mais" estiver aberto
  useEffect(() => {
    if (moreMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [moreMenuOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const nests = user?.nests ?? [];
  const activeNest =
    nests.find((n) => n.nestId === activeNestId) ??
    nests.find((n) => n.isDefault) ??
    nests[0] ??
    null;

  const ActiveNestIcon = activeNest ? getIconComponent(activeNest.icon) : null;

  const isCurrentPath = (path?: string) => {
    if (!path) return false;
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMoreMenuOpen(false);
  };

  const handleLogout = async () => {
    setMoreMenuOpen(false);
    await authService.logout();
    clearUser();
    navigate('/login');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <>
      {/* ── Bloqueador invisível de cliques atrás do dock (sem visual) ── */}
      <div
        className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 h-24 md:hidden"
        aria-hidden="true"
      />

      {/* ── Dock Flutuante Arredondado (Mobile Bottom Nav) ── */}
      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-4 pb-safe md:hidden">
        <nav
          aria-label="Navegação móvel"
          className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-1 rounded-full border border-border/40 bg-card/85 p-1.5 shadow-2xl backdrop-blur-2xl dark:border-border/60 dark:bg-card/90"
        >
          {BOTTOM_NAV_ITEMS.map((item) => {
            const active = item.isMore ? moreMenuOpen : isCurrentPath(item.path);
            const Icon = item.icon;
            const isCenterHome = item.id === 'dashboard';

            if (isCenterHome) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.path && handleNavigate(item.path)}
                  className="relative -mt-4 flex shrink-0 flex-col items-center justify-center px-1 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                >
                  <div
                    className={cn(
                      'flex size-12 items-center justify-center rounded-full border-2 border-background shadow-md transition-all duration-200',
                      active
                        ? 'scale-105 bg-primary text-primary-foreground shadow-primary/30'
                        : 'bg-primary/90 text-primary-foreground shadow-primary/20 hover:bg-primary'
                    )}
                  >
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                  <span className="pt-1 text-[10px] font-bold leading-none tracking-tight text-foreground">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.isMore) {
                    setMoreMenuOpen(true);
                  } else if (item.path) {
                    handleNavigate(item.path);
                  }
                }}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center rounded-full px-1 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'font-semibold text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeMobileTab"
                    className="shadow-xs absolute inset-0 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center gap-0.5">
                  <Icon size={19} strokeWidth={active ? 2.2 : 1.75} />
                  <span className="text-[10px] leading-none tracking-tight">{item.label}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Menu Fullscreen "Mais" */}
      <AnimatePresence>
        {moreMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="bg-background/98 fixed inset-0 z-50 flex touch-none flex-col overflow-hidden backdrop-blur-2xl md:hidden"
          >
            {/* Header do Menu Fullscreen */}
            <div className="pt-safe flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="shadow-2xs size-10 shrink-0 border border-border/60">
                  <AvatarImage src={user?.avatar} alt={user?.name || 'Perfil'} />
                  <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold text-foreground">
                    {user?.name || 'Usuário'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMoreMenuOpen(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Fechar menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo do menu: Rola somente se não couber na tela */}
            <div className="max-h-full flex-1 touch-auto space-y-5 overflow-y-auto px-5 py-4 pb-8">
              {/* Seção: Ninho Ativo */}
              <div className="shadow-2xs space-y-2.5 rounded-2xl border border-border/60 bg-card p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ninho Atual
                  </span>
                  {activeNest && <RoleBadge role={activeNest.role} />}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      {ActiveNestIcon ? (
                        <ActiveNestIcon className="size-5" />
                      ) : (
                        <Home className="size-5" />
                      )}
                    </div>
                    <span className="truncate text-base font-bold text-foreground">
                      {activeNest?.name || 'Meu Ninho'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNestManagerMode('list');
                      setNestManagerOpen(true);
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-xl bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    Trocar
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Seção 1: Principal */}
              <div className="space-y-1">
                <span className="block px-1 pb-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Principal
                </span>

                <MenuItem
                  icon={CalendarDays}
                  label={t('nav.calendar')}
                  active={isCurrentPath('/calendar')}
                  onClick={() => handleNavigate('/calendar')}
                />

                <MenuItem
                  icon={LayoutPanelTop}
                  label={t('nav.categories')}
                  active={isCurrentPath('/settings/categories')}
                  onClick={() => handleNavigate('/settings/categories')}
                />
              </div>

              {/* Seção 2: Gestão Financeira */}
              <div className="space-y-1">
                <span className="block px-1 pb-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Gestão Financeira
                </span>

                <MenuItem
                  icon={TrendingUp}
                  label={t('nav.financialGoals')}
                  active={isCurrentPath('/financial/goals')}
                  onClick={() => handleNavigate('/financial/goals')}
                />
                <MenuItem
                  icon={RefreshCw}
                  label={t('nav.financialRecurrences')}
                  active={isCurrentPath('/financial/recurrences')}
                  onClick={() => handleNavigate('/financial/recurrences')}
                />
                <MenuItem
                  icon={UserIcon}
                  label={t('nav.financialAccounts')}
                  active={isCurrentPath('/financial/account')}
                  onClick={() => handleNavigate('/financial/account')}
                />
                <MenuItem
                  icon={CreditCard}
                  label={t('nav.financialCards')}
                  active={isCurrentPath('/financial/card')}
                  onClick={() => handleNavigate('/financial/card')}
                />
              </div>

              {/* Seção 3: Configurações */}
              <div className="space-y-1">
                <span className="block px-1 pb-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Configurações
                </span>

                <MenuItem
                  icon={Bell}
                  label="Central de Notificações"
                  badge={unreadCount > 0 ? String(unreadCount) : undefined}
                  onClick={() => {
                    setMoreMenuOpen(false);
                    openCenter();
                  }}
                />

                <MenuItem
                  icon={History}
                  label="Novidades & Atualizações"
                  active={isCurrentPath('/changelog')}
                  onClick={() => handleNavigate('/changelog')}
                />

                <MenuItem
                  icon={UserIcon}
                  label="Meu Perfil"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setProfileOpen(true);
                  }}
                />

                <MenuItem
                  icon={Settings}
                  label="Configurações Gerais"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setSettingsOpen(true);
                  }}
                />

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    {isDark ? (
                      <Sun size={18} className="text-amber-400" />
                    ) : (
                      <Moon size={18} className="text-indigo-400" />
                    )}
                    <span>Modo {isDark ? 'Claro' : 'Escuro'}</span>
                  </div>
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    {isDark ? 'Escuro' : 'Claro'}
                  </span>
                </button>
              </div>

              {/* Seção 4: Sair da conta */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-bold text-destructive transition-colors hover:bg-destructive/20 active:scale-[0.98]"
                >
                  <LogOut size={18} />
                  Sair da Conta
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modais acionados pelo menu Mais */}
      <NestManagerModal
        open={nestManagerOpen}
        initialMode={nestManagerMode}
        onClose={() => setNestManagerOpen(false)}
        onOpenChange={setNestManagerOpen}
      />
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <NotificationCenterSheet
        open={isCenterOpen}
        onOpenChange={(o) => (o ? openCenter() : closeCenter())}
      />
    </>
  );
};

function MenuItem({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  active?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors active:scale-[0.99]',
        active
          ? 'bg-primary/15 font-bold text-primary'
          : 'font-medium text-foreground hover:bg-muted/60'
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Icon
          size={18}
          className={cn('shrink-0', active ? 'text-primary' : 'text-muted-foreground')}
        />
        <span className="truncate">{label}</span>
      </div>

      {badge ? (
        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {badge}
        </span>
      ) : (
        <ChevronRight size={16} className="shrink-0 text-muted-foreground/40" />
      )}
    </button>
  );
}

export default MobileBottomNav;
