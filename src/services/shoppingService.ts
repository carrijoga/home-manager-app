/**
 * Serviço para gerenciar listas de compras, itens e categorias.
 * Dual-mode: DATA_MODE === 'mock' usa dados locais; 'api' usa httpClient.
 */

import type {
  CreateShoppingCategoryRequest,
  CreateShoppingItemRequest,
  CreateShoppingListRequest,
  MarkAsPurchasedRequest,
  ShoppingCategoryResponse,
  ShoppingItemResponse,
  ShoppingListResponse,
  ShoppingListSummaryResponse,
  UpdateShoppingItemRequest,
  UpdateShoppingListRequest,
} from '@/schemas/shopping';
import {
  CreateShoppingItemRequestSchema,
  MarkAsPurchasedRequestSchema,
  ShoppingCategoryResponseSchema,
  ShoppingListResponseSchema,
  ShoppingListSummaryResponseSchema,
  UpdateShoppingItemRequestSchema,
} from '@/schemas/shopping';
import type { AppShoppingCategory, AppShoppingItem, AppShoppingList, AppShoppingListSummary } from '@/types';

import { mockShoppingCategories, mockShoppingListDetails, mockShoppingLists } from '../mocks/data';
import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { ApiError, httpClient } from './api/httpClient';

// ── Helper: safeParse ─────────────────────────────────────────────────────────

function safeParse<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { flatten: () => unknown } } },
  raw: unknown,
  name: string,
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    if (import.meta.env.DEV) {
      console.warn(`[shoppingService] ${name}: schema inesperado`, result.error?.flatten());
    }
    return raw as T;
  }
  return result.data!;
}

// ── Helper: validateRequest ───────────────────────────────────────────────────

function validateRequest<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { issues: Array<{ message: string }> } } },
  data: unknown,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(result.error!.issues[0].message, 422);
  }
  return result.data!;
}

// ── Mappers (API response → app-internal type) ────────────────────────────────

function mapCategory(r: ShoppingCategoryResponse): AppShoppingCategory {
  return {
    shoppingCategoryId: r.shoppingCategoryId,
    nestId: r.nestId ?? null,
    name: r.name,
    description: r.description,
    isDefault: r.isDefault,
  };
}

function mapItem(r: ShoppingItemResponse): AppShoppingItem {
  return {
    shoppingItemId: r.shoppingItemId,
    shoppingListId: r.shoppingListId,
    name: r.name,
    quantity: Number(r.quantity),
    unitType: r.unitType,
    shoppingCategoryId: r.shoppingCategoryId ?? null,
    categoryName: r.categoryName ?? null,
    isPurchased: r.isPurchased,
    price: r.price != null ? Number(r.price) : null,
    estimatedPrice: r.estimatedPrice != null ? Number(r.estimatedPrice) : null,
    purchasedAt: r.purchasedAt ?? null,
    notes: r.notes ?? null,
  };
}

function mapListDetail(r: ShoppingListResponse): AppShoppingList {
  return {
    shoppingListId: r.shoppingListId,
    name: r.name,
    monthYear: r.monthYear,
    notes: r.notes ?? null,
    items: r.items.map(mapItem),
  };
}

function mapListSummary(r: ShoppingListSummaryResponse): AppShoppingListSummary {
  return {
    shoppingListId: r.shoppingListId,
    name: r.name,
    monthYear: r.monthYear,
    notes: r.notes ?? null,
    totalItems: Number(r.totalItems),
    purchasedItems: Number(r.purchasedItems),
    totalEstimated: r.totalEstimated != null ? Number(r.totalEstimated) : null,
    totalSpent: r.totalSpent != null ? Number(r.totalSpent) : null,
  };
}

// ── mock state (in-memory mutation for mock mode) ─────────────────────────────

let _mockLists: AppShoppingListSummary[] = [...mockShoppingLists];
const _mockDetails: Record<string, AppShoppingList> = Object.fromEntries(
  Object.entries(mockShoppingListDetails).map(([k, v]) => [k, { ...v, items: [...v.items] }]),
);
let _mockCategories: AppShoppingCategory[] = [...mockShoppingCategories];

// ── ShoppingCategory ──────────────────────────────────────────────────────────

export async function getShoppingCategories(nestId?: string): Promise<AppShoppingCategory[]> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve([..._mockCategories]), 100));
  }

  const raw = await httpClient.get<unknown[]>(ENDPOINTS.shoppingCategories.list, nestId);
  const parsed = (Array.isArray(raw) ? raw : []).map((item) =>
    mapCategory(safeParse(ShoppingCategoryResponseSchema, item, 'getShoppingCategories')),
  );
  return parsed;
}

export async function createShoppingCategory(
  data: CreateShoppingCategoryRequest,
  nestId?: string,
): Promise<AppShoppingCategory> {
  if (DATA_MODE === 'mock') {
    const newCat: AppShoppingCategory = {
      shoppingCategoryId: crypto.randomUUID(),
      nestId: nestId ?? null,
      name: data.name,
      description: data.description ?? null,
      isDefault: false,
    };
    _mockCategories = [..._mockCategories, newCat];
    return new Promise((resolve) => setTimeout(() => resolve(newCat), 100));
  }

  // Backend requires description (even when empty) despite the OpenAPI spec marking it optional
  const payload = { ...data, description: data.description ?? '' };
  const newId = await httpClient.post<string>(ENDPOINTS.shoppingCategories.create, payload, { nestId });
  const allCats = await getShoppingCategories(nestId);
  const found = allCats.find((c) => c.shoppingCategoryId === newId);
  if (!found) throw new Error('Categoria não encontrada após criação');
  return found;
}

export async function deleteShoppingCategory(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    _mockCategories = _mockCategories.filter((c) => c.shoppingCategoryId !== id);
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  await httpClient.del<void>(ENDPOINTS.shoppingCategories.delete(id), nestId);
}

// ── ShoppingList ──────────────────────────────────────────────────────────────

export async function getShoppingLists(
  params?: { year?: number; month?: number },
  nestId?: string,
): Promise<AppShoppingListSummary[]> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve([..._mockLists]), 100));
  }

  let path = ENDPOINTS.shoppingLists.list;
  const qs: string[] = [];
  if (params?.year != null) qs.push(`year=${params.year}`);
  if (params?.month != null) qs.push(`month=${params.month}`);
  if (qs.length) path += `?${qs.join('&')}`;

  const raw = await httpClient.get<unknown[]>(path, nestId);
  return (Array.isArray(raw) ? raw : []).map((item) =>
    mapListSummary(safeParse(ShoppingListSummaryResponseSchema, item, 'getShoppingLists')),
  );
}

export async function getShoppingListById(id: string, nestId?: string): Promise<AppShoppingList> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        const found = _mockDetails[id];
        if (found) resolve({ ...found, items: [...found.items] });
        else reject(new Error(`Lista ${id} não encontrada`));
      }, 150),
    );
  }

  const raw = await httpClient.get<unknown>(ENDPOINTS.shoppingLists.getById(id), nestId);
  return mapListDetail(safeParse(ShoppingListResponseSchema, raw, 'getShoppingListById'));
}

export async function createShoppingList(
  data: CreateShoppingListRequest,
  nestId?: string,
): Promise<AppShoppingList> {
  if (DATA_MODE === 'mock') {
    const newId = crypto.randomUUID();
    const detail: AppShoppingList = {
      shoppingListId: newId,
      name: data.name,
      monthYear: data.monthYear,
      notes: data.notes ?? null,
      items: [],
    };
    const summary: AppShoppingListSummary = {
      shoppingListId: newId,
      name: data.name,
      monthYear: data.monthYear,
      notes: data.notes ?? null,
      totalItems: 0,
      purchasedItems: 0,
      totalEstimated: 0,
      totalSpent: 0,
    };
    _mockDetails[newId] = detail;
    _mockLists = [summary, ..._mockLists];
    return new Promise((resolve) => setTimeout(() => resolve({ ...detail }), 150));
  }

  const newId = await httpClient.post<string>(ENDPOINTS.shoppingLists.create, data, { nestId });
  return {
    shoppingListId: newId,
    name: data.name,
    monthYear: data.monthYear,
    notes: data.notes ?? null,
    items: [],
  };
}

export async function updateShoppingList(
  id: string,
  data: UpdateShoppingListRequest,
  nestId?: string,
): Promise<void> {
  if (DATA_MODE === 'mock') {
    if (_mockDetails[id]) {
      _mockDetails[id] = { ..._mockDetails[id], name: data.name, monthYear: data.monthYear, notes: data.notes ?? null };
    }
    _mockLists = _mockLists.map((l) =>
      l.shoppingListId === id ? { ...l, name: data.name, monthYear: data.monthYear, notes: data.notes ?? null } : l,
    );
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  await httpClient.put<void>(ENDPOINTS.shoppingLists.update(id), data, nestId);
}

export async function deleteShoppingList(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    delete _mockDetails[id];
    _mockLists = _mockLists.filter((l) => l.shoppingListId !== id);
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  await httpClient.del<void>(ENDPOINTS.shoppingLists.delete(id), nestId);
}

// ── ShoppingItem ──────────────────────────────────────────────────────────────

export async function addShoppingItem(
  data: CreateShoppingItemRequest,
  nestId?: string,
): Promise<AppShoppingItem> {
  if (DATA_MODE === 'mock') {
    const catName = _mockCategories.find((c) => c.shoppingCategoryId === data.shoppingCategoryId)?.name ?? null;
    const newItem: AppShoppingItem = {
      shoppingItemId: crypto.randomUUID(),
      shoppingListId: data.shoppingListId,
      name: data.name,
      quantity: Number(data.quantity),
      unitType: data.unitType,
      shoppingCategoryId: data.shoppingCategoryId ?? null,
      categoryName: catName,
      isPurchased: false,
      price: null,
      estimatedPrice: data.estimatedPrice != null ? Number(data.estimatedPrice) : null,
      purchasedAt: null,
      notes: data.notes ?? null,
    };
    if (_mockDetails[data.shoppingListId]) {
      _mockDetails[data.shoppingListId].items = [..._mockDetails[data.shoppingListId].items, newItem];
      _recomputeSummary(data.shoppingListId);
    }
    return new Promise((resolve) => setTimeout(() => resolve(newItem), 100));
  }

  validateRequest(CreateShoppingItemRequestSchema, data);
  const newId = await httpClient.post<string>(ENDPOINTS.shoppingItems.create, data, { nestId });
  const listDetail = await getShoppingListById(data.shoppingListId, nestId);
  const newItem = listDetail.items.find((i) => i.shoppingItemId === newId);
  if (!newItem) throw new Error('Item não encontrado após criação');
  return newItem;
}

export async function uploadShoppingItems(
  listId: string,
  file: File,
  nestId?: string,
): Promise<void> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  const formData = new FormData();
  formData.append('file', file);
  await httpClient.postForm<void>(ENDPOINTS.shoppingItems.upload(listId), formData, { nestId });
}

export async function updateShoppingItem(
  id: string,
  data: UpdateShoppingItemRequest,
  nestId?: string,
): Promise<void> {
  if (DATA_MODE === 'mock') {
    for (const listId of Object.keys(_mockDetails)) {
      const idx = _mockDetails[listId].items.findIndex((i) => i.shoppingItemId === id);
      if (idx !== -1) {
        const catName = _mockCategories.find((c) => c.shoppingCategoryId === data.shoppingCategoryId)?.name ?? null;
        const updated: AppShoppingItem = { ..._mockDetails[listId].items[idx], ...data, categoryName: catName };
        _mockDetails[listId].items = _mockDetails[listId].items.map((item, n) => (n === idx ? updated : item));
        _recomputeSummary(listId);
        break;
      }
    }
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  validateRequest(UpdateShoppingItemRequestSchema, data);
  await httpClient.put<void>(ENDPOINTS.shoppingItems.update(id), data, nestId);
}

export async function deleteShoppingItem(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    for (const listId of Object.keys(_mockDetails)) {
      const before = _mockDetails[listId].items.length;
      _mockDetails[listId].items = _mockDetails[listId].items.filter((i) => i.shoppingItemId !== id);
      if (_mockDetails[listId].items.length !== before) {
        _recomputeSummary(listId);
        break;
      }
    }
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  await httpClient.del<void>(ENDPOINTS.shoppingItems.delete(id), nestId);
}

export async function markItemAsPurchased(
  id: string,
  data: MarkAsPurchasedRequest,
  nestId?: string,
): Promise<void> {
  if (DATA_MODE === 'mock') {
    for (const listId of Object.keys(_mockDetails)) {
      const idx = _mockDetails[listId].items.findIndex((i) => i.shoppingItemId === id);
      if (idx !== -1) {
        _mockDetails[listId].items = _mockDetails[listId].items.map((item, n) =>
          n === idx
            ? { ...item, isPurchased: true, price: Number(data.price), purchasedAt: data.purchasedAt }
            : item,
        );
        _recomputeSummary(listId);
        break;
      }
    }
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  validateRequest(MarkAsPurchasedRequestSchema, data);
  await httpClient.patch<void>(ENDPOINTS.shoppingItems.markAsPurchased(id), data, nestId);
}

export async function unmarkItemAsPurchased(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    for (const listId of Object.keys(_mockDetails)) {
      const idx = _mockDetails[listId].items.findIndex((i) => i.shoppingItemId === id);
      if (idx !== -1) {
        _mockDetails[listId].items = _mockDetails[listId].items.map((item, n) =>
          n === idx ? { ...item, isPurchased: false, price: null, purchasedAt: null } : item,
        );
        _recomputeSummary(listId);
        break;
      }
    }
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  await httpClient.patch<void>(ENDPOINTS.shoppingItems.unmarkAsPurchased(id), undefined, nestId);
}

// ── Private helper ────────────────────────────────────────────────────────────

function _recomputeSummary(listId: string): void {
  const detail = _mockDetails[listId];
  if (!detail) return;
  _mockLists = _mockLists.map((s) => {
    if (s.shoppingListId !== listId) return s;
    return {
      ...s,
      totalItems: detail.items.length,
      purchasedItems: detail.items.filter((i) => i.isPurchased).length,
      totalEstimated: detail.items.reduce((acc, i) => acc + (i.estimatedPrice ?? 0), 0),
      totalSpent: detail.items.filter((i) => i.isPurchased).reduce((acc, i) => acc + (i.price ?? 0), 0),
    };
  });
}
