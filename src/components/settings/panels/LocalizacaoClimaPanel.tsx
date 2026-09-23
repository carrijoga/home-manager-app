import { Compass, MapPin, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button, Checkbox, Input, Label } from '@/components/ui';
import { getWeatherPreferences, saveWeatherPreferences } from '@/lib/weatherPreferences';

export function LocalizacaoClimaPanel() {
  const [manualCity, setManualCity] = useState('');
  const [useApproximateLocation, setUseApproximateLocation] = useState(false);
  const [requestingLocation, setRequestingLocation] = useState(false);

  useEffect(() => {
    const prefs = getWeatherPreferences();
    setManualCity(prefs.manualCity);
    setUseApproximateLocation(prefs.useApproximateLocation);
  }, []);

  const handleRequestLocation = async () => {
    if (!('geolocation' in navigator)) {
      toast.error('Seu navegador não suporta geolocalização.');
      return;
    }

    setRequestingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveWeatherPreferences({
          consentGiven: true,
          method: 'gps',
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });

        toast.success('Localização atualizada com sucesso.');
        setRequestingLocation(false);
      },
      () => {
        saveWeatherPreferences({
          consentGiven: false,
          method: null,
          coords: null,
        });
        toast.error('Não foi possível obter sua localização.');
        setRequestingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
      }
    );
  };

  const handleToggleApproximate = (checked: boolean) => {
    setUseApproximateLocation(checked);

    saveWeatherPreferences({
      consentGiven: checked || getWeatherPreferences().consentGiven,
      useApproximateLocation: checked,
      method: checked ? 'ip' : getWeatherPreferences().method,
      coords: checked ? null : getWeatherPreferences().coords,
    });

    toast.success(
      checked
        ? 'Localização aproximada por IP ativada.'
        : 'Localização aproximada por IP desativada.'
    );
  };

  const handleSaveManualCity = () => {
    const trimmed = manualCity.trim();
    saveWeatherPreferences({
      manualCity: trimmed,
      method: trimmed ? 'manual' : getWeatherPreferences().method,
    });

    toast.success(trimmed ? 'Cidade salva para o widget de clima.' : 'Cidade manual removida.');
  };

  const handleClearLocation = () => {
    saveWeatherPreferences({
      consentGiven: false,
      useApproximateLocation: false,
      method: null,
      coords: null,
      manualCity: '',
    });
    setManualCity('');
    setUseApproximateLocation(false);
    toast.success('Preferências de localização removidas.');
  };

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="rounded-3xl border border-border/50 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--secondary)_8%,var(--card))_100%)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
          Serviços de Clima
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Localização & Clima</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Controle como o widget de previsão do tempo obtém sua localização ou defina sua cidade manualmente.
        </p>
      </div>

      {/* GPS Location Section Card */}
      <section className="space-y-4 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Geolocalização via GPS</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Solicite ao seu navegador para atualizar as coordenadas exatas do seu lar.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleRequestLocation}
          disabled={requestingLocation}
          className="gap-2 rounded-xl shadow-xs"
        >
          <Compass className="size-4" />
          <span>{requestingLocation ? 'Solicitando localização...' : 'Solicitar localização via GPS'}</span>
        </Button>
      </section>

      {/* Approximate Location Section Card */}
      <section className="space-y-3 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Localização Aproximada</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Utilizada como alternativa caso o GPS não esteja ativado no navegador.
          </p>
        </div>
        <div className="flex items-start gap-3 pt-1">
          <Checkbox
            id="approximate-location"
            checked={useApproximateLocation}
            onCheckedChange={(checked) => handleToggleApproximate(Boolean(checked))}
          />
          <div className="space-y-1">
            <Label htmlFor="approximate-location" className="cursor-pointer text-xs font-semibold text-foreground">
              Permitir estimativa de região via IP
            </Label>
            <p className="text-xs text-muted-foreground">
              Usa sua conexão para detectar a cidade mais próxima de forma aproximada.
            </p>
          </div>
        </div>
      </section>

      {/* Manual City Section Card */}
      <section className="space-y-4 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Cidade Manual</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Defina um município fixo para consultar o clima sem precisar de localização automática.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="manual-city-input"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Nome da Cidade
          </Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="manual-city-input"
              value={manualCity}
              onChange={(event) => setManualCity(event.target.value)}
              placeholder="Ex.: São Paulo, Rio de Janeiro..."
              maxLength={80}
              className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveManualCity}
              className="gap-1.5 rounded-xl shrink-0"
            >
              <MapPin className="size-4" />
              <span>Salvar Cidade</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Reset Preferences Card */}
      <section className="rounded-2xl border border-border/40 bg-muted/20 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-foreground">Limpar Dados de Localização</h4>
            <p className="text-xs text-muted-foreground">
              Remove todas as preferências salvas referentes a clima e GPS neste dispositivo.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearLocation}
            className="gap-1.5 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
            <span>Limpar Preferências</span>
          </Button>
        </div>
      </section>
    </div>
  );
}

