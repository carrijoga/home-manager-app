import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Flame,
  Snowflake,
  Sun,
  Wind,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AnimatedNumber, AnimatedText } from '@/components/common/AnimatedNumber';
import { Button } from '@/components/ui';
import type { RefreshCWIconHandle } from '@/components/ui/animated-icons/refresh-cw';
import { RefreshCWIcon } from '@/components/ui/animated-icons/refresh-cw';
import { cn } from '@/lib/utils';

export interface GetWeatherIconParams {
  conditionCode?: string | null;
  description?: string;
  temperature?: number | null;
  temperatureLabel?: string;
}

export type WeatherType =
  | 'sun'
  | 'cloud-sun'
  | 'cloud'
  | 'rain'
  | 'drizzle'
  | 'lightning'
  | 'snow'
  | 'fog'
  | 'wind'
  | 'hot'
  | 'cold';

export interface WeatherIconInfo {
  Icon: typeof Sun;
  type: WeatherType;
}

export function getWeatherIconInfo({
  conditionCode,
  description = '',
  temperature,
  temperatureLabel,
}: GetWeatherIconParams): WeatherIconInfo {
  const code = (conditionCode || '').toLowerCase().trim();
  const desc = description.toLowerCase().trim();

  // 1. Verificação por código numérico do OpenWeatherMap ou texto (conditionCode)
  const codeNum = parseInt(code, 10);
  if (!Number.isNaN(codeNum)) {
    if (codeNum >= 200 && codeNum < 300) return { Icon: CloudLightning, type: 'lightning' };
    if (codeNum >= 300 && codeNum < 400) return { Icon: CloudDrizzle, type: 'drizzle' };
    if (codeNum >= 500 && codeNum < 600) return { Icon: CloudRain, type: 'rain' };
    if (codeNum >= 600 && codeNum < 700) return { Icon: CloudSnow, type: 'snow' };
    if (codeNum >= 700 && codeNum < 800) return { Icon: CloudFog, type: 'fog' };
    if (codeNum === 800) return { Icon: Sun, type: 'sun' };
    if (codeNum === 801 || codeNum === 802) return { Icon: CloudSun, type: 'cloud-sun' };
    if (codeNum === 803 || codeNum === 804) return { Icon: Cloud, type: 'cloud' };
  }

  if (code.includes('thunder') || code.includes('storm') || code.includes('lightning'))
    return { Icon: CloudLightning, type: 'lightning' };
  if (code.includes('drizzle')) return { Icon: CloudDrizzle, type: 'drizzle' };
  if (code.includes('rain') || code.includes('shower')) return { Icon: CloudRain, type: 'rain' };
  if (code.includes('snow') || code.includes('ice') || code.includes('flurry'))
    return { Icon: CloudSnow, type: 'snow' };
  if (code.includes('fog') || code.includes('mist') || code.includes('haze'))
    return { Icon: CloudFog, type: 'fog' };
  if (code.includes('wind') || code.includes('windy') || code.includes('breeze'))
    return { Icon: Wind, type: 'wind' };
  if (code.includes('clear') || code === 'sun' || code === 'sunny')
    return { Icon: Sun, type: 'sun' };
  if (code === 'cloudy' || code === 'overcast') return { Icon: Cloud, type: 'cloud' };
  if (code.includes('partly') || code.includes('cloud'))
    return { Icon: CloudSun, type: 'cloud-sun' };
  if (code.includes('hot')) return { Icon: Flame, type: 'hot' };
  if (code.includes('cold')) return { Icon: Snowflake, type: 'cold' };

  // 2. Verificação pela descrição em português / inglês
  if (
    desc.includes('tempestade') ||
    desc.includes('trovoada') ||
    desc.includes('raio') ||
    desc.includes('tormenta')
  ) {
    return { Icon: CloudLightning, type: 'lightning' };
  }
  if (desc.includes('garoa') || desc.includes('chuva fina') || desc.includes('chuvisco')) {
    return { Icon: CloudDrizzle, type: 'drizzle' };
  }
  if (
    desc.includes('chuva') ||
    desc.includes('chuvoso') ||
    desc.includes('temporal') ||
    desc.includes('pancada') ||
    desc.includes('aguaceiro')
  ) {
    return { Icon: CloudRain, type: 'rain' };
  }
  if (
    desc.includes('neve') ||
    desc.includes('geada') ||
    desc.includes('granizo') ||
    desc.includes('gelo')
  ) {
    return { Icon: CloudSnow, type: 'snow' };
  }
  if (
    desc.includes('neblina') ||
    desc.includes('nevoeiro') ||
    desc.includes('cerração') ||
    desc.includes('névoa')
  ) {
    return { Icon: CloudFog, type: 'fog' };
  }
  if (
    desc.includes('vento') ||
    desc.includes('ventania') ||
    desc.includes('ventoso') ||
    desc.includes('brisa')
  ) {
    return { Icon: Wind, type: 'wind' };
  }
  if (
    desc.includes('muito quente') ||
    desc.includes('calor extremo') ||
    desc.includes('calorão') ||
    desc.includes('canícula')
  ) {
    return { Icon: Flame, type: 'hot' };
  }
  if (desc.includes('muito frio') || desc.includes('congelante')) {
    return { Icon: Snowflake, type: 'cold' };
  }
  if (
    desc.includes('parcialmente') ||
    desc.includes('poucas nuvens') ||
    desc.includes('sol entre nuvens')
  ) {
    return { Icon: CloudSun, type: 'cloud-sun' };
  }
  if (
    desc.includes('nublado') ||
    desc.includes('encoberto') ||
    desc.includes('muitas nuvens') ||
    desc.includes('nuvens')
  ) {
    return { Icon: Cloud, type: 'cloud' };
  }
  if (
    desc.includes('ensolarado') ||
    desc.includes('sol') ||
    desc.includes('céu limpo') ||
    desc.includes('limpo')
  ) {
    return { Icon: Sun, type: 'sun' };
  }

  // 3. Fallback por faixa de temperatura
  let parsedTemp = temperature;
  if ((parsedTemp === undefined || parsedTemp === null) && temperatureLabel) {
    const match = temperatureLabel.match(/-?\d+(\.\d+)?/);
    if (match) {
      parsedTemp = parseFloat(match[0]);
    }
  }

  if (typeof parsedTemp === 'number' && !Number.isNaN(parsedTemp)) {
    if (parsedTemp >= 35) return { Icon: Flame, type: 'hot' };
    if (parsedTemp <= 2) return { Icon: Snowflake, type: 'cold' };
  }

  return { Icon: CloudSun, type: 'cloud-sun' };
}

export function getWeatherIcon(params: GetWeatherIconParams) {
  return getWeatherIconInfo(params).Icon;
}

interface AnimatedWeatherIconProps {
  info: WeatherIconInfo;
  className?: string;
}

function AnimatedWeatherIcon({ info, className }: AnimatedWeatherIconProps) {
  const { Icon, type } = info;
  const prefersReducedMotion = useReducedMotion();

  // Animações sutis e acolhedoras de acordo com a condição climática
  const getMotionAnimation = () => {
    if (prefersReducedMotion) return {};

    switch (type) {
      case 'sun':
        return {
          rotate: [0, 360],
          scale: [1, 1.05, 1],
          transition: {
            rotate: { duration: 36, repeat: Infinity, ease: 'linear' },
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          },
        };
      case 'cloud':
      case 'cloud-sun':
      case 'fog':
        return {
          y: [0, -2.5, 0],
          transition: {
            duration: 3.8,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        };
      case 'rain':
      case 'drizzle':
        return {
          y: [0, -1.5, 0],
          rotate: [0, -1, 1, 0],
          transition: {
            duration: 2.6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        };
      case 'lightning':
        return {
          scale: [1, 1.06, 0.98, 1],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        };
      case 'snow':
      case 'cold':
        return {
          rotate: [-4, 4, -4],
          transition: {
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        };
      case 'wind':
        return {
          x: [-2, 2, -2],
          transition: {
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        };
      case 'hot':
        return {
          scale: [1, 1.08, 1],
          y: [0, -1.5, 0],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      key={type}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1, ...getMotionAnimation() }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-center shrink-0"
    >
      <Icon
        className={cn('shrink-0 text-foreground transition-colors duration-300', className)}
        size={32}
        strokeWidth={1.25}
        aria-hidden="true"
      />
    </motion.div>
  );
}

interface WeatherWidgetProps {
  mode?: 'display' | 'onboarding';
  // display mode props
  temperatureLabel?: string;
  description?: string;
  city?: string;
  conditionCode?: string | null;
  temperature?: number | null;
  isLoading?: boolean;
  isError?: boolean;
  onRefresh?: () => void | Promise<void>;
  // onboarding mode props
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
    () => now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    [now]
  );

  const weatherIconInfo = useMemo(
    () => getWeatherIconInfo({ conditionCode, description, temperature, temperatureLabel }),
    [conditionCode, description, temperature, temperatureLabel]
  );

  // Extrai valor numérico e sufixo da temperatura (ex: "24°C" -> value: 24, suffix: "°C")
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

  // Garante tempo mínimo de feedback tátil (~600ms) mesmo que a resposta em cache demore 24ms
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
          <CloudSun
            className="shrink-0 text-foreground"
            size={28}
            strokeWidth={1.25}
            aria-hidden="true"
          />
          <div className="flex flex-col gap-0.5">
            <span className="font-ui text-sm font-semibold leading-none text-foreground">
              Ative o clima
            </span>
            <span className="font-ui text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
              Veja a temperatura aqui
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
              Aguardando...
            </>
          ) : (
            'Usar minha localização'
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
              <AnimatedText animation="smooth">Atualizando...</AnimatedText>
            ) : isError ? (
              <span>Clima indisponível</span>
            ) : (
              <AnimatedText animation="smooth">{description}</AnimatedText>
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
            aria-label="Atualizar clima"
            title="Atualizar clima"
          >
            <RefreshCWIcon
              ref={refreshIconRef}
              size={14}
              className={cn(isBusy && 'animate-spin text-primary')}
            />
            <span className="ml-1">Atualizar</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
