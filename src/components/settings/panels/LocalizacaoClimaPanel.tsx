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
      position => {
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
      <div>
        <h2 className="text-lg font-semibold">Localização & Clima</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Controle como o widget de clima obtém sua localização.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Localização por GPS</h3>
        <p className="text-xs text-muted-foreground">
          Se você negar a permissão, o widget ficará oculto até informar uma cidade manual ou permitir fallback aproximado.
        </p>
        <Button type="button" onClick={handleRequestLocation} disabled={requestingLocation}>
          {requestingLocation ? 'Solicitando localização...' : 'Solicitar novamente localização'}
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Localização aproximada</h3>
        <div className="flex items-start gap-3">
          <Checkbox
            id="approximate-location"
            checked={useApproximateLocation}
            onCheckedChange={checked => handleToggleApproximate(Boolean(checked))}
          />
          <div className="space-y-1">
            <Label htmlFor="approximate-location" className="cursor-pointer">
              Permitir localização aproximada por IP
            </Label>
            <p className="text-xs text-muted-foreground">
              Usa região aproximada quando GPS não estiver disponível. Requer seu consentimento.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Cidade manual</h3>
        <p className="text-xs text-muted-foreground">
          Informe uma cidade para exibir clima sem usar localização automática.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={manualCity}
            onChange={event => setManualCity(event.target.value)}
            placeholder="Ex.: São Paulo"
            maxLength={80}
          />
          <Button type="button" variant="secondary" onClick={handleSaveManualCity}>
            Salvar cidade
          </Button>
        </div>
      </div>

      <div>
        <Button type="button" variant="outline" onClick={handleClearLocation}>
          Limpar preferências de localização
        </Button>
      </div>
    </div>
  );
}
