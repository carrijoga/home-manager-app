import { formatCurrency, formatDateBR } from '@utils/formatters';
import { motion } from 'framer-motion';
import {
  Calendar,
  Check,
  Clock,
  EyeOff,
  FileText,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  ShoppingCart,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Undo2,
  X,
} from 'lucide-react';
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
import { useSidebar } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ShoppingItemStatus } from '@/schemas/enums';
import type { AppShoppingItem, AppShoppingList } from '@/types';

import { CategorySection } from './CategorySection';
import { DetailFilterBar } from './DetailFilterBar';
import { DetailHeader } from './DetailHeader';
import { BulkEditDialog } from './dialogs/BulkEditDialog';
import { ItemFormDialog } from './dialogs/ItemFormDialog';
import { ListFormDialog } from './dialogs/ListFormDialog';
import { ManageCategoriesDialog } from './dialogs/ManageCategoriesDialog';
import { MarkAsPurchasedDialog } from './dialogs/MarkAsPurchasedDialog';
import {
  emptyItemForm,
  getItemEstimatedTotal,
  getItemSpentTotal,
  getSavingsInfo,
  quantityLabel,
  unitPriceLabel,
} from './helpers';
import { QuickAddItemBar } from './QuickAddItemBar';
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
  setInlineForm: React.Dispatch<
    React.SetStateAction<{ qty: string; estimated: number | null; paid: number | null }>
  >;
  inlineSaving: boolean;
  pendingId: string | null;
  isDeleting: boolean;
  isFinishingList?: boolean;
  isUnfinishingList?: boolean;
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
  onIgnoreItem: (item: AppShoppingItem) => Promise<void>;
  onUnignoreItem: (item: AppShoppingItem) => Promise<void>;
  onUploadFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onBulkEdit: (patch: BulkEditPatch) => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onCreateCategory: (name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function ShoppingDetailView(props: ShoppingDetailViewProps) {
  const { state: sidebarState, isMobile } = useSidebar();
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
    isFinishingList = false,
    isUnfinishingList = false,
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
    onIgnoreItem,
    onUnignoreItem,
    onUploadFile,
    onBulkEdit,
    onBulkDelete,
    onCreateCategory,
    onDeleteCategory,
  } = props;

  const [addItemInitialData, setAddItemInitialData] = React.useState<ItemFormData | undefined>(
    undefined
  );

  const detailPurchasedItems = detailData?.items.filter((i) => i.isPurchased).length ?? 0;
  const detailTotalItems = detailData?.items.length ?? 0;
  const detailPct =
    detailTotalItems === 0 ? 0 : Math.round((detailPurchasedItems / detailTotalItems) * 100);
  const totalEstimated =
    detailData?.items.reduce(
      (s, i) => s + getItemEstimatedTotal(i.estimatedPrice, i.quantity, i.unitType),
      0
    ) ?? 0;
  const totalSpent =
    detailData?.items
      .filter((i) => i.isPurchased)
      .reduce((s, i) => s + getItemSpentTotal(i.price, i.quantity, i.unitType), 0) ?? 0;
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
        onEditList={() => setShowEditList(true)}
        onDeleteList={() => setShowDeleteAlert(true)}
      />

      {/* ── Quick Add Item Bar Mobile-First ─────────────────────────────────── */}
      {!isFinished && !isBulkMode && (
        <QuickAddItemBar
          onAddItem={onAddItem}
          onOpenDetailedForm={(initialName) => {
            setAddItemInitialData(
              initialName ? { ...emptyItemForm(), name: initialName } : undefined
            );
            setShowAddItem(true);
          }}
          categories={uniqueCategories}
          disabled={!detailData}
        />
      )}

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
                  className="flex items-center gap-4 border-t border-border/30 px-6 py-4"
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
              onIgnore={onIgnoreItem}
              onUnignore={onUnignoreItem}
              onOpenInlineEdit={onOpenInlineEdit}
              onCancelInlineEdit={onCancelInlineEdit}
              onSaveInlineEdit={onSaveInlineEdit}
              onDelete={onDeleteItem}
            />
          ))}
        </div>
      )}

      {/* Item detail sheet */}
      {selectedItem && (() => {
        const itemSpent =
          selectedItem.isPurchased && selectedItem.price != null
            ? getItemSpentTotal(selectedItem.price, selectedItem.quantity, selectedItem.unitType)
            : null;

        const itemEstimated =
          selectedItem.estimatedPrice != null
            ? getItemEstimatedTotal(
                selectedItem.estimatedPrice,
                selectedItem.quantity,
                selectedItem.unitType
              )
            : null;

        const itemSavings = selectedItem.isPurchased
          ? getSavingsInfo(
              selectedItem.estimatedPrice,
              selectedItem.price,
              selectedItem.quantity,
              selectedItem.unitType
            )
          : null;

        const isMultiQty = selectedItem.quantity > 1;

        return (
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
              className="rounded-t-3xl border-t border-border bg-card px-6 pb-8 pt-6 sm:max-w-lg sm:mx-auto sm:rounded-3xl sm:border sm:bottom-6 dark:bg-[#1e1e1e]"
            >
              <SheetHeader className="mb-5 space-y-2 text-left">
                {/* Badges: Status + Category */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedItem.status === ShoppingItemStatus.Purchased || selectedItem.isPurchased ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#78dc77]/15 px-3 py-1 text-xs font-semibold text-[#78dc77]">
                      <Check size={12} strokeWidth={3} />
                      Comprado
                    </span>
                  ) : selectedItem.status === ShoppingItemStatus.Ignored ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                      <EyeOff size={12} />
                      Ignorado
                    </span>
                  ) : selectedItem.status === ShoppingItemStatus.NotPurchased ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">
                      <X size={12} strokeWidth={2.5} />
                      Não comprado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      <Clock size={12} />
                      Pendente
                    </span>
                  )}
                  {selectedItem.categoryName && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-accent/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <Tag size={11} />
                      {selectedItem.categoryName}
                    </span>
                  )}
                </div>

                <SheetTitle className="text-xl font-bold text-foreground">
                  {selectedItem.name}
                </SheetTitle>
              </SheetHeader>

              {/* Informações consolidadas sem redundância */}
              <div className="space-y-4">
                <div className="space-y-3 rounded-2xl border border-border/70 bg-accent/20 p-4">
                  {/* Quantidade */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantidade</span>
                    <span className="font-semibold text-foreground">
                      {quantityLabel(selectedItem.quantity, selectedItem.unitType)}
                    </span>
                  </div>

                  {/* Detalhes de preço quando comprado */}
                  {selectedItem.isPurchased ? (
                    <>
                      {/* Valor pago */}
                      <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-sm">
                        <span className="text-muted-foreground">Valor pago</span>
                        <div className="text-right">
                          <span className="text-base font-bold text-[#78dc77]">
                            {itemSpent != null ? formatCurrency(itemSpent) : '---'}
                          </span>
                          {isMultiQty && selectedItem.price != null && (
                            <span className="block text-[11px] font-normal text-muted-foreground">
                              ({unitPriceLabel(selectedItem.price, selectedItem.unitType)})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Estimativa de referência (se houver) */}
                      {itemEstimated != null && (
                        <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-sm">
                          <span className="text-muted-foreground">Estimado</span>
                          <div className="text-right">
                            <span className="font-medium text-muted-foreground/80 line-through">
                              {formatCurrency(itemEstimated)}
                            </span>
                            {isMultiQty && selectedItem.estimatedPrice != null && (
                              <span className="block text-[11px] font-normal text-muted-foreground/70">
                                ({unitPriceLabel(selectedItem.estimatedPrice, selectedItem.unitType)})
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Variação / Economia */}
                      {itemSavings && itemSavings.type === 'savings' && (
                        <div className="flex items-center justify-between rounded-xl bg-[#78dc77]/10 px-3 py-2 text-xs font-semibold text-[#78dc77]">
                          <span className="flex items-center gap-1.5">
                            <TrendingDown size={14} /> Economia
                          </span>
                          <span>
                            -{formatCurrency(itemSavings.diff)} ({itemSavings.pct}%)
                          </span>
                        </div>
                      )}
                      {itemSavings && itemSavings.type === 'increase' && (
                        <div className="flex items-center justify-between rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-500">
                          <span className="flex items-center gap-1.5">
                            <TrendingUp size={14} /> Acréscimo
                          </span>
                          <span>
                            +{formatCurrency(itemSavings.diff)} ({itemSavings.pct}%)
                          </span>
                        </div>
                      )}

                      {/* Data da compra */}
                      {selectedItem.purchasedAt && (
                        <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} /> Data da compra
                          </span>
                          <span className="font-medium text-foreground">
                            {formatDateBR(selectedItem.purchasedAt)}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Detalhes de preço quando pendente */
                    <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-sm">
                      <span className="text-muted-foreground">Estimativa</span>
                      <div className="text-right">
                        <span className="font-semibold text-foreground">
                          {itemEstimated != null ? formatCurrency(itemEstimated) : 'Não informado'}
                        </span>
                        {isMultiQty && selectedItem.estimatedPrice != null && (
                          <span className="block text-[11px] font-normal text-muted-foreground">
                            ({unitPriceLabel(selectedItem.estimatedPrice, selectedItem.unitType)})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Observações */}
                {selectedItem.notes && (
                  <div className="space-y-1 rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                      <FileText size={12} /> Observações
                    </span>
                    <p className="leading-relaxed text-muted-foreground">{selectedItem.notes}</p>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="space-y-2.5 pt-2">
                  {/* Item pendente: Marcar como comprado, Marcar como ignorado, Editar, Remover */}
                  {!isFinished && selectedItem.status === ShoppingItemStatus.Pending && !selectedItem.isPurchased && (
                    <>
                      <button
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-600 active:scale-98"
                        onClick={() => {
                          setShowMobileEditSheet(false);
                          setShowPurchase(true);
                        }}
                      >
                        <Check size={18} strokeWidth={3} />
                        Marcar como comprado
                      </button>

                      <button
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-98 dark:bg-[#222]"
                        onClick={() => {
                          onIgnoreItem(selectedItem);
                          setShowMobileEditSheet(false);
                          setSelectedItem(null);
                        }}
                        disabled={pendingId === selectedItem.shoppingItemId}
                      >
                        <EyeOff size={16} />
                        Marcar como ignorado
                      </button>

                      <button
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent active:scale-98 dark:bg-[#222]"
                        onClick={() => {
                          setShowMobileEditSheet(false);
                          setShowEditItem(true);
                        }}
                      >
                        <Pencil size={16} />
                        Editar item
                      </button>

                      <button
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 active:scale-98"
                        onClick={() => {
                          onDeleteItem(selectedItem);
                          setShowMobileEditSheet(false);
                          setSelectedItem(null);
                        }}
                        disabled={pendingId === selectedItem.shoppingItemId}
                      >
                        <Trash2 size={16} />
                        Remover item
                      </button>
                    </>
                  )}

                  {/* Item ignorado: Voltar para pendente, Remover */}
                  {!isFinished && selectedItem.status === ShoppingItemStatus.Ignored && (
                    <>
                      <button
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent active:scale-98 dark:bg-[#222]"
                        onClick={() => {
                          onUnignoreItem(selectedItem);
                          setShowMobileEditSheet(false);
                          setSelectedItem(null);
                        }}
                        disabled={pendingId === selectedItem.shoppingItemId}
                      >
                        <RotateCcw size={15} />
                        Voltar para pendente
                      </button>

                      <button
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
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

                  {/* Item comprado: Apenas Desfazer compra */}
                  {!isFinished && (selectedItem.status === ShoppingItemStatus.Purchased || selectedItem.isPurchased) && (
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
              </div>
            </SheetContent>
          </Sheet>
        );
      })()}

      {/* Floating bulk action bar */}
      {isBulkMode && selectedItems.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 px-4">
          <div className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-xl">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 border-primary/40 bg-primary/10 text-xs text-primary hover:bg-primary/15 hover:text-primary"
              onClick={() => setShowBulkEdit(true)}
            >
              <Pencil size={13} />
              Editar selecionados
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 border-destructive/30 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
        onClose={() => {
          setShowAddItem(false);
          setAddItemInitialData(undefined);
        }}
        initialData={addItemInitialData}
        onSubmit={onAddItem}
        title="Adicionar Item"
        categories={uniqueCategories}
        onCreateCategory={onCreateCategory}
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
        onCreateCategory={onCreateCategory}
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Sticky footer bar ────────────────────────────────────────────────── */}
      {detailData && !isBulkMode && (
        <div
          className={cn(
            'fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-6 border-t border-border/20 bg-card/90 px-6 py-4 backdrop-blur-md transition-[left] duration-200 ease-linear dark:bg-[rgba(28,28,28,0.92)]',
            !isMobile &&
              (sidebarState === 'collapsed'
                ? 'md:left-[var(--sidebar-width-icon,3rem)]'
                : 'md:left-[var(--sidebar-width,16rem)]')
          )}
        >
          {/* Left: remaining balance */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/30 bg-background">
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
              className="flex shrink-0 items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#131313] shadow-lg transition-opacity hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #ffd6a5 0%, #ffb347 100%)' }}
              onClick={onUnfinishList}
              disabled={isUnfinishingList}
            >
              {isUnfinishingList ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Undo2 size={14} strokeWidth={3} />
              )}
              {isUnfinishingList ? 'Reabrindo...' : 'Reabrir Lista'}
            </button>
          ) : (
            <button
              className="flex shrink-0 items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#131313] shadow-lg transition-opacity hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #adc6ff 0%, #8cafff 100%)' }}
              onClick={onFinishList}
              disabled={detailTotalItems === 0 || isFinishingList}
            >
              {isFinishingList ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} strokeWidth={3} />
              )}
              {isFinishingList ? 'Finalizando...' : 'Finalizar Compra'}
            </button>
          )}
        </div>
      )}

      {/* ── Mobile FAB Principal para Adicionar Item ────────────────────────── */}
      {!isFinished && !isBulkMode && (
        <motion.div
          className="fixed bottom-24 right-5 z-40 sm:hidden pb-[env(safe-area-inset-bottom)]"
          whileTap={{ scale: 0.92 }}
        >
          <button
            onClick={() => {
              setAddItemInitialData(undefined);
              setShowAddItem(true);
            }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl transition-transform active:scale-95"
            aria-label="Adicionar item"
          >
            <Plus size={26} strokeWidth={3} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
