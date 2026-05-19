import { useCallback, useMemo, useRef, useState } from 'react';

import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import type { AppShoppingItem, AppShoppingList } from '@/types';

import { fromISOMonthYear, todayISO,toISOMonthYear } from '../helpers';
import type { BulkEditPatch, ItemFormData, ListFormData, PurchaseFormData } from '../types';

export function useShoppingActions(
  selectedListId: string | null,
  setDetailData: React.Dispatch<React.SetStateAction<AppShoppingList | null>>
) {
  const {
    shoppingLists, shoppingCategories,
    createShoppingList, updateShoppingList, deleteShoppingList,
    finishShoppingList, unfinishShoppingList,
    addShoppingItem, updateShoppingItem, deleteShoppingItem,
    markItemAsPurchased, unmarkItemAsPurchased,
    uploadShoppingItems, createShoppingCategory, deleteShoppingCategory,
  } = useApp();
  const { showSuccess, showError } = useToastNotifications();

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [showCreateList, setShowCreateList] = useState(false);
  const [showEditList, setShowEditList] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showMobileEditSheet, setShowMobileEditSheet] = useState(false);

  const [selectedItem, setSelectedItem] = useState<AppShoppingItem | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  // ── Bulk state ────────────────────────────────────────────────────────────
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // ── Inline edit state ─────────────────────────────────────────────────────
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineForm, setInlineForm] = useState<{ qty: string; estimated: number | null; paid: number | null }>({
    qty: '', estimated: null, paid: null,
  });
  const [inlineSaving, setInlineSaving] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const uniqueCategories = useMemo(() => {
    const map = new Map<string, { shoppingCategoryId: string; name: string; isDefault: boolean }>();
    shoppingCategories.forEach((c) => {
      if (!map.has(c.shoppingCategoryId)) map.set(c.shoppingCategoryId, c);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [shoppingCategories]);

  // editingListSummaryData for lists-view edit
  const editingListSummaryData = useMemo((): ListFormData | undefined => {
    if (!editingListId) return undefined;
    const s = shoppingLists.find((l) => l.shoppingListId === editingListId);
    if (!s) return undefined;
    return { name: s.name, monthYear: fromISOMonthYear(s.monthYear), notes: s.notes ?? '' };
  }, [editingListId, shoppingLists]);

  const editItemInitialData = useMemo((): ItemFormData | undefined => {
    if (!selectedItem) return undefined;
    return {
      name: selectedItem.name,
      quantity: String(selectedItem.quantity),
      unitType: String(selectedItem.unitType),
      categoryId: selectedItem.shoppingCategoryId ?? '',
      estimatedPrice: selectedItem.estimatedPrice ?? null,
      notes: selectedItem.notes ?? '',
    };
  }, [selectedItem]);

  // ── Bulk helpers ──────────────────────────────────────────────────────────
  const exitBulkMode = useCallback(() => {
    setIsBulkMode(false);
    setSelectedItemIds(new Set());
  }, []);

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Inline edit helpers ───────────────────────────────────────────────────
  const openInlineEdit = useCallback((item: AppShoppingItem) => {
    setInlineEditingId(item.shoppingItemId);
    setInlineForm({ qty: String(item.quantity), estimated: item.estimatedPrice ?? null, paid: item.price ?? null });
  }, []);

  const cancelInlineEdit = useCallback(() => {
    setInlineEditingId(null);
    setInlineSaving(false);
  }, []);

  const saveInlineEdit = useCallback(
    async (item: AppShoppingItem) => {
      setInlineSaving(true);
      try {
        const newQty = parseFloat(inlineForm.qty) || item.quantity;
        const newEstimated = inlineForm.estimated;
        const newPaid = inlineForm.paid;
        await updateShoppingItem(
          item.shoppingItemId, selectedListId!, item.name, newQty, item.unitType,
          item.shoppingCategoryId ?? null, newEstimated, item.notes ?? null
        );
        if (newPaid != null && !item.isPurchased) {
          await markItemAsPurchased(
            item.shoppingItemId, selectedListId!, newQty, item.unitType, newPaid,
            `${todayISO()}T12:00:00Z`
          );
          setDetailData((prev) => prev ? {
            ...prev,
            items: prev.items.map((i) =>
              i.shoppingItemId === item.shoppingItemId
                ? { ...i, quantity: newQty, estimatedPrice: newEstimated, isPurchased: true, price: newPaid }
                : i
            ),
          } : prev);
        } else {
          setDetailData((prev) => prev ? {
            ...prev,
            items: prev.items.map((i) =>
              i.shoppingItemId === item.shoppingItemId
                ? { ...i, quantity: newQty, estimatedPrice: newEstimated }
                : i
            ),
          } : prev);
        }
        showSuccess('Item atualizado!');
        setInlineEditingId(null);
      } finally {
        setInlineSaving(false);
      }
    },
    [inlineForm, selectedListId, updateShoppingItem, markItemAsPurchased, showSuccess, setDetailData]
  );

  // ── List CRUD ─────────────────────────────────────────────────────────────
  const handleCreateList = useCallback(
    async (data: ListFormData) => {
      await createShoppingList(data.name, toISOMonthYear(data.monthYear), data.notes || undefined);
      showSuccess('Lista criada!');
    },
    [createShoppingList, showSuccess]
  );

  const handleEditList = useCallback(
    async (data: ListFormData, listId: string, _currentDetailData: AppShoppingList | null) => {
      await updateShoppingList(listId, data.name, toISOMonthYear(data.monthYear), data.notes || undefined);
      setDetailData((prev) =>
        prev ? { ...prev, name: data.name, monthYear: toISOMonthYear(data.monthYear), notes: data.notes || null } : prev
      );
      showSuccess('Lista atualizada!');
    },
    [updateShoppingList, showSuccess, setDetailData]
  );

  const handleDeleteList = useCallback(
    async (listId: string, onSuccess: () => void) => {
      setIsDeleting(true);
      try {
        await deleteShoppingList(listId);
        showSuccess('Lista excluída!');
        onSuccess();
      } catch {
        showError('Erro ao excluir lista.');
      } finally {
        setIsDeleting(false);
        setShowDeleteAlert(false);
      }
    },
    [deleteShoppingList, showSuccess, showError]
  );

  const handleFinishList = useCallback(
    async (listId: string, onSuccess: () => void) => {
      try {
        await finishShoppingList(listId);
        showSuccess('Lista finalizada!');
        onSuccess();
      } catch {
        showError('Erro ao finalizar lista.');
      }
    },
    [finishShoppingList, showSuccess, showError]
  );

  const handleUnfinishList = useCallback(
    async (listId: string) => {
      try {
        await unfinishShoppingList(listId);
        showSuccess('Lista reaberta!');
      } catch {
        showError('Erro ao reabrir lista.');
      }
    },
    [unfinishShoppingList, showSuccess, showError]
  );

  const handleEditListFromGrid = useCallback(
    async (data: ListFormData) => {
      if (!editingListId) return;
      await updateShoppingList(editingListId, data.name, toISOMonthYear(data.monthYear), data.notes || undefined);
      showSuccess('Lista atualizada!');
      setEditingListId(null);
    },
    [editingListId, updateShoppingList, showSuccess]
  );

  const handleDeleteListFromGrid = useCallback(async () => {
    if (!editingListId) return;
    setIsDeleting(true);
    try {
      await deleteShoppingList(editingListId);
      showSuccess('Lista excluída!');
    } catch {
      showError('Erro ao excluir lista.');
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
      setEditingListId(null);
    }
  }, [editingListId, deleteShoppingList, showSuccess, showError]);

  // ── Item CRUD ─────────────────────────────────────────────────────────────
  const handleAddItem = useCallback(
    async (data: ItemFormData) => {
      if (!selectedListId) return;
      const newItem = await addShoppingItem(
        selectedListId, data.name, parseFloat(data.quantity) || 1,
        parseInt(data.unitType) || 0, data.categoryId || null,
        data.estimatedPrice ?? null, data.notes || null
      );
      setDetailData((prev) => prev ? { ...prev, items: [...prev.items, newItem] } : prev);
      showSuccess('Item adicionado!');
    },
    [selectedListId, addShoppingItem, showSuccess, setDetailData]
  );

  const handleEditItem = useCallback(
    async (data: ItemFormData) => {
      if (!selectedItem || !selectedListId) return;
      await updateShoppingItem(
        selectedItem.shoppingItemId, selectedListId, data.name,
        parseFloat(data.quantity) || 1, parseInt(data.unitType) || 0,
        data.categoryId || null, data.estimatedPrice ?? null, data.notes || null
      );
      const catName = shoppingCategories.find((c) => c.shoppingCategoryId === data.categoryId)?.name ?? null;
      setDetailData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.shoppingItemId === selectedItem.shoppingItemId
              ? {
                  ...i,
                  name: data.name,
                  quantity: parseFloat(data.quantity) || 1,
                  unitType: parseInt(data.unitType) || 0,
                  shoppingCategoryId: data.categoryId || null,
                  categoryName: catName,
                  estimatedPrice: data.estimatedPrice ?? null,
                  notes: data.notes || null,
                }
              : i
          ),
        };
      });
      showSuccess('Item atualizado!');
    },
    [selectedItem, selectedListId, updateShoppingItem, shoppingCategories, showSuccess, setDetailData]
  );

  const handleDeleteItem = useCallback(
    async (item: AppShoppingItem) => {
      setPendingId(item.shoppingItemId);
      try {
        await deleteShoppingItem(
          item.shoppingItemId, selectedListId!, item.quantity, item.unitType,
          item.estimatedPrice, item.isPurchased, item.price
        );
        setDetailData((prev) =>
          prev ? { ...prev, items: prev.items.filter((i) => i.shoppingItemId !== item.shoppingItemId) } : prev
        );
        showSuccess('Item removido!');
      } catch {
        showError('Erro ao remover item.');
      } finally {
        setPendingId(null);
      }
    },
    [deleteShoppingItem, selectedListId, showSuccess, showError, setDetailData]
  );

  const handleMarkAsPurchased = useCallback(
    async (data: PurchaseFormData) => {
      if (!selectedItem) return;
      const price = data.price ?? 0;
      const purchasedAt = `${data.purchasedAt}T12:00:00Z`;
      setPendingId(selectedItem.shoppingItemId);
      try {
        await markItemAsPurchased(
          selectedItem.shoppingItemId, selectedListId!, selectedItem.quantity,
          selectedItem.unitType, price, purchasedAt
        );
        setDetailData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.shoppingItemId === selectedItem.shoppingItemId
                ? { ...i, isPurchased: true, price, purchasedAt }
                : i
            ),
          };
        });
        showSuccess('Item marcado como comprado!');
      } catch {
        // AppContext handles revert
      } finally {
        setPendingId(null);
      }
    },
    [selectedItem, markItemAsPurchased, selectedListId, showSuccess, setDetailData]
  );

  const handleUnmarkAsPurchased = useCallback(
    async (item: AppShoppingItem) => {
      setPendingId(item.shoppingItemId);
      try {
        await unmarkItemAsPurchased(
          item.shoppingItemId, selectedListId!, item.quantity, item.unitType, item.price ?? 0
        );
        setDetailData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.shoppingItemId === item.shoppingItemId
                ? { ...i, isPurchased: false, price: null, purchasedAt: null }
                : i
            ),
          };
        });
        showSuccess('Item desmarcado como comprado.');
      } catch {
        // AppContext handles revert
      } finally {
        setPendingId(null);
      }
    },
    [selectedListId, unmarkItemAsPurchased, showSuccess, setDetailData]
  );

  const handleUploadFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file || !selectedListId) return;
      setIsUploading(true);
      try {
        const detail = await uploadShoppingItems(selectedListId, file);
        setDetailData(detail);
        showSuccess('Itens importados!');
      } catch {
        showError('Erro ao importar itens.');
      } finally {
        setIsUploading(false);
      }
    },
    [selectedListId, uploadShoppingItems, showSuccess, showError, setDetailData]
  );

  const handleBulkEdit = useCallback(
    async (patch: BulkEditPatch, selectedItems: AppShoppingItem[]) => {
      for (const item of selectedItems) {
        await updateShoppingItem(
          item.shoppingItemId, selectedListId!, item.name,
          patch.quantity ?? item.quantity, patch.unitType ?? item.unitType,
          'categoryId' in patch ? (patch.categoryId ?? null) : (item.shoppingCategoryId ?? null),
          patch.estimatedPrice ?? item.estimatedPrice ?? null, item.notes ?? null
        );
      }
      const catMap = new Map(shoppingCategories.map((c) => [c.shoppingCategoryId, c.name]));
      const patchedIds = new Set(selectedItems.map((i) => i.shoppingItemId));
      setDetailData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) => {
            if (!patchedIds.has(i.shoppingItemId)) return i;
            const newCategoryId =
              'categoryId' in patch ? (patch.categoryId ?? null) : (i.shoppingCategoryId ?? null);
            return {
              ...i,
              quantity: patch.quantity ?? i.quantity,
              unitType: patch.unitType ?? i.unitType,
              shoppingCategoryId: newCategoryId,
              categoryName: newCategoryId ? (catMap.get(newCategoryId) ?? null) : null,
              estimatedPrice: patch.estimatedPrice ?? i.estimatedPrice,
            };
          }),
        };
      });
      showSuccess(`${selectedItems.length} ${selectedItems.length === 1 ? 'item atualizado' : 'itens atualizados'}!`);
      exitBulkMode();
    },
    [selectedListId, updateShoppingItem, shoppingCategories, showSuccess, exitBulkMode, setDetailData]
  );

  const handleBulkDelete = useCallback(
    async (selectedItems: AppShoppingItem[]) => {
      for (const item of selectedItems) {
        await deleteShoppingItem(
          item.shoppingItemId, selectedListId!, item.quantity, item.unitType,
          item.estimatedPrice, item.isPurchased, item.price
        );
      }
      const deletedIds = new Set(selectedItems.map((i) => i.shoppingItemId));
      setDetailData((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => !deletedIds.has(i.shoppingItemId)) } : prev
      );
      showSuccess(`${selectedItems.length} ${selectedItems.length === 1 ? 'item excluído' : 'itens excluídos'}!`);
      exitBulkMode();
    },
    [selectedListId, deleteShoppingItem, showSuccess, exitBulkMode, setDetailData]
  );

  return {
    // dialog open/close state
    showCreateList, setShowCreateList,
    showEditList, setShowEditList,
    showAddItem, setShowAddItem,
    showEditItem, setShowEditItem,
    showPurchase, setShowPurchase,
    showCategories, setShowCategories,
    showDeleteAlert, setShowDeleteAlert,
    showBulkEdit, setShowBulkEdit,
    showBulkDelete, setShowBulkDelete,
    showMobileEditSheet, setShowMobileEditSheet,
    // item/list selection
    selectedItem, setSelectedItem,
    editingListId, setEditingListId,
    pendingId,
    isDeleting,
    isUploading,
    uploadInputRef,
    // bulk
    isBulkMode, setIsBulkMode,
    selectedItemIds, setSelectedItemIds,
    // inline edit
    inlineEditingId,
    inlineForm, setInlineForm,
    inlineSaving,
    // derived
    uniqueCategories,
    editingListSummaryData,
    editItemInitialData,
    // helpers
    exitBulkMode, toggleItemSelection,
    openInlineEdit, cancelInlineEdit, saveInlineEdit,
    // handlers
    handleCreateList, handleEditList, handleDeleteList,
    handleFinishList, handleUnfinishList,
    handleEditListFromGrid, handleDeleteListFromGrid,
    handleAddItem, handleEditItem, handleDeleteItem,
    handleMarkAsPurchased, handleUnmarkAsPurchased,
    handleUploadFile, handleBulkEdit, handleBulkDelete,
    // category management
    createShoppingCategory, deleteShoppingCategory,
  };
}
