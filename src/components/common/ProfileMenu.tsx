import React from 'react';
import { User as UserIcon, Settings, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

interface ProfileMenuProps {
  user: User;
  currentTheme?: 'light' | 'dark' | 'system';
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

/**
 * Componente de menu de perfil do usuário com dropdown
 */
const ProfileMenu: React.FC<ProfileMenuProps> = ({
  user,
  currentTheme = 'system',
  onThemeChange,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Claro', icon: Sun },
    { value: 'dark' as const, label: 'Escuro', icon: Moon },
    { value: 'system' as const, label: 'Sistema', icon: Monitor },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 p-1 rounded-lg transition-all duration-200',
            'hover:bg-ninho-50 dark:hover:bg-dark-bg-hover',
            'focus:outline-none focus:ring-2 focus:ring-ninho-500 dark:focus:ring-dark-accent-ninho'
          )}
          aria-label="Menu do usuário"
        >
          <Avatar className="h-8 w-8 border-2 border-ninho-200 dark:border-dark-border-default">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-ninho-600 dark:bg-dark-accent-ninho text-white text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white dark:bg-dark-bg-elevated border-gray-200 dark:border-dark-border-default"
      >
        <DropdownMenuLabel className="dark:text-dark-text-primary">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-gray-500 dark:text-dark-text-muted">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:bg-dark-border-subtle" />

        <DropdownMenuItem
          onClick={onProfileClick}
          className="cursor-pointer dark:hover:bg-dark-bg-hover dark:focus:bg-dark-bg-hover dark:text-dark-text-secondary"
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onSettingsClick}
          className="cursor-pointer dark:hover:bg-dark-bg-hover dark:focus:bg-dark-bg-hover dark:text-dark-text-secondary"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer dark:hover:bg-dark-bg-hover dark:focus:bg-dark-bg-hover dark:text-dark-text-secondary">
            {themeOptions.find(t => t.value === currentTheme)?.icon && (
              React.createElement(
                themeOptions.find(t => t.value === currentTheme)!.icon,
                { className: 'mr-2 h-4 w-4' }
              )
            )}
            <span>Alterar Tema</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-white dark:bg-dark-bg-elevated border-gray-200 dark:border-dark-border-default">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onThemeChange?.(option.value)}
                  className={cn(
                    'cursor-pointer dark:hover:bg-dark-bg-hover dark:focus:bg-dark-bg-hover dark:text-dark-text-secondary',
                    currentTheme === option.value && 'bg-ninho-50 dark:bg-dark-bg-secondary'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{option.label}</span>
                  {currentTheme === option.value && (
                    <span className="ml-auto text-ninho-600 dark:text-dark-accent-ninho">✓</span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="dark:bg-dark-border-subtle" />

        <DropdownMenuItem
          onClick={onLogoutClick}
          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 dark:hover:bg-dark-bg-hover dark:focus:bg-dark-bg-hover"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
