import { motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  HelpCircle,
  LogOut,
  MessageSquarePlus,
  Moon,
  Settings,
  Settings2,
  Star,
  Sun,
  User as UserIcon,
  X,
} from 'lucide-react';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AvatarWithPresence, OnlineStatusBadge } from '@/components/common/OnlineStatusBadge';
import { RoleBadge } from '@/components/common/RoleBadge';
import { NestManagerModal } from '@/components/modals/NestManagerModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { CalendarDaysIcon } from '@/components/ui/animated-icons/calendar-days';
import { CartIcon } from '@/components/ui/animated-icons/cart';
import { CheckIcon } from '@/components/ui/animated-icons/check';
import { CreditCardIcon } from '@/components/ui/animated-icons/credit-card';
import {
  DollarSignIcon,
  type DollarSignIconHandle,
} from '@/components/ui/animated-icons/dollar-sign';
import { HomeIcon } from '@/components/ui/animated-icons/home';
import { LayoutPanelTopIcon } from '@/components/ui/animated-icons/layout-panel-top';
import { RefreshCWIcon } from '@/components/ui/animated-icons/refresh-cw';
import { TrendingUpIcon } from '@/components/ui/animated-icons/trending-up';
import { UserIcon as AnimatedUserIcon } from '@/components/ui/animated-icons/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { useApp } from '@/contexts/AppContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n';
import { getIconComponent } from '@/lib/nestIcons';
import { cn } from '@/lib/utils';
import * as authService from '@/services/authService';
import type { AppUser, AppUserNest } from '@/types';

interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type AnimatedIconComponent = React.ForwardRefExoticComponent<
  { size?: number; className?: string } & React.RefAttributes<AnimatedIconHandle>
>;

interface Module {
  id: string;
  name: string;
  icon: AnimatedIconComponent;
  path: string;
}

interface FinancasSubItem {
  id: string;
  name: string;
  icon: AnimatedIconComponent;
  path: string;
}

interface ModuleConfig {
  id: string;
  labelKey: TranslationKey;
  icon: AnimatedIconComponent;
  path: string;
}

const FINANCAS_SUB_CONFIG: ModuleConfig[] = [
  { id: 'financial-lancamentos', labelKey: 'nav.financialTransactions', icon: DollarSignIcon, path: '/financial' },
  { id: 'financial-metas', labelKey: 'nav.financialGoals', icon: TrendingUpIcon, path: '/financial/goals' },
  {
    id: 'financial-recorrencias',
    labelKey: 'nav.financialRecurrences',
    icon: RefreshCWIcon,
    path: '/financial/recurrences',
  },
  { id: 'financial-conta', labelKey: 'nav.financialAccounts', icon: AnimatedUserIcon, path: '/financial/account' },
  { id: 'financial-cartao', labelKey: 'nav.financialCards', icon: CreditCardIcon, path: '/financial/card' },
];

const MAIN_MODULE_CONFIG: ModuleConfig[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: HomeIcon, path: '/dashboard' },
  { id: 'tasks', labelKey: 'nav.tasks', icon: CheckIcon, path: '/tasks' },
  { id: 'shopping', labelKey: 'nav.shopping', icon: CartIcon, path: '/shopping' },
  { id: 'calendar', labelKey: 'nav.calendar', icon: CalendarDaysIcon, path: '/calendar' },
];

const SETTINGS_MODULE_CONFIG: ModuleConfig[] = [
  { id: 'settings-categories', labelKey: 'nav.categories', icon: LayoutPanelTopIcon, path: '/settings/categories' },
];

function getInitials(name?: string | null) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'U';
}

interface NavModuleItemProps {
  module: Module;
  isActive: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  onNavigate: (path: string) => void;
}

function NavModuleItem({
  module,
  isActive,
  isCollapsed,
  isMobile,
  onNavigate,
}: NavModuleItemProps) {
  const Icon = module.icon;
  const iconRef = React.useRef<AnimatedIconHandle>(null);

  return (
    <SidebarMenuItem className={cn(isCollapsed && 'flex justify-center')}>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={module.name}
        onClick={() => onNavigate(module.path)}
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        className={cn(
          'group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98]',
          isMobile ? 'h-11 text-[15px]' : 'h-10 text-sm',
          isCollapsed && '!size-8 !p-0 justify-center gap-0',
          isActive
            ? 'bg-primary/15 font-semibold text-primary shadow-2xs'
            : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
        )}
      >
        <Icon
          ref={iconRef}
          size={18}
          className={cn(
            'shrink-0 transition-colors',
            isActive
              ? 'text-primary'
              : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
          )}
        />
        {!isCollapsed && <span className="truncate">{module.name}</span>}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

interface AppSidebarProps {
  user?: AppUser;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeNestId, setActiveNestId, clearUser } = useApp();
  const { isDark, toggleTheme } = useTheme();
  const { openInitialModal } = useOnboarding();
  const { isMobile, setOpenMobile, state: sidebarState } = useSidebar();

  const [manageNestsOpen, setManageNestsOpen] = React.useState(false);
  const [manageNestsMode, setManageNestsMode] = React.useState<'list' | 'create' | 'join_code'>('list');
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const isCollapsed = sidebarState === 'collapsed';
  const isFinancasActive = location.pathname.startsWith('/financial');
  const [financasOpen, setFinancasOpen] = React.useState(isFinancasActive);

  // Sync Finanças open state with route
  React.useEffect(() => {
    if (isFinancasActive) {
      setFinancasOpen(true);
    }
  }, [isFinancasActive]);

  const mainModules = React.useMemo<Module[]>(
    () =>
      MAIN_MODULE_CONFIG.map((m) => ({
        id: m.id,
        name: t(m.labelKey),
        icon: m.icon,
        path: m.path,
      })),
    [t]
  );

  const financasSubItems = React.useMemo<FinancasSubItem[]>(
    () =>
      FINANCAS_SUB_CONFIG.map((m) => ({
        id: m.id,
        name: t(m.labelKey),
        icon: m.icon,
        path: m.path,
      })),
    [t]
  );

  const settingsModules = React.useMemo<Module[]>(
    () =>
      SETTINGS_MODULE_CONFIG.map((m) => ({
        id: m.id,
        name: t(m.labelKey),
        icon: m.icon,
        path: m.path,
      })),
    [t]
  );

  const nests = user?.nests ?? [];
  const activeNest =
    nests.find((n) => n.nestId === activeNestId) ??
    nests.find((n) => n.isDefault) ??
    nests[0] ??
    null;

  const defaultNestName = t('nav.myNest');
  const activeNestDisplayName = activeNest?.name ?? defaultNestName;
  const ActiveNestIcon = activeNest ? getIconComponent(activeNest.icon) : null;
  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    clearUser();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar select-none">
      <NestManagerModal
        open={manageNestsOpen}
        initialMode={manageNestsMode}
        onClose={() => setManageNestsOpen(false)}
        onOpenChange={setManageNestsOpen}
      />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />

      {/* ── HEADER: INTEGRATED WORKSPACE SWITCHER ── */}
      <SidebarHeader className={cn('p-2.5 pb-2 transition-all', isCollapsed && 'p-2 pt-3 flex flex-col items-center')}>
        {isCollapsed ? (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent text-primary shadow-2xs transition-all hover:border-primary/40 hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring active:scale-95"
                  aria-label={t('nav.nestAria', { name: activeNestDisplayName })}
                  title={t('nav.nestAria', { name: activeNestDisplayName })}
                >
                  {ActiveNestIcon ? (
                    <ActiveNestIcon className="size-4 shrink-0" />
                  ) : activeNest?.name ? (
                    <span className="text-[10px] font-bold font-mono">
                      {activeNest.name.slice(0, 2).toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-sm">🪺</span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <NestDropdownContent
                nests={nests}
                activeNest={activeNest}
                onSelectNest={setActiveNestId}
                onOpenManager={(mode) => {
                  setManageNestsMode(mode);
                  setManageNestsOpen(true);
                }}
                isCollapsed={true}
              />
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group flex flex-1 min-w-0 items-center gap-2.5 rounded-xl p-1.5 transition-all duration-150 hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring text-left"
                  aria-label={t('nav.activeNestAria', { name: activeNestDisplayName })}
                >
                  {/* Nest Icon Container */}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent text-primary shadow-xs transition-transform duration-150 group-hover:scale-[1.03]">
                    {ActiveNestIcon ? (
                      <ActiveNestIcon className="size-5" />
                    ) : activeNest?.name ? (
                      <span className="text-xs font-bold font-mono">
                        {activeNest.name.slice(0, 2).toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-base">🪺</span>
                    )}
                  </div>

                  {/* Nest Info */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                        {activeNestDisplayName}
                      </span>
                      <ChevronsUpDown
                        size={13}
                        className="shrink-0 text-sidebar-foreground/40 transition-colors group-hover:text-sidebar-foreground/75"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-medium text-sidebar-foreground/50">
                        {activeNest?.isDefault ? t('nav.primaryNest') : t('nav.familySpace')}
                      </span>
                      {activeNest && (
                        <RoleBadge
                          role={activeNest.role}
                          className="h-3.5 px-1 text-[8px] py-0 font-medium"
                        />
                      )}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <NestDropdownContent
                nests={nests}
                activeNest={activeNest}
                onSelectNest={setActiveNestId}
                onOpenManager={(mode) => {
                  setManageNestsMode(mode);
                  setManageNestsOpen(true);
                }}
                isCollapsed={false}
              />
            </DropdownMenu>

            {/* Mobile Drawer Close Button */}
            {isMobile && (
              <button
                type="button"
                onClick={() => setOpenMobile(false)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground active:scale-95"
                aria-label={t('nav.closeMenu')}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
      </SidebarHeader>

      <SidebarSeparator className={cn('mx-auto my-1 w-6 opacity-40', !isCollapsed && 'mx-3 w-auto opacity-50')} />

      {/* ── NAVIGATION CONTENT ── */}
      <SidebarContent className={cn('px-2 py-1 scrollbar-hide', isCollapsed && 'px-0 items-center')}>
        {/* GRUPO PRINCIPAL */}
        <SidebarGroup className={cn('py-1', isCollapsed && 'px-0 py-1 items-center')}>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 pb-1.5 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">
              {t('nav.mainGroup')}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn('gap-1', isCollapsed && 'items-center')}>
              {mainModules.map((module) => (
                <NavModuleItem
                  key={module.id}
                  module={module}
                  isActive={isActive(module.path)}
                  isCollapsed={isCollapsed}
                  isMobile={isMobile}
                  onNavigate={handleNavClick}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* GRUPO FINANCEIRO */}
        <SidebarGroup className={cn('py-1', isCollapsed && 'px-0 py-1 items-center')}>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">
              {t('nav.financialGroup')}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn('gap-1', isCollapsed && 'items-center')}>
              <FinancasMenu
                subItems={financasSubItems}
                isFinancasActive={isFinancasActive}
                financasOpen={financasOpen}
                setFinancasOpen={setFinancasOpen}
                handleNavClick={handleNavClick}
                currentPath={location.pathname}
                isCollapsed={isCollapsed}
                isMobile={isMobile}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* GRUPO CONFIGURAÇÕES */}
        <SidebarGroup className={cn('py-1', isCollapsed && 'px-0 py-1 items-center')}>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">
              {t('nav.settingsGroup')}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn('gap-1', isCollapsed && 'items-center')}>
              {settingsModules.map((module) => (
                <NavModuleItem
                  key={module.id}
                  module={module}
                  isActive={isActive(module.path)}
                  isCollapsed={isCollapsed}
                  isMobile={isMobile}
                  onNavigate={handleNavClick}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── FOOTER: USER PROFILE & UTILITIES ── */}
      <SidebarFooter
        className={cn(
          'p-2 pt-1.5 border-t border-sidebar-border/40 space-y-1.5',
          isCollapsed && 'p-2 px-0 flex flex-col items-center justify-center space-y-0',
          isMobile && 'pb-[max(0.75rem,env(safe-area-inset-bottom))]'
        )}
      >
        {/* Quick Utilities (Help & Feedback) */}
        {!isCollapsed && (
          <div className="flex items-center gap-1 px-1">
            <button
              type="button"
              onClick={openInitialModal}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1 text-[11px] font-medium text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground active:scale-95"
            >
              <HelpCircle size={13} />
              <span>{t('nav.guide')}</span>
            </button>
            <div className="h-3 w-px bg-sidebar-border/50" />
            <button
              type="button"
              onClick={() => {}}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1 text-[11px] font-medium text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground active:scale-95"
            >
              <MessageSquarePlus size={13} />
              <span>{t('nav.feedback')}</span>
            </button>
          </div>
        )}

        {/* User Profile Card */}
        <SidebarMenu className={cn('gap-1', isCollapsed && 'items-center')}>
          <SidebarMenuItem className={cn(isCollapsed && 'flex justify-center')}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {isCollapsed ? (
                  <button
                    type="button"
                    className="flex size-8 shrink-0 items-center justify-center rounded-xl text-sidebar-foreground transition-all hover:bg-sidebar-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring active:scale-95"
                    aria-label={t('nav.profile')}
                    title={user?.name || t('nav.profile')}
                  >
                    <AvatarWithPresence isOnline={Boolean(user)} badgeSize="xs">
                      <Avatar className="size-7 shrink-0 rounded-full border border-primary/25 bg-white shadow-xs">
                        {user?.avatar && (
                          <AvatarImage
                            src={user.avatar}
                            alt={user.name}
                            className="size-full object-contain filter contrast-125 dark:brightness-105"
                          />
                        )}
                        <AvatarFallback className="bg-primary/20 font-bold text-primary text-[10px]">
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </AvatarWithPresence>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="group flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border/40 bg-sidebar-accent/25 p-2 text-left transition-all duration-150 hover:bg-sidebar-accent/70 hover:border-sidebar-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring active:scale-[0.98]"
                  >
                    <AvatarWithPresence isOnline={Boolean(user)} badgeSize="sm">
                      <Avatar className="size-9 shrink-0 rounded-full border border-primary/25 bg-white shadow-xs">
                        {user?.avatar && (
                          <AvatarImage
                            src={user.avatar}
                            alt={user.name}
                            className="size-full object-contain filter contrast-125 dark:brightness-105"
                          />
                        )}
                        <AvatarFallback className="bg-primary/20 font-bold text-primary text-xs">
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </AvatarWithPresence>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-xs font-semibold text-sidebar-foreground">
                        {user?.name || t('nav.profile')}
                      </span>
                      <span className="truncate text-[10px] text-sidebar-foreground/45">
                        {user?.email || t('nav.myAccount')}
                      </span>
                    </div>

                    <ChevronsUpDown
                      size={13}
                      className="shrink-0 text-sidebar-foreground/40 transition-colors group-hover:text-sidebar-foreground/75"
                    />
                  </button>
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-60 rounded-2xl border border-border/60 bg-popover/95 p-1.5 shadow-2xl backdrop-blur-xl scrollbar-hide"
                align="start"
                side={isCollapsed ? 'right' : 'top'}
                sideOffset={8}
              >
                <DropdownMenuLabel className="px-2.5 py-2">
                  <div className="flex items-center gap-2.5">
                    <AvatarWithPresence isOnline={Boolean(user)} badgeSize="sm">
                      <Avatar className="size-8 shrink-0 rounded-full border border-primary/25 bg-white shadow-xs">
                        {user?.avatar && (
                          <AvatarImage
                            src={user.avatar}
                            alt={user.name}
                            className="size-full object-contain filter contrast-125 dark:brightness-105"
                          />
                        )}
                        <AvatarFallback className="bg-primary/20 font-bold text-primary text-xs">
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </AvatarWithPresence>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-semibold text-foreground">{user?.name}</p>
                        <OnlineStatusBadge isOnline={Boolean(user)} size="xs" />
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1 bg-border/40" />

                <DropdownMenuItem
                  onClick={() => setProfileOpen(true)}
                  className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent/60"
                >
                  <UserIcon className="size-3.5 text-muted-foreground" />
                  <span>{t('nav.profile')}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setSettingsOpen(true)}
                  className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent/60"
                >
                  <Settings className="size-3.5 text-muted-foreground" />
                  <span>{t('nav.settings')}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    toggleTheme();
                  }}
                  className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent/60"
                >
                  {isDark ? (
                    <Moon className="size-3.5 text-primary" />
                  ) : (
                    <Sun className="size-3.5 text-primary" />
                  )}
                  <span>{isDark ? t('nav.themeDark') : t('nav.themeLight')}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-border/40" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-destructive focus:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="size-3.5" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * FINANÇAS SUBMENU COMPONENT
 * ───────────────────────────────────────────────────────────────────────────── */

interface FinancasSubNavItemProps {
  item: FinancasSubItem;
  isActive: boolean;
  isMobile: boolean;
  onNavigate: (path: string) => void;
}

function FinancasSubNavItem({
  item,
  isActive,
  isMobile,
  onNavigate,
}: FinancasSubNavItemProps) {
  const SubIcon = item.icon;
  const subIconRef = React.useRef<AnimatedIconHandle>(null);

  return (
    <button
      type="button"
      onClick={() => onNavigate(item.path)}
      onMouseEnter={() => subIconRef.current?.startAnimation()}
      onMouseLeave={() => subIconRef.current?.stopAnimation()}
      className={cn(
        'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 transition-all text-left active:scale-[0.98]',
        isMobile ? 'h-9 text-[13.5px]' : 'h-8 text-xs font-medium',
        isActive
          ? 'bg-primary/15 font-semibold text-primary'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      )}
    >
      <SubIcon
        ref={subIconRef}
        size={14}
        className={cn(
          'shrink-0 transition-colors',
          isActive ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'
        )}
      />
      <span className="truncate">{item.name}</span>
    </button>
  );
}

interface FinancasMenuProps {
  subItems: FinancasSubItem[];
  isFinancasActive: boolean;
  financasOpen: boolean;
  setFinancasOpen: (open: boolean) => void;
  handleNavClick: (path: string) => void;
  currentPath: string;
  isCollapsed: boolean;
  isMobile: boolean;
}

function FinancasMenu({
  subItems,
  isFinancasActive,
  financasOpen,
  setFinancasOpen,
  handleNavClick,
  currentPath,
  isCollapsed,
  isMobile,
}: FinancasMenuProps) {
  const { t } = useTranslation();
  const dollarRef = React.useRef<DollarSignIconHandle>(null);

  // Desktop collapsed mode -> Floating Dropdown
  if (isCollapsed) {
    return (
      <SidebarMenuItem className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onMouseEnter={() => dollarRef.current?.startAnimation()}
              onMouseLeave={() => dollarRef.current?.stopAnimation()}
              className={cn(
                'group flex size-8 shrink-0 items-center justify-center rounded-xl transition-all duration-150 active:scale-[0.98]',
                isFinancasActive
                  ? 'bg-primary/15 text-primary font-semibold shadow-2xs'
                  : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )}
              aria-label={t('nav.financialModule')}
              title={t('nav.financial')}
            >
              <DollarSignIcon
                ref={dollarRef}
                size={18}
                className={cn(
                  'shrink-0 transition-colors',
                  isFinancasActive
                    ? 'text-primary'
                    : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
                )}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-52 rounded-2xl border border-border/60 bg-popover/95 p-1.5 shadow-2xl backdrop-blur-xl scrollbar-hide"
          >
            <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('nav.financialModule')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-border/40" />
            {subItems.map((item) => {
              const SubIcon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs transition-colors',
                    isActive
                      ? 'bg-primary/15 font-semibold text-primary'
                      : 'text-foreground hover:bg-accent/60'
                  )}
                >
                  <SubIcon size={14} className="shrink-0" />
                  <span>{item.name}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  // Expanded mode -> Collapsible Accordion with subtle connector line
  return (
    <SidebarMenuItem className="relative">
      <Collapsible open={financasOpen} onOpenChange={setFinancasOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isFinancasActive}
            onMouseEnter={() => dollarRef.current?.startAnimation()}
            onMouseLeave={() => dollarRef.current?.stopAnimation()}
            className={cn(
              'group flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98]',
              isMobile ? 'h-11 text-[15px]' : 'h-10 text-sm',
              isFinancasActive
                ? 'bg-primary/15 font-semibold text-primary shadow-2xs'
                : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
            )}
            aria-label={financasOpen ? t('nav.collapseFinancial') : t('nav.expandFinancial')}
          >
            <div className="flex min-w-0 items-center gap-3">
              <DollarSignIcon
                ref={dollarRef}
                size={18}
                className={cn(
                  'shrink-0 transition-colors',
                  isFinancasActive
                    ? 'text-primary'
                    : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
                )}
              />
              <span className="truncate">{t('nav.financial')}</span>
            </div>

            <motion.div
              animate={{ rotate: financasOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 text-sidebar-foreground/45 transition-colors group-hover:text-sidebar-foreground"
            >
              <ChevronDown size={14} />
            </motion.div>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="relative ml-5 border-l border-sidebar-border/60 pl-2.5 my-1 space-y-0.5">
            {subItems.map((item) => (
              <FinancasSubNavItem
                key={item.id}
                item={item}
                isActive={currentPath === item.path}
                isMobile={isMobile}
                onNavigate={handleNavClick}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * NEST DROPDOWN CONTENT (WORKSPACE SWITCHER MENU)
 * ───────────────────────────────────────────────────────────────────────────── */

interface NestDropdownContentProps {
  nests: AppUserNest[];
  activeNest: AppUserNest | null;
  onSelectNest: (id: string) => void;
  onOpenManager: (mode: 'list' | 'create' | 'join_code') => void;
  isCollapsed: boolean;
}

function NestDropdownContent({
  nests,
  activeNest,
  onSelectNest,
  onOpenManager,
  isCollapsed,
}: NestDropdownContentProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenuContent
      className="w-72 rounded-2xl border border-border/60 bg-popover/95 p-1.5 shadow-2xl backdrop-blur-xl scrollbar-hide"
      align="start"
      side={isCollapsed ? 'right' : 'bottom'}
      sideOffset={8}
    >
      <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {t('nav.yourNests')}
      </DropdownMenuLabel>

      <div className="max-h-56 overflow-y-auto scrollbar-hide space-y-0.5 pr-0.5">
        {nests.length === 0 ? (
          <div className="px-3 py-3 text-center text-xs text-muted-foreground">
            {t('nav.noNestsFound')}
          </div>
        ) : (
          nests.map((nest) => {
            const NestIcon = getIconComponent(nest.icon);
            const isSelected = activeNest?.nestId === nest.nestId;

            return (
              <DropdownMenuItem
                key={nest.nestId}
                onClick={() => onSelectNest(nest.nestId)}
                className={cn(
                  'group flex cursor-pointer items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-colors',
                  isSelected
                    ? 'bg-primary/15 font-semibold text-primary'
                    : 'text-foreground hover:bg-accent/60'
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs',
                      isSelected
                        ? 'border-primary/30 bg-primary/20 text-primary'
                        : 'border-border/60 bg-muted/60 text-muted-foreground group-hover:border-border group-hover:text-foreground'
                    )}
                  >
                    {NestIcon ? (
                      <NestIcon className="size-3.5" />
                    ) : nest.name ? (
                      <span className="font-mono text-[10px] font-bold">
                        {nest.name.slice(0, 2).toUpperCase()}
                      </span>
                    ) : (
                      '🪺'
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-medium">
                        {nest.name}
                      </span>
                      {nest.isDefault && (
                        <span className="flex items-center gap-0.5 text-[9px] font-medium text-amber-500 shrink-0">
                          <Star size={9} className="fill-amber-500" />
                          <span>{t('nav.primaryNest')}</span>
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5">
                      <RoleBadge role={nest.role} className="h-3 px-1 text-[8px] py-0 font-medium" />
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <Check size={14} className="shrink-0 text-primary" />
                )}
              </DropdownMenuItem>
            );
          })
        )}
      </div>

      <DropdownMenuSeparator className="my-1.5 bg-border/40" />

      {/* Action to manage nests */}
      <DropdownMenuItem
        onClick={() => onOpenManager('list')}
        className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60"
      >
        <div className="flex size-6 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Settings2 size={13} />
        </div>
        <span>{t('nav.manageNests')}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
