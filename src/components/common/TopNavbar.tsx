import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProfileModal } from "@/components/modals/ProfileModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import * as authService from "@/services/authService";

import type { Notification } from "./NotificationsMenu";
import NotificationsMenu from "./NotificationsMenu";
import ProfileMenu from "./ProfileMenu";

interface SearchBarProps {
  className?: string;
}

function NavSearchBar({ className }: SearchBarProps) {
  const [active, setActive] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Atalho Ctrl/Cmd + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setActive(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={cn("relative h-10 w-[220px] sm:w-[416px] max-w-full", className)}>
      {/* Ícone de lupa */}
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-[length:var(--dur-fast)]"
        style={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}
      />

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        aria-label="Buscar no Ninho"
        placeholder="Buscar no Ninho… ⌘K"
        className={cn(
          "w-full h-full pl-11 pr-4 rounded-full text-sm font-normal text-foreground placeholder:text-muted-foreground outline-none transition-all duration-[length:var(--dur-fast)]",
          "bg-card",
          active
            ? "border border-primary/50 shadow-[0px_0px_15px_0px_color-mix(in_srgb,var(--primary)_15%,transparent)]"
            : "border border-border shadow-none"
        )}
      />
    </div>
  );
}

const TYPE_MAP: Record<number, Notification["type"]> = {
  0: "notice",
  1: "notice",
  2: "reminder",
  3: "task",
};

/**
 * TopNavbar — barra de navegação superior fixa.
 *
 * Contém: SidebarTrigger (mobile) | SearchBar (⌘K) | Sino de notificações | Menu do usuário
 * Fundo: color-mix(background 80%) + backdrop-blur para sensação de profundidade
 */
export function TopNavbar({ className }: { className?: string }) {
  const { user, notifications, markAllAsRead } = useApp();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!user) return null;

  const menuNotifications: Notification[] = notifications.map((n) => ({
    id: n.notificationId,
    type: TYPE_MAP[n.type] ?? "notice",
    title: n.title,
    message: n.message,
    timestamp: new Date(),
    read: n.isRead,
  }));

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-3 w-full",
        "border-b border-border",
        "text-foreground",
        className
      )}
      style={{
        background: "color-mix(in srgb, var(--background) 80%, transparent)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Esquerda: trigger da sidebar (mobile) + search */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <NavSearchBar className="hidden sm:block" />
      </div>

      {/* Direita: sino + perfil */}
      <div className="flex items-center gap-3">
        <NotificationsMenu
          notifications={menuNotifications}
          onMarkAllAsRead={markAllAsRead}
        />
        <ProfileMenu
          user={user}
          currentTheme={theme}
          onThemeChange={setTheme}
          onProfileClick={() => setProfileOpen(true)}
          onSettingsClick={() => setSettingsOpen(true)}
          onLogoutClick={handleLogout}
        />
        <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </header>
  );
}

export default TopNavbar;
