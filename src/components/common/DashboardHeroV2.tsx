import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useMemo } from 'react';

import { AvatarWithPresence } from '@/components/common/OnlineStatusBadge';
import { RoleBadge } from '@/components/common/RoleBadge';
import WeatherWidget from '@/components/common/WeatherWidget';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { isKoboyoAvatar, resolveUserAvatar } from '@/constants/koboyoAvatars';
import { useTranslation } from '@/hooks/useTranslation';
import { getIconComponent } from '@/lib/nestIcons';
import { cn } from '@/lib/utils';
import type { NestMember } from '@/schemas/nest';
import type { AppUserNest } from '@/types';
import { getDailyGreetingKey } from '@/utils/greetings';

interface DashboardHeroV2Props {
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
  onRefreshWeather?: () => void;
  onWeatherEnable?: () => void;
  weatherOnboardingKey?: number;
  onRefreshDashboard?: () => void;
  isRefreshingDashboard?: boolean;
  className?: string;
}

/**
 * DashboardHeroV2 — Card hero compacto do bento grid (dashboard-v2).
 * Uma única linha: saudação + ninho + membros à esquerda, clima à direita.
 */
export function DashboardHeroV2({
  userName = 'Silva',
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
  onRefreshWeather,
  onWeatherEnable,
  weatherOnboardingKey,
  onRefreshDashboard,
  isRefreshingDashboard = false,
  className,
}: DashboardHeroV2Props) {
  const { t } = useTranslation();
  const greeting = t(useMemo(() => getDailyGreetingKey(), []));
  const NestIcon = activeNest ? getIconComponent(activeNest.icon) : null;

  const sortedMembers = useMemo(() => {
    if (!members || members.length === 0) return [];
    if (!currentUserId) return members;
    const current = members.filter((m) => m.userId === currentUserId);
    const others = members.filter((m) => m.userId !== currentUserId);
    return [...current, ...others];
  }, [members, currentUserId]);

  const visibleMembers = sortedMembers.slice(0, 3);
  const extraMembersCount = Math.max(0, sortedMembers.length - 3);

  return (
    <div
      className={cn(
        'relative flex h-full items-center justify-between gap-4 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-5',
        className
      )}
    >
      {/* Ícone clay decorativo de fundo */}
      <motion.img
        src="/icons/clay-optimized/home.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-5 size-24 select-none object-contain opacity-90 drop-shadow-xl md:size-28"
        initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
        animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      />

      <div className="relative flex min-w-0 flex-1 flex-col gap-1.5">
        <motion.h1
          className="font-editorial truncate whitespace-nowrap font-extrabold leading-none tracking-tight text-foreground"
          style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.25rem)', letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          {greeting} {userName}.
        </motion.h1>

        <div className="flex items-center gap-2 overflow-hidden">
          {activeNest && (
            <span className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/90 px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-2xs backdrop-blur-xs">
              {NestIcon && <NestIcon className="size-3 text-primary" />}
              <span className="max-w-[100px] truncate">{activeNest.name}</span>
              <RoleBadge role={activeNest.role} className="ml-0.5 h-3.5 px-1.5 py-0 text-[8px]" />
            </span>
          )}

          {pendingTasksCount > 0 && (
            <span
              className="font-ui rounded-full border border-primary/20 bg-card px-2.5 py-0.5 font-semibold uppercase tracking-[1px] text-primary"
              style={{ fontSize: '10px' }}
            >
              {pendingTasksCount} {pendingTasksCount === 1 ? 'tarefa pendente' : 'tarefas pendentes'}
            </span>
          )}

          {sortedMembers.length > 0 && (
            <div className="flex items-center -space-x-1.5">
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
                const isKoboyo = isKoboyoAvatar(m.photoUrl, m.avatarSlug) || isKoboyoAvatar(avatarSrc);
                const isCurrentUser = Boolean(currentUserId && m.userId === currentUserId);
                const zIndex = (visibleMembers.length - idx) * 10;

                return (
                  <Popover key={m.userId}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Ver perfil de ${m.name}${isCurrentUser ? ' (Você)' : ''}${m.isOnline ? ' - Online agora' : ''}`}
                        style={{ zIndex }}
                        className="group relative cursor-pointer rounded-full outline-none transition-transform hover:z-50 hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <AvatarWithPresence
                          isOnline={m.isOnline}
                          badgeSize="xs"
                          badgeClassName="right-0 -bottom-0.5 ring-2 ring-background"
                        >
                          <Avatar
                            className={cn(
                              'size-6 rounded-full border-2 border-background shadow-2xs',
                              isCurrentUser && 'ring-1.5 ring-primary/50',
                              isKoboyo ? 'bg-white dark:bg-white' : 'bg-muted/30'
                            )}
                          >
                            {avatarSrc && (
                              <AvatarImage
                                src={avatarSrc}
                                alt={m.name}
                                className={cn(
                                  'size-full object-contain filter contrast-125 dark:brightness-105',
                                  isKoboyo && 'bg-white dark:bg-white'
                                )}
                              />
                            )}
                            <AvatarFallback className="bg-primary/20 text-[9px] font-bold text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        </AvatarWithPresence>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      sideOffset={8}
                      className="w-64 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-xl backdrop-blur-md"
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <AvatarWithPresence isOnline={m.isOnline} badgeSize="md">
                          <Avatar
                            className={cn(
                              'size-16 rounded-full border-2 border-primary/20 shadow-md',
                              isKoboyo ? 'bg-white p-1 dark:bg-white' : 'bg-muted/30'
                            )}
                          >
                            {avatarSrc && (
                              <AvatarImage
                                src={avatarSrc}
                                alt={m.name}
                                className={cn(
                                  'size-full object-contain',
                                  isKoboyo && 'bg-white dark:bg-white'
                                )}
                              />
                            )}
                            <AvatarFallback className="bg-primary/20 text-lg font-bold text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        </AvatarWithPresence>
                        <div className="flex w-full flex-col items-center gap-1">
                          <h4 className="max-w-[180px] truncate text-sm font-bold text-foreground">
                            {m.name}
                            {isCurrentUser && ' (Você)'}
                          </h4>
                          <RoleBadge role={m.role} className="h-4.5 px-2 text-[10px]" />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              })}

              {extraMembersCount > 0 && (
                <span className="relative z-0 flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-bold text-muted-foreground shadow-2xs">
                  +{extraMembersCount}
                </span>
              )}
            </div>
          )}

          {onRefreshDashboard && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 gap-1 rounded-full border-border/50 bg-card px-2 text-[11px] text-muted-foreground shadow-none transition-all hover:bg-muted/60 hover:text-foreground"
              onClick={onRefreshDashboard}
              disabled={isRefreshingDashboard}
              title="Atualizar dashboard"
              aria-label="Atualizar dashboard"
            >
              <RefreshCw className={cn('h-3 w-3', isRefreshingDashboard && 'animate-spin')} />
            </Button>
          )}
        </div>
      </div>

      <div className="relative shrink-0">
        {showWeather ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
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
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
          >
            <WeatherWidget mode="onboarding" onEnable={onWeatherEnable} />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

export default DashboardHeroV2;
