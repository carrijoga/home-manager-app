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
import type { AppUser } from "@/types";

interface ProfileMenuProps {
  user: AppUser;
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
            "flex items-center gap-2 p-1 rounded-lg transition-all duration-[length:var(--dur-base)]",
            "hover:bg-accent",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
          aria-label="Menu do usuário"
        >
          <Avatar className="h-8 w-8 border-2 border-primary/30">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onProfileClick}
          className="cursor-pointer"
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onSettingsClick}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleToggleSound}
          className="cursor-pointer"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="mr-2 h-4 w-4 text-primary" />
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
          <DropdownMenuSubTrigger className="cursor-pointer">
            {themeOptions.find((t) => t.value === currentTheme)?.icon &&
              React.createElement(
                themeOptions.find((t) => t.value === currentTheme)!.icon,
                { className: "mr-2 h-4 w-4" }
              )}
            <span>Alterar Tema</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onThemeChange?.(option.value)}
                  className={cn(
                    "cursor-pointer",
                    currentTheme === option.value && "bg-accent"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{option.label}</span>
                  {currentTheme === option.value && (
                    <span className="ml-auto text-primary">
                      ✓
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogoutClick}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
