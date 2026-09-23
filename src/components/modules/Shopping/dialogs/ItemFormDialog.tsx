import MoneyInput from '@components/common/MoneyInput';
import { ChevronRight, Minus, Plus, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { CategoryPicker } from '@/components/common/CategoryPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { useCategories } from '@/hooks/useCategories';
import { CategoryScope } from '@/schemas/category';
import { UNIT_TYPE_LABELS } from '@/schemas/enums';

import { emptyItemForm } from '../helpers';
import { suggestCategoryForItem } from '../smartCategory';
import type { ItemFormData } from '../types';
import { UnitChips, UnitPickerSheet } from './UnitSelector';

interface ItemFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: ItemFormData;
  onSubmit: (data: ItemFormData) => Promise<void>;
  title: string;
}

export function ItemFormDialog({
  open,
  onClose,
  initialData,
  onSubmit,
  title,
}: ItemFormDialogProps) {
  const [data, setData] = useState<ItemFormData>(initialData ?? emptyItemForm());
  const [saving, setSaving] = useState(false);
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);
  const [categoryWasManuallySet, setCategoryWasManuallySet] = useState(false);

  const { tree } = useCategories(CategoryScope.Shopping);

  useEffect(() => {
    if (open) {
      setData(initialData ?? emptyItemForm());
      setSaving(false);
      setUnitPickerOpen(false);
      setCategoryWasManuallySet(Boolean(initialData?.categoryId));
    }
  }, [open, initialData]);

  // Auto-sugestão inteligente de categoria conforme digita o nome do item
  const handleNameChange = (name: string) => {
    setData((d) => {
      const next = { ...d, name };
      if (!categoryWasManuallySet && !d.categoryId && name.trim().length >= 3) {
        const suggestedCat = suggestCategoryForItem(name, tree);
        if (suggestedCat) {
          next.categoryId = suggestedCat;
        }
      }
      return next;
    });
  };

  const adjustQty = (delta: number) => {
    setData((d) => {
      const current = parseFloat(d.quantity) || 1;
      const next = Math.max(0.1, Number((current + delta).toFixed(2)));
      return { ...d, quantity: String(next) };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || saving) return;
    setSaving(true);
    try {
      await onSubmit({ ...data });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="bottom"
          className="flex max-h-[92dvh] flex-col rounded-t-3xl border-t border-border bg-card p-0 sm:max-w-lg sm:mx-auto sm:rounded-3xl sm:border dark:bg-[#181818]"
        >
          {/* Header Mobile */}
          <SheetHeader className="border-b border-border/40 px-6 py-4 text-left">
            <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
              {title}
            </SheetTitle>
          </SheetHeader>

          {/* Form Content com scroll livre */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
              {/* Nome do Item */}
              <div className="space-y-1.5">
                <Label htmlFor="item-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nome do Item *
                </Label>
                <Input
                  id="item-name"
                  placeholder="Ex: Arroz, Leite, Banana..."
                  value={data.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  autoFocus
                  maxLength={150}
                  className="h-12 rounded-2xl bg-muted/30 px-4 text-base font-medium shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              {/* Quantidade e Unidade */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="item-qty" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quantidade & Unidade *
                  </Label>
                  <button
                    type="button"
                    onClick={() => setUnitPickerOpen(true)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Ver todas
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Stepper de quantidade */}
                  <div className="flex h-12 flex-1 items-center rounded-2xl border border-border/80 bg-muted/30 px-1">
                    <button
                      type="button"
                      onClick={() => adjustQty(-1)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
                      aria-label="Diminuir"
                    >
                      <Minus size={16} />
                    </button>
                    <Input
                      id="item-qty"
                      type="number"
                      min="0.001"
                      step="any"
                      placeholder="1"
                      value={data.quantity}
                      onChange={(e) => setData((d) => ({ ...d, quantity: e.target.value }))}
                      required
                      className="h-10 border-0 bg-transparent text-center text-base font-bold shadow-none focus-visible:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => adjustQty(1)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
                      aria-label="Aumentar"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Botão de seleção de unidade atual */}
                  <button
                    type="button"
                    onClick={() => setUnitPickerOpen(true)}
                    className="flex h-12 items-center justify-between gap-2 rounded-2xl border border-border/80 bg-muted/40 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent/50 active:scale-98"
                  >
                    <span>{UNIT_TYPE_LABELS[Number(data.unitType)] ?? 'un'}</span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </button>
                </div>

                {/* Chips rápidos de unidades mais comuns */}
                <UnitChips
                  value={data.unitType}
                  onChange={(val) => setData((d) => ({ ...d, unitType: val }))}
                  className="pt-1"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="item-category"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Categoria
                  </Label>
                  {data.categoryId && !categoryWasManuallySet && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <Sparkles size={11} />
                      Sugerida
                    </span>
                  )}
                </div>
                <CategoryPicker
                  id="item-category"
                  scope={CategoryScope.Shopping}
                  value={data.categoryId || null}
                  onChange={(id) => {
                    setData((d) => ({ ...d, categoryId: id ?? '' }));
                    setCategoryWasManuallySet(true);
                  }}
                  allowClear
                  placeholder="Selecionar categoria..."
                />
              </div>

              {/* Preço Estimado */}
              <div className="space-y-1.5">
                <Label htmlFor="item-price" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preço Estimado (R$) <span className="text-[11px] font-normal lowercase">(opcional)</span>
                </Label>
                <MoneyInput
                  id="item-price"
                  value={data.estimatedPrice}
                  onChange={(v) => setData((d) => ({ ...d, estimatedPrice: v }))}
                  className="h-12 rounded-2xl bg-muted/30 px-4 text-base font-medium shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              {/* Observações */}
              <div className="space-y-1.5">
                <Label htmlFor="item-notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Observações <span className="text-[11px] font-normal lowercase">(opcional)</span>
                </Label>
                <Input
                  id="item-notes"
                  placeholder="Ex: Marca preferida, ponto da carne..."
                  value={data.notes}
                  onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
                  className="h-12 rounded-2xl bg-muted/30 px-4 text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* Rodapé Fixo com Botão de Adicionar/Salvar de Alto Contraste */}
            <div className="border-t border-border/40 bg-card p-4 pb-6 dark:bg-[#181818]">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !data.name.trim()}
                  className="h-12 flex-[2] rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Salvando...
                    </span>
                  ) : (
                    'Salvar Item'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Sheet de Unidades Completo */}
      <UnitPickerSheet
        open={unitPickerOpen}
        onClose={() => setUnitPickerOpen(false)}
        value={data.unitType}
        onChange={(val) => setData((d) => ({ ...d, unitType: val }))}
      />
    </>
  );
}
