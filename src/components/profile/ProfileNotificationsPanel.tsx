import { Badge, Button, Separator } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import {
  BellRing,
  CheckCircle2,
  HelpCircle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  getNotificationPreferences,
  NOTIFICATION_PREFERENCES_UPDATED_EVENT,
  saveNotificationPreferences,
} from '@/lib/notificationPreferences';

type NotificationTypeId = 0 | 1 | 2 | 3;

type NotificationPreferenceKey = 'info' | 'warning' | 'error' | 'success';

const TYPE_CONFIG: Record<NotificationTypeId, {
  label: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  background: string;
}> = {
  0: {
    label: 'Informativa',
    description: 'Mensagens gerais e avisos neutros.',
    icon: Info,
    accent: 'var(--primary)',
    background: 'color-mix(in srgb, var(--primary) 10%, var(--card))',
  },
  1: {
    label: 'Aviso',
    description: 'Alertas que pedem atenção.',
    icon: BellRing,
    accent: 'var(--secondary)',
    background: 'color-mix(in srgb, var(--secondary) 10%, var(--card))',
  },
  2: {
    label: 'Erro',
    description: 'Problemas ou falhas importantes.',
    icon: ShieldAlert,
    accent: 'var(--destructive)',
    background: 'color-mix(in srgb, var(--destructive) 10%, var(--card))',
  },
  3: {
    label: 'Sucesso',
    description: 'Confirmações e eventos concluídos.',
    icon: CheckCircle2,
    accent: 'var(--chart-2)',
    background: 'color-mix(in srgb, var(--chart-2) 10%, var(--card))',
  },
};

export function ProfileNotificationsPanel() {
  const { user } = useApp();
  const notifications = user?.notifications ?? [];
  const [showGuidance, setShowGuidance] = useState(false);
  const [preferences, setPreferences] = useState(() => getNotificationPreferences());

  useEffect(() => {
    const syncPreferences = () => setPreferences(getNotificationPreferences());

    window.addEventListener(NOTIFICATION_PREFERENCES_UPDATED_EVENT, syncPreferences);
    return () => window.removeEventListener(NOTIFICATION_PREFERENCES_UPDATED_EVENT, syncPreferences);
  }, []);

  const typePreferenceKey: Record<NotificationTypeId, NotificationPreferenceKey> = {
    0: 'info',
    1: 'warning',
    2: 'error',
    3: 'success',
  };

  const grouped = useMemo(() => [0, 1, 2, 3].map((type) => {
    const items = notifications.filter((notification) => notification.type === type);
    const unreadCount = items.filter((notification) => !notification.isRead).length;
    const enabledCount = items.filter((notification) => notification.isEnabled).length;
    const key = typePreferenceKey[type as NotificationTypeId];

    return {
      type: type as NotificationTypeId,
      key,
      preferenceEnabled: preferences[key],
      items,
      unreadCount,
      enabledCount,
      totalCount: items.length,
    };
  }), [notifications, preferences]);

  const totalNotifications = notifications.length;
  const totalUnread = notifications.filter((notification) => !notification.isRead).length;
  const totalEnabled = notifications.filter((notification) => notification.isEnabled).length;
  const totalDisabled = Math.max(0, totalNotifications - totalEnabled);

  const maxCount = Math.max(...grouped.map((group) => group.totalCount), 1);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border p-5 sm:p-6 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--secondary)_8%,var(--card))_100%)]">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => setShowGuidance((value) => !value)}
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-transform hover:scale-[1.03]"
            aria-label="Abrir ajuda rápida sobre notificações"
          >
            <HelpCircle className="size-6" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">Leitura rápida</p>
            <h2 className="mt-1 text-lg font-semibold">Controle como o Ninho te avisa</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ative ou silencie cada tipo de notificação com um toque. A visão abaixo mostra o volume e o estado atual de cada categoria.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowGuidance((value) => !value)}
            className="shrink-0 rounded-2xl"
          >
            {showGuidance ? 'Ocultar' : 'Ver'} detalhes
          </Button>
        </div>

        {showGuidance && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-card/70 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">1. Escolha</p>
              <p className="mt-2 text-sm text-foreground">Veja todos os tipos de alerta em cartões separados.</p>
            </div>
            <div className="rounded-2xl border bg-card/70 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">2. Ajuste</p>
              <p className="mt-2 text-sm text-foreground">Use o botão em cada cartão para receber ou silenciar.</p>
            </div>
            <div className="rounded-2xl border bg-card/70 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">3. Revise</p>
              <p className="mt-2 text-sm text-foreground">O resumo rápido mostra o que está ativo e o que ainda precisa atenção.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile label="Total" value={String(totalNotifications)} hint="notificações registradas" />
        <SummaryTile label="Não lidas" value={String(totalUnread)} hint="ainda precisam de atenção" tone="warning" />
        <SummaryTile label="Ativas" value={String(totalEnabled)} hint={`${totalDisabled} desativadas`} tone="success" />
      </div>

      <div className="rounded-2xl border p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Distribuição por tipo</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Cada cor representa um tipo de notificação.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((type) => {
              const config = TYPE_CONFIG[type as NotificationTypeId];
              return (
                <Badge key={type} variant="secondary" className="gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: config.accent }} />
                  {config.label}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {grouped.map((group) => {
            const config = TYPE_CONFIG[group.type];
            const width = `${(group.totalCount / maxCount) * 100}%`;
            return (
              <div
                key={group.type}
                className="h-full transition-all duration-[length:var(--dur-base)]"
                style={{ width, background: config.accent }}
                title={`${config.label}: ${group.totalCount}`}
              />
            );
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {grouped.map((group) => {
            const config = TYPE_CONFIG[group.type];
            const Icon = config.icon;
            const latestItems = group.items.slice(0, 2);
            const isReceiving = group.preferenceEnabled;

            return (
              <section
                key={group.type}
                className="rounded-2xl p-4"
                style={{ background: config.background }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card border border-border">
                      <Icon className="size-5" style={{ color: config.accent }} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm">{config.label}</h4>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold leading-none">{group.totalCount}</p>
                    <p className="text-xs text-muted-foreground">{group.unreadCount} não lidas</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-card/80">
                    <div
                      className="h-full rounded-full transition-all duration-[length:var(--dur-base)]"
                      style={{ width: `${(group.totalCount / Math.max(totalNotifications, 1)) * 100}%`, background: config.accent }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {isReceiving ? 'Recebendo' : 'Silenciado'}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border bg-card/70 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">Receber este tipo</p>
                    <p className="text-xs text-muted-foreground">
                      {isReceiving ? 'Você verá esse tipo de aviso no app.' : 'Esse tipo fica oculto até você reativar.'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isReceiving ? 'default' : 'outline'}
                    className={cn('rounded-2xl', !isReceiving && 'border-dashed')}
                    onClick={() => saveNotificationPreferences({ [group.key]: !isReceiving } as Partial<Record<NotificationPreferenceKey, boolean>>)}
                    style={isReceiving ? undefined : { borderColor: config.accent, color: config.accent }}
                  >
                    {isReceiving ? 'Ativo' : 'Ativar'}
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  {latestItems.length > 0 ? latestItems.map((notification) => (
                    <div key={notification.notificationId} className="flex items-start gap-2 rounded-xl bg-card/70 px-3 py-2">
                      <span className="mt-1 size-2 rounded-full shrink-0" style={{ background: notification.isRead ? 'var(--muted-foreground)' : config.accent }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-dashed px-3 py-4 text-sm text-muted-foreground">
                      Nenhuma notificação deste tipo ainda.
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="rounded-2xl border p-4 bg-card/60">
        <h3 className="text-sm font-semibold">Leitura rápida</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          O banner no topo resume como as notificações funcionam e os cartões mostram o estado de cada tipo sem exigir uma lista longa de opções.
        </p>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'warning' | 'success';
}) {
  const toneStyles = {
    default: 'bg-card border-border',
    warning: 'bg-card border-border',
    success: 'bg-card border-border',
  };

  const valueColor =
    tone === 'warning' ? 'var(--secondary)' : tone === 'success' ? 'var(--chart-2)' : 'var(--foreground)';

  return (
    <div className={cn('rounded-2xl border p-4', toneStyles[tone])}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold" style={{ color: valueColor }}>{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}