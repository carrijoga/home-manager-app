import { z } from 'zod';

import { UnitTypeSchema } from './enums';
import { DateTimeSchema, MoneyRequestSchema, MoneySchema, UuidSchema } from './shared';

// ── Requests — ShoppingCategory ───────────────────────────────────────────────

export const CreateShoppingCategoryRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().nullable().optional(),
});
export type CreateShoppingCategoryRequest = z.infer<typeof CreateShoppingCategoryRequestSchema>;

// ── Requests — ShoppingList ───────────────────────────────────────────────────

export const CreateShoppingListRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  monthYear: DateTimeSchema,
  notes: z.string().nullable().optional(),
});
export type CreateShoppingListRequest = z.infer<typeof CreateShoppingListRequestSchema>;

export const UpdateShoppingListRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  monthYear: DateTimeSchema,
  notes: z.string().nullable().optional(),
});
export type UpdateShoppingListRequest = z.infer<typeof UpdateShoppingListRequestSchema>;

// ── Requests — ShoppingItem ───────────────────────────────────────────────────

export const CreateShoppingItemRequestSchema = z.object({
  shoppingListId: UuidSchema,
  name: z.string().min(1, 'Nome é obrigatório'),
  quantity: MoneySchema,
  unitType: UnitTypeSchema,
  shoppingCategoryId: UuidSchema.nullable().optional(),
  estimatedPrice: MoneyRequestSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type CreateShoppingItemRequest = z.infer<typeof CreateShoppingItemRequestSchema>;

export const UpdateShoppingItemRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  quantity: MoneySchema,
  unitType: UnitTypeSchema,
  shoppingCategoryId: UuidSchema.nullable().optional(),
  estimatedPrice: MoneyRequestSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type UpdateShoppingItemRequest = z.infer<typeof UpdateShoppingItemRequestSchema>;

export const MarkAsPurchasedRequestSchema = z.object({
  price: MoneyRequestSchema,
  purchasedAt: DateTimeSchema,
});
export type MarkAsPurchasedRequest = z.infer<typeof MarkAsPurchasedRequestSchema>;

// ── Responses ─────────────────────────────────────────────────────────────────

export const ShoppingCategoryResponseSchema = z.object({
  shoppingCategoryId: UuidSchema,
  nestId: UuidSchema.nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isDefault: z.boolean(),
});
export type ShoppingCategoryResponse = z.infer<typeof ShoppingCategoryResponseSchema>;

export const ShoppingItemResponseSchema = z.object({
  shoppingItemId: UuidSchema,
  shoppingListId: UuidSchema,
  name: z.string(),
  quantity: MoneySchema,
  unitType: UnitTypeSchema,
  shoppingCategoryId: UuidSchema.nullable().optional(),
  categoryName: z.string().nullable().optional(),
  isPurchased: z.boolean(),
  price: MoneySchema.nullable().optional(),
  estimatedPrice: MoneySchema.nullable().optional(),
  purchasedAt: DateTimeSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type ShoppingItemResponse = z.infer<typeof ShoppingItemResponseSchema>;

export const ShoppingListResponseSchema = z.object({
  shoppingListId: UuidSchema,
  name: z.string(),
  monthYear: DateTimeSchema,
  notes: z.string().nullable().optional(),
  items: z.array(ShoppingItemResponseSchema),
});
export type ShoppingListResponse = z.infer<typeof ShoppingListResponseSchema>;

export const ShoppingListSummaryResponseSchema = z.object({
  shoppingListId: UuidSchema,
  name: z.string(),
  monthYear: DateTimeSchema,
  notes: z.string().nullable().optional(),
  totalItems: z.union([z.number(), z.string()]).transform(Number),
  purchasedItems: z.union([z.number(), z.string()]).transform(Number),
  totalEstimated: MoneySchema.nullable().optional(),
  totalSpent: MoneySchema.nullable().optional(),
  isFinished: z.boolean().optional(),
});
export type ShoppingListSummaryResponse = z.infer<typeof ShoppingListSummaryResponseSchema>;
