import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { getIconComponent } from "@/lib/nestIcons";
import { CreateNestModal } from "@/components/modals/CreateNestModal";
import type { AppUser, AppUserNest } from "@/types";
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronsUpDown,
  DollarSign,
  Home,
  Info,
  LogOut,
  Moon,
  Package,
  Pencil,
  Plus,
  Settings,
  ShoppingCart,
  Sun,
  User as UserIcon,
  X,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toAvatarSrc } from "@/lib/avatarUtils";
import * as authService from "@/services/authService";

// Mock de notificações removido — notificações vem do AppContext

// Notification type icon + color helpers
function getNotificationIcon(type: number) {
  switch (type) {
    case 1: return AlertTriangle; // Warning
    case 2: return XCircle;       // Error
    case 3: return CheckCircle2;  // Success
    default: return Info;         // Info (0) + fallback
  }
}

const NOTIFICATION_ICON_COLOR: Record<number, string> = {
  0: 'text-blue-500',
  1: 'text-amber-500',
  2: 'text-red-500',
  3: 'text-emerald-500',
};

interface Module {
  id: string;
  name: string;
  icon: any;
  path: string;
}

const MODULES: Module[] = [
  { id: "dashboard", name: "Dashboard", icon: Home, path: "/dashboard" },
  { id: "tasks", name: "Tarefas", icon: CheckSquare, path: "/tasks" },
  {
    id: "shopping",
    name: "Lista de Compras",
    icon: ShoppingCart,
    path: "/shopping",
  },
  { id: "financial", name: "Financeiro", icon: DollarSign, path: "/financial" },
  {
    id: "future",
    name: "Compras Futuras",
    icon: Package,
    path: "/future",
  },
  { id: "calendar", name: "Calendário", icon: Calendar, path: "/calendar" },
];

interface AppSidebarProps {
  user?: AppUser;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const {
    activeNestId,
    setActiveNestId,
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useApp();
  const [createNestOpen, setCreateNestOpen] = React.useState(false);
  const [editNestOpen, setEditNestOpen] = React.useState(false);
  const [editingNest, setEditingNest] = React.useState<AppUserNest | null>(null);

  const handleEditNest = (nest: AppUserNest) => {
    setEditingNest(nest);
    setEditNestOpen(true);
  };

  const nests = user?.nests ?? [];
  const activeNest = nests.find(n => n.nestId === activeNestId)
    ?? nests.find(n => n.isDefault)
    ?? nests[0]
    ?? null;

  // Usuário padrão para desenvolvimento
  const defaultUser: AppUser = {
    id: "1",
    name: "Usuário",
    callmeby: "Você",
    email: "usuario@ninho.app",
  };

  const currentUser = user || defaultUser;

  const [avatarSrc, setAvatarSrc] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    let mounted = true;
    let createdObjectUrl: string | undefined;

    (async () => {
      const src = await toAvatarSrc(currentUser.avatar, "image/png");
      if (!mounted) {
        if (src && src.startsWith("blob:")) URL.revokeObjectURL(src);
        return;
      }
      if (src && src.startsWith("blob:")) createdObjectUrl = src;
      setAvatarSrc(src);
    })();

    return () => {
      mounted = false;
      if (createdObjectUrl) URL.revokeObjectURL(createdObjectUrl);
    };
  }, [currentUser.avatar]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNinhoChange = (nestId: string) => {
    setActiveNestId(nestId);
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
  };

  const handleSettingsClick = () => {
    console.log("Settings clicked");
  };

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      // Limpar estado do usuário, se houver (opcional: useApp()?.setUser(null))
      navigate("/login");
    } catch (error) {
      // Exibir erro (opcional: toast)
      console.error("Erro ao sair:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <CreateNestModal open={createNestOpen} onClose={() => setCreateNestOpen(false)} />
      <CreateNestModal
        open={editNestOpen}
        onClose={() => setEditNestOpen(false)}
        mode="edit"
        nest={editingNest ?? undefined}
      />
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  disabled={nests.length === 0}
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg">
                    {activeNest?.icon
                      ? React.createElement(getIconComponent(activeNest.icon), { className: 'size-4' })
                      : '🪺'
                    }
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Ninho</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {activeNest?.name ?? 'Nenhum ninho'}
                    </span>
                  </div>
                  {nests.length > 0 && <ChevronsUpDown className="ml-auto" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              {nests.length > 0 && (
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side="bottom"
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
                        onClick={() => handleNinhoChange(nest.nestId)}
                        className="group gap-2 p-2"
                      >
                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <NestIcon className="size-3.5" />
                        </div>
                        <span className="flex-1 truncate">{nest.name}</span>
                        <span className="ml-auto flex items-center gap-1">
                          <button
                            type="button"
                            aria-label="Editar ninho"
                            onClick={(e) => { e.stopPropagation(); handleEditNest(nest); }}
                            className="rounded p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                          >
                            <Pencil className="size-3" />
                          </button>
                          {activeNest?.nestId === nest.nestId && (
                            <Check className="size-3.5" />
                          )}
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 p-2 text-indigo-600 dark:text-indigo-400"
                    onClick={() => setCreateNestOpen(true)}
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border border-dashed">
                      <Plus className="size-3.5" />
                    </div>
                    Adicionar ninho
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MODULES.map((module) => {
                const Icon = module.icon;
                const active = isActive(module.path);
                return (
                  <SidebarMenuItem key={module.id}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={module.name}
                      onClick={() => navigate(module.path)}
                    >
                      <Icon />
                      <span>{module.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Notificações */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="relative">
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Notificações</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {unreadCount > 0 ? `${unreadCount} não lidas` : 'Nenhuma nova'}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-80 rounded-lg p-0"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <span className="text-sm font-semibold">Notificações</span>
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Marcar todas
                      </button>
                      <span className="text-muted-foreground/40 text-xs">·</span>
                      <button
                        type="button"
                        onClick={clearAllNotifications}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Limpar tudo
                      </button>
                    </div>
                  )}
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                      <Bell className="size-8 opacity-30" />
                      <span className="text-sm">Nenhuma notificação</span>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      const iconColor = NOTIFICATION_ICON_COLOR[notification.type] ?? 'text-blue-500';
                      return (
                        <div
                          key={notification.notificationId}
                          role="button"
                          tabIndex={0}
                          onClick={() => markAsRead(notification.notificationId)}
                          onKeyDown={(e) => e.key === 'Enter' && markAsRead(notification.notificationId)}
                          className={cn(
                            "group flex items-start gap-3 px-3 py-2.5 cursor-pointer",
                            "hover:bg-muted/60 transition-colors border-b last:border-0",
                            !notification.isRead && "bg-muted/30"
                          )}
                        >
                          <Icon className={cn("size-4 mt-0.5 shrink-0", iconColor)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={cn(
                                "text-sm truncate",
                                !notification.isRead && "font-semibold"
                              )}>
                                {notification.title}
                              </span>
                              {!notification.isRead && (
                                <span className="shrink-0 size-1.5 rounded-full bg-blue-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                          </div>
                          <button
                            type="button"
                            aria-label="Remover notificação"
                            onClick={(e) => { e.stopPropagation(); clearNotification(notification.notificationId); }}
                            className="shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-muted-foreground"
                  onClick={() => {
                    // TODO: navigate to notification settings or open preferences modal
                    handleSettingsClick();
                  }}
                >
                  <Settings className="size-4" />
                  Configurar notificações
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          {/* Menu do Usuário */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatarSrc ?? currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      {currentUser.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {currentUser.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {currentUser.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={avatarSrc ?? currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {currentUser.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {currentUser.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {currentUser.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <UserIcon />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Settings />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleThemeToggle}>
                  {theme === "light" ? <Moon /> : <Sun />}
                  {theme === "light" ? "Modo Escuro" : "Modo Claro"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={isLoggingOut ? undefined : handleLogoutClick} disabled={isLoggingOut} className={isLoggingOut ? "opacity-60 pointer-events-none" : ""}>
                  {isLoggingOut ? (
                    <>
                      <LogOut className="animate-spin mr-1" />
                      Saindo...
                    </>
                  ) : (
                    <>
                      <LogOut />
                      Sair
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
