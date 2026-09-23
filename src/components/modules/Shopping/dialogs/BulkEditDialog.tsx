import MoneyInput from '@components/common/MoneyInput';
import { ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { CategoryPicker } from '@/components/common/CategoryPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CategoryScope } from '@/schemas/category';
import { UNIT_TYPE_LABELS } from '@/schemas/enums';
import type { AppShoppingItem } from '@/types';

import type { BulkEditPatch } from '../types';
import { UnitChips, UnitPickerSheet } from './UnitSelector';

interface BulkEditDialogProps {
  open: boolean;
  onClose: () => void;
  selectedItems: AppShoppingItem[];
  onSubmit: (patch: BulkEditPatch) => Promise<void>;
}

export function BulkEditDialog({
  open,
  onClose,
  selectedItems,
  onSubmit,
}: BulkEditDialogProps) {
  const [quantity, setQuantity] = useState('');
  const [unitType, setUnitType] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity('');
      setUnitType('');
      setCategoryId('');
      setEstimatedPrice(null);
      setUnitPickerOpen(false);
      setSaving(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const patch: BulkEditPatch = {};
    if (quantity !== '') patch.quantity = parseFloat(quantity);
    if (unitType !== '') patch.unitType = parseInt(unitType);
    if (categoryId === '__clear__') patch.categoryId = null;
    else if (categoryId !== '') patch.categoryId = categoryId;
    if (estimatedPrice !== null) patch.estimatedPrice = estimatedPrice;
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await onSubmit(patch);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const previewNames = selectedItems.slice(0, 3).map((i) => i.name);
  const overflow = selectedItems.length - 3;

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="bottom"
          className="flex max-h-[90dvh] flex-col rounded-t-3xl border-t border-border bg-card p-0 sm:max-w-lg sm:mx-auto sm:rounded-3xl sm:border dark:bg-[#181818]"
        >
          <SheetHeader className="border-b border-border/40 px-6 py-4 text-left">
            <SheetTitle className="text-lg font-bold text-foreground">
              Editar {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'}
            </SheetTitle>
            <p className="text-xs text-muted-foreground">
              Apenas os campos preenchidos serão atualizados nos itens selecionados ({previewNames.join(', ')}
              {overflow > 0 ? ` +${overflow}` : ''}).
            </p>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-qty" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quantidade & Unidade
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="bulk-qty"
                    type="number"
                    min="0.001"
                    step="any"
                    placeholder="Sem alteração"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="h-12 flex-1 rounded-2xl bg-muted/30 px-4 text-base font-medium shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                      setUnitPickerOpen(true);
                    }}
                    className="flex h-12 items-center justify-between gap-2 rounded-2xl border border-border/80 bg-muted/40 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent/50"
                  >
                    <span>
                      {unitType !== '' ? UNIT_TYPE_LABELS[Number(unitType)] ?? 'un' : '— unidade —'}
                    </span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </button>
                </div>
                <UnitChips
                  value={unitType}
                  onChange={(val) => setUnitType(val)}
                  className="pt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="bulk-category"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Categoria
                </Label>
                <CategoryPicker
                  id="bulk-category"
                  scope={CategoryScope.Shopping}
                  value={categoryId && categoryId !== '__clear__' ? categoryId : null}
                  onChange={(id) => setCategoryId(id ?? '__clear__')}
                  allowClear
                  placeholder={categoryId === '__clear__' ? 'Remover categoria' : 'Manter categoria atual'}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bulk-price" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preço estimado (R$)
                </Label>
                <MoneyInput
                  id="bulk-price"
                  value={estimatedPrice}
                  onChange={setEstimatedPrice}
                  className="h-12 rounded-2xl bg-muted/30 px-4 text-base font-medium shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="border-t border-border/40 bg-card p-4 pb-6 dark:bg-[#181818]">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 flex-1 rounded-2xl font-semibold"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-12 flex-[2] rounded-2xl bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90"
                >
                  {saving ? 'Aplicando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <UnitPickerSheet
        open={unitPickerOpen}
        onClose={() => setUnitPickerOpen(false)}
        value={unitType}
        onChange={(val) => setUnitType(val)}
      />
    </>
  );
}
