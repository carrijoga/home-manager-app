import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Banknote,
  BellOff,
  CheckSquare,
  Heart,
  Info,
  ShoppingCart,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { BellIconHandle } from '@/components/ui/animated-icons/bell';
import { BellIcon } from '@/components/ui/animated-icons/bell';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n';
import { cn } from '@/lib/utils';
import type { NotificationModule } from '@/types';

export interface NotificationItem {
  id: string;
  type: 'task' | 'notice' | 'reminder' | 'info' | 'warning' | 'error' | 'success';
  module?: NotificationModule;
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
  onOpenCenter?: () => void;
}

type TabType = 'all' | 'unread' | 'alerts';

// Mapeamento visual harmônico para cada categoria/módulo (estilo Soft Glass)
function getNotificationVisual(item: NotificationItem) {
  const titleLower = (item.title || '').toLowerCase();
  const msgLower = (item.message || '').toLowerCase();

  // 1. Compras (Shopping)
  if (
    item.module === 'shopping' ||
    titleLower.includes('compra') ||
    titleLower.includes('mercado') ||
    titleLower.includes('item na lista') ||
    msgLower.includes('lista de compras')
  ) {
    return {
      icon: ShoppingCart,
      bgClass: 'bg-rose-500/10 dark:bg-rose-500/15',
      borderClass: 'border-rose-500/20',
      textClass: 'text-rose-600 dark:text-rose-400',
    };
  }

  // 2. Mural / Recados / Reações
  if (
    (item.module === 'system' && (titleLower.includes('mural') || titleLower.includes('recado') || titleLower.includes('reagiu'))) ||
    titleLower.includes('reagiu') ||
    titleLower.includes('recado') ||
    titleLower.includes('mural')
  ) {
    return {
      icon: Heart,
      bgClass: 'bg-pink-500/10 dark:bg-pink-500/15',
      borderClass: 'border-pink-500/20',
      textClass: 'text-pink-600 dark:text-pink-400',
    };
  }

  // 3. Financeiro
  if (
    item.module === 'financial' ||
    titleLower.includes('pagamento') ||
    titleLower.includes('fatura') ||
    titleLower.includes('conta de luz') ||
    titleLower.includes('despesa') ||
    titleLower.includes('aluguel') ||
    titleLower.includes('vencendo') ||
    msgLower.includes('despesa')
  ) {
    return {
      icon: Banknote,
      bgClass: 'bg-amber-500/10 dark:bg-amber-500/15',
      borderClass: 'border-amber-500/20',
      textClass: 'text-amber-600 dark:text-amber-400',
    };
  }

  // 4. Tarefas
  if (
    item.module === 'tasks' ||
    item.type === 'task' ||
    titleLower.includes('tarefa') ||
    titleLower.includes('limpeza') ||
    msgLower.includes('tarefa')
  ) {
    return {
      icon: CheckSquare,
      bgClass: 'bg-sky-500/10 dark:bg-sky-500/15',
      borderClass: 'border-sky-500/20',
      textClass: 'text-sky-600 dark:text-sky-400',
    };
  }

  // 5. Avisos / Erros
  if (item.type === 'error' || titleLower.includes('atrasad') || titleLower.includes('falha')) {
    return {
      icon: XCircle,
      bgClass: 'bg-destructive/10 dark:bg-destructive/15',
      borderClass: 'border-destructive/20',
      textClass: 'text-destructive',
    };
  }

  if (item.type === 'warning' || titleLower.includes('alerta') || titleLower.includes('atenção')) {
    return {
      icon: AlertTriangle,
      bgClass: 'bg-amber-500/10 dark:bg-amber-500/15',
      borderClass: 'border-amber-500/20',
      textClass: 'text-amber-600 dark:text-amber-400',
    };
  }

  return {
    icon: Info,
    bgClass: 'bg-primary/10 dark:bg-primary/15',
    borderClass: 'border-primary/20',
    textClass: 'text-primary',
  };
}

interface BellTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  unreadCount: number;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const BellTrigger = React.forwardRef<HTMLButtonElement, BellTriggerProps>(
  ({ unreadCount, t, className, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const bellRef = useRef<BellIconHandle>(null);

    // Quando há notificações não lidas, balança o sino após montar e periodicamente
    useEffect(() => {
      if (unreadCount > 0) {
        const timeout = setTimeout(() => {
          bellRef.current?.startAnimation();
        }, 500);
        const interval = setInterval(() => {
          bellRef.current?.startAnimation();
        }, 8000);
        return () => {
          clearTimeout(timeout);
          clearInterval(interval);
        };
      }
    }, [unreadCount]);

    const ariaLabel =
      unreadCount > 0
        ? `${t('notifications.title')} ${t('notifications.unreadCount', { count: unreadCount })}`
        : t('notifications.title');

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'relative flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background/60 text-muted-foreground transition-all hover:bg-accent/60 hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
        aria-label={ariaLabel}
        onMouseEnter={(e) => {
          bellRef.current?.startAnimation();
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          bellRef.current?.stopAnimation();
          onMouseLeave?.(e);
        }}
        {...props}
      >
        <BellIcon ref={bellRef} size={18} />

        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground shadow-md ring-2 ring-background pointer-events-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>
    );
  }
);
BellTrigger.displayName = 'BellTrigger';

function formatTimestamp(
  dateValue: Date | string | undefined,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
  locale: string
): string {
  if (!dateValue) return t('notifications.timeJustNow');
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(date.getTime())) return t('notifications.timeJustNow');

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('notifications.timeJustNow');
  if (diffMins < 60) return t('notifications.timeMinutesAgo', { mins: diffMins });
  if (diffHours < 24) return t('notifications.timeHoursAgo', { hours: diffHours });
  if (diffDays === 1) return t('notifications.timeYesterday');
  if (diffDays < 7) return t('notifications.timeDaysAgo', { days: diffDays });
  return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
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
      module: item.module,
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
  onOpenCenter,
}) => {
  const { t, language } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const normalizedList = useMemo(
    () => normalizeNotifications(notifications),
    [notifications]
  );

  const unreadCount = useMemo(
    () => normalizedList.filter((n) => !n.read).length,
    [normalizedList]
  );

  const alertsCount = useMemo(
    () =>
      normalizedList.filter(
        (n) => n.type === 'warning' || n.type === 'error'
      ).length,
    [normalizedList]
  );

  const filteredList = useMemo(() => {
    if (activeTab === 'unread') {
      return normalizedList.filter((n) => !n.read);
    }
    if (activeTab === 'alerts') {
      return normalizedList.filter(
        (n) => n.type === 'warning' || n.type === 'error'
      );
    }
    return normalizedList;
  }, [normalizedList, activeTab]);

  // Exibe no máximo as 4 últimas notificações no dropdown (como no design de referência)
  const previewList = useMemo(() => filteredList.slice(0, 4), [filteredList]);

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'all', label: t('notifications.all'), count: normalizedList.length },
    { id: 'unread', label: t('notifications.unread'), count: unreadCount },
    { id: 'alerts', label: t('notifications.alerts'), count: alertsCount > 0 ? alertsCount : undefined },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <BellTrigger unreadCount={unreadCount} t={t} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="relative w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-3xl border border-white/30 dark:border-white/20 bg-white/75 dark:bg-[#141312]/60 text-popover-foreground shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_0_rgba(255,255,255,0.45),inset_0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-2xl backdrop-saturate-200 p-0 sm:w-[400px]"
      >
        {/* Camada de brilho e reflexo especular de vidro (Glass Sheen) */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.14] via-white/[0.02] to-black/[0.1] dark:from-white/[0.09] dark:via-transparent dark:to-black/[0.2]"
          aria-hidden
        />

        {/* Cabeçalho Glassmorphic */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2.5 border-b border-white/15 dark:border-white/10 bg-white/[0.03] dark:bg-white/[0.02]">
          <span className="text-base font-bold tracking-tight text-foreground font-display">
            {t('notifications.title')}
          </span>

          {unreadCount > 0 && onMarkAllAsRead ? (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-[10px] font-bold tracking-wider text-muted-foreground/80 hover:text-foreground uppercase transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-white/10 active:scale-95"
            >
              {t('notifications.markAllAsRead') || 'MARCAR TODAS COMO LIDAS'}
            </button>
          ) : (
            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
              Tudo em dia
            </span>
          )}
        </div>

        {/* Abas com Segmented Control Glassmorphism e Indicador Deslizante Suave */}
        <div className="relative z-10 mx-4 my-2.5 flex rounded-2xl bg-black/20 dark:bg-black/35 p-1 border border-white/15 dark:border-white/10 backdrop-blur-md">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors duration-200 outline-none select-none text-center cursor-pointer',
                  isActive
                    ? 'text-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground/80'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNotificationTabPill"
                    className="absolute inset-0 rounded-xl bg-white/30 dark:bg-white/[0.16] shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.4)] border border-white/30 dark:border-white/20 backdrop-blur-md"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums',
                        isActive
                          ? 'bg-white/30 dark:bg-white/20 text-foreground'
                          : 'bg-white/10 text-muted-foreground'
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Lista de Notificações com Animação Fluida Cross-Fade (Zero Trava) */}
        <div className="relative z-10 max-h-[380px] overflow-y-auto px-2 py-1 scrollbar-thin">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="space-y-1"
            >
              {previewList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 dark:bg-white/[0.05] border border-white/20 dark:border-white/10 text-muted-foreground backdrop-blur-md">
                    {activeTab === 'unread' ? <Sparkles size={22} /> : <BellOff size={22} />}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {activeTab === 'unread'
                      ? t('notifications.emptyUnreadTitle')
                      : activeTab === 'alerts'
                      ? t('notifications.emptyAlertsTitle')
                      : t('notifications.emptyTitle')}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[220px]">
                    {t('notifications.emptySubtitle')}
                  </p>
                </div>
              ) : (
                previewList.map((notification) => {
                  const visual = getNotificationVisual(notification);
                  const IconComponent = visual.icon;

                  return (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (!notification.read && onMarkAsRead) {
                          onMarkAsRead(notification.id);
                        }
                        onNotificationClick?.(notification.id);
                      }}
                      className={cn(
                        'group relative flex items-start gap-3.5 px-3.5 py-3 transition-all duration-150 cursor-pointer select-none rounded-2xl border',
                        notification.read
                          ? 'border-transparent hover:bg-white/10 dark:hover:bg-white/[0.06] opacity-75 hover:opacity-100'
                          : 'bg-white/10 dark:bg-white/[0.04] border-white/20 dark:border-white/[0.08] hover:bg-white/15 dark:hover:bg-white/[0.08] hover:border-white/30 dark:hover:border-white/20'
                      )}
                    >
                      {/* Ícone Squircle com Glassmorphism Translúcido */}
                      <div
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-2xl border shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-transform duration-200 group-hover:scale-105 backdrop-blur-md',
                          visual.bgClass,
                          visual.borderClass
                        )}
                      >
                        <IconComponent size={18} className={visual.textClass} />
                      </div>

                      {/* Textos: Título + Mensagem (opcional) + Tempo (Sem nenhum espaço em branco fantasma na lateral) */}
                      <div className="min-w-0 flex-1 pt-0.5 pr-2">
                        <p
                          className={cn(
                            'text-sm leading-snug tracking-tight line-clamp-2',
                            notification.read
                              ? 'font-medium text-foreground/80'
                              : 'font-semibold text-foreground'
                          )}
                        >
                          {notification.title}
                        </p>

                        {notification.message &&
                          notification.message.trim() !== notification.title.trim() && (
                            <p className="mt-0.5 text-xs text-muted-foreground/70 line-clamp-1">
                              {notification.message}
                            </p>
                          )}

                        <p className="mt-1 text-[11px] font-medium text-muted-foreground/60 tabular-nums">
                          {formatTimestamp(notification.timestamp, t, language)}
                        </p>
                      </div>

                      {/* Indicador de Não Lida (Bolinha Azul com Glow) e Ação de Descarte no Hover */}
                      <div className="flex shrink-0 items-center justify-center pt-2">
                        {!notification.read && (
                          <span
                            className="size-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_2px_rgba(59,130,246,0.9)] transition-opacity duration-150 group-hover:opacity-0"
                            aria-label="Não lida"
                          />
                        )}

                        {(onClearNotification || onClearAll) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearNotification?.(notification.id);
                            }}
                            className="absolute right-3.5 top-3 flex size-6 items-center justify-center rounded-lg text-muted-foreground/50 opacity-0 transition-all duration-150 hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto cursor-pointer"
                            title={t('common.delete')}
                            aria-label={t('common.delete')}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Rodapé Glassmorphism ("Ver histórico completo") */}
        {onOpenCenter && (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenCenter();
            }}
            className="relative z-10 flex w-full items-center justify-center gap-1.5 border-t border-white/15 dark:border-white/10 bg-white/[0.05] dark:bg-white/[0.03] hover:bg-white/[0.12] dark:hover:bg-white/[0.08] py-3 text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer rounded-b-3xl select-none backdrop-blur-md"
          >
            <span>Ver histórico completo</span>
          </button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;
