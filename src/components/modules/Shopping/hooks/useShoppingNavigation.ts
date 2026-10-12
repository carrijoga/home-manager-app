import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useDebounce } from '@/hooks/useDebounce';
import type { CategoryResponse } from '@/schemas/category';
import type { AppShoppingList, AppShoppingListSummary } from '@/types';

import { getMainCategoryKey, groupItemsByMainCategory, type ItemSection, type SectionOption } from '../grouping';
import { addMonths, currentMonthValue, fromISOMonthYear } from '../helpers';
import type { ViewMode } from '../types';

interface ShoppingNavigationDeps {
  remoteShoppingLists: AppShoppingListSummary[];
  categoryTree: CategoryResponse[];
  loadShoppingListDetail: (id: string) => Promise<AppShoppingList>;
}

export function useShoppingNavigation({
  remoteShoppingLists,
  categoryTree,
  loadShoppingListDetail,
}: ShoppingNavigationDeps) {
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

  const [filterYear, filterMonthNum] = filterMonth.split('-').map(Number);
  const filteredLists = useMemo(
    () =>
      shoppingLists.filter((l) => {
        const d = new Date(l.monthYear);
        return d.getUTCFullYear() === filterYear && d.getUTCMonth() + 1 === filterMonthNum;
      }),
    [shoppingLists, filterYear, filterMonthNum]
  );

  const sectionOptions = useMemo((): SectionOption[] => {
    if (!detailData) return [];
    return groupItemsByMainCategory(detailData.items, categoryTree).map(({ key, label, icon }) => ({
      key,
      label,
      icon,
    }));
  }, [detailData, categoryTree]);

  const itemSections = useMemo((): ItemSection[] => {
    if (!detailData) return [];
    let items = detailData.items;
    if (categoryFilter === '__unpurchased__')
      items = items.filter((i) => i.status === 0 || (!i.isPurchased && i.status !== 2));
    else if (categoryFilter === '__purchased__')
      items = items.filter((i) => i.status === 1 || i.isPurchased);
    else if (categoryFilter === '__ignored__') items = items.filter((i) => i.status === 2);
    else if (categoryFilter) items = items.filter((i) => getMainCategoryKey(i) === categoryFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }
    const sections = groupItemsByMainCategory(items, categoryTree);
    switch (sortOrder) {
      case 'name':
        return sections;
      case 'count':
        return [...sections].sort((a, b) => b.items.length - a.items.length);
      case 'purchased': {
        const pending = (s: ItemSection) => s.items.filter((i) => !i.isPurchased).length;
        return [...sections].sort((a, b) => pending(b) - pending(a));
      }
    }
  }, [detailData, categoryFilter, debouncedSearch, sortOrder, categoryTree]);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlListId = searchParams.get('listId') || searchParams.get('id');
  const isNavigatingBackRef = useRef(false);

  const openListDetail = useCallback(
    async (id: string) => {
      isNavigatingBackRef.current = false;
      setSelectedListId(id);
      setIsLoadingDetail(true);
      setDetailData(null);
      setViewMode('detail');
      setCategoryFilter(null);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('listId', id);
          return next;
        },
        { replace: false }
      );
      try {
        const data = await loadShoppingListDetail(id);
        setDetailData(data);
        if (data?.monthYear) {
          setFilterMonth(fromISOMonthYear(data.monthYear));
        }
      } catch {
        showError('Erro ao carregar lista.');
        setViewMode('lists');
        setSelectedListId(null);
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.delete('listId');
            next.delete('id');
            return next;
          },
          { replace: true }
        );
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [loadShoppingListDetail, showError, setSearchParams]
  );

  const backToLists = useCallback(() => {
    isNavigatingBackRef.current = true;
    setViewMode('lists');
    setSelectedListId(null);
    setDetailData(null);
    setCategoryFilter(null);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('listId');
        next.delete('id');
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  // Synchronize URL search params (?listId=...) with viewMode/detail
  useEffect(() => {
    if (urlListId) {
      if (isNavigatingBackRef.current) {
        return;
      }
      if (urlListId !== selectedListId) {
        void openListDetail(urlListId);
      }
    } else {
      isNavigatingBackRef.current = false;
      if (viewMode === 'detail') {
        setViewMode('lists');
        setSelectedListId(null);
        setDetailData(null);
        setCategoryFilter(null);
      }
    }
  }, [urlListId, selectedListId, viewMode, openListDetail]);

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
    viewMode,
    selectedListId,
    detailData,
    setDetailData,
    isLoadingDetail,
    filterMonth,
    monthNavDir,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    isSearchPending,
    collapsedCategories,
    shoppingLists,
    setShoppingLists,
    // refs
    categoryScrollRef,
    // computed
    filteredLists,
    sectionOptions,
    itemSections,
    // actions
    openListDetail,
    backToLists,
    toggleCategoryCollapse,
    scrollCategories,
    handleCategoryPointerDown,
    handleCategoryPointerMove,
    handleCategoryPointerUp,
    navigateMonth,
    resetMonthToToday,
  };
}
