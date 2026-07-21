import { z } from 'zod';

import { TransactionTypeSchema } from './enums';
import { UuidSchema } from './shared';

// ── Requests ──────────────────────────────────────────────────────────────────

export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().nullable().optional(),
  type: TransactionTypeSchema,
});
export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;

export const CategoryFilterSchema = z.object({
  page: z.number().int().optional(),
  pageSize: z.number().int().optional(),
  ids: z.array(UuidSchema).nullable().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  types: z.array(TransactionTypeSchema).nullable().optional(),
});
export type CategoryFilter = z.infer<typeof CategoryFilterSchema>;

// ── Responses ─────────────────────────────────────────────────────────────────

export const CategoryResponseSchema = z.object({
  categoryId: UuidSchema,
  nestId: UuidSchema,
  name: z.string(),
  description: z.string().optional(),
  type: TransactionTypeSchema,
});
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

// A API retorna um array puro de categorias (sem paginação) em /api/categories/list.
export const CategoryListResponseSchema = z.array(CategoryResponseSchema);
export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>;

// /api/categories/create retorna apenas o UUID da categoria criada (não o objeto completo).
export const CreateCategoryResponseSchema = UuidSchema;
