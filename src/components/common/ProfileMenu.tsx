import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToastNotifications } from "@/hooks/use-toast-notifications";
import { cn } from "@/lib/utils";
import type { User } from "@/types";
import {
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  User as UserIcon,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface ProfileMenuProps {
  user: User;
  currentTheme?: "light" | "dark" | "system";
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

/**
 * Componente de menu de perfil do usuário com dropdown
 */
const ProfileMenu: React.FC<ProfileMenuProps> = ({
  user,
  currentTheme = "system",
  onThemeChange,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
}) => {
  const { enableSound, disableSound, isSoundEnabled } = useToastNotifications();
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setSoundEnabled(isSoundEnabled());
  }, [isSoundEnabled]);

  const handleToggleSound = () => {
    if (soundEnabled) {
      disableSound();
      setSoundEnabled(false);
    } else {
      enableSound();
      setSoundEnabled(true);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const themeOptions = [
    { value: "light" as const, label: "Claro", icon: Sun },
    { value: "dark" as const, label: "Escuro", icon: Moon },
    { value: "system" as const, label: "Sistema", icon: Monitor },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 p-1 rounded-lg transition-all duration-200",
            "hover:bg-indigo-50 dark:hover:bg-dark-bg-hover",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-dark-accent-indigo"
          )}
          aria-label="Menu do usuário"
        >
          <Avatar className="h-8 w-8 border-2 border-indigo-200 dark:border-dark-border-default">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-indigo-600 dark:bg-dark-accent-indigo text-white text-xs">
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

        <DropdownMenuItem
          onClick={handleToggleSound}
          className="cursor-pointer dark:hover:bg-dark-bg-hover dark:focus:bg-dark-bg-hover dark:text-dark-text-secondary"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Sons Ativos</span>
            </>
          ) : (
            <>
              <VolumeX className="mr-2 h-4 w-4" />
              <span>Sons Desativados</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer dark:hover:bg-dark-bg-hover dark:focus:bg-dark-bg-hover dark:text-dark-text-secondary">
            {themeOptions.find((t) => t.value === currentTheme)?.icon &&
              React.createElement(
                themeOptions.find((t) => t.value === currentTheme)!.icon,
                { className: "mr-2 h-4 w-4" }
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
                    "cursor-pointer dark:hover:bg-dark-bg-hover dark:focus:bg-dark-bg-hover dark:text-dark-text-secondary",
                    currentTheme === option.value &&
                      "bg-indigo-50 dark:bg-dark-bg-secondary"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{option.label}</span>
                  {currentTheme === option.value && (
                    <span className="ml-auto text-indigo-600 dark:text-dark-accent-indigo">
                      ✓
                    </span>
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
