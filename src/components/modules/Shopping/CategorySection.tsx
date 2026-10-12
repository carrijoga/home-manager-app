import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, FolderMinus, Tag } from 'lucide-react';
import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { AppShoppingItem } from '@/types';

import { type ItemSection, NO_CATEGORY_KEY } from './grouping';
import { ShoppingItemRow } from './ShoppingItemRow';

interface CategorySectionProps {
  section: ItemSection;
  isCollapsed: boolean;
  isBulkMode: boolean;
  isFinished: boolean;
  selectedItemIds: Set<string>;
  inlineEditingId: string | null;
  inlineForm: { qty: string; estimated: number | null; paid: number | null };
  inlineSaving: boolean;
  pendingId: string | null;
  setInlineForm: React.Dispatch<
    React.SetStateAction<{ qty: string; estimated: number | null; paid: number | null }>
  >;
  setSelectedItemIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onToggleCollapse: (category: string) => void;
  onOpenMobileSheet: (item: AppShoppingItem) => void;
  onToggleSelection: (id: string) => void;
  onMarkAsPurchased: (item: AppShoppingItem) => void;
  onUnmark: (item: AppShoppingItem) => void;
  onIgnore?: (item: AppShoppingItem) => void;
  onUnignore?: (item: AppShoppingItem) => void;
  onOpenInlineEdit: (item: AppShoppingItem) => void;
  onCancelInlineEdit: () => void;
  onSaveInlineEdit: (item: AppShoppingItem) => void;
  onDelete: (item: AppShoppingItem) => void;
}

export function CategorySection(props: CategorySectionProps) {
  const {
    section,
    isCollapsed,
    isBulkMode,
    isFinished,
    selectedItemIds,
    inlineEditingId,
    inlineForm,
    inlineSaving,
    pendingId,
    setInlineForm,
    setSelectedItemIds,
    onToggleCollapse,
    onOpenMobileSheet,
    onToggleSelection,
    onMarkAsPurchased,
    onUnmark,
    onIgnore,
    onUnignore,
    onOpenInlineEdit,
    onCancelInlineEdit,
    onSaveInlineEdit,
    onDelete,
  } = props;
  const { items } = section;

  const purchasedCount = items.filter((i) => i.isPurchased).length;
  const unpurchased = items.filter((i) => !i.isPurchased);
  const allPurchased = items.length > 0 && purchasedCount === items.length;
  const allGroupSelected =
    unpurchased.length > 0 && unpurchased.every((i) => selectedItemIds.has(i.shoppingItemId));
  const someGroupSelected = unpurchased.some((i) => selectedItemIds.has(i.shoppingItemId));

  const isNoneCategory = section.key === NO_CATEGORY_KEY;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-subtle transition-all duration-200 hover:border-border/90 hover:shadow-card">
      {/* Category header - Tappable with thumb */}
      <div
        onClick={() => onToggleCollapse(section.key)}
        className="flex cursor-pointer items-center justify-between border-b border-border/40 bg-muted/25 px-4 py-3 sm:px-5 sm:py-3.5 select-none transition-colors hover:bg-muted/40 active:bg-muted/60"
      >
        <div className="flex items-center gap-3 min-w-0">
          {isBulkMode && unpurchased.length > 0 && (
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={allGroupSelected}
                data-state={someGroupSelected && !allGroupSelected ? 'indeterminate' : undefined}
                onCheckedChange={(checked) => {
                  setSelectedItemIds((prev) => {
                    const next = new Set(prev);
                    unpurchased.forEach((i) => {
                      if (checked) next.add(i.shoppingItemId);
                      else next.delete(i.shoppingItemId);
                    });
                    return next;
                  });
                }}
                className="shrink-0 rounded-lg h-5 w-5 mr-0.5"
              />
            </div>
          )}

          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base transition-colors',
              allPurchased
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-primary/10 text-primary'
            )}
          >
            {section.icon ? (
              <span aria-hidden>{section.icon}</span>
            ) : isNoneCategory ? (
              <FolderMinus size={15} />
            ) : (
              <Tag size={15} />
            )}
          </div>

          {section.color && (
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: section.color }}
              aria-hidden
            />
          )}

          <span className="truncate text-sm sm:text-base font-bold tracking-tight text-foreground font-display">
            {section.label}
          </span>

          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground shrink-0 tabular-nums">
            {purchasedCount}/{items.length}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {allPurchased && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
              <CheckCircle2 size={11} /> Concluída
            </span>
          )}

          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-transform duration-200',
              !isCollapsed && 'rotate-180'
            )}
          >
            <ChevronDown size={16} />
          </span>
        </div>
      </div>

      {/* Items List */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden divide-y divide-border/30"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const isEditing = inlineEditingId === item.shoppingItemId;

                return (
                  <motion.div
                    key={item.shoppingItemId}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                  >
                    <ShoppingItemRow
                      item={item}
                      isBulkMode={isBulkMode}
                      isFinished={isFinished}
                      isEditing={isEditing}
                      isSelected={selectedItemIds.has(item.shoppingItemId)}
                      isPending={pendingId === item.shoppingItemId}
                      inlineForm={inlineForm}
                      inlineSaving={inlineSaving}
                      setInlineForm={setInlineForm}
                      onOpenMobileSheet={onOpenMobileSheet}
                      onToggleSelection={onToggleSelection}
                      onMarkAsPurchased={onMarkAsPurchased}
                      onUnmark={onUnmark}
                      onIgnore={onIgnore}
                      onUnignore={onUnignore}
                      onOpenInlineEdit={onOpenInlineEdit}
                      onCancelInlineEdit={onCancelInlineEdit}
                      onSaveInlineEdit={onSaveInlineEdit}
                      onDelete={onDelete}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
