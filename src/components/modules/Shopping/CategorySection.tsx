import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Tag } from 'lucide-react';
import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import type { AppShoppingItem } from '@/types';

import { ShoppingItemRow } from './ShoppingItemRow';

interface CategorySectionProps {
  category: string;
  items: AppShoppingItem[];
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
  onOpenInlineEdit: (item: AppShoppingItem) => void;
  onCancelInlineEdit: () => void;
  onSaveInlineEdit: (item: AppShoppingItem) => void;
  onDelete: (item: AppShoppingItem) => void;
}

export function CategorySection(props: CategorySectionProps) {
  const {
    category,
    items,
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
    onOpenInlineEdit,
    onCancelInlineEdit,
    onSaveInlineEdit,
    onDelete,
  } = props;

  const purchasedCount = items.filter((i) => i.isPurchased).length;
  const unpurchased = items.filter((i) => !i.isPurchased);
  const allGroupSelected =
    unpurchased.length > 0 && unpurchased.every((i) => selectedItemIds.has(i.shoppingItemId));
  const someGroupSelected = unpurchased.some((i) => selectedItemIds.has(i.shoppingItemId));

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card dark:bg-[#1e1e1e]">
      {/* Category header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card px-5 py-3.5 dark:bg-[#242424]">
        <div className="flex items-center gap-3">
          {isBulkMode && unpurchased.length > 0 && (
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
              className="shrink-0"
            />
          )}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(173,198,255,0.1)' }}
          >
            <Tag size={13} style={{ color: '#adc6ff' }} />
          </div>
          <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
            {category}
          </span>
          <span className="text-xs text-muted-foreground">
            {purchasedCount}/{items.length}
          </span>
        </div>
        <button
          onClick={() => onToggleCollapse(category)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={isCollapsed ? 'Expandir categoria' : 'Recolher categoria'}
        >
          {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </button>
      </div>

      {/* Items */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => {
                const isEditing = inlineEditingId === item.shoppingItemId;

                return (
                  <motion.div
                    key={item.shoppingItemId}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                    className={idx > 0 ? 'border-t border-border/30' : ''}
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
