import { motion } from 'framer-motion';
import { Check, ChevronDown, HelpCircle, MessageSquarePlus, Settings2, Star, X } from 'lucide-react';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { RoleBadge } from '@/components/common/RoleBadge';
import { NestManagerModal } from '@/components/modals/NestManagerModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { CalendarDaysIcon } from '@/components/ui/animated-icons/calendar-days';
import { CartIcon } from '@/components/ui/animated-icons/cart';
import { CheckIcon } from '@/components/ui/animated-icons/check';
import { ChevronsUpDownIcon } from '@/components/ui/animated-icons/chevrons-up-down';
import { CreditCardIcon } from '@/components/ui/animated-icons/credit-card';
import {
  DollarSignIcon,
  type DollarSignIconHandle,
} from '@/components/ui/animated-icons/dollar-sign';
import { HomeIcon } from '@/components/ui/animated-icons/home';
import { RefreshCWIcon } from '@/components/ui/animated-icons/refresh-cw';
import { TrendingUpIcon } from '@/components/ui/animated-icons/trending-up';
import { UserIcon } from '@/components/ui/animated-icons/user';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useApp } from '@/contexts/AppContext';
import { getIconComponent } from '@/lib/nestIcons';
import { cn } from '@/lib/utils';
import type { AppUser } from '@/types';

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

const FINANCAS_SUB_ITEMS: FinancasSubItem[] = [
  { id: 'financial-lancamentos', name: 'Lançamentos', icon: DollarSignIcon, path: '/financial' },
  { id: 'financial-metas', name: 'Metas', icon: TrendingUpIcon, path: '/financial/goals' },
  {
    id: 'financial-recorrencias',
    name: 'Recorrências',
    icon: RefreshCWIcon,
    path: '/financial/recurrences',
  },
  { id: 'financial-conta', name: 'Contas', icon: UserIcon, path: '/financial/account' },
  { id: 'financial-cartao', name: 'Cartões', icon: CreditCardIcon, path: '/financial/card' },
];

const MAIN_MODULES: Module[] = [
  { id: 'dashboard', name: 'Início', icon: HomeIcon, path: '/dashboard' },
  { id: 'tasks', name: 'Tarefas', icon: CheckIcon, path: '/tasks' },
  { id: 'shopping', name: 'Lista de Compras', icon: CartIcon, path: '/shopping' },
  { id: 'calendar', name: 'Agenda', icon: CalendarDaysIcon, path: '/calendar' },
];

interface AppSidebarProps {
  user?: AppUser;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeNestId, setActiveNestId } = useApp();
  const [manageNestsOpen, setManageNestsOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const { isMobile, setOpenMobile, state: sidebarState } = useSidebar();

  const isCollapsed = sidebarState === 'collapsed';
  const isFinancasActive = location.pathname.startsWith('/financial');
  const [financasOpen, setFinancasOpen] = React.useState(isFinancasActive);

  // Sync Finanças open state with route
  React.useEffect(() => {
    if (isFinancasActive) {
      setFinancasOpen(true);
    }
  }, [isFinancasActive]);

  const nests = user?.nests ?? [];
  const activeNest =
    nests.find((n) => n.nestId === activeNestId) ??
    nests.find((n) => n.isDefault) ??
    nests[0] ??
    null;

  const ActiveNestIcon = activeNest ? getIconComponent(activeNest.icon) : null;

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar select-none">
      <NestManagerModal open={manageNestsOpen} onClose={() => setManageNestsOpen(false)} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* ── HEADER: BRANDING & MOBILE CLOSE ── */}
      <SidebarHeader className={cn('px-3 pt-4 pb-2 transition-all', isCollapsed && 'px-2 pt-3')}>
        {isCollapsed ? (
          <div className="flex items-center justify-center py-1">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-terracotta-500/20 via-honey-500/20 to-terracotta-500/10 border border-terracotta-500/30 text-lg shadow-sm">
              🪺
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-3">
              <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-terracotta-500 via-terracotta-600 to-honey-500 text-lg text-white shadow-md shadow-terracotta-500/20 ring-1 ring-white/20">
                🪺
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-lg font-bold leading-tight tracking-tight text-sidebar-foreground">
                  Ninho
                </span>
                <span className="text-[11px] font-medium tracking-wide text-sidebar-foreground/50">
                  Seu lar, organizado
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            {isMobile && (
              <button
                type="button"
                onClick={() => setOpenMobile(false)}
                className="flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground active:scale-95"
                aria-label="Fechar menu"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* ── NEST SWITCHER (TOP POSITIONED) ── */}
        {nests.length > 0 && (
          <div className={cn('mt-3', isCollapsed ? 'flex justify-center' : 'w-full')}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {isCollapsed ? (
                  <button
                    type="button"
                    className="group relative flex size-9 items-center justify-center rounded-xl border border-sidebar-border/60 bg-sidebar-accent/40 text-sidebar-foreground transition-colors hover:border-sidebar-border hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                    aria-label={activeNest?.name ?? 'Ninho'}
                  >
                    <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                      {ActiveNestIcon ? (
                        <ActiveNestIcon className="size-3.5" />
                      ) : activeNest?.name ? (
                        activeNest.name.slice(0, 2).toUpperCase()
                      ) : (
                        '🪺'
                      )}
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="group flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border/60 bg-sidebar-accent/35 p-2 text-left transition-all duration-150 hover:border-sidebar-border hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                  >
                    <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-xs font-semibold text-primary">
                      {ActiveNestIcon ? (
                        <ActiveNestIcon className="size-3.5" />
                      ) : activeNest?.name ? (
                        activeNest.name.slice(0, 2).toUpperCase()
                      ) : (
                        '🪺'
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold text-sidebar-foreground">
                          {activeNest?.name ?? 'Meu Ninho'}
                        </span>
                        {activeNest && (
                          <RoleBadge
                            role={activeNest.role}
                            className="h-3.5 px-1 text-[8px] py-0 shrink-0 font-medium"
                          />
                        )}
                      </div>
                      <span className="truncate text-[10px] text-sidebar-foreground/45">
                        Grupo Familiar
                      </span>
                    </div>

                    <ChevronsUpDownIcon
                      size={14}
                      className="shrink-0 text-sidebar-foreground/40 transition-colors group-hover:text-sidebar-foreground/75"
                    />
                  </button>
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[280px] sm:w-[310px] rounded-2xl border border-border/60 bg-popover/95 p-1.5 shadow-2xl backdrop-blur-xl"
                align={isCollapsed ? 'start' : 'start'}
                side={isCollapsed ? 'right' : 'bottom'}
                sideOffset={6}
              >
                <DropdownMenuLabel className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Ninhos da Família
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-border/40" />

                <div className="space-y-1">
                  {nests.map((nest) => {
                    const NestIcon = getIconComponent(nest.icon);
                    const isCurrent = activeNest?.nestId === nest.nestId;
                    return (
                      <DropdownMenuItem
                        key={nest.nestId}
                        onClick={() => setActiveNestId(nest.nestId)}
                        className={cn(
                          'group flex cursor-pointer items-center justify-between gap-3 rounded-xl p-2.5 transition-all duration-150',
                          isCurrent
                            ? 'bg-primary/10 border border-primary/25 shadow-xs'
                            : 'hover:bg-accent/60 border border-transparent'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className={cn(
                              'flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
                              isCurrent
                                ? 'border-primary/40 bg-background text-primary shadow-xs'
                                : 'border-border/60 bg-background/80 text-muted-foreground group-hover:text-foreground'
                            )}
                          >
                            <NestIcon className="size-4" />
                          </div>

                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-xs font-semibold text-foreground">
                                {nest.name}
                              </span>
                              {nest.isDefault && (
                                <Star className="size-3 shrink-0 fill-amber-500 text-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <RoleBadge role={nest.role} className="h-3.5 px-1 text-[8px] py-0 font-medium" />
                              <span className="text-[10px] text-muted-foreground/50">Grupo Familiar</span>
                            </div>
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Check className="size-3 text-primary stroke-[3]" />
                          </div>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </div>

                <DropdownMenuSeparator className="my-1.5 bg-border/40" />
                <DropdownMenuItem
                  className="group flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent/60"
                  onClick={() => setManageNestsOpen(true)}
                >
                  <div className="flex size-7 items-center justify-center rounded-lg border border-border/50 bg-background/80 text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
                    <Settings2 className="size-3.5" />
                  </div>
                  <span className="font-medium">Gerenciar ninhos</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarHeader>

      {/* ── NAVIGATION CONTENT ── */}
      <SidebarContent className="px-2 py-1 scrollbar-hide">
        {/* GRUPO PRINCIPAL */}
        <SidebarGroup className="py-1">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">
              Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {MAIN_MODULES.map((module) => {
                const active = isActive(module.path);
                const Icon = module.icon;
                const iconRef = React.useRef<AnimatedIconHandle>(null);

                return (
                  <SidebarMenuItem key={module.id} className="relative">
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={module.name}
                      onClick={() => handleNavClick(module.path)}
                      onMouseEnter={() => iconRef.current?.startAnimation()}
                      onMouseLeave={() => iconRef.current?.stopAnimation()}
                      className={cn(
                        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150',
                        isMobile ? 'h-11 text-[15px]' : 'h-10 text-sm',
                        active
                          ? 'bg-primary/12 font-semibold text-primary shadow-xs'
                          : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                      )}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary"
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        ref={iconRef}
                        size={18}
                        className={cn(
                          'shrink-0 transition-colors',
                          active
                            ? 'text-primary'
                            : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
                        )}
                      />
                      {!isCollapsed && <span className="truncate">{module.name}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* GRUPO FINANCEIRO */}
        <SidebarGroup className="py-1">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">
              Financeiro
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <FinancasMenu
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
      </SidebarContent>

      {/* ── FOOTER: UTILITIES & SAFE AREA ── */}
      <SidebarFooter
        className={cn(
          'px-2 py-2 border-t border-sidebar-border/40',
          isMobile && 'pb-[max(1rem,env(safe-area-inset-bottom))]'
        )}
      >
        <SidebarMenu className="gap-1">
          {isCollapsed ? (
            <>
              <FooterTooltipButton
                label="Suporte"
                icon={HelpCircle}
                onClick={() => {}}
              />
              <FooterTooltipButton
                label="Feedback"
                icon={MessageSquarePlus}
                onClick={() => {}}
              />
            </>
          ) : (
            <div className="flex items-center gap-1 px-1">
              <button
                type="button"
                onClick={() => {}}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground active:scale-95"
              >
                <HelpCircle size={14} />
                <span>Suporte</span>
              </button>
              <div className="h-3 w-px bg-sidebar-border/50" />
              <button
                type="button"
                onClick={() => {}}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground active:scale-95"
              >
                <MessageSquarePlus size={14} />
                <span>Feedback</span>
              </button>
            </div>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * FINANÇAS SUBMENU COMPONENT
 * ───────────────────────────────────────────────────────────────────────────── */

interface FinancasMenuProps {
  isFinancasActive: boolean;
  financasOpen: boolean;
  setFinancasOpen: (open: boolean) => void;
  handleNavClick: (path: string) => void;
  currentPath: string;
  isCollapsed: boolean;
  isMobile: boolean;
}

function FinancasMenu({
  isFinancasActive,
  financasOpen,
  setFinancasOpen,
  handleNavClick,
  currentPath,
  isCollapsed,
  isMobile,
}: FinancasMenuProps) {
  const dollarRef = React.useRef<DollarSignIconHandle>(null);

  // Desktop collapsed mode -> Floating Dropdown
  if (isCollapsed) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              isActive={isFinancasActive}
              tooltip="Finanças"
              onMouseEnter={() => dollarRef.current?.startAnimation()}
              onMouseLeave={() => dollarRef.current?.stopAnimation()}
              className={cn(
                'group relative flex size-9 items-center justify-center rounded-xl transition-colors',
                isFinancasActive
                  ? 'bg-primary/12 text-primary font-semibold'
                  : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )}
            >
              {isFinancasActive && (
                <span
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary"
                  aria-hidden="true"
                />
              )}
              <DollarSignIcon ref={dollarRef} size={18} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-48 rounded-xl border border-sidebar-border bg-popover/95 p-1 shadow-xl backdrop-blur-md"
          >
            <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Módulo Financeiro
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-border/40" />
            {FINANCAS_SUB_ITEMS.map((item) => {
              const SubIcon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
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

  // Expanded mode -> Collapsible Accordion with vertical connector line
  return (
    <SidebarMenuItem className="relative">
      <Collapsible open={financasOpen} onOpenChange={setFinancasOpen}>
        <div className="relative flex items-center">
          <SidebarMenuButton
            isActive={isFinancasActive}
            onClick={() => handleNavClick('/financial')}
            onMouseEnter={() => dollarRef.current?.startAnimation()}
            onMouseLeave={() => dollarRef.current?.stopAnimation()}
            className={cn(
              'group relative flex flex-1 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150',
              isMobile ? 'h-11 text-[15px]' : 'h-10 text-sm',
              isFinancasActive
                ? 'bg-primary/12 font-semibold text-primary shadow-xs'
                : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
            )}
          >
            {isFinancasActive && (
              <span
                className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary"
                aria-hidden="true"
              />
            )}
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
            <span className="truncate">Finanças</span>
          </SidebarMenuButton>

          {/* Toggle button specifically for collapsing without navigating */}
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="absolute right-2 flex size-6 items-center justify-center rounded-md text-sidebar-foreground/45 transition-colors hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
              aria-label={financasOpen ? 'Recolher Finanças' : 'Expandir Finanças'}
            >
              <motion.div
                animate={{ rotate: financasOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} />
              </motion.div>
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="relative ml-5 border-l border-sidebar-border/50 pl-2.5 my-1 space-y-0.5">
            {FINANCAS_SUB_ITEMS.map((item) => {
              const SubIcon = item.icon;
              const subIconRef = React.useRef<AnimatedIconHandle>(null);
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  onMouseEnter={() => subIconRef.current?.startAnimation()}
                  onMouseLeave={() => subIconRef.current?.stopAnimation()}
                  className={cn(
                    'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 transition-colors text-left',
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
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * FOOTER TOOLTIP BUTTON (FOR COLLAPSED DESKTOP)
 * ───────────────────────────────────────────────────────────────────────────── */

function FooterTooltipButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
}) {
  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className="flex size-9 w-full items-center justify-center rounded-xl text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:outline-none"
            aria-label={label}
          >
            <Icon size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  );
}
