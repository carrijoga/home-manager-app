import { AnimatePresence } from 'framer-motion';
import { memo, useMemo } from 'react';

import { useApp } from '@/contexts/AppContext';
import { useSignalR } from '@/hooks/useSignalR';
import { DATA_MODE } from '@/services/api/config';
import { ENDPOINTS } from '@/services/api/endpoints';

import { fromISOMonthYear } from './helpers';
import { useShoppingActions } from './hooks/useShoppingActions';
import { useShoppingData } from './hooks/useShoppingData';
import { useShoppingNavigation } from './hooks/useShoppingNavigation';
import { useShoppingRealtime } from './hooks/useShoppingRealtime';
import { ShoppingDetailView } from './ShoppingDetailView';
import { ShoppingListsView } from './ShoppingListsView';

const Shopping = memo(function Shopping() {
  const { activeNestId } = useApp();

  const data = useShoppingData();

  const nav = useShoppingNavigation({
    remoteShoppingLists: data.shoppingLists,
    shoppingCategories: data.shoppingCategories,
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

  const isFinished = nav.selectedListId
    ? (nav.shoppingLists.find((l) => l.shoppingListId === nav.selectedListId)?.isFinished ?? false)
    : false;

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

  return (
    <AnimatePresence mode="wait">
      {nav.viewMode === 'lists' ? (
        <ShoppingListsView
          key="lists"
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
          categoriesInDetail={nav.categoriesInDetail}
          groupedItemEntries={nav.groupedItemEntries}
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
          isUploading={actions.isUploading}
          uploadInputRef={actions.uploadInputRef}
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
          onUploadFile={actions.handleUploadFile}
          onBulkEdit={(patch) => actions.handleBulkEdit(patch, selectedItems)}
          onBulkDelete={() => actions.handleBulkDelete(selectedItems)}
          onCreateCategory={async (name) => {
            await actions.createShoppingCategory(name);
          }}
          onDeleteCategory={async (id) => {
            await actions.deleteShoppingCategory(id);
          }}
        />
      )}
    </AnimatePresence>
  );
});

export default Shopping;
