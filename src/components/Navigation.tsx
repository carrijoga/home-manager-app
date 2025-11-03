import { cn } from "@/lib/utils";
import type { User } from "@/types";
import {
  Calendar,
  CheckSquare,
  DollarSign,
  Home,
  Menu,
  Package,
  ShoppingCart,
  X,
} from "lucide-react";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { ModuleIds } from "../models/types";
import GlobalSearch from "./common/GlobalSearch";
import NotificationsMenu from "./common/NotificationsMenu";
import ProfileMenu from "./common/ProfileMenu";

interface NavigationProps {
  currentModule: string;
  onModuleChange: (moduleId: string) => void;
  user?: User;
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
  currentTheme?: "light" | "dark" | "system";
}

interface Module {
  id: string;
  name: string;
  icon: any;
}

// Módulos definidos fora do componente para evitar recriação
const MODULES: Module[] = [
  { id: ModuleIds.DASHBOARD, name: "Dashboard", icon: Home },
  { id: ModuleIds.TASKS, name: "Tarefas", icon: CheckSquare },
  { id: ModuleIds.SHOPPING, name: "Lista de Compras", icon: ShoppingCart },
  { id: ModuleIds.FINANCIAL, name: "Financeiro", icon: DollarSign },
  { id: ModuleIds.FUTURE, name: "Compras Futuras", icon: Package },
  { id: ModuleIds.CALENDAR, name: "Calendário", icon: Calendar },
];

/**
 * Componente de navegação completo com logo, links, busca, notificações e perfil
 */
const Navigation: FC<NavigationProps> = ({
  currentModule,
  onModuleChange,
  user,
  onThemeChange,
  currentTheme = "system",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Usuário padrão para desenvolvimento
  const defaultUser: User = {
    id: "1",
    name: "Usuário",
    email: "usuario@ninho.app",
  };

  const currentUser = user || defaultUser;

  const modules: Module[] = MODULES;

  // Mock de notificações com useMemo (será substituído por dados reais)
  const mockNotifications = useMemo(
    () => [
      {
        id: "1",
        type: "task" as const,
        title: "Tarefa vencendo",
        message: 'A tarefa "Comprar mantimentos" vence hoje',
        timestamp: new Date(Date.now() - 3600000), // 1h atrás
        read: false,
      },
      {
        id: "2",
        type: "notice" as const,
        title: "Novo aviso",
        message: "Gabriel adicionou um novo aviso no quadro",
        timestamp: new Date(Date.now() - 7200000), // 2h atrás
        read: false,
      },
    ],
    []
  );

  // Função de busca (mock - será implementada com dados reais)
  const handleSearch = (_query: string) => {
    // TODO: Implementar busca real em todos os módulos
    return [];
  };

  const handleSearchResultClick = (result: any) => {
    // TODO: Navegar para o módulo e item específico
    console.log("Search result clicked:", result);
  };

  const handleNotificationClick = (notificationId: string) => {
    // TODO: Marcar notificação como lida e navegar para o item
    console.log("Notification clicked:", notificationId);
  };

  const handleMarkAllAsRead = () => {
    // TODO: Marcar todas notificações como lidas
    console.log("Mark all as read");
  };

  const handleProfileClick = () => {
    // TODO: Navegar para página de perfil
    console.log("Profile clicked");
  };

  const handleSettingsClick = () => {
    // TODO: Navegar para página de configurações
    console.log("Settings clicked");
  };

  const handleLogoutClick = () => {
    // TODO: Implementar logout
    console.log("Logout clicked");
  };

  const handleModuleClick = (moduleId: string) => {
    onModuleChange(moduleId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onModuleChange(ModuleIds.DASHBOARD)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-lg px-2 py-1"
            >
              <span className="text-2xl">🪺</span>
              <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400 hidden sm:inline">
                Ninho
              </span>
            </button>
          </div>

          {/* Links de Navegação - Desktop */}
          <div className="hidden lg:flex items-center gap-1 flex-1 px-6">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = currentModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-indigo-50 dark:hover:bg-slate-800",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                    isActive
                      ? "bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300"
                  )}
                >
                  <Icon size={16} />
                  <span className="whitespace-nowrap">{module.name}</span>
                </button>
              );
            })}
          </div>

          {/* Busca Global - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <GlobalSearch
              onSearch={handleSearch}
              onResultClick={handleSearchResultClick}
            />
          </div>

          {/* Notificações e Perfil */}
          <div className="flex items-center gap-2">
            <NotificationsMenu
              notifications={mockNotifications}
              onNotificationClick={handleNotificationClick}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
            <ProfileMenu
              user={currentUser}
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
              onProfileClick={handleProfileClick}
              onSettingsClick={handleSettingsClick}
              onLogoutClick={handleLogoutClick}
            />

            {/* Botão de menu mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden ml-2 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X size={20} className="text-slate-700 dark:text-slate-300" />
              ) : (
                <Menu
                  size={20}
                  className="text-slate-700 dark:text-slate-300"
                />
              )}
            </button>
          </div>
        </div>

        {/* Busca Global - Mobile */}
        <div className="md:hidden pb-3">
          <GlobalSearch
            onSearch={handleSearch}
            onResultClick={handleSearchResultClick}
            placeholder="Buscar..."
          />
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = currentModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon size={20} />
                  <span>{module.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
