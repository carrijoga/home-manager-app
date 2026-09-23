import { getCurrentLanguage, getErrorMessageByCode } from '@/i18n';
import {
  CategoryListResponseSchema,
  type CategoryResponse,
  CategoryResponseSchema,
  CategoryScope,
  type CategoryUsageResponse,
  CategoryUsageResponseSchema,
  type CreateCategoryRequest,
  CreateCategoryResponseSchema,
  type MoveCategoryRequest,
  type UpdateCategoryRequest,
} from '@/schemas/category';

import { mockCategoryTree } from '../mocks/data';
import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { ApiError, httpClient } from './api/httpClient';

// ── Mock store ────────────────────────────────────────────────────────────────
// Cópia profunda mutável: simula persistência entre chamadas no modo mock
// (reinicia em full reload/HMR).
let mockStore: CategoryResponse[] = structuredClone(mockCategoryTree);

const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 100));

function sortTree(tree: CategoryResponse[]): CategoryResponse[] {
  return [...tree]
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((c) => ({ ...c, children: sortTree(c.children) }));
}

function mockFind(id: string): { cat: CategoryResponse; parent: CategoryResponse | null } | null {
  for (const root of mockStore) {
    if (root.categoryId === id) return { cat: root, parent: null };
    const child = root.children.find((c) => c.categoryId === id);
    if (child) return { cat: child, parent: root };
  }
  return null;
}

function mockFail(code: string): never {
  const message = getErrorMessageByCode(code, getCurrentLanguage()) ?? code;
  throw new ApiError(message, 400, code);
}

function safeParse<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { flatten: () => unknown } } },
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
  return result.data as T;
}

// ── API ───────────────────────────────────────────────────────────────────────

/** Árvore de categorias (principais com subcategorias), em ordem alfabética. */
export async function listCategories(
  nestId: string | undefined,
  scope?: CategoryScope
): Promise<CategoryResponse[]> {
  if (DATA_MODE === 'mock') {
    const items = scope ? mockStore.filter((c) => c.scope === scope) : mockStore;
    return delay(sortTree(structuredClone(items)));
  }
  const path = scope ? `${ENDPOINTS.categories.list}?scope=${scope}` : ENDPOINTS.categories.list;
  const raw = await httpClient.get<unknown>(path, nestId);
  return safeParse(CategoryListResponseSchema, raw, 'listCategories');
}

export async function getCategoryById(nestId: string | undefined, id: string): Promise<CategoryResponse> {
  if (DATA_MODE === 'mock') {
    const found = mockFind(id);
    if (!found) mockFail('Category_NotFound');
    return delay(structuredClone(found.cat));
  }
  const raw = await httpClient.get<unknown>(ENDPOINTS.categories.getById(id), nestId);
  return safeParse(CategoryResponseSchema, raw, 'getCategoryById');
}

export async function getCategoryUsage(
  nestId: string | undefined,
  id: string
): Promise<CategoryUsageResponse> {
  if (DATA_MODE === 'mock') {
    const found = mockFind(id);
    if (!found) mockFail('Category_NotFound');
    const children = found.cat.children.length;
    return delay({
      children,
      usages: [],
      canDelete: children === 0,
      blockingReason: children > 0 ? 'Category_CannotDeleteWithChildren' : null,
    });
  }
  const raw = await httpClient.get<unknown>(ENDPOINTS.categories.usage(id), nestId);
  return safeParse(CategoryUsageResponseSchema, raw, 'getCategoryUsage');
}

/** Cria uma categoria e devolve o UUID criado. */
export async function createCategory(
  nestId: string | undefined,
  req: CreateCategoryRequest
): Promise<string> {
  if (DATA_MODE === 'mock') {
    const id = crypto.randomUUID();
    if (req.parentCategoryId) {
      const parent = mockFind(req.parentCategoryId);
      if (!parent) mockFail('Category_NotFound');
      if (parent.parent) mockFail('Category_MaxDepthExceeded');
      if (parent.cat.children.some((c) => c.name.toLowerCase() === req.name.toLowerCase()))
        mockFail('Category_NameAlreadyExists');
      parent.cat.children.push({
        categoryId: id,
        scope: parent.cat.scope,
        parentCategoryId: parent.cat.categoryId,
        name: req.name,
        icon: req.icon,
        color: parent.cat.color,
        children: [],
      });
    } else {
      if (mockStore.some((c) => c.scope === req.scope && c.name.toLowerCase() === req.name.toLowerCase()))
        mockFail('Category_NameAlreadyExists');
      mockStore.push({
        categoryId: id,
        scope: req.scope,
        parentCategoryId: null,
        name: req.name,
        icon: req.icon,
        color: req.color ?? '#64748B',
        children: [],
      });
    }
    return delay(id);
  }
  const raw = await httpClient.post<unknown>(ENDPOINTS.categories.create, req, { nestId });
  return safeParse(CreateCategoryResponseSchema, raw, 'createCategory');
}

export async function updateCategory(
  nestId: string | undefined,
  id: string,
  req: UpdateCategoryRequest
): Promise<void> {
  if (DATA_MODE === 'mock') {
    const found = mockFind(id);
    if (!found) mockFail('Category_NotFound');
    found.cat.name = req.name;
    found.cat.icon = req.icon;
    if (!found.parent && req.color) {
      found.cat.color = req.color;
      found.cat.children.forEach((c) => (c.color = req.color!));
    }
    return delay(undefined);
  }
  await httpClient.put<void>(ENDPOINTS.categories.update(id), req, nestId);
}

export async function moveCategory(
  nestId: string | undefined,
  id: string,
  req: MoveCategoryRequest
): Promise<void> {
  if (DATA_MODE === 'mock') {
    const found = mockFind(id);
    if (!found) mockFail('Category_NotFound');
    const { cat, parent } = found;
    if (req.parentCategoryId === cat.categoryId) mockFail('Category_InvalidMove');
    if (req.parentCategoryId && cat.children.length > 0) mockFail('Category_MaxDepthExceeded');
    // Valida o destino ANTES de remover a categoria da posição atual, para
    // que um destino inválido nunca deixe a árvore mock num estado
    // inconsistente (categoria removida do pai sem ter sido reinserida).
    let target: { cat: CategoryResponse; parent: CategoryResponse | null } | null = null;
    if (req.parentCategoryId) {
      target = mockFind(req.parentCategoryId);
      if (!target || target.parent || target.cat.scope !== cat.scope) mockFail('Category_ParentScopeMismatch');
    }
    // remove da posição atual
    if (parent) parent.children = parent.children.filter((c) => c.categoryId !== id);
    else mockStore = mockStore.filter((c) => c.categoryId !== id);
    if (target) {
      target.cat.children.push({ ...cat, parentCategoryId: target.cat.categoryId, color: target.cat.color });
    } else {
      mockStore.push({ ...cat, parentCategoryId: null, color: req.color ?? cat.color });
    }
    return delay(undefined);
  }
  await httpClient.put<void>(ENDPOINTS.categories.move(id), req, nestId);
}

export async function deleteCategory(nestId: string | undefined, id: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    const found = mockFind(id);
    if (!found) mockFail('Category_NotFound');
    if (found.cat.children.length > 0) mockFail('Category_CannotDeleteWithChildren');
    if (found.parent) found.parent.children = found.parent.children.filter((c) => c.categoryId !== id);
    else mockStore = mockStore.filter((c) => c.categoryId !== id);
    return delay(undefined);
  }
  await httpClient.del<void>(ENDPOINTS.categories.delete(id), nestId);
}
