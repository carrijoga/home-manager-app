import {
  Calendar,
  Check,
  CheckCheck,
  CheckSquare,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Megaphone,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import React from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n';
import { cn } from '@/lib/utils';
import type { AppNotification, NotificationAction, NotificationAttachment, NotificationModule } from '@/types';

interface NotificationCardTileProps {
  notification: AppNotification;
  onMarkAsRead?: (id: string) => void;
  onToggleRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onActionClick?: (notificationId: string, action: NotificationAction) => void;
}

const MODULE_CONFIG: Record<
  NotificationModule,
  {
    label: string;
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  financial: {
    label: 'Financeiro',
    icon: CreditCard,
    bgClass: 'bg-amber-500/15 dark:bg-amber-500/25',
    textClass: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300',
  },
  shopping: {
    label: 'Compras',
    icon: ShoppingBag,
    bgClass: 'bg-emerald-500/15 dark:bg-emerald-500/25',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
  },
  tasks: {
    label: 'Tarefas',
    icon: CheckSquare,
    bgClass: 'bg-blue-500/15 dark:bg-blue-500/25',
    textClass: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20',
    badgeText: 'text-blue-700 dark:text-blue-300',
  },
  calendar: {
    label: 'Calendário',
    icon: Calendar,
    bgClass: 'bg-sky-500/15 dark:bg-sky-500/25',
    textClass: 'text-sky-600 dark:text-sky-400',
    badgeBg: 'bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/20',
    badgeText: 'text-sky-700 dark:text-sky-300',
  },
  system: {
    label: 'Mural & Sistema',
    icon: Megaphone,
    bgClass: 'bg-purple-500/15 dark:bg-purple-500/25',
    textClass: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/20',
    badgeText: 'text-purple-700 dark:text-purple-300',
  },
};

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
  return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function NotificationCardTile({
  notification,
  onMarkAsRead,
  onToggleRead,
  onDelete,
  onActionClick,
}: NotificationCardTileProps) {
  const { t, language } = useTranslation();
  const mod = notification.module ?? 'system';
  const config = MODULE_CONFIG[mod] ?? MODULE_CONFIG.system;
  const IconComponent = config.icon;

  const isUnread = !notification.isRead;

  const handleAttachmentClick = (attachment: NotificationAttachment, e: React.MouseEvent) => {
    e.stopPropagation();
    if (attachment.url && attachment.url !== '#') {
      window.open(attachment.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl p-4 transition-all duration-150',
        isUnread
          ? 'border-2 border-primary/50 bg-card shadow-xs hover:border-primary/70 hover:shadow-md'
          : 'border border-border/70 bg-card/60 opacity-80 hover:opacity-100 hover:border-border shadow-subtle'
      )}
    >
      {/* ── TOPO: SQUIRCLE + METADADOS + TIMESTAMP + UNREAD DOT ── */}
      <div className="flex items-start gap-3.5">
        {/* Squircle com ícone do módulo */}
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-transform group-hover:scale-105',
            config.bgClass,
            config.textClass
          )}
        >
          <IconComponent size={20} strokeWidth={2.2} />
        </div>

        {/* Informações centrais */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  config.badgeBg,
                  config.badgeText
                )}
              >
                {config.label}
              </span>
              <h4 className="truncate text-sm font-bold text-foreground">
                {notification.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-medium text-muted-foreground">
                {formatTimestamp(notification.createdAt, t, language)}
              </span>
              {isUnread && (
                <span
                  className="h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card animate-pulse shrink-0"
                  title="Não lida"
                />
              )}
            </div>
          </div>

          {/* Mensagem textual */}
          <p className="mt-1 text-xs sm:text-sm text-foreground/90 font-normal leading-relaxed">
            {notification.message}
          </p>

          {/* Autor (se houver) */}
          {notification.author?.name && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Por <span className="font-semibold text-foreground/80">{notification.author.name}</span>
            </p>
          )}

          {/* ── BLOCO DE ANEXOS (SE HOUVER) ── */}
          {notification.attachments && notification.attachments.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {notification.attachments.map((att) => {
                const isPdf = att.fileType === 'pdf' || att.name.endsWith('.pdf');
                const isImg = att.fileType === 'image' || att.name.match(/\.(jpg|jpeg|png|webp|gif)$/i);

                return (
                  <div
                    key={att.id}
                    onClick={(e) => handleAttachmentClick(att, e)}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl border border-border/70 bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer group/att"
                    title={`Abrir ${att.name}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold',
                          isPdf
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                            : isImg
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        )}
                      >
                        {isPdf ? (
                          'PDF'
                        ) : isImg ? (
                          <ImageIcon size={14} />
                        ) : (
                          <FileText size={14} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground group-hover/att:text-primary transition-colors">
                          {att.name}
                        </p>
                        {att.size && (
                          <span className="text-[10px] text-muted-foreground">{att.size}</span>
                        )}
                      </div>
                    </div>

                    <span className="text-muted-foreground group-hover/att:text-primary p-1">
                      {att.url && att.url !== '#' ? <ExternalLink size={13} /> : <Download size={13} />}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── LINHA DE BOTÕES DE AÇÃO (SE HOUVER) ── */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
            <div className="flex flex-wrap items-center gap-2">
              {notification.actions &&
                notification.actions.map((act) => {
                  const isPrimary = act.variant === 'primary' || !act.variant;
                  const isDestructive = act.variant === 'destructive';

                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => onActionClick?.(notification.notificationId, act)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs transition-all active:scale-95 cursor-pointer',
                        isPrimary
                          ? 'bg-primary text-primary-foreground font-bold shadow-2xs hover:opacity-90'
                          : isDestructive
                          ? 'border border-destructive/30 bg-destructive/10 text-destructive font-semibold hover:bg-destructive/20'
                          : 'border border-border/70 bg-card text-foreground font-semibold hover:bg-muted'
                      )}
                    >
                      {act.actionType === 'complete_task' && <Check size={13} />}
                      {act.actionType === 'navigate' && <ExternalLink size={12} />}
                      <span>{act.label}</span>
                    </button>
                  );
                })}
            </div>

            {/* Ações Rápidas de Gerenciamento do Card */}
            <div className="flex items-center gap-1 ml-auto">
              {(onToggleRead || onMarkAsRead) && (
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleRead) onToggleRead(notification.notificationId);
                    else onMarkAsRead?.(notification.notificationId);
                  }}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title={isUnread ? 'Marcar como lida' : 'Marcar como não lida'}
                >
                  {isUnread ? <Check size={14} /> : <CheckCheck size={14} className="text-primary" />}
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(notification.notificationId)}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                  title="Excluir notificação"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
