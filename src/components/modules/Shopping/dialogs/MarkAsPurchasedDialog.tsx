import MoneyInput from '@components/common/MoneyInput';
import { CheckCircle2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { UNIT_TYPE_LABELS } from '@/schemas/enums';
import type { AppShoppingItem } from '@/types';

import { emptyPurchaseForm } from '../helpers';
import type { PurchaseFormData } from '../types';

interface MarkAsPurchasedDialogProps {
  open: boolean;
  onClose: () => void;
  item: AppShoppingItem | null;
  onSubmit: (data: PurchaseFormData) => Promise<void>;
}

export function MarkAsPurchasedDialog({
  open,
  onClose,
  item,
  onSubmit,
}: MarkAsPurchasedDialogProps) {
  const [data, setData] = useState<PurchaseFormData>(
    emptyPurchaseForm(item?.quantity, item?.estimatedPrice)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setData(emptyPurchaseForm(item?.quantity, item?.estimatedPrice));
      setSaving(false);
    }
  }, [open, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const unitLabel = item ? (UNIT_TYPE_LABELS[item.unitType] ?? 'un') : '';

  return (
    <Sheet open={open && !!item} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="flex max-h-[90dvh] flex-col rounded-t-3xl border-t border-border bg-card p-0 sm:max-w-md sm:mx-auto sm:rounded-3xl sm:border dark:bg-[#181818]"
      >
        <SheetHeader className="border-b border-border/40 px-6 py-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <CheckCircle2 size={20} className="text-emerald-500" />
            Confirmar Compra
          </SheetTitle>
          {item && (
            <p className="text-sm font-semibold text-foreground/90 pt-0.5">
              {item.name}
            </p>
          )}
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="purchase-quantity" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quantidade comprada *{' '}
                {unitLabel && <span className="lowercase text-primary">({unitLabel})</span>}
              </Label>
              <Input
                id="purchase-quantity"
                type="number"
                min="0.001"
                step="any"
                placeholder="1"
                value={data.quantity}
                onChange={(e) => setData((d) => ({ ...d, quantity: e.target.value }))}
                required
                className="h-12 rounded-2xl bg-muted/30 px-4 text-base font-medium shadow-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="purchase-price" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Preço total pago (R$) <span className="text-[11px] font-normal lowercase">(opcional)</span>
              </Label>
              <MoneyInput
                id="purchase-price"
                value={data.price}
                onChange={(v) => setData((d) => ({ ...d, price: v }))}
                className="h-12 rounded-2xl bg-muted/30 px-4 text-base font-medium shadow-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="purchase-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Data da compra
              </Label>
              <Input
                id="purchase-date"
                type="date"
                value={data.purchasedAt}
                onChange={(e) => setData((d) => ({ ...d, purchasedAt: e.target.value }))}
                required
                className="h-12 rounded-2xl bg-muted/30 px-4 text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="border-t border-border/40 bg-card p-4 pb-6 dark:bg-[#181818]">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-2xl text-sm font-semibold"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-12 flex-[2] rounded-2xl bg-emerald-500 text-white text-sm font-bold shadow-md hover:bg-emerald-600 active:scale-[0.98]"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Confirmando...
                  </span>
                ) : (
                  'Confirmar Compra'
                )}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
