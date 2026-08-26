import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BellOff,
  Check,
  CheckCircle2,
  CheckCheck,
  Clock,
  Info,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';

import type { BellIconHandle } from '@/components/ui/animated-icons/bell';
import { BellIcon } from '@/components/ui/animated-icons/bell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface NotificationItem {
  id: string;
  type: 'task' | 'notice' | 'reminder' | 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
}

export type Notification = NotificationItem;

export interface NotificationsMenuProps {
  notifications?: NotificationItem[] | any[];
  onNotificationClick?: (notificationId: string) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearNotification?: (notificationId: string) => void;
  onClearAll?: () => void;
}

type TabType = 'all' | 'unread' | 'alerts';

// Mapeamento de esteticas por tipo
const TYPE_CONFIG: Record<
  NotificationItem['type'],
  {
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
    badgeBg: string;
  }
> = {
  task: {
    icon: CheckCircle2,
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500',
  },
  success: {
    icon: CheckCircle2,
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500',
  },
  notice: {
    icon: Info,
    bgClass: 'bg-primary/10 text-primary',
    textClass: 'text-primary',
    badgeBg: 'bg-primary',
  },
  info: {
    icon: Info,
    bgClass: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    textClass: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-500',
  },
  reminder: {
    icon: Clock,
    bgClass: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
    textClass: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
    textClass: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500',
  },
  error: {
    icon: XCircle,
    bgClass: 'bg-destructive/10 text-destructive',
    textClass: 'text-destructive',
    badgeBg: 'bg-destructive',
  },
};

function BellTrigger({ unreadCount }: { unreadCount: number }) {
  const bellRef = useRef<BellIconHandle>(null);

  return (
    <button
      className="relative flex size-10 items-center justify-center rounded-full transition-all hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Notificações ${unreadCount > 0 ? `(${unreadCount} não lidas)` : ''}`}
      onMouseEnter={() => bellRef.current?.startAnimation()}
      onMouseLeave={() => bellRef.current?.stopAnimation()}
    >
      <BellIcon ref={bellRef} size={20} />

      {unreadCount > 0 && (
        <motion.span
          key={unreadCount}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground shadow-md ring-2 ring-background"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.span>
      )}
    </button>
  );
}

function formatTimestamp(dateValue?: Date | string): string {
  if (!dateValue) return 'Agora';
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(date.getTime())) return 'Agora';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora há pouco';
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours} h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** Normaliza lista de notificações vinda do AppContext ou props simples */
function normalizeNotifications(rawList: any[]): NotificationItem[] {
  return rawList.map((item) => {
    // Trata AppNotification (type: 0=info, 1=warning, 2=error, 3=success)
    let itemType: NotificationItem['type'] = 'notice';
    if (typeof item.type === 'number') {
      const typeMap: Record<number, NotificationItem['type']> = {
        0: 'info',
        1: 'warning',
        2: 'error',
        3: 'success',
      };
      itemType = typeMap[item.type] ?? 'info';
    } else if (typeof item.type === 'string') {
      itemType = item.type as NotificationItem['type'];
    }

    return {
      id: item.id || item.notificationId || Math.random().toString(),
      type: itemType,
      title: item.title || 'Notificação',
      message: item.message || '',
      timestamp: item.timestamp || item.createdAt || new Date(),
      read: item.read ?? item.isRead ?? false,
    };
  });
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotification,
  onClearAll,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const normalizedList = useMemo(
    () => normalizeNotifications(notifications),
    [notifications]
  );

  const unreadCount = useMemo(
    () => normalizedList.filter((n) => !n.read).length,
    [normalizedList]
  );

  const filteredList = useMemo(() => {
    if (activeTab === 'unread') {
      return normalizedList.filter((n) => !n.read);
    }
    if (activeTab === 'alerts') {
      return normalizedList.filter(
        (n) => n.type === 'warning' || n.type === 'error' || n.type === 'task'
      );
    }
    return normalizedList;
  }, [normalizedList, activeTab]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span>
          <BellTrigger unreadCount={unreadCount} />
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-border/60 bg-popover p-0 shadow-xl backdrop-blur-xl sm:w-[400px]"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-3.5 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-foreground">
              Notificações
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {unreadCount} novas
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                title="Marcar todas como lidas"
              >
                <CheckCheck size={14} />
                <span className="hidden sm:inline">Lidas</span>
              </button>
            )}

            {normalizedList.length > 0 && onClearAll && (
              <button
                type="button"
                onClick={onClearAll}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Limpar todas as notificações"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            )}
          </div>
        </div>

        {/* Abas de Filtro */}
        <div className="flex border-b border-border/40 bg-muted/10 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-xs font-medium transition-all',
              activeTab === 'all'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Todas ({normalizedList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-xs font-medium transition-all',
              activeTab === 'unread'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Não lidas ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-xs font-medium transition-all',
              activeTab === 'alerts'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Alertas
          </button>
        </div>

        {/* Lista de Notificações com Animação */}
        <div className="max-h-[380px] overflow-y-auto p-1.5">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
                {activeTab === 'unread' ? <Sparkles size={24} /> : <BellOff size={24} />}
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                {activeTab === 'unread'
                  ? 'Você está em dia!'
                  : 'Nenhuma notificação por aqui'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[220px]">
                {activeTab === 'unread'
                  ? 'Todas as suas notificações foram lidas.'
                  : 'Quando novos alertas surgirem, eles aparecerão nesta lista.'}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredList.map((notification) => {
                const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.notice;
                const IconComponent = config.icon;

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'group relative flex items-start gap-3 rounded-xl p-3 text-left transition-all',
                      notification.read
                        ? 'hover:bg-muted/50 opacity-75 hover:opacity-100'
                        : 'bg-muted/30 hover:bg-muted/60'
                    )}
                  >
                    {/* Ícone com circulo colorido */}
                    <div
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                        config.bgClass
                      )}
                    >
                      <IconComponent size={18} />
                    </div>

                    {/* Conteúdo textual */}
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => onNotificationClick?.(notification.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            'truncate text-sm leading-snug',
                            notification.read ? 'font-medium text-foreground/80' : 'font-semibold text-foreground'
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="size-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>

                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {notification.message}
                      </p>

                      <p className="mt-1.5 text-[11px] font-medium text-muted-foreground/70">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>

                    {/* Ações individuais ao passar o mouse ou em foco */}
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {!notification.read && (onMarkAsRead || onMarkAllAsRead) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead
                              ? onMarkAsRead(notification.id)
                              : onNotificationClick?.(notification.id);
                          }}
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          title="Marcar como lida"
                        >
                          <Check size={14} />
                        </button>
                      )}

                      {(onClearNotification || onClearAll) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClearNotification?.(notification.id);
                          }}
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Excluir notificação"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;
