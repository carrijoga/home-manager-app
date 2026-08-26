import { motion } from 'framer-motion';
import { Check, Settings2, Star } from 'lucide-react';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { RoleBadge } from '@/components/common/RoleBadge';
import { NestManagerModal } from '@/components/modals/NestManagerModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { CalendarDaysIcon } from '@/components/ui/animated-icons/calendar-days';
import { CartIcon } from '@/components/ui/animated-icons/cart';
import { CheckIcon } from '@/components/ui/animated-icons/check';
import {
  ChevronRightIcon,
  type ChevronRightIconHandle,
} from '@/components/ui/animated-icons/chevron-right';
import { ChevronsUpDownIcon } from '@/components/ui/animated-icons/chevrons-up-down';
import { CircleHelpIcon } from '@/components/ui/animated-icons/circle-help';
import { CreditCardIcon } from '@/components/ui/animated-icons/credit-card';
import {
  DollarSignIcon,
  type DollarSignIconHandle,
} from '@/components/ui/animated-icons/dollar-sign';
import { HomeIcon } from '@/components/ui/animated-icons/home';
import { RefreshCWIcon } from '@/components/ui/animated-icons/refresh-cw';
import { SendIcon } from '@/components/ui/animated-icons/send';
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
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
  { id: 'financial-conta', name: 'Conta', icon: UserIcon, path: '/financial/account' },
  { id: 'financial-cartao', name: 'Cartão', icon: CreditCardIcon, path: '/financial/card' },
];

const TOP_MODULES: Module[] = [
  { id: 'dashboard', name: 'Início', icon: HomeIcon, path: '/dashboard' },
  { id: 'tasks', name: 'Tarefas', icon: CheckIcon, path: '/tasks' },
  { id: 'shopping', name: 'Lista de Compras', icon: CartIcon, path: '/shopping' },
];

const BOTTOM_MODULES: Module[] = [
  { id: 'calendar', name: 'Agenda', icon: CalendarDaysIcon, path: '/calendar' },
];

// Sub-components that own their icon refs so hover triggers animations

function FinancasGroup({
  isFinancasActive,
  financasOpen,
  setFinancasOpen,
  handleNavClick,
  currentPath,
}: {
  isFinancasActive: boolean;
  financasOpen: boolean;
  setFinancasOpen: (open: boolean) => void;
  handleNavClick: (path: string) => void;
  currentPath: string;
}) {
  const dollarRef = React.useRef<DollarSignIconHandle>(null);
  const chevronRef = React.useRef<ChevronRightIconHandle>(null);
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';

  if (isCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            isActive={isFinancasActive}
            tooltip="Finanças"
            onMouseEnter={() => dollarRef.current?.startAnimation()}
            onMouseLeave={() => dollarRef.current?.stopAnimation()}
            className={cn(
              'relative cursor-pointer !gap-3 rounded-[24px] px-4 py-3 text-base transition-colors',
              isFinancasActive
                ? '!bg-primary/8 font-semibold !text-primary hover:!bg-primary/12'
                : 'font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
            style={{ zIndex: 1 }}
          >
            <DollarSignIcon ref={dollarRef} size={18} />
            <span>Finanças</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-48">
          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Finanças
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {FINANCAS_SUB_ITEMS.map((item) => {
            const SubIcon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm',
                  isActive && '!bg-primary/15 font-semibold !text-primary'
                )}
              >
                <SubIcon size={16} />
                <span>{item.name}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Collapsible open={financasOpen} onOpenChange={setFinancasOpen}>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton
          isActive={false}
          tooltip="Finanças"
          onClick={() => handleNavClick('/financial')}
          onMouseEnter={() => {
            dollarRef.current?.startAnimation();
            chevronRef.current?.startAnimation();
          }}
          onMouseLeave={() => {
            dollarRef.current?.stopAnimation();
            chevronRef.current?.stopAnimation();
          }}
          className={cn(
            'relative cursor-pointer !gap-3 rounded-[24px] px-4 py-3 text-base transition-colors',
            isFinancasActive
              ? '!bg-primary/8 font-semibold !text-primary hover:!bg-primary/12'
              : 'font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
          style={{ zIndex: 1 }}
        >
          <DollarSignIcon ref={dollarRef} size={18} />
          <span>Finanças</span>
          <motion.div
            className="ml-auto"
            animate={{ rotate: financasOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRightIcon ref={chevronRef} size={16} />
          </motion.div>
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {FINANCAS_SUB_ITEMS.map((item) => (
            <FinancasSubItemRow
              key={item.id}
              item={item}
              isActive={currentPath === item.path}
              handleNavClick={handleNavClick}
            />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FinancasSubItemRow({
  item,
  isActive,
  handleNavClick,
}: {
  item: { id: string; name: string; icon: AnimatedIconComponent; path: string };
  isActive: boolean;
  handleNavClick: (path: string) => void;
}) {
  const SubIcon = item.icon;
  const iconRef = React.useRef<AnimatedIconHandle>(null);

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        onClick={() => handleNavClick(item.path)}
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        isActive={isActive}
        className={cn('cursor-pointer', isActive && '!bg-primary/15 font-semibold !text-primary')}
      >
        <SubIcon ref={iconRef} size={14} />
        <span>{item.name}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

function FooterIconButton({
  tooltip,
  Icon,
  label,
}: {
  tooltip: string;
  Icon: AnimatedIconComponent;
  label: string;
}) {
  const iconRef = React.useRef<AnimatedIconHandle>(null);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={tooltip}
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        className="!gap-3 rounded-[24px] px-4 py-3 text-base font-normal text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <Icon ref={iconRef} size={18} />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

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

  const isFinancasActive = location.pathname.startsWith('/financial');
  const [financasOpen, setFinancasOpen] = React.useState(isFinancasActive);

  // Sync Finanças open state with route
  React.useEffect(() => {
    setFinancasOpen(isFinancasActive);
  }, [isFinancasActive]);

  const nests = user?.nests ?? [];
  const activeNest =
    nests.find((n) => n.nestId === activeNestId) ??
    nests.find((n) => n.isDefault) ??
    nests[0] ??
    null;

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) setOpenMobile(false);
  };

  const isCollapsed = sidebarState === 'collapsed';

  const NavItem = ({ module }: { module: Module }) => {
    const Icon = module.icon;
    const iconRef = React.useRef<AnimatedIconHandle>(null);
    const active = isActive(module.path);
    return (
      <SidebarMenuItem className="relative">
        {active && (
          <motion.div
            layoutId="sidebar-active-pill"
            className="absolute inset-0 rounded-[24px] bg-sidebar-accent"
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            style={{ zIndex: 0 }}
          />
        )}
        <SidebarMenuButton
          isActive={active}
          tooltip={module.name}
          onClick={() => handleNavClick(module.path)}
          onMouseEnter={() => iconRef.current?.startAnimation()}
          onMouseLeave={() => iconRef.current?.stopAnimation()}
          className={cn(
            'relative !gap-3 rounded-[24px] px-4 py-3 text-base transition-colors',
            active
              ? '!bg-transparent font-semibold !text-primary'
              : 'font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
          style={{ zIndex: 1 }}
        >
          <Icon ref={iconRef} size={18} />
          <span>{module.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <NestManagerModal open={manageNestsOpen} onClose={() => setManageNestsOpen(false)} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Header — App Branding */}
      <SidebarHeader className="py-6">
        {isCollapsed ? (
          <div className="flex items-center justify-center px-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-terracotta-500 to-honey-400 text-base text-white">
              🪺
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-terracotta-500 to-honey-400 text-lg text-white">
              🪺
            </div>
            <div className="flex flex-col gap-0">
              <span className="font-editorial text-xl font-bold leading-6 tracking-tight text-primary">
                Ninho
              </span>
              <span
                className="font-normal tracking-wide text-sidebar-foreground/60"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                Seu lar, organizado
              </span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {/* Top modules: Início, Tarefas, Lista de Compras */}
              {TOP_MODULES.map((m) => (
                <NavItem key={m.id} module={m} />
              ))}

              {/* Finanças — collapsible group */}
              <SidebarMenuItem className="relative">
                <FinancasGroup
                  isFinancasActive={isFinancasActive}
                  financasOpen={financasOpen}
                  setFinancasOpen={setFinancasOpen}
                  handleNavClick={handleNavClick}
                  currentPath={location.pathname}
                />
              </SidebarMenuItem>

              {/* Bottom modules: Agenda */}
              {BOTTOM_MODULES.map((m) => (
                <NavItem key={m.id} module={m} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Support */}
          <FooterIconButton tooltip="Suporte" Icon={CircleHelpIcon} label="Suporte" />

          {/* Feedback */}
          <FooterIconButton tooltip="Feedback" Icon={SendIcon} label="Feedback" />

          {/* Divider */}
          <div className="mx-4 my-1 h-px bg-sidebar-border" />

          {/* Nest switcher */}
          {nests.length > 0 && (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="bg-sidebar-background rounded-[24px] shadow-sm data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      {activeNest?.name
                        ? activeNest.name
                            .split(' ')
                            .map((w: string) => w[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                        : '🪺'}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                      <div className="flex items-center justify-between gap-1.5 min-w-0">
                        <span className="truncate font-semibold text-sidebar-foreground">
                          {activeNest?.name ?? 'Nenhum ninho'}
                        </span>
                        {activeNest && (
                          <RoleBadge role={activeNest.role} className="h-4 px-1.5 text-[9px] py-0 shrink-0" />
                        )}
                      </div>
                      <span
                        className="truncate uppercase tracking-widest text-sidebar-foreground/50"
                        style={{ fontSize: 'var(--text-xs)' }}
                      >
                        Grupo Familiar
                      </span>
                    </div>
                    <ChevronsUpDownIcon size={16} className="ml-auto shrink-0" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side="top"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Ninhos
                  </DropdownMenuLabel>
                  {nests.map((nest) => {
                    const NestIcon = getIconComponent(nest.icon);
                    return (
                      <DropdownMenuItem
                        key={nest.nestId}
                        onClick={() => setActiveNestId(nest.nestId)}
                        className="flex items-center justify-between gap-2 p-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex size-6 items-center justify-center rounded-sm border shrink-0">
                            <NestIcon className="size-3.5" />
                          </div>
                          <span className="truncate">{nest.name}</span>
                          {nest.isDefault && (
                            <Star className="size-3 text-amber-500 fill-amber-500/20 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <RoleBadge role={nest.role} className="h-4 px-1.5 text-[9px] py-0" />
                          {activeNest?.nestId === nest.nestId && (
                            <Check className="size-3.5 text-primary shrink-0" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 p-2 text-terracotta-500 dark:text-honey-400"
                    onClick={() => setManageNestsOpen(true)}
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <Settings2 className="size-3.5" />
                    </div>
                    Gerenciar ninhos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
