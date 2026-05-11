import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { CloudSun, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

interface WeatherWidgetProps {
  temperatureLabel: string;
  description: string;
  city: string;
  isLoading?: boolean;
  isError?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export default function WeatherWidget({
  temperatureLabel,
  description,
  city,
  isLoading = false,
  isError = false,
  onRefresh,
  className,
}: WeatherWidgetProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const time = useMemo(
    () => now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    [now]
  );

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
          >
            <RefreshCw className={`size-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        )}
      </div>
    </div>
  );
}
