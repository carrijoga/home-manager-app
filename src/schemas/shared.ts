import { z } from 'zod';

// z.string().uuid() valida os bits de versão/variante do RFC 4122 e rejeita
// UUIDs "nil"/sequenciais (ex: 00000000-0000-0000-0000-000000000001) usados
// pelo backend para categorias seedadas. Aceita qualquer string no formato
// 8-4-4-4-12 hex, sem exigir conformidade estrita com uma versão específica.
export const UuidSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'UUID inválido');
export const DateTimeSchema = z.string().datetime({ offset: true }).or(z.string());
export const DateSchema = z.string();

// Para responses da API (backend pode retornar string ou number)
export const MoneySchema = z.union([z.number(), z.string()]).transform(Number);

// Para requests front → API (sempre number, nunca NaN, nunca negativo)
export const MoneyRequestSchema = z
  .number()
  .nonnegative('Valor não pode ser negativo')
  .finite('Valor inválido');

export function PaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalCount: z.number().int(),
  });
}

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};
