import { motion } from "framer-motion";
import { Check, Settings2 } from "lucide-react";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { NestManagerSheet } from "@/components/modals/NestManagerSheet";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { CalendarDaysIcon } from "@/components/ui/animated-icons/calendar-days";
import { CartIcon } from "@/components/ui/animated-icons/cart";
import { CheckIcon } from "@/components/ui/animated-icons/check";
import { ChevronRightIcon, type ChevronRightIconHandle } from "@/components/ui/animated-icons/chevron-right";
import { ChevronsUpDownIcon } from "@/components/ui/animated-icons/chevrons-up-down";
import { CircleHelpIcon } from "@/components/ui/animated-icons/circle-help";
import { DollarSignIcon, type DollarSignIconHandle } from "@/components/ui/animated-icons/dollar-sign";
import { HomeIcon } from "@/components/ui/animated-icons/home";
import { LayoutPanelTopIcon } from "@/components/ui/animated-icons/layout-panel-top";
import { RefreshCWIcon } from "@/components/ui/animated-icons/refresh-cw";
import { SendIcon } from "@/components/ui/animated-icons/send";
import { TrendingUpIcon } from "@/components/ui/animated-icons/trending-up";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/sidebar";
import { useApp } from "@/contexts/AppContext";
import { getIconComponent } from "@/lib/nestIcons";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/types";

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
  { id: "financial-dashboard", name: "Dashboard", icon: LayoutPanelTopIcon, path: "/financial" },
  { id: "financial-lancamentos", name: "Lançamentos", icon: DollarSignIcon, path: "/financial" },
  { id: "financial-metas", name: "Metas", icon: TrendingUpIcon, path: "/financial" },
  { id: "financial-recorrencias", name: "Recorrências", icon: RefreshCWIcon, path: "/financial" },
];

const TOP_MODULES: Module[] = [
  { id: "dashboard", name: "Início", icon: HomeIcon, path: "/dashboard" },
  { id: "tasks", name: "Tarefas", icon: CheckIcon, path: "/tasks" },
  { id: "shopping", name: "Lista de Compras", icon: CartIcon, path: "/shopping" },
];

const BOTTOM_MODULES: Module[] = [
  { id: "calendar", name: "Agenda", icon: CalendarDaysIcon, path: "/calendar" },
];

// Sub-components that own their icon refs so hover triggers animations

function FinancasGroup({
  isFinancasActive,
  financasOpen,
  setFinancasOpen,
  handleNavClick,
}: {
  isFinancasActive: boolean;
  financasOpen: boolean;
  setFinancasOpen: (open: boolean) => void;
  handleNavClick: (path: string) => void;
}) {
  const dollarRef = React.useRef<DollarSignIconHandle>(null);
  const chevronRef = React.useRef<ChevronRightIconHandle>(null);

  return (
    <Collapsible open={financasOpen} onOpenChange={setFinancasOpen}>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton
          isActive={isFinancasActive}
          tooltip="Finanças"
          onClick={() => handleNavClick("/financial")}
          onMouseEnter={() => { dollarRef.current?.startAnimation(); chevronRef.current?.startAnimation(); }}
          onMouseLeave={() => { dollarRef.current?.stopAnimation(); chevronRef.current?.stopAnimation(); }}
          className={cn(
            "relative rounded-[24px] px-4 py-3 text-base transition-colors !gap-3",
            isFinancasActive
              ? "!bg-transparent !text-primary font-semibold"
              : "font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
          {FINANCAS_SUB_ITEMS.map((item, index) => (
            <FinancasSubItemRow
              key={item.id}
              item={item}
              isActive={isFinancasActive && index === 0}
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
        className="rounded-[24px] px-4 py-3 text-base font-normal text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground !gap-3"
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

  const isFinancasActive = location.pathname === "/financial";
  const [financasOpen, setFinancasOpen] = React.useState(isFinancasActive);

  // Sync Finanças open state with route
  React.useEffect(() => {
    setFinancasOpen(isFinancasActive);
  }, [isFinancasActive]);

  const nests = user?.nests ?? [];
  const activeNest = nests.find(n => n.nestId === activeNestId)
    ?? nests.find(n => n.isDefault)
    ?? nests[0]
    ?? null;

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) setOpenMobile(false);
  };

  const isCollapsed = sidebarState === "collapsed";

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
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
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
            "relative rounded-[24px] px-4 py-3 text-base transition-colors !gap-3",
            active
              ? "!bg-transparent !text-primary font-semibold"
              : "font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
      <NestManagerSheet open={manageNestsOpen} onClose={() => setManageNestsOpen(false)} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Header — App Branding */}
      <SidebarHeader className="py-6">
        {isCollapsed ? (
          <div className="flex items-center justify-center px-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-terracotta-500 to-honey-400 text-white text-base shrink-0">
              🪺
            </div>
          </div>
        ) : (
          <div className="px-4 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-terracotta-500 to-honey-400 text-white text-lg shrink-0">
              🪺
            </div>
            <div className="flex flex-col gap-0">
              <span className="font-editorial font-bold text-xl tracking-tight text-primary leading-6">Ninho</span>
              <span className="font-normal tracking-wide text-sidebar-foreground/60" style={{ fontSize: "var(--text-xs)" }}>Seu lar, organizado</span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {/* Top modules: Início, Tarefas, Lista de Compras */}
              {TOP_MODULES.map(m => <NavItem key={m.id} module={m} />)}

              {/* Finanças — collapsible group */}
              <SidebarMenuItem className="relative">
                {isFinancasActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-[24px] bg-sidebar-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 38 }}
                    style={{ zIndex: 0 }}
                  />
                )}
                <FinancasGroup
                  isFinancasActive={isFinancasActive}
                  financasOpen={financasOpen}
                  setFinancasOpen={setFinancasOpen}
                  handleNavClick={handleNavClick}
                />
              </SidebarMenuItem>

              {/* Bottom modules: Agenda */}
              {BOTTOM_MODULES.map(m => <NavItem key={m.id} module={m} />)}
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
          <div className="my-1 h-px bg-sidebar-border mx-4" />

          {/* Nest switcher */}
          {nests.length > 0 && (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="rounded-[24px] bg-sidebar-background shadow-sm data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold shrink-0">
                      {activeNest?.name
                        ? activeNest.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
                        : '🪺'
                      }
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-sidebar-foreground">{activeNest?.name ?? 'Nenhum ninho'}</span>
                      <span className="truncate tracking-widest uppercase text-sidebar-foreground/50" style={{ fontSize: "var(--text-xs)" }}>Grupo Familiar</span>
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
                        className="gap-2 p-2"
                      >
                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <NestIcon className="size-3.5" />
                        </div>
                        <span className="flex-1 truncate">{nest.name}</span>
                        {activeNest?.nestId === nest.nestId && (
                          <Check className="ml-auto size-3.5" />
                        )}
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
