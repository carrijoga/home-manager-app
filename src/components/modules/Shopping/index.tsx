import { AnimatePresence } from 'framer-motion';
import { memo, useCallback, useMemo, useState } from 'react';

import { useApp } from '@/contexts/AppContext';
import { useCategories } from '@/hooks/useCategories';
import { usePolling } from '@/hooks/usePolling';
import { useSignalR } from '@/hooks/useSignalR';
import { CategoryScope } from '@/schemas/category';
import { DATA_MODE } from '@/services/api/config';
import { ENDPOINTS } from '@/services/api/endpoints';

import { fromISOMonthYear } from './helpers';
import { useShoppingActions } from './hooks/useShoppingActions';
import { useShoppingData } from './hooks/useShoppingData';
import { useShoppingNavigation } from './hooks/useShoppingNavigation';
import { useShoppingRealtime } from './hooks/useShoppingRealtime';
import { MarketModeView } from './MarketMode/MarketModeView';
import { ShoppingDetailView } from './ShoppingDetailView';
import { ShoppingListsView } from './ShoppingListsView';

const Shopping = memo(function Shopping() {
  const { activeNestId } = useApp();
  const { tree: categoryTree } = useCategories(CategoryScope.Shopping);

  const data = useShoppingData();

  const nav = useShoppingNavigation({
    remoteShoppingLists: data.shoppingLists,
    shoppingCategories: data.shoppingCategories,
    categoryTree,
    loadShoppingListDetail: data.loadShoppingListDetail,
  });
  const actions = useShoppingActions(nav.selectedListId, nav.setDetailData, {
    shoppingLists: data.shoppingLists,
    shoppingCategories: data.shoppingCategories,
    createShoppingList: data.createShoppingList,
    updateShoppingList: data.updateShoppingList,
    deleteShoppingList: data.deleteShoppingList,
    finishShoppingList: data.finishShoppingList,
    unfinishShoppingList: data.unfinishShoppingList,
    addShoppingItem: data.addShoppingItem,
    updateShoppingItem: data.updateShoppingItem,
    deleteShoppingItem: data.deleteShoppingItem,
    markItemAsPurchased: data.markItemAsPurchased,
    unmarkItemAsPurchased: data.unmarkItemAsPurchased,
    ignoreShoppingItem: data.ignoreShoppingItem,
    unignoreShoppingItem: data.unignoreShoppingItem,
    uploadShoppingItems: data.uploadShoppingItems,
    createShoppingCategory: data.createShoppingCategory,
    deleteShoppingCategory: data.deleteShoppingCategory,
  });

  const hubUrl = DATA_MODE !== 'mock' && activeNestId ? ENDPOINTS.shoppingHub(activeNestId) : null;

  const { connectionRef, isConnected } = useSignalR(hubUrl);

  useShoppingRealtime({
    connectionRef,
    isConnected,
    viewMode: nav.viewMode,
    selectedListId: nav.selectedListId,
    shoppingCategories: data.shoppingCategories,
    setDetailData: nav.setDetailData,
    setShoppingLists: nav.setShoppingLists,
    backToLists: nav.backToLists,
    nestId: activeNestId ?? undefined,
  });

  usePolling(
    useCallback(async () => {
      if (!activeNestId) return;
      await data.refreshShoppingData();
      if (nav.viewMode === 'detail' && nav.selectedListId) {
        try {
          const detail = await data.loadShoppingListDetail(nav.selectedListId);
          nav.setDetailData(detail);
        } catch {
          // ignore background error
        }
      }
    }, [activeNestId, data, nav]),
    { intervalMs: 10000, enabled: Boolean(activeNestId) }
  );

  const selectedList = nav.selectedListId
    ? nav.shoppingLists.find((l) => l.shoppingListId === nav.selectedListId)
    : undefined;
  const isFinished = selectedList ? (selectedList.finished ?? selectedList.isFinished ?? false) : false;

  const editListInitialData = useMemo(() => {
    if (!nav.detailData) return undefined;
    return {
      name: nav.detailData.name,
      monthYear: fromISOMonthYear(nav.detailData.monthYear),
      notes: nav.detailData.notes ?? '',
    };
  }, [nav.detailData]);

  const selectedItems = useMemo(
    () => nav.detailData?.items.filter((i) => actions.selectedItemIds.has(i.shoppingItemId)) ?? [],
    [nav.detailData, actions.selectedItemIds]
  );

  const [isMarketMode, setIsMarketMode] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {isMarketMode && nav.detailData ? (
        <MarketModeView
          key="market"
          detailData={nav.detailData}
          uniqueCategories={actions.uniqueCategories}
          categoryTree={categoryTree}
          onExit={() => setIsMarketMode(false)}
          onMarkAsPurchased={actions.handleMarkItemAsPurchased}
          onUnmarkAsPurchased={actions.handleUnmarkAsPurchased}
          onAddItem={actions.handleAddItem}
          onEditItem={actions.handleEditSpecificItem}
          onFinishList={async () => {
            await actions.handleFinishList(nav.selectedListId!, () => {
              setIsMarketMode(false);
              nav.backToLists();
            });
          }}
        />
      ) : nav.viewMode === 'lists' ? (
        <ShoppingListsView
          key="lists"
          isLoading={data.loading && data.shoppingLists.length === 0}
          filteredLists={nav.filteredLists}
          filterMonth={nav.filterMonth}
          monthNavDir={nav.monthNavDir}
          showCreateList={actions.showCreateList}
          setShowCreateList={actions.setShowCreateList}
          showEditList={actions.showEditList}
          setShowEditList={actions.setShowEditList}
          showDeleteAlert={actions.showDeleteAlert}
          setShowDeleteAlert={actions.setShowDeleteAlert}
          editingListId={actions.editingListId}
          setEditingListId={actions.setEditingListId}
          editingListSummaryData={actions.editingListSummaryData}
          isDeleting={actions.isDeleting}
          onNavigateMonth={nav.navigateMonth}
          onResetMonth={nav.resetMonthToToday}
          onOpenList={nav.openListDetail}
          onCreateList={actions.handleCreateList}
          onEditListFromGrid={actions.handleEditListFromGrid}
          onDeleteListFromGrid={actions.handleDeleteListFromGrid}
          onUnfinishList={actions.handleUnfinishList}
        />
      ) : (
        <ShoppingDetailView
          key="detail"
          detailData={nav.detailData}
          isLoadingDetail={nav.isLoadingDetail}
          isFinished={isFinished}
          editListInitialData={editListInitialData}
          uniqueCategories={actions.uniqueCategories}
          sectionOptions={nav.sectionOptions}
          itemSections={nav.itemSections}
          categoryFilter={nav.categoryFilter}
          setCategoryFilter={nav.setCategoryFilter}
          sortOrder={nav.sortOrder}
          setSortOrder={nav.setSortOrder}
          searchTerm={nav.searchTerm}
          setSearchTerm={nav.setSearchTerm}
          isSearchPending={nav.isSearchPending}
          collapsedCategories={nav.collapsedCategories}
          categoryScrollRef={nav.categoryScrollRef}
          isBulkMode={actions.isBulkMode}
          setIsBulkMode={actions.setIsBulkMode}
          selectedItemIds={actions.selectedItemIds}
          setSelectedItemIds={actions.setSelectedItemIds}
          selectedItems={selectedItems}
          inlineEditingId={actions.inlineEditingId}
          inlineForm={actions.inlineForm}
          setInlineForm={actions.setInlineForm}
          inlineSaving={actions.inlineSaving}
          pendingId={actions.pendingId}
          isDeleting={actions.isDeleting}
          isFinishingList={actions.isFinishingList}
          isUnfinishingList={actions.isUnfinishingList}
          isUploading={actions.isUploading}
          showEditList={actions.showEditList}
          setShowEditList={actions.setShowEditList}
          showAddItem={actions.showAddItem}
          setShowAddItem={actions.setShowAddItem}
          showEditItem={actions.showEditItem}
          setShowEditItem={actions.setShowEditItem}
          showPurchase={actions.showPurchase}
          setShowPurchase={actions.setShowPurchase}
          showCategories={actions.showCategories}
          setShowCategories={actions.setShowCategories}
          showDeleteAlert={actions.showDeleteAlert}
          setShowDeleteAlert={actions.setShowDeleteAlert}
          showBulkEdit={actions.showBulkEdit}
          setShowBulkEdit={actions.setShowBulkEdit}
          showBulkDelete={actions.showBulkDelete}
          setShowBulkDelete={actions.setShowBulkDelete}
          showMobileEditSheet={actions.showMobileEditSheet}
          setShowMobileEditSheet={actions.setShowMobileEditSheet}
          selectedItem={actions.selectedItem}
          setSelectedItem={actions.setSelectedItem}
          editItemInitialData={actions.editItemInitialData}
          onBack={nav.backToLists}
          onToggleCategoryCollapse={nav.toggleCategoryCollapse}
          onScrollCategories={nav.scrollCategories}
          onCategoryPointerDown={nav.handleCategoryPointerDown}
          onCategoryPointerMove={nav.handleCategoryPointerMove}
          onCategoryPointerUp={nav.handleCategoryPointerUp}
          onExitBulkMode={actions.exitBulkMode}
          onToggleItemSelection={actions.toggleItemSelection}
          onOpenInlineEdit={actions.openInlineEdit}
          onCancelInlineEdit={actions.cancelInlineEdit}
          onSaveInlineEdit={actions.saveInlineEdit}
          onEditList={(data) => actions.handleEditList(data, nav.selectedListId!, nav.detailData)}
          onDeleteList={() => actions.handleDeleteList(nav.selectedListId!, nav.backToLists)}
          onFinishList={() => actions.handleFinishList(nav.selectedListId!, nav.backToLists)}
          onUnfinishList={() => actions.handleUnfinishList(nav.selectedListId!)}
          onAddItem={actions.handleAddItem}
          onEditItem={actions.handleEditItem}
          onDeleteItem={actions.handleDeleteItem}
          onMarkAsPurchased={(item) => {
            actions.setSelectedItem(item);
            actions.setShowPurchase(true);
          }}
          onSubmitPurchase={actions.handleMarkAsPurchased}
          onUnmarkAsPurchased={actions.handleUnmarkAsPurchased}
          onIgnoreItem={actions.handleIgnoreItem}
          onUnignoreItem={actions.handleUnignoreItem}
          onUploadFile={actions.handleUploadFile}
          onBulkEdit={(patch) => actions.handleBulkEdit(patch, selectedItems)}
          onBulkDelete={() => actions.handleBulkDelete(selectedItems)}
          onCreateCategory={async (name) => {
            await actions.createShoppingCategory(name);
          }}
          onDeleteCategory={async (id) => {
            await actions.deleteShoppingCategory(id);
          }}
          onStartMarketMode={() => setIsMarketMode(true)}
        />
      )}
    </AnimatePresence>
  );
});

export default Shopping;
