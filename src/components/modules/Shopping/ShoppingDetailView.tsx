import { formatCurrency } from '@utils/formatters';
import { motion } from 'framer-motion';
import { Check, ListChecks, Pencil, Plus, RotateCcw, ShoppingCart, Trash2, Undo2 } from 'lucide-react';
import React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppShoppingItem, AppShoppingList } from '@/types';

import { CategorySection } from './CategorySection';
import { DetailFilterBar } from './DetailFilterBar';
import { DetailHeader } from './DetailHeader';
import { BulkEditDialog } from './dialogs/BulkEditDialog';
import { ItemFormDialog } from './dialogs/ItemFormDialog';
import { ListFormDialog } from './dialogs/ListFormDialog';
import { ManageCategoriesDialog } from './dialogs/ManageCategoriesDialog';
import { MarkAsPurchasedDialog } from './dialogs/MarkAsPurchasedDialog';
import { quantityLabel } from './helpers';
import type { BulkEditPatch, ItemFormData, ListFormData, PurchaseFormData } from './types';

interface ShoppingDetailViewProps {
  detailData: AppShoppingList | null;
  isLoadingDetail: boolean;
  isFinished: boolean;
  editListInitialData: ListFormData | undefined;
  uniqueCategories: Array<{ shoppingCategoryId: string; name: string; isDefault: boolean }>;
  categoriesInDetail: string[];
  groupedItemEntries: [string, AppShoppingItem[]][];
  categoryFilter: string | null;
  setCategoryFilter: (v: string | null) => void;
  sortOrder: 'name' | 'count' | 'purchased';
  setSortOrder: (v: 'name' | 'count' | 'purchased') => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  isSearchPending: boolean;
  collapsedCategories: Set<string>;
  categoryScrollRef: React.RefObject<HTMLDivElement | null>;
  isBulkMode: boolean;
  setIsBulkMode: (v: boolean) => void;
  selectedItemIds: Set<string>;
  setSelectedItemIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedItems: AppShoppingItem[];
  inlineEditingId: string | null;
  inlineForm: { qty: string; estimated: number | null; paid: number | null };
  setInlineForm: React.Dispatch<React.SetStateAction<{ qty: string; estimated: number | null; paid: number | null }>>;
  inlineSaving: boolean;
  pendingId: string | null;
  isDeleting: boolean;
  isUploading: boolean;
  uploadInputRef: React.RefObject<HTMLInputElement | null>;
  showEditList: boolean;
  setShowEditList: (v: boolean) => void;
  showAddItem: boolean;
  setShowAddItem: (v: boolean) => void;
  showEditItem: boolean;
  setShowEditItem: (v: boolean) => void;
  showPurchase: boolean;
  setShowPurchase: (v: boolean) => void;
  showCategories: boolean;
  setShowCategories: (v: boolean) => void;
  showDeleteAlert: boolean;
  setShowDeleteAlert: (v: boolean) => void;
  showBulkEdit: boolean;
  setShowBulkEdit: (v: boolean) => void;
  showBulkDelete: boolean;
  setShowBulkDelete: (v: boolean) => void;
  showMobileEditSheet: boolean;
  setShowMobileEditSheet: (v: boolean) => void;
  selectedItem: AppShoppingItem | null;
  setSelectedItem: (item: AppShoppingItem | null) => void;
  editItemInitialData: ItemFormData | undefined;
  onBack: () => void;
  onToggleCategoryCollapse: (category: string) => void;
  onScrollCategories: (dir: 'left' | 'right') => void;
  onCategoryPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onCategoryPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onCategoryPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onExitBulkMode: () => void;
  onToggleItemSelection: (id: string) => void;
  onOpenInlineEdit: (item: AppShoppingItem) => void;
  onCancelInlineEdit: () => void;
  onSaveInlineEdit: (item: AppShoppingItem) => void;
  onEditList: (data: ListFormData) => Promise<void>;
  onDeleteList: () => Promise<void>;
  onFinishList: () => Promise<void>;
  onUnfinishList: () => Promise<void>;
  onAddItem: (data: ItemFormData) => Promise<void>;
  onEditItem: (data: ItemFormData) => Promise<void>;
  onDeleteItem: (item: AppShoppingItem) => Promise<void>;
  onMarkAsPurchased: (item: AppShoppingItem) => void;
  onSubmitPurchase: (data: PurchaseFormData) => Promise<void>;
  onUnmarkAsPurchased: (item: AppShoppingItem) => Promise<void>;
  onUploadFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onBulkEdit: (patch: BulkEditPatch) => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onCreateCategory: (name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function ShoppingDetailView(props: ShoppingDetailViewProps) {
  const {
    detailData,
    isLoadingDetail,
    isFinished,
    editListInitialData,
    uniqueCategories,
    categoriesInDetail,
    groupedItemEntries,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
    searchTerm,
    setSearchTerm,
    isSearchPending,
    collapsedCategories,
    categoryScrollRef,
    isBulkMode,
    setIsBulkMode,
    selectedItemIds,
    setSelectedItemIds,
    selectedItems,
    inlineEditingId,
    inlineForm,
    setInlineForm,
    inlineSaving,
    pendingId,
    isDeleting,
    isUploading,
    uploadInputRef,
    showEditList,
    setShowEditList,
    showAddItem,
    setShowAddItem,
    showEditItem,
    setShowEditItem,
    showPurchase,
    setShowPurchase,
    showCategories,
    setShowCategories,
    showDeleteAlert,
    setShowDeleteAlert,
    showBulkEdit,
    setShowBulkEdit,
    showBulkDelete,
    setShowBulkDelete,
    showMobileEditSheet,
    setShowMobileEditSheet,
    selectedItem,
    setSelectedItem,
    editItemInitialData,
    onBack,
    onToggleCategoryCollapse,
    onScrollCategories,
    onCategoryPointerDown,
    onCategoryPointerMove,
    onCategoryPointerUp,
    onExitBulkMode,
    onToggleItemSelection,
    onOpenInlineEdit,
    onCancelInlineEdit,
    onSaveInlineEdit,
    onEditList,
    onDeleteList,
    onFinishList,
    onUnfinishList,
    onAddItem,
    onEditItem,
    onDeleteItem,
    onMarkAsPurchased,
    onSubmitPurchase,
    onUnmarkAsPurchased,
    onUploadFile,
    onBulkEdit,
    onBulkDelete,
    onCreateCategory,
    onDeleteCategory,
  } = props;

  const detailPurchasedItems = detailData?.items.filter((i) => i.isPurchased).length ?? 0;
  const detailTotalItems = detailData?.items.length ?? 0;
  const detailPct =
    detailTotalItems === 0 ? 0 : Math.round((detailPurchasedItems / detailTotalItems) * 100);
  const totalEstimated = detailData?.items.reduce((s, i) => s + (i.estimatedPrice ?? 0), 0) ?? 0;
  const totalSpent =
    detailData?.items.filter((i) => i.isPurchased).reduce((s, i) => s + (i.price ?? 0), 0) ?? 0;
  const remaining = Math.max(0, totalEstimated - totalSpent);

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className="max-w-full space-y-5 pb-32"
    >
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <DetailHeader
        detailData={detailData}
        totalEstimated={totalEstimated}
        totalSpent={totalSpent}
        remaining={remaining}
        onBack={onBack}
      />

      {/* ── Sort + action toolbar / filter bar ───────────────────────────────── */}
      <DetailFilterBar
        isBulkMode={isBulkMode}
        selectedCount={selectedItems.length}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categoriesInDetail={categoriesInDetail}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isSearchPending={isSearchPending}
        isFinished={isFinished}
        isUploading={isUploading}
        detailDataLoaded={!!detailData}
        categoryScrollRef={categoryScrollRef}
        onExitBulkMode={onExitBulkMode}
        onShowCategories={() => setShowCategories(true)}
        onUploadClick={() => uploadInputRef.current?.click()}
        onEnterBulkMode={() => setIsBulkMode(true)}
        onAddItem={() => setShowAddItem(true)}
        onScrollCategories={onScrollCategories}
        onCategoryPointerDown={onCategoryPointerDown}
        onCategoryPointerMove={onCategoryPointerMove}
        onCategoryPointerUp={onCategoryPointerUp}
      />

      <input
        ref={uploadInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={onUploadFile}
        className="hidden"
      />

      {/* Item list */}
      {isLoadingDetail ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                <Skeleton className="h-8 w-8 rounded-2xl" />
                <Skeleton className="h-4 w-32" />
              </div>
              {[...Array(2)].map((_, j) => (
                <div
                  key={j}
                  className="border-border/30 flex items-center gap-4 border-t px-6 py-4"
                >
                  <Skeleton className="h-6 w-6 rounded-lg" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : detailData && detailData.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-honey-200/60 bg-gradient-to-br from-honey-100 to-linen-200 dark:border-honey-800/30 dark:from-honey-900/30 dark:to-muted">
            <ListChecks size={24} className="text-honey-600 dark:text-honey-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">Lista vazia</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione o primeiro item para começar.
            </p>
          </div>
          {!isFinished && (
            <Button variant="outline" className="gap-1.5" onClick={() => setShowAddItem(true)}>
              <Plus size={15} />
              Adicionar item
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {groupedItemEntries.map(([category, items]) => (
            <CategorySection
              key={category}
              category={category}
              items={items}
              isCollapsed={collapsedCategories.has(category)}
              isBulkMode={isBulkMode}
              isFinished={isFinished}
              selectedItemIds={selectedItemIds}
              inlineEditingId={inlineEditingId}
              inlineForm={inlineForm}
              inlineSaving={inlineSaving}
              pendingId={pendingId}
              setInlineForm={setInlineForm}
              setSelectedItemIds={setSelectedItemIds}
              onToggleCollapse={onToggleCategoryCollapse}
              onOpenMobileSheet={(item) => {
                setSelectedItem(item);
                setShowMobileEditSheet(true);
              }}
              onToggleSelection={onToggleItemSelection}
              onMarkAsPurchased={onMarkAsPurchased}
              onUnmark={onUnmarkAsPurchased}
              onOpenInlineEdit={onOpenInlineEdit}
              onCancelInlineEdit={onCancelInlineEdit}
              onSaveInlineEdit={onSaveInlineEdit}
              onDelete={onDeleteItem}
            />
          ))}
        </div>
      )}

      {/* Mobile edit/purchase sheet */}
      {selectedItem && (
        <Sheet
          open={showMobileEditSheet}
          onOpenChange={(v) => {
            if (!v) {
              setShowMobileEditSheet(false);
              setSelectedItem(null);
            }
          }}
        >
          <SheetContent
            side="bottom"
            className="rounded-t-2xl border-t border-border bg-card px-6 pb-8 pt-6 dark:bg-[#1e1e1e]"
          >
            <SheetHeader className="mb-5 text-left">
              <SheetTitle className="text-base font-semibold text-foreground">
                {selectedItem.name}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                {quantityLabel(selectedItem.quantity, selectedItem.unitType)}
                {selectedItem.estimatedPrice != null && (
                  <> · estimado {formatCurrency(selectedItem.estimatedPrice)}</>
                )}
              </p>
              {selectedItem.notes && (
                <p className="mt-1 text-sm text-muted-foreground">{selectedItem.notes}</p>
              )}
            </SheetHeader>

            <div className="space-y-4">
              {/* Quick mark as purchased */}
              {!selectedItem.isPurchased && !isFinished && (
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors"
                  style={{ background: '#78dc77', color: '#131313' }}
                  onClick={() => {
                    setShowMobileEditSheet(false);
                    setShowPurchase(true);
                  }}
                >
                  <Check size={16} strokeWidth={3} />
                  Marcar como comprado
                </button>
              )}

              {/* Edit + Delete — only when not purchased and not finished */}
              {!selectedItem.isPurchased && !isFinished && (
                <>
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    onClick={() => {
                      setShowMobileEditSheet(false);
                      setShowEditItem(true);
                    }}
                  >
                    <Pencil size={15} />
                    Editar item
                  </button>

                  <button
                    className="border-destructive/30 hover:bg-destructive/10 flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium text-destructive transition-colors"
                    onClick={() => {
                      onDeleteItem(selectedItem);
                      setShowMobileEditSheet(false);
                      setSelectedItem(null);
                    }}
                    disabled={pendingId === selectedItem.shoppingItemId}
                  >
                    <Trash2 size={15} />
                    Remover item
                  </button>
                </>
              )}

              {/* Undo purchase — only when purchased and not finished */}
              {selectedItem.isPurchased && !isFinished && (
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
                  onClick={() => {
                    onUnmarkAsPurchased(selectedItem);
                    setShowMobileEditSheet(false);
                    setSelectedItem(null);
                  }}
                  disabled={pendingId === selectedItem.shoppingItemId}
                >
                  <RotateCcw size={15} />
                  Desfazer compra
                </button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Floating bulk action bar */}
      {isBulkMode && selectedItems.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 px-4">
          <div className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-xl">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/40 bg-primary/10 hover:bg-primary/15 flex-1 gap-1.5 text-xs text-primary hover:text-primary"
              onClick={() => setShowBulkEdit(true)}
            >
              <Pencil size={13} />
              Editar selecionados
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-destructive/10 border-destructive/30 flex-1 gap-1.5 text-xs text-destructive hover:text-destructive"
              onClick={() => setShowBulkDelete(true)}
            >
              <Trash2 size={13} />
              Excluir selecionados
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <BulkEditDialog
        open={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        selectedItems={selectedItems}
        categories={uniqueCategories}
        onSubmit={onBulkEdit}
      />
      <AlertDialog
        open={showBulkDelete}
        onOpenChange={(o) => {
          if (!o) setShowBulkDelete(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'}?
            </AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onBulkDelete}
              className="hover:bg-destructive/90 bg-destructive text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ListFormDialog
        open={showEditList}
        onClose={() => setShowEditList(false)}
        initialData={editListInitialData}
        onSubmit={onEditList}
        title="Editar Lista"
      />
      <ItemFormDialog
        open={showAddItem}
        onClose={() => setShowAddItem(false)}
        onSubmit={onAddItem}
        title="Adicionar Item"
        categories={uniqueCategories}
      />
      <ItemFormDialog
        open={showEditItem}
        onClose={() => {
          setShowEditItem(false);
          setSelectedItem(null);
        }}
        initialData={editItemInitialData}
        onSubmit={onEditItem}
        title="Editar Item"
        categories={uniqueCategories}
      />
      <MarkAsPurchasedDialog
        open={showPurchase}
        onClose={() => {
          setShowPurchase(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSubmit={onSubmitPurchase}
      />
      <ManageCategoriesDialog
        open={showCategories}
        onClose={() => setShowCategories(false)}
        categories={uniqueCategories}
        onCreateCategory={onCreateCategory}
        onDeleteCategory={onDeleteCategory}
      />

      {/* Delete list alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lista?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá permanentemente a lista{' '}
              <span className="font-semibold text-foreground">{detailData?.name}</span> e todos os
              seus itens. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteList}
              disabled={isDeleting}
              className="hover:bg-destructive/90 bg-destructive text-destructive-foreground"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Sticky footer bar ────────────────────────────────────────────────── */}
      {detailData && !isBulkMode && (
        <div className="border-border/20 bg-card/90 fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-6 border-t px-6 py-4 backdrop-blur-md dark:bg-[rgba(28,28,28,0.92)] md:left-[var(--sidebar-width,0px)]">
          {/* Left: remaining balance */}
          <div className="flex items-center gap-3">
            <div className="border-border/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
              <ShoppingCart size={16} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-foreground">
                {totalEstimated > 0 ? formatCurrency(remaining) : '—'}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Restante para finalizar
              </p>
            </div>
          </div>

          {/* Center: progress bar */}
          <div className="hidden flex-1 items-center gap-3 md:flex">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Progresso
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[rgba(255,202,217,0.6)] to-[#ffcad9] transition-all duration-500"
                style={{ width: `${detailPct}%` }}
              />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {detailPct}%
            </span>
          </div>

          {/* Right: finish / reopen button */}
          {isFinished ? (
            <button
              className="flex shrink-0 items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#131313] shadow-lg transition-opacity hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(90deg, #ffd6a5 0%, #ffb347 100%)' }}
              onClick={onUnfinishList}
            >
              <Undo2 size={14} strokeWidth={3} />
              Reabrir Lista
            </button>
          ) : (
            <button
              className="flex shrink-0 items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#131313] shadow-lg transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #adc6ff 0%, #8cafff 100%)' }}
              onClick={onFinishList}
              disabled={detailTotalItems === 0 || detailPurchasedItems < detailTotalItems}
            >
              <Check size={14} strokeWidth={3} />
              Finalizar Compra
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
