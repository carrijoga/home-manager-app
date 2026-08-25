import { z } from 'zod';

import { TransactionTypeSchema } from './enums';
import { UuidSchema } from './shared';

// ── Requests ──────────────────────────────────────────────────────────────────

export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  type: TransactionTypeSchema,
});
export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;

export const UpdateCategoryRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  type: TransactionTypeSchema.optional(),
});
export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;

export const CategoryFilterSchema = z.object({
  page: z.union([z.number().int(), z.string()]).optional(),
  pageSize: z.union([z.number().int(), z.string()]).optional(),
  ids: z.array(UuidSchema).nullable().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  types: z.array(TransactionTypeSchema).nullable().optional(),
});
export type CategoryFilter = z.infer<typeof CategoryFilterSchema>;

export const ListCategoryOptionsQuerySchema = z.object({
  type: TransactionTypeSchema.nullable().optional(),
  ids: z.array(UuidSchema).nullable().optional(),
  description: z.string().nullable().optional(),
});
export type ListCategoryOptionsQuery = z.infer<typeof ListCategoryOptionsQuerySchema>;

// ── Responses ─────────────────────────────────────────────────────────────────

export const CategoryResponseSchema = z.object({
  categoryId: UuidSchema,
  nestId: UuidSchema,
  name: z.string(),
  description: z.string().nullable().optional(),
  type: TransactionTypeSchema,
});
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

// A API retorna um array puro de categorias (sem paginação) em /api/categories/list.
export const CategoryListResponseSchema = z.array(CategoryResponseSchema);
export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>;

export const CategoryOptionResponseSchema = z.object({
  categoryId: UuidSchema,
  name: z.string(),
});
export type CategoryOptionResponse = z.infer<typeof CategoryOptionResponseSchema>;

export const CategoryOptionListResponseSchema = z.array(CategoryOptionResponseSchema);
export type CategoryOptionListResponse = z.infer<typeof CategoryOptionListResponseSchema>;

// /api/categories/create retorna apenas o UUID da categoria criada (não o objeto completo).
export const CreateCategoryResponseSchema = UuidSchema;
