import { z } from 'zod';

import { UuidSchema } from './shared';

// ── Enum ──────────────────────────────────────────────────────────────────────

export enum CategoryScope {
  Expense = 1,
  Income = 2,
  Shopping = 3,
  Task = 4,
}

export const CategoryScopeSchema = z
  .union([z.number(), z.string()])
  .transform(Number)
  .pipe(z.nativeEnum(CategoryScope));

// ── Requests ──────────────────────────────────────────────────────────────────

export interface CreateCategoryRequest {
  scope: CategoryScope;
  parentCategoryId: string | null;
  name: string;
  icon: string;
  color: string | null;
}

export interface UpdateCategoryRequest {
  name: string;
  icon: string;
  color: string | null;
}

export interface MoveCategoryRequest {
  parentCategoryId: string | null;
  color: string | null;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  categoryId: string;
  scope: CategoryScope;
  parentCategoryId: string | null;
  name: string;
  icon: string;
  color: string;
  children: CategoryResponse[];
}

export const CategoryResponseSchema: z.ZodType<CategoryResponse> = z.lazy(() =>
  z.object({
    categoryId: UuidSchema,
    scope: CategoryScopeSchema,
    parentCategoryId: UuidSchema.nullable(),
    name: z.string(),
    icon: z.string(),
    color: z.string(),
    children: z.array(CategoryResponseSchema).default([]),
  })
);

export const CategoryListResponseSchema = z.array(CategoryResponseSchema);

export const CategorySummaryResponseSchema = z.object({
  categoryId: UuidSchema,
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  parentCategoryId: UuidSchema.nullable(),
  parentName: z.string().nullable(),
});
export type CategorySummaryResponse = z.infer<typeof CategorySummaryResponseSchema>;

export const CategoryModuleUsageResponseSchema = z.object({
  module: z.string(),
  count: z.union([z.number(), z.string()]).transform(Number),
  blocksDeletion: z.boolean(),
});
export type CategoryModuleUsageResponse = z.infer<typeof CategoryModuleUsageResponseSchema>;

export const CategoryUsageResponseSchema = z.object({
  children: z.union([z.number(), z.string()]).transform(Number),
  usages: z.array(CategoryModuleUsageResponseSchema),
  canDelete: z.boolean(),
  blockingReason: z.string().nullable(),
});
export type CategoryUsageResponse = z.infer<typeof CategoryUsageResponseSchema>;

/** POST /api/categories devolve apenas o UUID criado. */
export const CreateCategoryResponseSchema = UuidSchema;
