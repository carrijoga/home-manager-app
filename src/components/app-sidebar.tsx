import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { User } from "@/types";
import {
  Bell,
  Calendar,
  Check,
  CheckSquare,
  ChevronsUpDown,
  DollarSign,
  Home,
  LogOut,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  User as UserIcon,
} from "lucide-react";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Mock de ninhos - será substituído por dados reais
const mockNinhos = [
  { id: "1", name: "Casa Principal" },
  { id: "2", name: "Escritório" },
  { id: "3", name: "Casa de Praia" },
];

// Mock de notificações
const mockNotifications = [
  {
    id: "1",
    title: "Tarefa vencendo",
    message: 'A tarefa "Comprar mantimentos" vence hoje',
    read: false,
  },
  {
    id: "2",
    title: "Novo aviso",
    message: "Gabriel adicionou um novo aviso no quadro",
    read: false,
  },
];

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
  user?: User;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [activeNinho, setActiveNinho] = React.useState(mockNinhos[0]);

  // Usuário padrão para desenvolvimento
  const defaultUser: User = {
    id: "1",
    name: "Usuário",
    email: "usuario@ninho.app",
  };

  const currentUser = user || defaultUser;

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const handleNinhoChange = (ninho: (typeof mockNinhos)[0]) => {
    setActiveNinho(ninho);
    console.log("Ninho changed to:", ninho.name);
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleNotificationClick = (notificationId: string) => {
    console.log("Notification clicked:", notificationId);
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
  };

  const handleSettingsClick = () => {
    console.log("Settings clicked");
  };

  const handleLogoutClick = () => {
    console.log("Logout clicked");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg">
                    🪺
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Ninho</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {activeNinho.name}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Ninhos
                </DropdownMenuLabel>
                {mockNinhos.map((ninho) => (
                  <DropdownMenuItem
                    key={ninho.id}
                    onClick={() => handleNinhoChange(ninho)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      🪺
                    </div>
                    {ninho.name}
                    {activeNinho.id === ninho.id && (
                      <Check className="ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
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
                      {unreadCount} não lidas
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {mockNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className="flex flex-col items-start gap-1 p-2"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-semibold text-sm">
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <Badge
                          variant="default"
                          className="h-2 w-2 p-0 rounded-full"
                        />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {notification.message}
                    </span>
                  </DropdownMenuItem>
                ))}
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
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
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
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {currentUser.name
                          .split(" ")
                          .map((n) => n[0])
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
                <DropdownMenuItem onClick={handleLogoutClick}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
