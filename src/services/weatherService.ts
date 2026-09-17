import { mockWeather } from '@/mocks/data';
import { type WeatherQuery, WeatherQuerySchema, WeatherResponseSchema } from '@/schemas/weather';
import type { AppWeather } from '@/types';

import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { ApiError, httpClient } from './api/httpClient';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function toRequestBody(query: WeatherQuery): Record<string, unknown> {
  const source =
    query.source ||
    (query.city
      ? 'manual'
      : typeof query.latitude === 'number' && typeof query.longitude === 'number'
        ? 'gps'
        : 'ip');

  if (source === 'ip') {
    return { source: 'ip' };
  }

  if (source === 'manual') {
    const body: Record<string, unknown> = { source: 'manual' };
    if (query.city) body.city = query.city.trim();
    if (query.state) body.state = query.state;
    return body;
  }

  if (source === 'gps') {
    const body: Record<string, unknown> = { source: 'gps' };
    if (typeof query.latitude === 'number') body.latitude = query.latitude;
    if (typeof query.longitude === 'number') body.longitude = query.longitude;
    return body;
  }

  return { source };
}

function coerceWeather(raw: unknown): AppWeather {
  const parsed = WeatherResponseSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }

  const record = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const city = String(record.city ?? record.locationName ?? mockWeather.city);
  const description = String(record.description ?? record.summary ?? mockWeather.description);

  const tempCandidate = record.temperature ?? record.temperatureCelsius ?? record.temp;
  const temperature = Number(tempCandidate);

  const tempMinCandidate = record.temperatureMin ?? record.tempMin;
  const temperatureMin =
    typeof tempMinCandidate === 'number' && Number.isFinite(tempMinCandidate)
      ? tempMinCandidate
      : undefined;

  const tempMaxCandidate = record.temperatureMax ?? record.tempMax;
  const temperatureMax =
    typeof tempMaxCandidate === 'number' && Number.isFinite(tempMaxCandidate)
      ? tempMaxCandidate
      : undefined;

  const rawSource = String(record.source ?? '');
  const source =
    rawSource === 'manual' || rawSource === 'gps' || rawSource === 'ip'
      ? (rawSource as AppWeather['source'])
      : undefined;

  return {
    city,
    description,
    temperature: Number.isFinite(temperature) ? temperature : mockWeather.temperature,
    temperatureMin,
    temperatureMax,
    source,
    conditionCode: (record.conditionCode as string) ?? null,
    observedAt: (record.observedAt as string) ?? null,
  };
}

export async function getMyWeather(query?: WeatherQuery): Promise<AppWeather> {
  const parsedQuery = WeatherQuerySchema.safeParse(query ?? {});
  const validQuery = parsedQuery.success ? parsedQuery.data : {};

  if (DATA_MODE === 'mock') {
    await delay(100);

    return {
      city: validQuery.city?.trim() || mockWeather.city,
      temperature: mockWeather.temperature,
      temperatureMin: mockWeather.temperatureMin,
      temperatureMax: mockWeather.temperatureMax,
      description: mockWeather.description,
      source: validQuery.source ?? mockWeather.source,
      conditionCode: mockWeather.conditionCode,
      observedAt: mockWeather.observedAt,
    };
  }

  try {
    const raw = await httpClient.post<unknown>(
      ENDPOINTS.dashboard.weather,
      toRequestBody(validQuery)
    );
    return coerceWeather(raw);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Não foi possível carregar os dados de clima.');
  }
}
