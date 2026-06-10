// src/components/modules/Shopping/hooks/useShoppingNavigation.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useDebounce } from '@/hooks/useDebounce';
import type { AppShoppingCategory, AppShoppingList, AppShoppingListSummary } from '@/types';

import { addMonths, currentMonthValue } from '../helpers';
import type { ViewMode } from '../types';

interface ShoppingNavigationDeps {
  remoteShoppingLists: AppShoppingListSummary[];
  shoppingCategories: AppShoppingCategory[];
  loadShoppingListDetail: (id: string) => Promise<AppShoppingList>;
}

export function useShoppingNavigation({ remoteShoppingLists, shoppingCategories, loadShoppingListDetail }: ShoppingNavigationDeps) {
  const [shoppingLists, setShoppingLists] = useState(remoteShoppingLists);
  const { showError } = useToastNotifications();

  const [viewMode, setViewMode] = useState<ViewMode>('lists');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<AppShoppingList | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [filterMonth, setFilterMonth] = useState(currentMonthValue);
  const [monthNavDir, setMonthNavDir] = useState<1 | -1>(1);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'name' | 'count' | 'purchased'>('name');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const isSearchPending = searchTerm !== debouncedSearch;
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    setShoppingLists(remoteShoppingLists);
  }, [remoteShoppingLists]);

  const categoryScrollRef = useRef<HTMLDivElement | null>(null);
  const categoryDragRef = useRef({ startX: 0, scrollLeft: 0, isDragging: false });

  const uniqueCategories = useMemo(() => {
    const map = new Map<string, { shoppingCategoryId: string; name: string; isDefault: boolean }>();
    shoppingCategories.forEach((c) => {
      if (!map.has(c.shoppingCategoryId)) map.set(c.shoppingCategoryId, c);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [shoppingCategories]);

  const [filterYear, filterMonthNum] = filterMonth.split('-').map(Number);
  const filteredLists = useMemo(
    () =>
      shoppingLists.filter((l) => {
        const d = new Date(l.monthYear);
        return d.getUTCFullYear() === filterYear && d.getUTCMonth() + 1 === filterMonthNum;
      }),
    [shoppingLists, filterYear, filterMonthNum]
  );

  const categoriesInDetail = useMemo((): string[] => {
    if (!detailData) return [];
    const set = new Set<string>();
    detailData.items.forEach((i) => { if (i.categoryName) set.add(i.categoryName); });
    return Array.from(set).sort((a, b) => {
      if (a === 'Sem categoria') return 1;
      if (b === 'Sem categoria') return -1;
      return a.localeCompare(b, 'pt-BR');
    });
  }, [detailData]);

  const groupedItems = useMemo(() => {
    if (!detailData) return {};
    let items = detailData.items;
    if (categoryFilter === '__unpurchased__') items = items.filter((i) => !i.isPurchased);
    else if (categoryFilter === '__purchased__') items = items.filter((i) => i.isPurchased);
    else if (categoryFilter) items = items.filter((i) => i.categoryName === categoryFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }
    return items.reduce<Record<string, typeof items>>((acc, item) => {
      const key = item.categoryName ?? 'Sem categoria';
      acc[key] = acc[key] ?? [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [detailData, categoryFilter, debouncedSearch]);

  const groupedItemEntries = useMemo(() => {
    const entries = Object.entries(groupedItems);
    switch (sortOrder) {
      case 'name':
        return entries.sort(([a], [b]) => {
          if (a === 'Sem categoria') return 1;
          if (b === 'Sem categoria') return -1;
          return a.localeCompare(b, 'pt-BR');
        });
      case 'count':
        return entries.sort(([, a], [, b]) => b.length - a.length);
      case 'purchased':
        return entries.sort(([, a], [, b]) => {
          const unpurchasedA = a.filter((i) => !i.isPurchased).length;
          const unpurchasedB = b.filter((i) => !i.isPurchased).length;
          return unpurchasedB - unpurchasedA;
        });
    }
  }, [groupedItems, sortOrder]);

  const openListDetail = useCallback(
    async (id: string) => {
      setSelectedListId(id);
      setIsLoadingDetail(true);
      setDetailData(null);
      setViewMode('detail');
      setCategoryFilter(null);
      try {
        const data = await loadShoppingListDetail(id);
        setDetailData(data);
      } catch {
        showError('Erro ao carregar lista.');
        setViewMode('lists');
        setSelectedListId(null);
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [loadShoppingListDetail, showError]
  );

  const backToLists = useCallback(() => {
    setViewMode('lists');
    setSelectedListId(null);
    setDetailData(null);
    setCategoryFilter(null);
  }, []);

  const toggleCategoryCollapse = useCallback((category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const scrollCategories = useCallback((dir: 'left' | 'right') => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const amount = Math.max(160, el.clientWidth * 0.6);
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  const handleCategoryPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(min-width: 768px)').matches) return;
    categoryDragRef.current.isDragging = true;
    categoryDragRef.current.startX = e.clientX;
    categoryDragRef.current.scrollLeft = e.currentTarget.scrollLeft;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handleCategoryPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!categoryDragRef.current.isDragging) return;
    const dx = e.clientX - categoryDragRef.current.startX;
    e.currentTarget.scrollLeft = categoryDragRef.current.scrollLeft - dx;
  }, []);

  const handleCategoryPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!categoryDragRef.current.isDragging) return;
    categoryDragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const navigateMonth = useCallback((dir: 1 | -1) => {
    setMonthNavDir(dir);
    setFilterMonth((m) => addMonths(m, dir));
  }, []);

  const resetMonthToToday = useCallback(() => {
    setMonthNavDir(1);
    setFilterMonth(currentMonthValue());
  }, []);

  return {
    // state
    viewMode, selectedListId, detailData, setDetailData, isLoadingDetail,
    filterMonth, monthNavDir, categoryFilter, setCategoryFilter,
    sortOrder, setSortOrder, searchTerm, setSearchTerm,
    debouncedSearch, isSearchPending, collapsedCategories,
    shoppingLists, setShoppingLists, uniqueCategories,
    // refs
    categoryScrollRef,
    // computed
    filteredLists, categoriesInDetail, groupedItemEntries,
    // actions
    openListDetail, backToLists, toggleCategoryCollapse,
    scrollCategories, handleCategoryPointerDown, handleCategoryPointerMove, handleCategoryPointerUp,
    navigateMonth, resetMonthToToday,
  };
}
