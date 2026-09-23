import { BellOff, CheckCheck, Maximize2, Sparkles, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import EmptyState from '@/components/common/EmptyState';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { useNotifications } from '@/contexts/NotificationContext';
import { useIsMobile } from '@/hooks/use-mobile';
import type { NotificationModule } from '@/types';

import { NotificationCardTile } from './NotificationCardTile';
import { NotificationFilterBar, type NotificationStatusFilter } from './NotificationFilterBar';

interface NotificationCenterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationCenterSheet({ open, onOpenChange }: NotificationCenterSheetProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    executeAction,
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<NotificationStatusFilter>('all');
  const [moduleFilter, setModuleFilter] = useState<'all' | NotificationModule>('all');

  // Cálculos de Contagens
  const counts = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const actions = notifications.filter((n) => n.actions && n.actions.length > 0).length;
    const files = notifications.filter((n) => n.attachments && n.attachments.length > 0).length;

    const byModule: Record<NotificationModule, number> = {
      financial: 0,
      shopping: 0,
      tasks: 0,
      calendar: 0,
      system: 0,
    };

    notifications.forEach((n) => {
      const mod = n.module ?? 'system';
      if (byModule[mod] !== undefined) {
        byModule[mod]++;
      }
    });

    return { total, unread, actions, files, byModule };
  }, [notifications]);

  // Lista Filtrada
  const filteredNotifications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return notifications.filter((item) => {
      // Filtro de Texto
      if (term) {
        const titleMatch = item.title.toLowerCase().includes(term);
        const msgMatch = item.message.toLowerCase().includes(term);
        const authorMatch = item.author?.name?.toLowerCase().includes(term);
        if (!titleMatch && !msgMatch && !authorMatch) return false;
      }

      // Filtro de Status
      if (statusFilter === 'unread' && item.isRead) return false;
      if (statusFilter === 'actions' && (!item.actions || item.actions.length === 0)) return false;
      if (statusFilter === 'files' && (!item.attachments || item.attachments.length === 0)) return false;

      // Filtro de Módulo
      if (moduleFilter !== 'all') {
        const itemMod = item.module ?? 'system';
        if (itemMod !== moduleFilter) return false;
      }

      return true;
    });
  }, [notifications, searchTerm, statusFilter, moduleFilter]);

  const handleToggleRead = (id: string) => {
    const item = notifications.find((n) => n.notificationId === id);
    if (!item) return;
    if (!item.isRead) {
      markAsRead(id);
    }
  };

  const handleExpandToPage = () => {
    onOpenChange(false);
    navigate('/notifications');
  };

  const handleClearRead = () => {
    const readIds = notifications.filter((n) => n.isRead).map((n) => n.notificationId);
    readIds.forEach((id) => clearNotification(id));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={
          isMobile
            ? 'h-[94dvh] max-h-[94dvh] flex flex-col p-0 rounded-t-3xl border-t border-border/80 bg-background overflow-hidden'
            : 'w-full sm:max-w-2xl md:w-[640px] flex flex-col p-0 border-l border-border/80 bg-background overflow-hidden shadow-modal'
        }
      >
        {isMobile && (
          <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0" aria-hidden />
        )}

        {/* ── CABEÇALHO PADRONIZADO DA CENTRAL ── */}
        <div className="flex flex-col gap-3 px-6 pt-5 pb-4 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-2.5">
              <SheetTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Central de Notificações
              </SheetTitle>
              {counts.unread > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span>{counts.unread} não lida{counts.unread !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Ação de Expandir para Tela Cheia */}
            <button
              type="button"
              onClick={handleExpandToPage}
              className="flex items-center gap-1 rounded-xl border border-border/60 bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer shadow-2xs"
              title="Abrir em página cheia"
            >
              <Maximize2 size={13} />
              <span className="hidden sm:inline">Tela cheia</span>
            </button>
          </div>

          <SheetDescription className="text-xs sm:text-sm text-muted-foreground">
            Acompanhe avisos, tarefas, faturas e arquivos compartilhados no seu Ninho.
          </SheetDescription>

          {/* Ações em Lote */}
          <div className="flex items-center gap-2 pt-1">
            {counts.unread > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer shadow-2xs"
              >
                <CheckCheck size={13} className="text-primary" />
                <span>Marcar todas como lidas</span>
              </button>
            )}

            {notifications.some((n) => n.isRead) && (
              <button
                type="button"
                onClick={handleClearRead}
                className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all cursor-pointer shadow-2xs"
              >
                <Trash2 size={13} />
                <span>Limpar lidas</span>
              </button>
            )}
          </div>
        </div>

        {/* ── BARRA DE FILTRO (DIRETO APÓS O CABEÇALHO) ── */}
        <div className="px-6 pt-4 pb-2 shrink-0 border-b border-border/40 bg-background/90 backdrop-blur-xs">
          <NotificationFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            moduleFilter={moduleFilter}
            onModuleFilterChange={setModuleFilter}
            counts={counts}
          />
        </div>

        {/* ── LISTA DE CARDS DE NOTIFICAÇÃO ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={statusFilter === 'unread' ? Sparkles : BellOff}
                title={
                  statusFilter === 'unread'
                    ? 'Nenhuma notificação não lida'
                    : searchTerm
                    ? 'Nenhuma notificação encontrada'
                    : 'Tudo limpo por aqui!'
                }
                description={
                  searchTerm
                    ? `Nenhum aviso encontrado para "${searchTerm}". Tente outros termos.`
                    : 'Você não possui notificações correspondentes ao filtro atual.'
                }
              />
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCardTile
                key={notification.notificationId}
                notification={notification}
                onMarkAsRead={markAsRead}
                onToggleRead={handleToggleRead}
                onDelete={clearNotification}
                onActionClick={executeAction}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
