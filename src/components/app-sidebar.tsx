import { cn } from "@/lib/utils";
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
import { NestManagerSheet } from "@/components/modals/NestManagerSheet";
import { SettingsModal } from "@/components/modals/SettingsModal";
import type { AppUser } from "@/types";
import {
  Calendar,
  Check,
  CheckSquare,
  ChevronRight,
  ChevronsUpDown,
  DollarSign,
  HelpCircle,
  Home,
  LayoutGrid,
  RefreshCw,
  Send,
  Settings2,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Module {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface FinancasSubItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const FINANCAS_SUB_ITEMS: FinancasSubItem[] = [
  { id: "financial-dashboard", name: "Dashboard", icon: LayoutGrid, path: "/financial" },
  { id: "financial-lancamentos", name: "Lançamentos", icon: DollarSign, path: "/financial" },
  { id: "financial-metas", name: "Metas", icon: TrendingUp, path: "/financial" },
  { id: "financial-recorrencias", name: "Recorrências", icon: RefreshCw, path: "/financial" },
];

const TOP_MODULES: Module[] = [
  { id: "dashboard", name: "Início", icon: Home, path: "/dashboard" },
  { id: "tasks", name: "Tarefas", icon: CheckSquare, path: "/tasks" },
  { id: "shopping", name: "Lista de Compras", icon: ShoppingCart, path: "/shopping" },
];

const BOTTOM_MODULES: Module[] = [
  { id: "calendar", name: "Agenda", icon: Calendar, path: "/calendar" },
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

  const isFinancasActive = location.pathname === "/financial";
  const [financasOpen, setFinancasOpen] = React.useState(isFinancasActive);

  // Auto-expand Finanças when navigating to /financial
  React.useEffect(() => {
    if (isFinancasActive) setFinancasOpen(true);
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

  const renderNavItem = (module: Module) => {
    const Icon = module.icon;
    const active = isActive(module.path);
    return (
      <SidebarMenuItem key={module.id} className="relative">
        {active && (
          <motion.div
            layoutId="sidebar-active-pill"
            className="absolute inset-0 rounded-[24px] bg-background"
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            style={{ zIndex: 0 }}
          />
        )}
        <SidebarMenuButton
          isActive={active}
          tooltip={module.name}
          onClick={() => handleNavClick(module.path)}
          className={cn(
            "relative rounded-[24px] px-4 py-3 text-base transition-colors !gap-3",
            active
              ? "!bg-transparent !text-primary font-semibold"
              : "font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
          style={{ zIndex: 1 }}
        >
          <Icon className="size-[18px]" />
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
      <SidebarHeader className="pb-10">
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
              <span className="text-[10px] font-normal tracking-[0.5px] text-sidebar-foreground/60">Seu lar, organizado</span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {/* Top modules: Início, Tarefas, Lista de Compras */}
              {TOP_MODULES.map(renderNavItem)}

              {/* Finanças — collapsible group */}
              <SidebarMenuItem className="relative">
                {isFinancasActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-[24px] bg-background"
                    transition={{ type: "spring", stiffness: 380, damping: 38 }}
                    style={{ zIndex: 0 }}
                  />
                )}
                <Collapsible open={financasOpen} onOpenChange={setFinancasOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isFinancasActive}
                      tooltip="Finanças"
                      className={cn(
                        "relative rounded-[24px] px-4 py-3 text-base transition-colors !gap-3",
                        isFinancasActive
                          ? "!bg-transparent !text-primary font-semibold"
                          : "font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      style={{ zIndex: 1 }}
                    >
                      <DollarSign className="size-[18px]" />
                      <span>Finanças</span>
                      <motion.div
                        className="ml-auto"
                        animate={{ rotate: financasOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="size-4" />
                      </motion.div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {FINANCAS_SUB_ITEMS.map((item) => {
                        const SubIcon = item.icon;
                        return (
                          <SidebarMenuSubItem key={item.id}>
                            <SidebarMenuSubButton
                              onClick={() => handleNavClick(item.path)}
                              isActive={isFinancasActive}
                            >
                              <SubIcon className="size-3.5" />
                              <span>{item.name}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              {/* Bottom modules: Agenda */}
              {BOTTOM_MODULES.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Support */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Suporte"
              className="rounded-[24px] px-4 py-3 text-base font-normal text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground !gap-3"
            >
              <HelpCircle className="size-[18px]" />
              <span>Suporte</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Feedback */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Feedback"
              className="rounded-[24px] px-4 py-3 text-base font-normal text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground !gap-3"
            >
              <Send className="size-[18px]" />
              <span>Feedback</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

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
                      <span className="truncate text-[10px] tracking-[1px] uppercase text-sidebar-foreground/50">Grupo Familiar</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 shrink-0" />
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
