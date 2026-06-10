import { z } from 'zod';

export const WeatherSourceSchema = z.enum(['gps', 'ip', 'manual']);

export const WeatherResponseSchema = z.object({
  city: z.string(),
  temperature: z.number(),
  description: z.string(),
  source: WeatherSourceSchema.optional(),
  conditionCode: z.string().nullable().optional(),
  observedAt: z.string().nullable().optional(),
});

export type WeatherSource = z.infer<typeof WeatherSourceSchema>;
export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;

export const WeatherQuerySchema = z.object({
  city: z.string().min(1).optional(),
  state: z.string().optional(),
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
  source: WeatherSourceSchema.optional(),
});

export type WeatherQuery = z.infer<typeof WeatherQuerySchema>;
