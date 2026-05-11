import { z } from 'zod';

export const UuidSchema = z.string().uuid();
export const DateTimeSchema = z.string().datetime({ offset: true }).or(z.string());
export const DateSchema = z.string();
export const MoneySchema = z.union([z.number(), z.string()]).transform(Number);

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
