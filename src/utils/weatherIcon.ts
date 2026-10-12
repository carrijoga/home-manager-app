import type { WeatherIconName } from '@/components/common/WeatherIcon';

/**
 * Converte o `weather[0].id` do OpenWeatherMap ou código de condição em um ícone do Ninho.
 * https://openweathermap.org/weather-conditions
 *
 * LACUNAS conhecidas (não há arte para isso ainda):
 *  - Noite: não existem ícones de lua. `isNight` já é aceito para os chamadores não mudarem depois,
 *    mas hoje 800/801/802 devolvem sol/parcialmente nublado também à noite.
 *  - Névoa/fumaça/poeira (7xx): cai em "cloudy" (aproximação).
 *  - Garoa (3xx) usa "rain"; granizo/chuva com neve (611-616) usa "snow".
 */
export function owmToWeatherIcon(
  conditionId?: number | string | null,
  isNight = false
): WeatherIconName {
  void isNight; // reservado: ver LACUNAS
  if (conditionId === null || conditionId === undefined || conditionId === '') {
    return 'partly-cloudy';
  }

  const num = typeof conditionId === 'number' ? conditionId : parseInt(String(conditionId), 10);
  if (!Number.isNaN(num)) {
    if (num >= 200 && num < 300) return 'thunderstorm';
    if (num >= 300 && num < 600) return 'rain';
    if (num >= 600 && num < 700) return 'snow';
    if (num === 800) return 'clear';
    if (num === 801 || num === 802) return 'partly-cloudy';
    if (num === 803 || num === 804 || (num >= 700 && num < 800)) return 'cloudy';
  }

  const str = String(conditionId).toLowerCase().trim();
  if (str.includes('thunder') || str.includes('storm') || str.includes('lightning'))
    return 'thunderstorm';
  if (str.includes('drizzle') || str.includes('rain') || str.includes('shower')) return 'rain';
  if (str.includes('snow') || str.includes('ice') || str.includes('flurry')) return 'snow';
  if (str.includes('clear') || str === 'sun' || str === 'sunny') return 'clear';
  if (str.includes('partly')) return 'partly-cloudy';
  if (str.includes('cloud') || str.includes('overcast') || str.includes('fog')) return 'cloudy';

  return 'partly-cloudy';
}
