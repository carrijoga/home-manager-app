import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import WeatherWidget from "./WeatherWidget";

interface DashboardHeaderProps {
  userName?: string;
  pendingTasksCount?: number;
  showWeather?: boolean;
  weatherCity?: string;
  weatherDescription?: string;
  weatherTemperatureLabel?: string;
  isWeatherLoading?: boolean;
  isWeatherError?: boolean;
  onRefreshWeather?: () => void;
  onWeatherEnable?: () => void;
  weatherOnboardingKey?: number;
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
  userName = "Silva",
  pendingTasksCount = 0,
  showWeather = false,
  weatherCity = "São Paulo",
  weatherDescription = "Tempo indisponível",
  weatherTemperatureLabel = "--",
  isWeatherLoading = false,
  isWeatherError = false,
  onRefreshWeather,
  onWeatherEnable,
  weatherOnboardingKey,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4 w-full", className)}>

      {/* Saudação editorial — Manrope display */}
      <div className="flex flex-col gap-2">
        <motion.h1
          className="font-editorial font-extrabold text-foreground leading-none tracking-tight"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.025em" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          Bem-vindo ao lar,{" "}
          <span className="inline-block max-w-[320px] truncate align-bottom">{userName}</span>.
        </motion.h1>

        {pendingTasksCount > 0 && (
          <motion.span
            className="font-ui font-semibold text-primary uppercase tracking-[1.2px] px-3 py-1 rounded-full self-start border border-primary/20 bg-card"
            style={{ fontSize: "var(--text-xs)" }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
          >
            {pendingTasksCount} {pendingTasksCount === 1 ? 'tarefa pendente' : 'tarefas pendentes'}
          </motion.span>
        )}
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
          <WeatherWidget
            mode="onboarding"
            onEnable={onWeatherEnable}
          />
        </motion.div>
      ) : null}
    </div>
  );
}

export default DashboardHeader;
