import { motion } from 'framer-motion';
import { RefreshCw, Users } from 'lucide-react';
import { useMemo } from 'react';

import { AvatarWithPresence, OnlineStatusPill } from '@/components/common/OnlineStatusBadge';
import { RoleBadge } from '@/components/common/RoleBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { isKoboyoAvatar, resolveUserAvatar } from '@/constants/koboyoAvatars';
import { getIconComponent } from '@/lib/nestIcons';
import { cn } from '@/lib/utils';
import type { NestMember } from '@/schemas/nest';
import type { AppUserNest } from '@/types';

import WeatherWidget from './WeatherWidget';

interface DashboardHeaderProps {
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
 * DashboardHeader — Cabeçalho editorial do dashboard.
 *
 * Design System "Domestic Sanctuary":
 * - font-editorial extrabold para o título (display-lg)
 * - Chip de status ghost border (primary)
 * - Widget de clima bg-muted (surface-container-high)
 */
export function DashboardHeader({
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
}: DashboardHeaderProps) {
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
    <div className={cn('flex w-full flex-wrap items-center justify-between gap-4', className)}>
      {/* Saudação editorial — Manrope display */}
      <div className="flex flex-col gap-2">
        <motion.h1
          className="font-editorial font-extrabold leading-none tracking-tight text-foreground"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          Bem-vindo ao lar,{' '}
          <span className="inline-block max-w-[320px] truncate align-bottom">{userName}</span>.
        </motion.h1>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ninho Ativo */}
          {activeNest && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
              className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/90 px-3 py-1 text-xs font-semibold text-foreground shadow-2xs backdrop-blur-xs"
            >
              {NestIcon && <NestIcon className="size-3.5 text-primary" />}
              <span className="truncate max-w-[140px]">{activeNest.name}</span>
              <RoleBadge role={activeNest.role} className="h-4 px-1.5 text-[9px] py-0 ml-0.5" />
            </motion.div>
          )}

          {/* Moradores do Ninho com Popup se > 3 */}
          {sortedMembers && sortedMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
              className="flex items-center"
            >
              <div className="flex items-center -space-x-1.5 pl-1">
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
                          className="relative group cursor-pointer rounded-full outline-none transition-transform hover:scale-110 hover:!z-50 focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <AvatarWithPresence
                            isOnline={m.isOnline}
                            badgeSize="xs"
                            badgeClassName="right-0 -bottom-0.5 ring-2 ring-background"
                          >
                            <Avatar
                              className={cn(
                                'size-7 rounded-full border-2 border-background shadow-2xs',
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
                              <AvatarFallback className="bg-primary/20 text-[10px] font-bold text-primary">
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
                                isKoboyo ? 'bg-white dark:bg-white p-1' : 'bg-muted/30'
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

                          <div className="flex flex-col items-center gap-1 w-full">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-bold text-foreground truncate max-w-[180px]">
                                {m.name}
                              </h4>
                              {isCurrentUser && (
                                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-extrabold text-primary shadow-2xs">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 pt-1">
                              <RoleBadge role={m.role} className="text-[10px] h-4.5 px-2" />
                              <OnlineStatusPill isOnline={m.isOnline} />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })}

                {/* Se tiver mais de 3 membros, exibe o botão '+' que abre o Popover com todos */}
                {extraMembersCount > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Ver todos os ${members.length} moradores`}
                        className="relative z-10 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold text-muted-foreground shadow-2xs transition-all hover:scale-110 hover:bg-primary/15 hover:text-primary active:scale-95"
                      >
                        +{extraMembersCount}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      sideOffset={8}
                      className="w-80 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-xl backdrop-blur-md"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Users size={14} className="text-primary" />
                            <span>Moradores do Ninho</span>
                          </div>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {members.length} membros
                          </span>
                        </div>

                        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
                          {members.map((m) => {
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

                            return (
                              <Popover key={m.userId}>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl p-2 text-left transition-colors hover:bg-muted/50"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <AvatarWithPresence isOnline={m.isOnline} badgeSize="xs">
                                        <Avatar
                                          className={cn(
                                            'size-8 rounded-full border border-background shadow-2xs shrink-0',
                                            isKoboyo ? 'bg-white dark:bg-white p-0.5' : 'bg-muted/30'
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
                                          <AvatarFallback className="bg-primary/20 text-[10px] font-bold text-primary">
                                            {initials}
                                          </AvatarFallback>
                                        </Avatar>
                                      </AvatarWithPresence>
                                      <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="truncate text-xs font-semibold text-foreground">
                                            {m.name}
                                          </span>
                                          {isCurrentUser && (
                                            <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[9px] font-extrabold text-primary">
                                              Você
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <RoleBadge role={m.role} className="shrink-0 text-[9px] h-4 px-1.5 py-0" />
                                    </div>
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  side="right"
                                  align="center"
                                  sideOffset={8}
                                  className="w-60 rounded-2xl border border-border/80 bg-card/98 p-4 shadow-xl backdrop-blur-md"
                                >
                                  <div className="flex flex-col items-center gap-2.5 text-center">
                                    <AvatarWithPresence isOnline={m.isOnline} badgeSize="md">
                                      <Avatar
                                        className={cn(
                                          'size-14 rounded-full border border-primary/20 shadow-xs',
                                          isKoboyo ? 'bg-white dark:bg-white p-1' : 'bg-muted/30'
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
                                        <AvatarFallback className="bg-primary/20 text-sm font-bold text-primary">
                                          {initials}
                                        </AvatarFallback>
                                      </Avatar>
                                    </AvatarWithPresence>
                                    <div className="flex flex-col items-center gap-1">
                                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-bold text-foreground">
                                          {m.name}
                                        </span>
                                        {isCurrentUser && (
                                          <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[9px] font-extrabold text-primary">
                                            Você
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5 pt-0.5">
                                        <RoleBadge role={m.role} className="text-[9px] h-4 px-1.5 py-0" />
                                        <OnlineStatusPill isOnline={m.isOnline} />
                                      </div>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            );
                          })}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </motion.div>
          )}

          {pendingTasksCount > 0 && (
            <motion.span
              className="font-ui self-start rounded-full border border-primary/20 bg-card px-3 py-1 font-semibold uppercase tracking-[1.2px] text-primary"
              style={{ fontSize: 'var(--text-xs)' }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
            >
              {pendingTasksCount}{' '}
              {pendingTasksCount === 1 ? 'tarefa pendente' : 'tarefas pendentes'}
            </motion.span>
          )}

          {onRefreshDashboard && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1], delay: 0.25 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 rounded-full border-border/50 bg-card px-2.5 text-xs text-muted-foreground shadow-none transition-all hover:bg-muted/60 hover:text-foreground"
                onClick={onRefreshDashboard}
                disabled={isRefreshingDashboard}
                title="Atualizar dashboard"
                aria-label="Atualizar dashboard"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isRefreshingDashboard && 'animate-spin')} />
                <span>Atualizar</span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {showWeather ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
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
          transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
        >
          <WeatherWidget mode="onboarding" onEnable={onWeatherEnable} />
        </motion.div>
      ) : null}
    </div>
  );
}

export default DashboardHeader;
