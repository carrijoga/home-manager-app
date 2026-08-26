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
import { useEffect, useMemo, useRef, useState } from 'react';

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

export function getWeatherIcon({
  conditionCode,
  description = '',
  temperature,
  temperatureLabel,
}: GetWeatherIconParams) {
  const code = (conditionCode || '').toLowerCase().trim();
  const desc = description.toLowerCase().trim();

  // 1. Verificação por condição direta (conditionCode)
  if (code.includes('thunder') || code.includes('storm') || code.includes('lightning'))
    return CloudLightning;
  if (code.includes('drizzle')) return CloudDrizzle;
  if (code.includes('rain') || code.includes('shower')) return CloudRain;
  if (code.includes('snow') || code.includes('ice') || code.includes('flurry')) return CloudSnow;
  if (code.includes('fog') || code.includes('mist') || code.includes('haze')) return CloudFog;
  if (code.includes('wind') || code.includes('windy') || code.includes('breeze')) return Wind;
  if (code.includes('clear') || code === 'sun' || code === 'sunny') return Sun;
  if (code === 'cloudy' || code === 'overcast') return Cloud;
  if (code.includes('partly') || code.includes('cloud')) return CloudSun;
  if (code.includes('hot')) return Flame;
  if (code.includes('cold')) return Snowflake;

  // 2. Verificação pela descrição em português / inglês
  if (
    desc.includes('tempestade') ||
    desc.includes('trovoada') ||
    desc.includes('raio') ||
    desc.includes('tormenta')
  ) {
    return CloudLightning;
  }
  if (desc.includes('garoa') || desc.includes('chuva fina') || desc.includes('chuvisco')) {
    return CloudDrizzle;
  }
  if (
    desc.includes('chuva') ||
    desc.includes('chuvoso') ||
    desc.includes('temporal') ||
    desc.includes('pancada') ||
    desc.includes('aguaceiro')
  ) {
    return CloudRain;
  }
  if (
    desc.includes('neve') ||
    desc.includes('geada') ||
    desc.includes('granizo') ||
    desc.includes('gelo')
  ) {
    return CloudSnow;
  }
  if (
    desc.includes('neblina') ||
    desc.includes('nevoeiro') ||
    desc.includes('cerração') ||
    desc.includes('névoa')
  ) {
    return CloudFog;
  }
  if (
    desc.includes('vento') ||
    desc.includes('ventania') ||
    desc.includes('ventoso') ||
    desc.includes('brisa')
  ) {
    return Wind;
  }
  if (
    desc.includes('muito quente') ||
    desc.includes('calor extremo') ||
    desc.includes('calorão') ||
    desc.includes('canícula')
  ) {
    return Flame;
  }
  if (desc.includes('muito frio') || desc.includes('congelante')) {
    return Snowflake;
  }
  if (
    desc.includes('parcialmente') ||
    desc.includes('poucas nuvens') ||
    desc.includes('sol entre nuvens')
  ) {
    return CloudSun;
  }
  if (
    desc.includes('nublado') ||
    desc.includes('encoberto') ||
    desc.includes('muitas nuvens') ||
    desc.includes('nuvens')
  ) {
    return Cloud;
  }
  if (
    desc.includes('ensolarado') ||
    desc.includes('sol') ||
    desc.includes('céu limpo') ||
    desc.includes('limpo')
  ) {
    return Sun;
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
    if (parsedTemp >= 35) return Flame;
    if (parsedTemp <= 2) return Snowflake;
  }

  return CloudSun;
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
  onRefresh?: () => void;
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
  const refreshIconRef = useRef<RefreshCWIconHandle>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const time = useMemo(
    () => now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    [now]
  );

  const WeatherIcon = useMemo(
    () => getWeatherIcon({ conditionCode, description, temperature, temperatureLabel }),
    [conditionCode, description, temperature, temperatureLabel]
  );

  const handleEnable = () => {
    if (!onEnable) return;
    setRequesting(true);
    onEnable();
  };

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
    <div
      className={cn(
        'glass flex w-full min-w-0 items-center gap-4 rounded-3xl p-4 sm:w-auto sm:min-w-[280px] sm:gap-6',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <WeatherIcon
          className="shrink-0 text-foreground"
          size={32}
          strokeWidth={1.25}
          aria-hidden="true"
        />
        <div className="flex flex-col gap-0.5">
          <span className="font-ui text-2xl font-semibold leading-none text-foreground">
            {isLoading ? '--' : isError ? '--' : temperatureLabel}
          </span>
          <span
            className="font-ui uppercase tracking-wide text-muted-foreground"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            {isLoading ? 'Atualizando...' : isError ? 'Clima indisponível' : description}
          </span>
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
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={onRefresh}
            disabled={isLoading}
            onMouseEnter={() => !isLoading && refreshIconRef.current?.startAnimation()}
            onMouseLeave={() => refreshIconRef.current?.stopAnimation()}
          >
            <RefreshCWIcon
              ref={refreshIconRef}
              size={14}
              className={isLoading ? 'animate-spin' : ''}
            />
            Atualizar
          </Button>
        )}
      </div>
    </div>
  );
}
