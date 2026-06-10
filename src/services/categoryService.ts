import type {
  CategoryFilter,
  CategoryListResponse,
  CategoryResponse,
  CreateCategoryRequest,
} from '@/schemas/category';
import { CategoryListResponseSchema,CategoryResponseSchema } from '@/schemas/category';

import { mockFinancialCategories } from '../mocks/data';
import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

function safeParse<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { flatten: () => unknown } } },
  raw: unknown,
  name: string,
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    if (import.meta.env.DEV) {
      console.warn(`[categoryService] ${name}: schema inesperado`, result.error?.flatten());
    }
    return raw as T;
  }
  return result.data!;
}

/** Lista categorias com filtro e paginação */
export async function listCategories(filter?: CategoryFilter, nestId?: string): Promise<CategoryListResponse> {
  if (DATA_MODE === 'mock') {
    const items = filter?.types?.length
      ? mockFinancialCategories.filter(c => filter.types!.includes(c.type))
      : mockFinancialCategories;
    return new Promise(resolve =>
      setTimeout(() => resolve({ items, page: 1, pageSize: items.length, totalCount: items.length }), 100),
    );
  }
  const raw = await httpClient.post<unknown>(ENDPOINTS.categories.list, filter ?? {}, { nestId });
  return safeParse(CategoryListResponseSchema, raw, 'listCategories');
}

/** Cria uma nova categoria */
export async function createCategory(payload: CreateCategoryRequest, nestId?: string): Promise<CategoryResponse> {
  const raw = await httpClient.post<unknown>(ENDPOINTS.categories.create, payload, { nestId });
  return safeParse(CategoryResponseSchema, raw, 'createCategory');
}

/** Busca uma categoria pelo ID */
export async function getCategoryById(id: string, nestId?: string): Promise<CategoryResponse> {
  const raw = await httpClient.get<unknown>(`${ENDPOINTS.categories.getById}?id=${id}`, nestId);
  return safeParse(CategoryResponseSchema, raw, 'getCategoryById');
}
