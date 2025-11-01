import React from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Notification {
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

/**
 * Componente de menu de notificações com dropdown
 */
const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  notifications = [],
  onNotificationClick,
  onMarkAllAsRead,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task':
        return '✓';
      case 'notice':
        return '📌';
      case 'reminder':
        return '⏰';
      default:
        return '•';
    }
  };

  const formatTimestamp = (date: Date) => {
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
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'relative p-2 rounded-lg transition-all duration-200',
            'hover:bg-ninho-50 dark:hover:bg-dark-bg-hover',
            'focus:outline-none focus:ring-2 focus:ring-ninho-500 dark:focus:ring-dark-accent-ninho'
          )}
          aria-label="Notificações"
        >
          <Bell
            size={20}
            className="text-ninho-700 dark:text-dark-text-secondary"
          />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-red-500 dark:bg-red-600"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto bg-white dark:bg-dark-bg-elevated border-gray-200 dark:border-dark-border-default"
      >
        <DropdownMenuLabel className="flex items-center justify-between dark:text-dark-text-primary">
          <span>Notificações</span>
          {unreadCount > 0 && onMarkAllAsRead && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-ninho-600 dark:text-dark-accent-ninho hover:underline font-normal"
            >
              Marcar todas como lidas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:bg-dark-border-subtle" />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-dark-text-muted">
            Nenhuma notificação
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                'flex flex-col items-start gap-1 p-3 cursor-pointer',
                'dark:hover:bg-dark-bg-hover dark:focus:bg-dark-bg-hover',
                !notification.read && 'bg-ninho-50 dark:bg-dark-bg-secondary'
              )}
              onClick={() => onNotificationClick?.(notification.id)}
            >
              <div className="flex items-start gap-2 w-full">
                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-dark-text-secondary line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-1">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-ninho-600 dark:bg-dark-accent-ninho flex-shrink-0 mt-1" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;
