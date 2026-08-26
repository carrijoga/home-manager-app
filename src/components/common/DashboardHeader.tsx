import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import WeatherWidget from './WeatherWidget';

interface DashboardHeaderProps {
  userName?: string;
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

        <div className="flex flex-wrap items-center gap-2">
          {pendingTasksCount > 0 && (
            <motion.span
              className="font-ui self-start rounded-full border border-primary/20 bg-card px-3 py-1 font-semibold uppercase tracking-[1.2px] text-primary"
              style={{ fontSize: 'var(--text-xs)' }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
            >
              {pendingTasksCount}{' '}
              {pendingTasksCount === 1 ? 'tarefa pendente' : 'tarefas pendentes'}
            </motion.span>
          )}

          {onRefreshDashboard && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
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
