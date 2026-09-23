import { useCallback, useEffect, useMemo, useState } from 'react';

import { useApp } from '@/contexts/AppContext';
import { type FlatCategory, flattenTree } from '@/lib/categories';
import type {
  CategoryResponse,
  CategoryScope,
  CreateCategoryRequest,
  MoveCategoryRequest,
  UpdateCategoryRequest,
} from '@/schemas/category';
import * as categoryService from '@/services/categoryService';

// ── Cache de módulo ───────────────────────────────────────────────────────────
// Chave `${nestId}:${scope}`. Várias instâncias do hook (página + pickers) leem
// a mesma entrada; mutações invalidam o escopo e notificam todos os assinantes.

interface Entry {
  data: CategoryResponse[] | null;
  promise: Promise<CategoryResponse[]> | null;
  error: unknown;
}

const cache = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();

function getEntry(key: string): Entry {
  let entry = cache.get(key);
  if (!entry) {
    entry = { data: null, promise: null, error: null };
    cache.set(key, entry);
  }
  return entry;
}

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

function load(
  key: string,
  nestId: string,
  scope: CategoryScope,
  force = false
): Promise<CategoryResponse[]> {
  const entry = getEntry(key);
  if (entry.promise) return entry.promise;
  if (entry.data && !force) return Promise.resolve(entry.data);
  entry.promise = categoryService
    .listCategories(nestId, scope)
    .then((data) => {
      entry.data = data;
      entry.error = null;
      return data;
    })
    .catch((err) => {
      entry.error = err;
      throw err;
    })
    .finally(() => {
      entry.promise = null;
      notify(key);
    });
  notify(key);
  return entry.promise;
}

export function clearCategoryCache(): void {
  cache.clear();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseCategoriesResult {
  tree: CategoryResponse[];
  flat: FlatCategory<CategoryResponse>[];
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
  create: (req: Omit<CreateCategoryRequest, 'scope'>) => Promise<string>;
  update: (id: string, req: UpdateCategoryRequest) => Promise<void>;
  move: (id: string, req: MoveCategoryRequest) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useCategories(scope: CategoryScope): UseCategoriesResult {
  const { activeNestId } = useApp();
  const nestId = activeNestId ?? undefined;
  const key = `${nestId ?? 'none'}:${scope}`;
  const [, setTick] = useState(0);

  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    let set = listeners.get(key);
    if (!set) {
      set = new Set();
      listeners.set(key, set);
    }
    set.add(rerender);
    if (nestId) load(key, nestId, scope).catch(() => {});
    return () => {
      set!.delete(rerender);
    };
  }, [key, nestId, scope]);

  const entry = getEntry(key);
  const data = entry.data;
  const flat = useMemo(() => flattenTree(data ?? []), [data]);

  const reload = useCallback(async () => {
    if (!nestId) return;
    await load(key, nestId, scope, true);
  }, [key, nestId, scope]);

  const mutate = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      const result = await fn();
      await reload().catch(() => {});
      return result;
    },
    [reload]
  );

  return {
    tree: data ?? [],
    flat,
    loading: entry.data === null && (entry.promise !== null || (!!nestId && entry.error === null)),
    error: entry.error,
    reload,
    create: (req) => mutate(() => categoryService.createCategory(nestId, { ...req, scope })),
    update: (id, req) => mutate(() => categoryService.updateCategory(nestId, id, req)),
    move: (id, req) => mutate(() => categoryService.moveCategory(nestId, id, req)),
    remove: (id) => mutate(() => categoryService.deleteCategory(nestId, id)),
  };
}
