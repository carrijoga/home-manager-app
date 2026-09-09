import { motion } from 'framer-motion';
import { Calendar, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';

import { RoleBadge } from '@/components/common/RoleBadge';
import WeatherWidget from '@/components/common/WeatherWidget';
import { Button } from '@/components/ui/button';
import { getIconComponent } from '@/lib/nestIcons';
import { cn } from '@/lib/utils';
import type { AppUserNest } from '@/types';

interface DashboardHeaderV2Props {
  userName?: string;
  activeNest?: AppUserNest | null;
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
  activeNest,
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

  // Data formatada em português
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());
  }, []);

  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const NestIcon = activeNest ? getIconComponent(activeNest.icon) : null;

  return (
    <div className={cn('flex w-full flex-col gap-4 sm:gap-6', className)}>
      {/* Top Meta Bar: Data Atual, Ninho Ativo & Status Realtime */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Data Atual */}
          <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur-xs">
            <Calendar size={13} className="text-primary" />
            <span className="capitalize">{capitalizedDate}</span>
          </div>

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

      {/* Hero Greeting & Weather Widget Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <motion.h1
            className="font-editorial font-extrabold leading-tight tracking-tight text-foreground flex flex-wrap items-center gap-2"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
          >
            <span>
              {greeting.text},{' '}
              <span className="inline-block max-w-[340px] truncate align-bottom text-primary">
                {userName}
              </span>
            </span>
            <span className="text-2xl sm:text-3xl" aria-hidden="true">
              {greeting.icon}
            </span>
          </motion.h1>

          <p className="font-ui text-sm text-muted-foreground">
            {pendingTasksCount > 0 ? (
              <span>
                Você tem <strong className="font-semibold text-foreground">{pendingTasksCount}</strong>{' '}
                {pendingTasksCount === 1 ? 'tarefa pendente' : 'tarefas pendentes'} para hoje no seu Ninho.
              </span>
            ) : (
              <span>Tudo em ordem por aqui hoje! Aproveite o seu dia. ✨</span>
            )}
          </p>
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
