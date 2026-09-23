import { formatCurrency, formatDateBR } from '@utils/formatters';
import { motion } from 'framer-motion';
import {
  Calendar,
  Check,
  Clock,
  EyeOff,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  ShoppingCart,
  Trash2,
  TrendingDown,
  TrendingUp,
  Undo2,
  X,
} from 'lucide-react';
import React from 'react';

import { UploadModal } from '@/components/modals/UploadModal';
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
import { formatCategoryLabel } from '@/lib/categories';
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
import type { ItemSection, SectionOption } from './grouping';
import {
  emptyItemForm,
  getItemEstimatedTotal,
  getItemSpentTotal,
  getQuantityDisplay,
  getSavingsInfo,
  getSpentQuantity,
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
  sectionOptions: SectionOption[];
  itemSections: ItemSection[];
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
  onUploadFile: (file: File) => Promise<void>;
  onBulkEdit: (patch: BulkEditPatch) => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onCreateCategory: (name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onStartMarketMode?: () => void;
}

export function ShoppingDetailView(props: ShoppingDetailViewProps) {
  const { state: sidebarState, isMobile } = useSidebar();
  const {
    detailData,
    isLoadingDetail,
    isFinished,
    editListInitialData,
    uniqueCategories,
    sectionOptions,
    itemSections,
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
    onStartMarketMode,
  } = props;

  const [showUploadModal, setShowUploadModal] = React.useState(false);
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
      .reduce((s, i) => s + getItemSpentTotal(i), 0) ?? 0;
  const remaining = Math.max(0, totalEstimated - totalSpent);

  if (isLoadingDetail || !detailData) {
    return (
      <div
        className="max-w-5xl mx-auto space-y-5 pb-32 px-1 sm:px-4"
        aria-busy="true"
        aria-live="polite"
        aria-label="Carregando lista de compras"
      >
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-44 rounded-lg" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/40">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* Categories / items skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-3.5 shadow-subtle"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className="max-w-5xl mx-auto space-y-5 pb-32 px-1 sm:px-4"
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
        onStartMarketMode={onStartMarketMode}
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
        sectionOptions={sectionOptions}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isSearchPending={isSearchPending}
        isFinished={isFinished}
        isUploading={isUploading}
        detailDataLoaded={!!detailData}
        categoryScrollRef={categoryScrollRef}
        onExitBulkMode={onExitBulkMode}
        onShowCategories={() => setShowCategories(true)}
        onUploadClick={() => setShowUploadModal(true)}
        onEnterBulkMode={() => setIsBulkMode(true)}
        onAddItem={() => setShowAddItem(true)}
        onScrollCategories={onScrollCategories}
        onCategoryPointerDown={onCategoryPointerDown}
        onCategoryPointerMove={onCategoryPointerMove}
        onCategoryPointerUp={onCategoryPointerUp}
      />
      <UploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onConfirm={async (file: File) => {
          await onUploadFile(file);
          setShowUploadModal(false);
        }}
        isLoading={isUploading}
        accept=".csv,.txt"
        title="Importar Itens"
        description="Selecione ou arraste um arquivo CSV ou TXT para importar produtos para sua lista de compras."
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
        <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-dashed border-border/80 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShoppingCart size={28} />
          </div>
          <div className="space-y-1">
            <p className="font-display text-base font-bold text-foreground">
              Sua lista de compras está vazia
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Adicione os primeiros itens pelo campo rápido acima ou toque em Adicionar.
            </p>
          </div>
          {!isFinished && (
            <Button
              onClick={() => setShowAddItem(true)}
              className="h-10 rounded-xl px-4 font-bold shadow-xs gap-1.5"
            >
              <Plus size={15} strokeWidth={2.5} />
              Adicionar Item
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {itemSections.map((section) => (
            <CategorySection
              key={section.key}
              section={section}
              isCollapsed={collapsedCategories.has(section.key)}
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
            ? getItemSpentTotal(selectedItem)
            : null;

        const itemEstimated =
          selectedItem.estimatedPrice != null
            ? getItemEstimatedTotal(
                selectedItem.estimatedPrice,
                selectedItem.quantity,
                selectedItem.unitType
              )
            : null;

        const itemSavings = selectedItem.isPurchased ? getSavingsInfo(selectedItem) : null;

        const isMultiQty =
          (selectedItem.isPurchased ? getSpentQuantity(selectedItem) : selectedItem.quantity) > 1;

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
              className="rounded-t-3xl border-t border-border/70 bg-card px-6 pb-8 pt-6 sm:max-w-lg sm:mx-auto sm:rounded-3xl sm:border sm:bottom-6"
            >
              <SheetHeader className="mb-5 space-y-2 text-left">
                {/* Badges: Status + Category */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedItem.status === ShoppingItemStatus.Purchased || selectedItem.isPurchased ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
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
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <Clock size={12} />
                      Pendente
                    </span>
                  )}
                  {selectedItem.category && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {formatCategoryLabel(
                        selectedItem.category,
                        selectedItem.category.parentName ? { name: selectedItem.category.parentName } : null
                      )}
                    </span>
                  )}
                </div>

                <SheetTitle className="font-display text-xl font-bold text-foreground">
                  {selectedItem.name}
                </SheetTitle>
              </SheetHeader>

              {/* Informações consolidadas sem redundância */}
              <div className="space-y-4">
                <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                  {/* Quantidade */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantidade</span>
                    <span className="text-right font-bold text-foreground">
                      {getQuantityDisplay(selectedItem).label}
                      {getQuantityDisplay(selectedItem).plannedLabel && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {getQuantityDisplay(selectedItem).plannedLabel}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Detalhes de preço quando comprado */}
                  {selectedItem.isPurchased ? (
                    <>
                      {/* Valor pago */}
                      <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-sm">
                        <span className="text-muted-foreground">Valor pago</span>
                        <div className="text-right">
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
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
                        <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
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
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-98"
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
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:scale-98"
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
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:scale-98"
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
            'fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 sm:gap-6 border-t border-border/60 bg-card/90 px-4 sm:px-6 py-3 sm:py-3.5 backdrop-blur-md shadow-modal transition-[left] duration-200 ease-linear',
            !isMobile &&
              (sidebarState === 'collapsed'
                ? 'md:left-[var(--sidebar-width-icon,3rem)]'
                : 'md:left-[var(--sidebar-width,16rem)]')
          )}
        >
          {/* Left: remaining balance */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/50 text-foreground">
              <ShoppingCart size={16} />
            </div>
            <div>
              <p className="font-display text-base sm:text-xl font-bold text-foreground tabular-nums leading-tight">
                {totalEstimated > 0 ? formatCurrency(remaining) : '—'}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Restante estimado
              </p>
            </div>
          </div>

          {/* Center: progress bar */}
          <div className="hidden flex-1 items-center gap-3 md:flex max-w-xs lg:max-w-md mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
              {detailPct}%
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/60">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isFinished ? 'bg-emerald-500' : 'bg-primary'
                )}
                style={{ width: `${detailPct}%` }}
              />
            </div>
          </div>

          {/* Right: finish / reopen button */}
          {isFinished ? (
            <button
              className="flex shrink-0 items-center gap-2 rounded-xl bg-card border border-border/80 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-foreground shadow-subtle transition-all hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              onClick={onUnfinishList}
              disabled={isUnfinishingList}
            >
              {isUnfinishingList ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Undo2 size={14} strokeWidth={2.5} />
              )}
              <span>{isUnfinishingList ? 'Reabrindo...' : 'Reabrir Lista'}</span>
            </button>
          ) : (
            <button
              className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-card transition-all hover:bg-primary/90 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              onClick={onFinishList}
              disabled={detailTotalItems === 0 || isFinishingList}
            >
              {isFinishingList ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} strokeWidth={3} />
              )}
              <span>{isFinishingList ? 'Finalizando...' : 'Finalizar Compra'}</span>
            </button>
          )}
        </div>
      )}

      {/* ── Mobile FAB Principal para Adicionar Item ────────────────────────── */}
      {!isFinished && !isBulkMode && (
        <motion.div
          className="fixed bottom-20 right-4 z-40 sm:hidden pb-[env(safe-area-inset-bottom)]"
          whileTap={{ scale: 0.92 }}
        >
          <button
            onClick={() => {
              setAddItemInitialData(undefined);
              setShowAddItem(true);
            }}
            className="flex h-13 w-13 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-modal transition-transform active:scale-95"
            aria-label="Adicionar item"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
