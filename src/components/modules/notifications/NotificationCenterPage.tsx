import { CheckCheck, Sparkles, Trash2, BellOff } from 'lucide-react';
import { useMemo, useState } from 'react';

import EmptyState from '@/components/common/EmptyState';
import { FinancialPageHeader } from '@/components/modules/financial/shared/FinancialPageHeader';
import { useNotifications } from '@/contexts/NotificationContext';
import type { NotificationModule } from '@/types';

import { NotificationCardTile } from './NotificationCardTile';
import { NotificationFilterBar, type NotificationStatusFilter } from './NotificationFilterBar';

export function NotificationCenterPage() {
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
      if (term) {
        const titleMatch = item.title.toLowerCase().includes(term);
        const msgMatch = item.message.toLowerCase().includes(term);
        const authorMatch = item.author?.name?.toLowerCase().includes(term);
        if (!titleMatch && !msgMatch && !authorMatch) return false;
      }

      if (statusFilter === 'unread' && item.isRead) return false;
      if (statusFilter === 'actions' && (!item.actions || item.actions.length === 0)) return false;
      if (statusFilter === 'files' && (!item.attachments || item.attachments.length === 0)) return false;

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

  const handleClearRead = () => {
    const readIds = notifications.filter((n) => n.isRead).map((n) => n.notificationId);
    readIds.forEach((id) => clearNotification(id));
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col gap-5 overflow-x-hidden animate-in fade-in duration-200">
      {/* ── 1. CABEÇALHO PADRONIZADO (FINANCIALPAGEHEADER) ── */}
      <FinancialPageHeader
        title="Central de Notificações"
        description="Histórico completo de avisos, tarefas, faturas e arquivos compartilhados no seu Ninho."
        badgeLabel={counts.unread > 0 ? `${counts.unread} Não Lidas` : undefined}
        badgeDotColor="bg-primary"
        actions={
          <div className="flex items-center gap-2">
            {counts.unread > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer shadow-2xs"
              >
                <CheckCheck size={14} className="text-primary" />
                <span>Marcar todas como lidas</span>
              </button>
            )}

            {notifications.some((n) => n.isRead) && (
              <button
                type="button"
                onClick={handleClearRead}
                className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all cursor-pointer shadow-2xs"
              >
                <Trash2 size={14} />
                <span>Limpar lidas</span>
              </button>
            )}
          </div>
        }
      />

      {/* ── 2. PAINEL PRINCIPAL COM FILTROS E LISTA (INICIANDO DIRETAMENTE PELOS FILTROS) ── */}
      <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-7 shadow-sm flex flex-col gap-5">
        <NotificationFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          moduleFilter={moduleFilter}
          onModuleFilterChange={setModuleFilter}
          counts={counts}
        />

        {/* Lista de Notificações */}
        <div className="flex flex-col gap-3 pt-2">
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
      </div>
    </div>
  );
}

export default NotificationCenterPage;
