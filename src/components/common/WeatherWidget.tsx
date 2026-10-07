import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AnimatedNumber, AnimatedText } from '@/components/common/AnimatedNumber';
import { WeatherIcon, type WeatherIconName } from '@/components/common/WeatherIcon';
import { Button } from '@/components/ui';
import type { RefreshCWIconHandle } from '@/components/ui/animated-icons/refresh-cw';
import { RefreshCWIcon } from '@/components/ui/animated-icons/refresh-cw';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { owmToWeatherIcon } from '@/utils/weatherIcon';

export interface GetWeatherIconParams {
  conditionCode?: string | null;
  description?: string;
  temperature?: number | null;
  temperatureLabel?: string;
}

export type WeatherType = WeatherIconName;

export interface WeatherIconInfo {
  type: WeatherType;
  iconName: WeatherIconName;
  translationKey: string;
}

const WEATHER_TRANSLATIONS: Record<WeatherIconName, string> = {
  clear: 'weather.conditions.sun',
  'partly-cloudy': 'weather.conditions.cloudSun',
  cloudy: 'weather.conditions.cloud',
  rain: 'weather.conditions.rain',
  thunderstorm: 'weather.conditions.lightning',
  snow: 'weather.conditions.snow',
};

export function getWeatherIconInfo({
  conditionCode,
  description = '',
  temperature,
  temperatureLabel,
}: GetWeatherIconParams): WeatherIconInfo {
  let iconName: WeatherIconName = 'partly-cloudy';

  if (conditionCode) {
    iconName = owmToWeatherIcon(conditionCode);
  } else if (description) {
    const desc = description.toLowerCase().trim();
    if (
      desc.includes('tempestade') ||
      desc.includes('trovoada') ||
      desc.includes('raio') ||
      desc.includes('tormenta')
    ) {
      iconName = 'thunderstorm';
    } else if (
      desc.includes('garoa') ||
      desc.includes('chuva') ||
      desc.includes('chuvoso') ||
      desc.includes('temporal') ||
      desc.includes('pancada') ||
      desc.includes('aguaceiro')
    ) {
      iconName = 'rain';
    } else if (
      desc.includes('neve') ||
      desc.includes('geada') ||
      desc.includes('granizo') ||
      desc.includes('gelo')
    ) {
      iconName = 'snow';
    } else if (
      desc.includes('ensolarado') ||
      desc.includes('sol') ||
      desc.includes('céu limpo') ||
      desc.includes('limpo') ||
      desc.includes('quente')
    ) {
      iconName = 'clear';
    } else if (desc.includes('parcialmente') || desc.includes('poucas nuvens')) {
      iconName = 'partly-cloudy';
    } else if (
      desc.includes('nublado') ||
      desc.includes('encoberto') ||
      desc.includes('nuvens') ||
      desc.includes('neblina')
    ) {
      iconName = 'cloudy';
    } else {
      iconName = owmToWeatherIcon(description);
    }
  } else {
    let parsedTemp = temperature;
    if ((parsedTemp === undefined || parsedTemp === null) && temperatureLabel) {
      const match = temperatureLabel.match(/-?\d+(\.\d+)?/);
      if (match) parsedTemp = parseFloat(match[0]);
    }
    if (typeof parsedTemp === 'number' && !Number.isNaN(parsedTemp)) {
      if (parsedTemp >= 32) iconName = 'clear';
      else if (parsedTemp <= 2) iconName = 'snow';
    }
  }

  return {
    type: iconName,
    iconName,
    translationKey: WEATHER_TRANSLATIONS[iconName] || 'weather.conditions.cloudSun',
  };
}

export function getWeatherIcon(params: GetWeatherIconParams): WeatherIconName {
  return getWeatherIconInfo(params).iconName;
}

interface AnimatedWeatherIconProps {
  info: WeatherIconInfo;
  className?: string;
}

function AnimatedWeatherIcon({ info, className }: AnimatedWeatherIconProps) {
  const { iconName, translationKey } = info;
  const { t } = useTranslation();

  return (
    <motion.div
      key={iconName}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-center shrink-0"
    >
      <WeatherIcon
        name={iconName}
        size={44}
        animated={true}
        label={t(translationKey)}
        className={className}
      />
    </motion.div>
  );
}

interface WeatherWidgetProps {
  mode?: 'display' | 'onboarding';
  temperatureLabel?: string;
  description?: string;
  city?: string;
  conditionCode?: string | null;
  temperature?: number | null;
  isLoading?: boolean;
  isError?: boolean;
  onRefresh?: () => void | Promise<void>;
  onEnable?: () => void;
  className?: string;
}

export default function WeatherWidget({
  mode = 'display',
  temperatureLabel = '--',
  description = '',
  city = '',
  conditionCode = null,
  temperature = null,
  isLoading = false,
  isError = false,
  onRefresh,
  onEnable,
  className,
}: WeatherWidgetProps) {
  const { t, language } = useTranslation();
  const [now, setNow] = useState(() => new Date());
  const [requesting, setRequesting] = useState(false);
  const [isLocalRefreshing, setIsLocalRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);
  const refreshIconRef = useRef<RefreshCWIconHandle>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const time = useMemo(
    () => now.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }),
    [now, language]
  );

  const weatherIconInfo = useMemo(
    () => getWeatherIconInfo({ conditionCode, description, temperature, temperatureLabel }),
    [conditionCode, description, temperature, temperatureLabel]
  );

  const displayDescription = useMemo(() => {
    if (description && description.trim()) {
      return description;
    }
    return t(weatherIconInfo.translationKey);
  }, [description, t, weatherIconInfo.translationKey]);

  const parsedTemperature = useMemo(() => {
    if (typeof temperature === 'number' && !Number.isNaN(temperature)) {
      const suffix = temperatureLabel?.includes('°C')
        ? '°C'
        : temperatureLabel?.includes('°')
          ? '°'
          : '°C';
      return { value: Math.round(temperature), suffix };
    }
    if (temperatureLabel && temperatureLabel !== '--') {
      const match = temperatureLabel.match(/(-?\d+(\.\d+)?)/);
      if (match) {
        const val = Math.round(parseFloat(match[0]));
        const suffix = temperatureLabel.replace(match[0], '').trim() || '°C';
        return { value: val, suffix };
      }
    }
    return null;
  }, [temperature, temperatureLabel]);

  const handleRefresh = async () => {
    if (!onRefresh || isLoading || isLocalRefreshing) return;

    setIsLocalRefreshing(true);
    const startTime = Date.now();

    try {
      await onRefresh();
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 600 - elapsed);

      window.setTimeout(() => {
        setIsLocalRefreshing(false);
        setJustRefreshed(true);
        window.setTimeout(() => setJustRefreshed(false), 800);
      }, remaining);
    }
  };

  const handleEnable = () => {
    if (!onEnable) return;
    setRequesting(true);
    onEnable();
  };

  const isBusy = isLoading || isLocalRefreshing;

  if (mode === 'onboarding') {
    return (
      <div
        className={cn(
          'glass flex w-full min-w-0 flex-col gap-3 rounded-3xl p-4 sm:w-auto sm:min-w-[280px]',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <WeatherIcon name="partly-cloudy" size={36} animated={true} />
          <div className="flex flex-col gap-0.5">
            <span className="font-ui text-sm font-semibold leading-none text-foreground">
              {t('weather.onboarding.title')}
            </span>
            <span className="font-ui text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
              {t('weather.onboarding.subtitle')}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={handleEnable}
          disabled={requesting}
        >
          {requesting ? (
            <>
              <RefreshCWIcon size={14} className="mr-1.5 animate-spin" aria-hidden="true" />
              {t('weather.onboarding.waiting')}
            </>
          ) : (
            t('weather.onboarding.button')
          )}
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      animate={
        justRefreshed && !prefersReducedMotion
          ? { scale: [1, 1.02, 1], transition: { duration: 0.35, ease: 'easeOut' } }
          : { scale: 1 }
      }
      className={cn(
        'glass relative flex w-full min-w-0 items-center gap-4 rounded-3xl p-4 sm:w-auto sm:min-w-[280px] sm:gap-6 transition-shadow duration-300',
        justRefreshed && 'ring-1 ring-primary/30 shadow-md',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          <AnimatedWeatherIcon
            key={`${weatherIconInfo.type}-${conditionCode || ''}`}
            info={weatherIconInfo}
          />
        </AnimatePresence>

        <div className="flex flex-col gap-0.5">
          <div className="font-ui text-2xl font-semibold leading-none text-foreground flex items-center min-h-[1.75rem]">
            {isBusy ? (
              <motion.span
                initial={{ opacity: 0.6 }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-muted-foreground"
              >
                --
              </motion.span>
            ) : isError ? (
              <span>--</span>
            ) : parsedTemperature !== null ? (
              <AnimatedNumber
                value={parsedTemperature.value}
                suffix={parsedTemperature.suffix}
                variant="number"
                animation="smooth"
                className="tabular-nums select-none"
              />
            ) : (
              <span>{temperatureLabel}</span>
            )}
          </div>

          <div
            className="font-ui uppercase tracking-wide text-muted-foreground min-h-[1rem] flex items-center"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            {isBusy ? (
              <AnimatedText animation="smooth">{t('weather.status.updating')}</AnimatedText>
            ) : isError ? (
              <span>{t('weather.status.unavailable')}</span>
            ) : (
              <AnimatedText animation="smooth">{displayDescription}</AnimatedText>
            )}
          </div>
        </div>
      </div>

      <div className="h-10 w-px shrink-0 bg-muted-foreground/20" aria-hidden="true" />

      <div className="flex flex-col items-end gap-1">
        <span className="font-ui max-w-[120px] truncate text-sm font-medium text-foreground">
          {city}
        </span>
        <span
          className="font-ui uppercase tracking-tight text-muted-foreground/80"
          style={{ fontSize: 'var(--text-xs)' }}
        >
          {time}
        </span>
        {onRefresh && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-auto p-0 text-xs text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95',
              isBusy && 'pointer-events-none opacity-80'
            )}
            onClick={handleRefresh}
            disabled={isBusy}
            onMouseEnter={() => !isBusy && refreshIconRef.current?.startAnimation()}
            onMouseLeave={() => refreshIconRef.current?.stopAnimation()}
            aria-label={t('weather.actions.refresh')}
            title={t('weather.actions.refresh')}
          >
            <RefreshCWIcon
              ref={refreshIconRef}
              size={14}
              className={cn(isBusy && 'animate-spin text-primary')}
            />
            <span className="ml-1">{t('weather.actions.refreshShort')}</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
