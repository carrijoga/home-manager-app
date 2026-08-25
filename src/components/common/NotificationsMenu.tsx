import { motion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

import type { BellIconHandle } from '@/components/ui/animated-icons/bell';
import { BellIcon } from '@/components/ui/animated-icons/bell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: 'task' | 'notice' | 'reminder';
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

const TYPE_COLORS: Record<Notification['type'], string> = {
  task: 'bg-[color-mix(in_srgb,var(--chart-2)_15%,transparent)] text-[var(--chart-2)]',
  notice: 'bg-primary/20 text-primary',
  reminder: 'bg-[color-mix(in_srgb,var(--chart-4)_15%,transparent)] text-[var(--chart-4)]',
};

const TYPE_ICONS: Record<Notification['type'], string> = {
  task: '✓',
  notice: '📌',
  reminder: '⏰',
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
      className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="Notificações"
      onMouseEnter={() => bellRef.current?.startAnimation()}
      onMouseLeave={() => bellRef.current?.stopAnimation()}
    >
      <BellIcon ref={bellRef} size={20} />

      {hasUnread && (
        <motion.span
          className="absolute right-2 top-2 size-2 rounded-full bg-secondary"
          aria-hidden="true"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.5 }}
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

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-BR');
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

      <DropdownMenuContent align="end" className="w-80 overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Notificações</span>
          {unreadCount > 0 && onMarkAllAsRead && (
            <button
              onClick={onMarkAllAsRead}
              className="font-semibold uppercase tracking-wide text-primary hover:underline"
              style={{ fontSize: 'var(--text-xs)' }}
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
                  'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                  'hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none',
                  !notification.read && 'bg-accent/40'
                )}
                onClick={() => onNotificationClick?.(notification.id)}
              >
                {/* Icon circle */}
                <div
                  className={cn(
                    'flex size-9 flex-shrink-0 items-center justify-center rounded-full text-base',
                    TYPE_COLORS[notification.type]
                  )}
                >
                  {TYPE_ICONS[notification.type]}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-snug text-foreground">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>

                {/* Unread dot */}
                {!notification.read && (
                  <div className="mt-1.5 size-2 flex-shrink-0 rounded-full bg-primary" />
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
