import { motion } from 'framer-motion';
import { Calendar, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';

import { AvatarWithPresence } from '@/components/common/OnlineStatusBadge';
import { RoleBadge } from '@/components/common/RoleBadge';
import WeatherWidget from '@/components/common/WeatherWidget';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { resolveUserAvatar } from '@/constants/koboyoAvatars';
import { getIconComponent } from '@/lib/nestIcons';
import { cn } from '@/lib/utils';
import type { NestMember } from '@/schemas/nest';
import type { AppUserNest } from '@/types';

interface DashboardHeaderV2Props {
  userName?: string;
  currentUserId?: string;
  activeNest?: AppUserNest | null;
  members?: NestMember[];
  pendingTasksCount?: number;
  showWeather?: boolean;
  weatherCity?: string;
  weatherDescription?: string;
  weatherTemperatureLabel?: string;
  weatherConditionCode?: string | null;
  weatherTemperature?: number | null;
  isWeatherLoading?: boolean;
  isWeatherError?: boolean;
  isRealtimeConnected?: boolean;
  onRefreshWeather?: () => void;
  onWeatherEnable?: () => void;
  weatherOnboardingKey?: number;
  onRefreshDashboard?: () => void;
  isRefreshingDashboard?: boolean;
  className?: string;
}

export function DashboardHeaderV2({
  userName = 'Família',
  currentUserId,
  activeNest,
  members = [],
  pendingTasksCount = 0,
  showWeather = false,
  weatherCity = 'São Paulo',
  weatherDescription = 'Tempo indisponível',
  weatherTemperatureLabel = '--',
  weatherConditionCode = null,
  weatherTemperature = null,
  isWeatherLoading = false,
  isWeatherError = false,
  isRealtimeConnected = false,
  onRefreshWeather,
  onWeatherEnable,
  weatherOnboardingKey,
  onRefreshDashboard,
  isRefreshingDashboard = false,
  className,
}: DashboardHeaderV2Props) {
  // Saudação contextual baseada no horário
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Bom dia', icon: '☀️' };
    if (hour >= 12 && hour < 18) return { text: 'Boa tarde', icon: '🌤️' };
    return { text: 'Boa noite', icon: '🌙' };
  }, []);

  // Data formatada completa em português: ex "Quarta-Feira, 9 de Setembro"
  const formattedDate = useMemo(() => {
    const now = new Date();
    const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(now);
    const day = now.getDate();
    const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(now);
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${capitalizedWeekday}, ${day} de ${capitalizedMonth}`;
  }, []);

  const NestIcon = activeNest ? getIconComponent(activeNest.icon) : null;

  return (
    <div className={cn('flex w-full flex-col gap-4 sm:gap-6', className)}>
      {/* Top Meta Bar: Data Atual, Moradores, Ninho Ativo & Status Realtime */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Data Atual por extenso */}
          <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-semibold text-foreground shadow-xs backdrop-blur-xs">
            <Calendar size={13} className="text-primary" />
            <span>{formattedDate}</span>
          </div>

          {/* Moradores do Ninho (Avatares sobrepostos com usuário logado à frente) */}
          {members && members.length > 0 && (() => {
            const sortedMembers = currentUserId
              ? [...members.filter((m) => m.userId === currentUserId), ...members.filter((m) => m.userId !== currentUserId)]
              : members;
            const visibleMembers = sortedMembers.slice(0, 4);
            const extraCount = Math.max(0, sortedMembers.length - 4);

            return (
              <div
                className="flex items-center -space-x-1.5 pl-1"
                title={`${members.length} moradores no ninho`}
              >
                {visibleMembers.map((m, idx) => {
                  const initials = m.name
                    ? m.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : '👤';
                  const avatarSrc = resolveUserAvatar(m.photoUrl, m.avatarSlug);
                  const isCurrentUser = Boolean(currentUserId && m.userId === currentUserId);
                  const statusSuffix = m.isOnline ? ' (Online)' : '';
                  const zIndex = (visibleMembers.length - idx) * 10;

                  return (
                    <AvatarWithPresence
                      key={m.userId}
                      isOnline={m.isOnline}
                      badgeSize="xs"
                      badgeClassName="right-0 -bottom-0.5 ring-2 ring-background"
                      style={{ zIndex }}
                      className="transition-transform hover:scale-110 hover:!z-50"
                    >
                      <Avatar
                        title={`${m.name}${statusSuffix}${isCurrentUser ? ' (Você)' : ''}`}
                        className={cn(
                          'size-6 rounded-full border border-background bg-white shadow-xs',
                          isCurrentUser && 'ring-1.5 ring-primary/50'
                        )}
                      >
                        {avatarSrc && (
                          <AvatarImage
                            src={avatarSrc}
                            alt={m.name}
                            className="size-full object-contain filter contrast-125 dark:brightness-105"
                          />
                        )}
                        <AvatarFallback className="bg-primary/20 text-[9px] font-bold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </AvatarWithPresence>
                  );
                })}
                {extraCount > 0 && (
                  <div
                    title={`+${extraCount} outros moradores`}
                    className="flex size-6 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground ring-2 ring-background shadow-xs"
                  >
                    +{extraCount}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Ninho Ativo */}
          {activeNest && (
            <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-semibold text-foreground shadow-xs backdrop-blur-xs">
              {NestIcon && <NestIcon className="size-3.5 text-primary" />}
              <span>{activeNest.name}</span>
              <RoleBadge role={activeNest.role} className="h-4 px-1.5 text-[9px] py-0 ml-1" />
            </div>
          )}

          {/* Indicador Realtime */}
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors',
              isRealtimeConnected
                ? 'bg-chart-2/10 text-chart-2 border border-chart-2/20'
                : 'bg-muted text-muted-foreground/80'
            )}
            title={isRealtimeConnected ? 'Conectado em tempo real' : 'Modo padrão'}
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                isRealtimeConnected ? 'bg-chart-2 animate-pulse' : 'bg-muted-foreground/40'
              )}
            />
            <span>{isRealtimeConnected ? 'Ao vivo' : 'Sincronizado'}</span>
          </div>
        </div>

        {/* Botão Atualizar */}
        {onRefreshDashboard && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 rounded-full border-border/70 bg-card px-3 text-xs font-medium text-muted-foreground shadow-xs transition-all hover:bg-muted/60 hover:text-foreground active:scale-95"
            onClick={onRefreshDashboard}
            disabled={isRefreshingDashboard}
            title="Atualizar dados do dashboard"
            aria-label="Atualizar dashboard"
          >
            <RefreshCw
              className={cn('size-3.5', isRefreshingDashboard && 'animate-spin text-primary')}
            />
            <span>{isRefreshingDashboard ? 'Atualizando...' : 'Atualizar'}</span>
          </Button>
        )}
      </div>

      {/* Hero Greeting Row com Ícone 3D Oficial & Weather Widget */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4">
          {/* Ícone 3D Soft Clay Oficial do Ninho */}
          <div className="relative flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50/40 p-1.5 shadow-sm dark:border-amber-900/40 dark:from-amber-950/30 dark:to-orange-950/20">
            <img
              src="/icons/clay-optimized/nest_eggs.webp"
              alt="Ninho"
              className="size-full object-contain transition-transform duration-300 hover:scale-105"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.08))' }}
              loading="eager"
            />
            <span
              className={cn(
                'absolute -bottom-1 -right-1 size-3.5 rounded-full ring-2 ring-background',
                isRealtimeConnected ? 'bg-emerald-500' : 'bg-chart-2'
              )}
              title={isRealtimeConnected ? 'Sincronizado' : 'Conectado'}
            />
          </div>

          <div className="flex flex-col gap-1">
            <motion.h1
              className="font-editorial font-extrabold leading-tight tracking-tight text-foreground flex flex-wrap items-center gap-2"
              style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.5rem)', letterSpacing: '-0.02em' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            >
              <span>
                {greeting.text},{' '}
                <span className="inline-block max-w-[280px] sm:max-w-[340px] truncate align-bottom text-primary">
                  {userName}
                </span>
              </span>
              <span className="text-xl sm:text-2xl" aria-hidden="true">
                {greeting.icon}
              </span>
            </motion.h1>

            <p className="font-ui text-xs sm:text-sm text-muted-foreground">
              {pendingTasksCount > 0 ? (
                <span>
                  Você tem{' '}
                  <strong className="font-semibold text-foreground tabular-nums">
                    {pendingTasksCount}
                  </strong>{' '}
                  {pendingTasksCount === 1 ? 'tarefa pendente' : 'tarefas pendentes'} para hoje no
                  seu Ninho.
                </span>
              ) : (
                <span>Tudo em ordem por aqui hoje! Aproveite o seu dia. ✨</span>
              )}
            </p>
          </div>
        </div>

        {/* Weather card */}
        <div className="shrink-0">
          {showWeather ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
            >
              <WeatherWidget
                mode="display"
                city={weatherCity}
                description={weatherDescription}
                temperatureLabel={weatherTemperatureLabel}
                conditionCode={weatherConditionCode}
                temperature={weatherTemperature}
                isLoading={isWeatherLoading}
                isError={isWeatherError}
                onRefresh={onRefreshWeather}
              />
            </motion.div>
          ) : onWeatherEnable ? (
            <motion.div
              key={weatherOnboardingKey}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
            >
              <WeatherWidget mode="onboarding" onEnable={onWeatherEnable} />
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
