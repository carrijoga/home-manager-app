import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";

import type { BellIconHandle } from "@/components/ui/animated-icons/bell";
import { BellIcon } from "@/components/ui/animated-icons/bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  type: "task" | "notice" | "reminder";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsMenuProps {
  notifications?: Notification[];
  onNotificationClick?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
}

const TYPE_COLORS: Record<Notification["type"], string> = {
  task: "bg-[color-mix(in_srgb,var(--chart-2)_15%,transparent)] text-[var(--chart-2)]",
  notice: "bg-primary/20 text-primary",
  reminder: "bg-[color-mix(in_srgb,var(--chart-4)_15%,transparent)] text-[var(--chart-4)]",
};

const TYPE_ICONS: Record<Notification["type"], string> = {
  task: "✓",
  notice: "📌",
  reminder: "⏰",
};

function BellTrigger({ hasUnread }: { hasUnread: boolean }) {
  const bellRef = useRef<BellIconHandle>(null);

  useEffect(() => {
    if (!hasUnread) return;
    const t = setTimeout(() => {
      bellRef.current?.startAnimation();
    }, 800);
    return () => clearTimeout(t);
  }, [hasUnread]);

  return (
    <button
      className="relative flex items-center justify-center size-10 rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="Notificações"
    >
      <BellIcon ref={bellRef} size={20} />

      {hasUnread && (
        <motion.span
          className="absolute top-2 right-2 size-2 rounded-full bg-secondary"
          aria-hidden="true"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.5 }}
        />
      )}
    </button>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString("pt-BR");
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  notifications = [],
  onNotificationClick,
  onMarkAllAsRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span>
          <BellTrigger hasUnread={unreadCount > 0} />
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-semibold text-sm text-foreground">Notificações</span>
          {unreadCount > 0 && onMarkAllAsRead && (
            <button
              onClick={onMarkAllAsRead}
              className="font-semibold uppercase tracking-wide text-primary hover:underline"
            style={{ fontSize: "var(--text-xs)" }}
            >
              Marcar tudo como lido
            </button>
          )}
        </div>

        <DropdownMenuSeparator className="my-0" />

        {/* Notification list */}
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Não há novas notificações
          </div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                  "hover:bg-muted/60 focus-visible:outline-none focus-visible:bg-muted/60",
                  !notification.read && "bg-accent/40"
                )}
                onClick={() => onNotificationClick?.(notification.id)}
              >
                {/* Icon circle */}
                <div
                  className={cn(
                    "flex-shrink-0 size-9 rounded-full flex items-center justify-center text-base",
                    TYPE_COLORS[notification.type]
                  )}
                >
                  {TYPE_ICONS[notification.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground leading-snug truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>

                {/* Unread dot */}
                {!notification.read && (
                  <div className="flex-shrink-0 size-2 rounded-full bg-primary mt-1.5" />
                )}
              </button>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;
