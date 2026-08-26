import type {
  CategoryFilter,
  CategoryListResponse,
  CategoryOptionResponse,
  CategoryResponse,
  CreateCategoryRequest,
  ListCategoryOptionsQuery,
  UpdateCategoryRequest,
} from '@/schemas/category';
import {
  CategoryListResponseSchema,
  CategoryOptionListResponseSchema,
  CategoryResponseSchema,
  CreateCategoryResponseSchema,
} from '@/schemas/category';

import { mockFinancialCategories } from '../mocks/data';
import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

// Cópia mutável — simula persistência entre chamadas no modo mock, sem alterar
// o array exportado original (reinicia em full reload/HMR, igual a `finSeq` em mocks/data.ts).
let mockCategoriesStore: CategoryResponse[] = [...mockFinancialCategories];

function safeParse<T>(
  schema: {
    safeParse: (v: unknown) => { success: boolean; data?: T; error?: { flatten: () => unknown } };
  },
  raw: unknown,
  name: string
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

/** Lista categorias com filtro. A API retorna um array puro (sem paginação). */
export async function listCategories(
  filter?: CategoryFilter,
  nestId?: string
): Promise<CategoryListResponse> {
  if (DATA_MODE === 'mock') {
    const items = filter?.types?.length
      ? mockCategoriesStore.filter((c) => filter.types!.includes(c.type))
      : mockCategoriesStore;
    return new Promise((resolve) => setTimeout(() => resolve(items), 100));
  }
  const raw = await httpClient.post<unknown>(ENDPOINTS.categories.list, filter ?? {}, { nestId });
  return safeParse(CategoryListResponseSchema, raw, 'listCategories');
}

/** Lista um conjunto minificado de categorias (apenas ID e nome) para selects. */
export async function listCategoryOptions(
  query?: ListCategoryOptionsQuery,
  nestId?: string
): Promise<CategoryOptionResponse[]> {
  if (DATA_MODE === 'mock') {
    let items = [...mockCategoriesStore];
    if (query?.type != null) {
      items = items.filter((c) => c.type === query.type);
    }
    if (query?.ids?.length) {
      items = items.filter((c) => query.ids!.includes(c.categoryId));
    }
    if (query?.description) {
      const descLower = query.description.toLowerCase();
      items = items.filter((c) => c.description?.toLowerCase().includes(descLower));
    }
    const options: CategoryOptionResponse[] = items.map((c) => ({
      categoryId: c.categoryId,
      name: c.name,
    }));
    return new Promise((resolve) => setTimeout(() => resolve(options), 100));
  }
  const raw = await httpClient.post<unknown>(ENDPOINTS.categories.listOptions, query ?? {}, {
    nestId,
  });
  return safeParse(CategoryOptionListResponseSchema, raw, 'listCategoryOptions');
}

/**
 * Cria uma nova categoria. A API retorna apenas o UUID da categoria criada,
 * então o objeto completo é montado localmente a partir do payload enviado.
 */
export async function createCategory(
  payload: CreateCategoryRequest,
  nestId?: string
): Promise<CategoryResponse> {
  if (DATA_MODE === 'mock') {
    const created: CategoryResponse = {
      categoryId: `fincat-mock-${Date.now()}`,
      nestId: nestId ?? 'nest-mock-0001',
      name: payload.name,
      description: payload.description ?? undefined,
      type: payload.type,
    };
    mockCategoriesStore = [...mockCategoriesStore, created];
    return new Promise((resolve) => setTimeout(() => resolve(created), 100));
  }
  const raw = await httpClient.post<unknown>(ENDPOINTS.categories.create, payload, { nestId });
  const categoryId = safeParse(CreateCategoryResponseSchema, raw, 'createCategory');
  return {
    categoryId,
    nestId: nestId ?? '',
    name: payload.name,
    description: payload.description ?? undefined,
    type: payload.type,
  };
}

/** Busca uma categoria pelo ID */
export async function getCategoryById(id: string, nestId?: string): Promise<CategoryResponse> {
  const raw = await httpClient.get<unknown>(`${ENDPOINTS.categories.getById}?id=${id}`, nestId);
  return safeParse(CategoryResponseSchema, raw, 'getCategoryById');
}

/** Atualiza os dados de uma categoria */
export async function updateCategory(
  id: string,
  payload: UpdateCategoryRequest,
  nestId?: string
): Promise<CategoryResponse> {
  if (DATA_MODE === 'mock') {
    const idx = mockCategoriesStore.findIndex((c) => c.categoryId === id);
    if (idx >= 0) {
      mockCategoriesStore[idx] = {
        ...mockCategoriesStore[idx],
        name: payload.name ?? mockCategoriesStore[idx].name,
        description:
          payload.description !== undefined
            ? (payload.description ?? undefined)
            : mockCategoriesStore[idx].description,
        type: payload.type ?? mockCategoriesStore[idx].type,
      };
      return new Promise((resolve) => setTimeout(() => resolve(mockCategoriesStore[idx]), 100));
    }
  }
  await httpClient.put<void>(ENDPOINTS.categories.update(id), payload, nestId);
  try {
    return await getCategoryById(id, nestId);
  } catch {
    return {
      categoryId: id,
      nestId: nestId ?? '',
      name: payload.name ?? '',
      description: payload.description ?? undefined,
      type: payload.type ?? 1,
    };
  }
}

/** Exclui uma categoria */
export async function deleteCategory(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    const idx = mockCategoriesStore.findIndex((c) => c.categoryId === id);
    if (idx >= 0) {
      mockCategoriesStore.splice(idx, 1);
    }
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
  await httpClient.del<void>(ENDPOINTS.categories.delete(id), nestId);
}
