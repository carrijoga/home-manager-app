import React, { useState } from 'react';
import { Home, CheckSquare, ShoppingCart, DollarSign, Package, Calendar, Menu, X } from 'lucide-react';
import { ModuleIds } from '../models/types';
import { cn } from '@/lib/utils';
import NotificationsMenu from './common/NotificationsMenu';
import ProfileMenu from './common/ProfileMenu';
import GlobalSearch from './common/GlobalSearch';
import type { User } from '@/types';

interface NavigationProps {
  currentModule: string;
  onModuleChange: (moduleId: string) => void;
  user?: User;
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  currentTheme?: 'light' | 'dark' | 'system';
}

interface Module {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

/**
 * Componente de navegação completo com logo, links, busca, notificações e perfil
 */
const Navigation: React.FC<NavigationProps> = ({
  currentModule,
  onModuleChange,
  user,
  onThemeChange,
  currentTheme = 'system',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Usuário padrão para desenvolvimento
  const defaultUser: User = {
    id: '1',
    name: 'Usuário',
    email: 'usuario@ninho.app',
  };

  const currentUser = user || defaultUser;

  const modules: Module[] = [
    { id: ModuleIds.DASHBOARD, name: 'Dashboard', icon: Home },
    { id: ModuleIds.TASKS, name: 'Tarefas', icon: CheckSquare },
    { id: ModuleIds.SHOPPING, name: 'Lista de Compras', icon: ShoppingCart },
    { id: ModuleIds.FINANCIAL, name: 'Financeiro', icon: DollarSign },
    { id: ModuleIds.FUTURE, name: 'Compras Futuras', icon: Package },
    { id: ModuleIds.CALENDAR, name: 'Calendário', icon: Calendar },
  ];

  // Mock de notificações (será substituído por dados reais)
  const mockNotifications = [
    {
      id: '1',
      type: 'task' as const,
      title: 'Tarefa vencendo',
      message: 'A tarefa "Comprar mantimentos" vence hoje',
      timestamp: new Date(Date.now() - 3600000), // 1h atrás
      read: false,
    },
    {
      id: '2',
      type: 'notice' as const,
      title: 'Novo aviso',
      message: 'Gabriel adicionou um novo aviso no quadro',
      timestamp: new Date(Date.now() - 7200000), // 2h atrás
      read: false,
    },
  ];

  // Função de busca (mock - será implementada com dados reais)
  const handleSearch = (_query: string) => {
    // TODO: Implementar busca real em todos os módulos
    return [];
  };

  const handleSearchResultClick = (result: any) => {
    // TODO: Navegar para o módulo e item específico
    console.log('Search result clicked:', result);
  };

  const handleNotificationClick = (notificationId: string) => {
    // TODO: Marcar notificação como lida e navegar para o item
    console.log('Notification clicked:', notificationId);
  };

  const handleMarkAllAsRead = () => {
    // TODO: Marcar todas notificações como lidas
    console.log('Mark all as read');
  };

  const handleProfileClick = () => {
    // TODO: Navegar para página de perfil
    console.log('Profile clicked');
  };

  const handleSettingsClick = () => {
    // TODO: Navegar para página de configurações
    console.log('Settings clicked');
  };

  const handleLogoutClick = () => {
    // TODO: Implementar logout
    console.log('Logout clicked');
  };

  const handleModuleClick = (moduleId: string) => {
    onModuleChange(moduleId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-dark-bg-secondary shadow-sm border-b border-gray-200 dark:border-dark-border-default sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onModuleChange(ModuleIds.DASHBOARD)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ninho-500 dark:focus:ring-dark-accent-ninho rounded-lg px-2 py-1"
            >
              <span className="text-2xl">🪺</span>
              <span className="text-xl font-bold text-ninho-700 dark:text-dark-accent-ninho hidden sm:inline">
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
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-ninho-50 dark:hover:bg-dark-bg-hover',
                    'focus:outline-none focus:ring-2 focus:ring-ninho-500 dark:focus:ring-dark-accent-ninho',
                    isActive
                      ? 'bg-ninho-100 dark:bg-dark-bg-elevated text-ninho-700 dark:text-dark-accent-ninho'
                      : 'text-gray-700 dark:text-dark-text-secondary'
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
              className="lg:hidden ml-2 p-2 rounded-lg hover:bg-ninho-50 dark:hover:bg-dark-bg-hover focus:outline-none focus:ring-2 focus:ring-ninho-500 dark:focus:ring-dark-accent-ninho"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X size={20} className="text-gray-700 dark:text-dark-text-secondary" />
              ) : (
                <Menu size={20} className="text-gray-700 dark:text-dark-text-secondary" />
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
        <div className="lg:hidden border-t border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-bg-secondary">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = currentModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200',
                    isActive
                      ? 'bg-ninho-100 dark:bg-dark-bg-elevated text-ninho-700 dark:text-dark-accent-ninho'
                      : 'text-gray-700 dark:text-dark-text-secondary hover:bg-ninho-50 dark:hover:bg-dark-bg-hover'
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
