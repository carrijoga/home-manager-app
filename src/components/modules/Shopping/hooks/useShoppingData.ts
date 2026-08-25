import { useCallback, useEffect, useState } from 'react';

import { useApp } from '@/contexts/AppContext';
import * as shoppingService from '@/services/shoppingService';
import type {
  AppShoppingCategory,
  AppShoppingItem,
  AppShoppingList,
  AppShoppingListSummary,
} from '@/types';

import { getItemEstimatedTotal, getItemSpentTotal } from '../helpers';

function dedupeCategories(cats: AppShoppingCategory[]): AppShoppingCategory[] {
  const map = new Map<string, AppShoppingCategory>();
  cats.forEach((c) => {
    if (!map.has(c.shoppingCategoryId)) map.set(c.shoppingCategoryId, c);
  });
  return Array.from(map.values());
}

function buildSummaryFromDetail(detail: AppShoppingList): AppShoppingListSummary {
  const totals = detail.items.reduce(
    (acc, item) => {
      acc.totalItems += 1;
      if (item.isPurchased) acc.purchasedItems += 1;
      acc.totalEstimated += getItemEstimatedTotal(
        item.estimatedPrice,
        item.quantity,
        item.unitType
      );
      if (item.isPurchased)
        acc.totalSpent += getItemSpentTotal(item.price, item.quantity, item.unitType);
      return acc;
    },
    { totalItems: 0, purchasedItems: 0, totalEstimated: 0, totalSpent: 0 }
  );
  return {
    shoppingListId: detail.shoppingListId,
    name: detail.name,
    monthYear: detail.monthYear,
    notes: detail.notes ?? null,
    ...totals,
  };
}

export function useShoppingData() {
  const { activeNestId } = useApp();
  const nestId = activeNestId ?? undefined;

  const [shoppingLists, setShoppingLists] = useState<AppShoppingListSummary[]>([]);
  const [shoppingCategories, setShoppingCategories] = useState<AppShoppingCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeNestId) return;
    let isMounted = true;
    setLoading(true);
    Promise.all([
      shoppingService.getShoppingLists(undefined, activeNestId),
      shoppingService.getShoppingCategories(activeNestId),
    ])
      .then(([lists, cats]) => {
        if (!isMounted) return;
        setShoppingLists(lists);
        setShoppingCategories(dedupeCategories(cats));
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [activeNestId]);

  const loadShoppingListDetail = useCallback(
    (id: string): Promise<AppShoppingList> => shoppingService.getShoppingListById(id, nestId),
    [nestId]
  );

  const createShoppingList = useCallback(
    async (name: string, monthYear: string, notes?: string) => {
      const detail = await shoppingService.createShoppingList({ name, monthYear, notes }, nestId);
      const summary: AppShoppingListSummary = {
        shoppingListId: detail.shoppingListId,
        name: detail.name,
        monthYear: detail.monthYear,
        notes: detail.notes,
        totalItems: 0,
        purchasedItems: 0,
        totalEstimated: 0,
        totalSpent: 0,
      };
      setShoppingLists((prev) => [summary, ...prev]);
    },
    [nestId]
  );

  const updateShoppingList = useCallback(
    async (id: string, name: string, monthYear: string, notes?: string) => {
      await shoppingService.updateShoppingList(id, { name, monthYear, notes }, nestId);
      setShoppingLists((prev) =>
        prev.map((l) =>
          l.shoppingListId === id ? { ...l, name, monthYear, notes: notes ?? null } : l
        )
      );
    },
    [nestId]
  );

  const deleteShoppingList = useCallback(
    async (id: string) => {
      await shoppingService.deleteShoppingList(id, nestId);
      setShoppingLists((prev) => prev.filter((l) => l.shoppingListId !== id));
    },
    [nestId]
  );

  const finishShoppingList = useCallback(
    async (id: string) => {
      await shoppingService.finishShoppingList(id, nestId);
      setShoppingLists((prev) =>
        prev.map((l) => (l.shoppingListId === id ? { ...l, isFinished: true } : l))
      );
    },
    [nestId]
  );

  const unfinishShoppingList = useCallback(
    async (id: string) => {
      await shoppingService.unfinishShoppingList(id, nestId);
      setShoppingLists((prev) =>
        prev.map((l) => (l.shoppingListId === id ? { ...l, isFinished: false } : l))
      );
    },
    [nestId]
  );

  const addShoppingItem = useCallback(
    async (
      listId: string,
      name: string,
      quantity: number,
      unitType: number,
      categoryId?: string | null,
      estimatedPrice?: number | null,
      notes?: string | null
    ): Promise<AppShoppingItem> => {
      const newItem = await shoppingService.addShoppingItem(
        {
          shoppingListId: listId,
          name,
          quantity,
          unitType,
          shoppingCategoryId: categoryId,
          estimatedPrice,
          notes,
        },
        nestId
      );
      const estimatedContrib = getItemEstimatedTotal(estimatedPrice, quantity, unitType);
      setShoppingLists((prev) =>
        prev.map((l) =>
          l.shoppingListId === listId
            ? {
                ...l,
                totalItems: l.totalItems + 1,
                totalEstimated: (l.totalEstimated ?? 0) + estimatedContrib,
              }
            : l
        )
      );
      return newItem;
    },
    [nestId]
  );

  const updateShoppingItem = useCallback(
    async (
      id: string,
      _listId: string,
      name: string,
      quantity: number,
      unitType: number,
      categoryId?: string | null,
      estimatedPrice?: number | null,
      notes?: string | null
    ) => {
      await shoppingService.updateShoppingItem(
        id,
        { name, quantity, unitType, shoppingCategoryId: categoryId, estimatedPrice, notes },
        nestId
      );
    },
    [nestId]
  );

  const deleteShoppingItem = useCallback(
    async (
      id: string,
      listId: string,
      quantity: number,
      unitType: number,
      estimatedPrice?: number | null,
      isPurchased?: boolean,
      price?: number | null
    ) => {
      await shoppingService.deleteShoppingItem(id, nestId);
      const estimatedContrib = getItemEstimatedTotal(estimatedPrice, quantity, unitType);
      const spentContrib = getItemSpentTotal(price, quantity, unitType);
      setShoppingLists((prev) =>
        prev.map((l) =>
          l.shoppingListId === listId
            ? {
                ...l,
                totalItems: Math.max(0, l.totalItems - 1),
                purchasedItems: isPurchased ? Math.max(0, l.purchasedItems - 1) : l.purchasedItems,
                totalEstimated: Math.max(0, (l.totalEstimated ?? 0) - estimatedContrib),
                totalSpent: isPurchased
                  ? Math.max(0, (l.totalSpent ?? 0) - spentContrib)
                  : l.totalSpent,
              }
            : l
        )
      );
    },
    [nestId]
  );

  const markItemAsPurchased = useCallback(
    async (
      id: string,
      listId: string,
      quantity: number,
      unitType: number,
      price: number,
      purchasedAt: string
    ) => {
      await shoppingService.markItemAsPurchased(id, { quantity, price, purchasedAt }, nestId);
      const spentContrib = getItemSpentTotal(price, quantity, unitType);
      setShoppingLists((prev) =>
        prev.map((l) =>
          l.shoppingListId === listId
            ? {
                ...l,
                purchasedItems: l.purchasedItems + 1,
                totalSpent: (l.totalSpent ?? 0) + spentContrib,
              }
            : l
        )
      );
    },
    [nestId]
  );

  const unmarkItemAsPurchased = useCallback(
    async (id: string, listId: string, quantity: number, unitType: number, price: number) => {
      await shoppingService.unmarkItemAsPurchased(listId, id, nestId);
      const spentContrib = getItemSpentTotal(price, quantity, unitType);
      setShoppingLists((prev) =>
        prev.map((l) =>
          l.shoppingListId === listId
            ? {
                ...l,
                purchasedItems: Math.max(0, l.purchasedItems - 1),
                totalSpent: Math.max(0, (l.totalSpent ?? 0) - spentContrib),
              }
            : l
        )
      );
    },
    [nestId]
  );

  const uploadShoppingItems = useCallback(
    async (listId: string, file: File): Promise<AppShoppingList> => {
      await shoppingService.uploadShoppingItems(listId, file, nestId);
      const [detail, categories] = await Promise.all([
        shoppingService.getShoppingListById(listId, nestId),
        shoppingService.getShoppingCategories(nestId),
      ]);
      setShoppingCategories(dedupeCategories(categories));
      const summary = buildSummaryFromDetail(detail);
      setShoppingLists((prev) => {
        const hasList = prev.some((l) => l.shoppingListId === listId);
        if (!hasList) return [summary, ...prev];
        return prev.map((l) => (l.shoppingListId === listId ? summary : l));
      });
      return detail;
    },
    [nestId]
  );

  const createShoppingCategory = useCallback(
    async (name: string, description?: string): Promise<AppShoppingCategory> => {
      const cat = await shoppingService.createShoppingCategory({ name, description }, nestId);
      setShoppingCategories((prev) => dedupeCategories([...prev, cat]));
      return cat;
    },
    [nestId]
  );

  const deleteShoppingCategory = useCallback(
    async (id: string) => {
      await shoppingService.deleteShoppingCategory(id, nestId);
      setShoppingCategories((prev) => prev.filter((c) => c.shoppingCategoryId !== id));
    },
    [nestId]
  );

  return {
    shoppingLists,
    setShoppingLists,
    shoppingCategories,
    loading,
    loadShoppingListDetail,
    createShoppingList,
    updateShoppingList,
    deleteShoppingList,
    finishShoppingList,
    unfinishShoppingList,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    markItemAsPurchased,
    unmarkItemAsPurchased,
    uploadShoppingItems,
    createShoppingCategory,
    deleteShoppingCategory,
  };
}
