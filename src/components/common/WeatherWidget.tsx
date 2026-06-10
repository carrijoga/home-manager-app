import { CloudSun } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { RefreshCWIconHandle } from '@/components/ui/animated-icons/refresh-cw';
import { RefreshCWIcon } from '@/components/ui/animated-icons/refresh-cw';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
  mode?: 'display' | 'onboarding';
  // display mode props
  temperatureLabel?: string;
  description?: string;
  city?: string;
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

  const handleEnable = () => {
    if (!onEnable) return;
    setRequesting(true);
    onEnable();
  };

  if (mode === 'onboarding') {
    return (
      <div
        className={cn(
          'glass flex flex-col gap-3 p-4 rounded-3xl w-full sm:w-auto min-w-0 sm:min-w-[280px]',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <CloudSun className="text-foreground shrink-0" size={28} strokeWidth={1.25} aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <span className="font-ui font-semibold text-foreground text-sm leading-none">
              Ative o clima
            </span>
            <span
              className="font-ui text-muted-foreground"
              style={{ fontSize: 'var(--text-xs)' }}
            >
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
      className={cn("glass flex items-center gap-4 sm:gap-6 p-4 rounded-3xl w-full sm:w-auto min-w-0 sm:min-w-[280px]", className)}
    >
      <div className="flex items-center gap-4">
        <CloudSun className="text-foreground shrink-0" size={32} strokeWidth={1.25} aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <span className="font-ui font-semibold text-foreground text-2xl leading-none">
            {isLoading ? '--' : isError ? '--' : temperatureLabel}
          </span>
          <span
            className="font-ui text-muted-foreground uppercase tracking-wide"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            {isLoading ? 'Atualizando...' : isError ? 'Clima indisponível' : description}
          </span>
        </div>
      </div>

      <div className="h-10 w-px bg-muted-foreground/20 shrink-0" aria-hidden="true" />

      <div className="flex flex-col items-end gap-1">
        <span className="font-ui font-medium text-foreground text-sm max-w-[120px] truncate">{city}</span>
        <span
          className="font-ui text-muted-foreground/80 uppercase tracking-tight"
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
