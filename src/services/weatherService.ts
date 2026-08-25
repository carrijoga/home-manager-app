import { mockWeather } from '@/mocks/data';
import { type WeatherQuery, WeatherQuerySchema, WeatherResponseSchema } from '@/schemas/weather';
import type { AppWeather } from '@/types';

import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { ApiError, httpClient } from './api/httpClient';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function toRequestBody(query: WeatherQuery): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (query.city) body.city = query.city.trim();
  if (query.state) body.state = query.state;
  if (typeof query.latitude === 'number') body.latitude = query.latitude;
  if (typeof query.longitude === 'number') body.longitude = query.longitude;
  if (query.source) body.source = query.source;
  return body;
}

function coerceWeather(raw: unknown): AppWeather {
  const parsed = WeatherResponseSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }

  const record = raw as Record<string, unknown>;
  const city = String(record.city ?? record.locationName ?? mockWeather.city);
  const description = String(record.description ?? record.summary ?? mockWeather.description);

  const tempCandidate = record.temperature ?? record.temperatureCelsius ?? record.temp;
  const temperature = Number(tempCandidate);

  return {
    city,
    description,
    temperature: Number.isFinite(temperature) ? temperature : mockWeather.temperature,
    source: (record.source as AppWeather['source']) ?? undefined,
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
