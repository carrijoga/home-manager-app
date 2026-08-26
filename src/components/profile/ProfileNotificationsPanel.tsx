import {
  BellRing,
  CheckCircle2,
  HelpCircle,
  Info,
  ShieldAlert,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge, Button, Separator } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import {
  getNotificationPreferences,
  NOTIFICATION_PREFERENCES_UPDATED_EVENT,
  saveNotificationPreferences,
} from '@/lib/notificationPreferences';
import { cn } from '@/lib/utils';

type NotificationTypeId = 0 | 1 | 2 | 3;
type NotificationPreferenceKey = 'info' | 'warning' | 'error' | 'success';

const TYPE_CONFIG: Record<
  NotificationTypeId,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    accent: string;
    background: string;
  }
> = {
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
  const { showSuccess, showError, showWarning, showInfo, isSoundEnabled, enableSound, disableSound } =
    useToastNotifications();

  const [soundActive, setSoundActive] = useState(() => isSoundEnabled());
  const rawNotifications = user?.notifications;
  const notifications = useMemo(() => rawNotifications ?? [], [rawNotifications]);
  const [showGuidance, setShowGuidance] = useState(false);
  const [preferences, setPreferences] = useState(() => getNotificationPreferences());

  useEffect(() => {
    const syncPreferences = () => setPreferences(getNotificationPreferences());
    window.addEventListener(NOTIFICATION_PREFERENCES_UPDATED_EVENT, syncPreferences);
    return () =>
      window.removeEventListener(NOTIFICATION_PREFERENCES_UPDATED_EVENT, syncPreferences);
  }, []);

  const toggleSound = () => {
    if (soundActive) {
      disableSound();
      setSoundActive(false);
    } else {
      enableSound();
      setSoundActive(true);
      showSuccess('Efeitos sonoros ativados!');
    }
  };

  const grouped = useMemo(() => {
    const typePreferenceKey: Record<NotificationTypeId, NotificationPreferenceKey> = {
      0: 'info',
      1: 'warning',
      2: 'error',
      3: 'success',
    };
    return [0, 1, 2, 3].map((type) => {
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
    });
  }, [notifications, preferences]);

  const totalNotifications = notifications.length;
  const totalUnread = notifications.filter((notification) => !notification.isRead).length;
  const totalEnabled = notifications.filter((notification) => notification.isEnabled).length;
  const totalDisabled = Math.max(0, totalNotifications - totalEnabled);
  const maxCount = Math.max(...grouped.map((group) => group.totalCount), 1);

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="rounded-3xl border border-border/50 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--secondary)_8%,var(--card))_100%)] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => setShowGuidance((value) => !value)}
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-card text-foreground transition-transform hover:scale-[1.03]"
            aria-label="Abrir ajuda rápida sobre notificações"
          >
            <HelpCircle className="size-6" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
              Alertas & Preferências
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Controle como o Ninho te avisa</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ative ou silencie categorias de alerta, configure os sons de notificação e faça testes em tempo real.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowGuidance((value) => !value)}
            className="shrink-0 rounded-xl"
          >
            {showGuidance ? 'Ocultar' : 'Ver'} detalhes
          </Button>
        </div>

        {showGuidance && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-card/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">1. Escolha</p>
              <p className="mt-2 text-sm text-foreground">
                Veja todos os tipos de alerta em cartões separados.
              </p>
            </div>
            <div className="rounded-2xl border bg-card/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">2. Ajuste</p>
              <p className="mt-2 text-sm text-foreground">
                Use o botão em cada cartão para receber ou silenciar.
              </p>
            </div>
            <div className="rounded-2xl border bg-card/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">3. Som & Testes</p>
              <p className="mt-2 text-sm text-foreground">
                Ligue o som das notificações ou teste alertas em tempo real.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cartões de Resumo Rápidos */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile
          label="Total Registradas"
          value={String(totalNotifications)}
          hint="histórico de notificações"
        />
        <SummaryTile
          label="Não Lidas"
          value={String(totalUnread)}
          hint="precisam de atenção"
          tone="warning"
        />
        <SummaryTile
          label="Categorias Ativas"
          value={String(totalEnabled)}
          hint={`${totalDisabled} silenciosas`}
          tone="success"
        />
      </div>

      {/* Seção Som & Notificações de Teste */}
      <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {soundActive ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Sons de Alerta</h3>
              <p className="text-xs text-muted-foreground">
                {soundActive ? 'Efeitos sonoros ativos para toasts e avisos' : 'Sons desativados'}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant={soundActive ? 'default' : 'outline'}
            size="sm"
            onClick={toggleSound}
            className="rounded-xl gap-2"
          >
            {soundActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {soundActive ? 'Som Ativado' : 'Ativar Som'}
          </Button>
        </div>

        <Separator className="my-4" />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-primary" /> Testar Notificações em Tempo Real
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl text-xs border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              onClick={() => showSuccess('Operação realizada com sucesso!')}
            >
              Sucesso
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl text-xs border-blue-500/30 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400"
              onClick={() => showInfo('Você possui 2 novas atualizações no ninho.')}
            >
              Informativo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl text-xs border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
              onClick={() => showWarning('Atenção: uma tarefa vence hoje às 18h.')}
            >
              Aviso
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl text-xs border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
              onClick={() => showError('Falha ao conectar com o servidor.')}
            >
              Erro
            </Button>
          </div>
        </div>
      </div>

      {/* Grid de Categorias */}
      <div className="space-y-4 rounded-2xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Distribuição por Tipo</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Cada cor representa um tipo de notificação no sistema.
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
                className="h-full transition-all duration-300"
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
                className="rounded-2xl p-4 transition-all"
                style={{ background: config.background }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-card">
                      <Icon className="size-5" style={{ color: config.accent }} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold">{config.label}</h4>
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
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(group.totalCount / Math.max(totalNotifications, 1)) * 100}%`,
                        background: config.accent,
                      }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                    {isReceiving ? 'Recebendo' : 'Silenciado'}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border bg-card/70 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">Receber este tipo</p>
                    <p className="text-xs text-muted-foreground">
                      {isReceiving
                        ? 'Você verá esse tipo de aviso no app.'
                        : 'Esse tipo fica oculto até você reativar.'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isReceiving ? 'default' : 'outline'}
                    className={cn('rounded-2xl', !isReceiving && 'border-dashed')}
                    onClick={() =>
                      saveNotificationPreferences({ [group.key]: !isReceiving } as Partial<
                        Record<NotificationPreferenceKey, boolean>
                      >)
                    }
                    style={
                      isReceiving ? undefined : { borderColor: config.accent, color: config.accent }
                    }
                  >
                    {isReceiving ? 'Ativo' : 'Ativar'}
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  {latestItems.length > 0 ? (
                    latestItems.map((notification) => (
                      <div
                        key={notification.notificationId}
                        className="flex items-start gap-2 rounded-xl bg-card/70 px-3 py-2"
                      >
                        <span
                          className="mt-1 size-2 shrink-0 rounded-full"
                          style={{
                            background: notification.isRead
                              ? 'var(--muted-foreground)'
                              : config.accent,
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{notification.title}</p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed px-3 py-4 text-xs text-muted-foreground text-center">
                      Nenhuma notificação deste tipo ainda.
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
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
    tone === 'warning'
      ? 'var(--secondary)'
      : tone === 'success'
        ? 'var(--chart-2)'
        : 'var(--foreground)';

  return (
    <div className={cn('rounded-2xl border p-4 shadow-xs', toneStyles[tone])}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight" style={{ color: valueColor }}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
