import MoneyInput from '@components/common/MoneyInput';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        className="rounded-t-2xl border-t border-border bg-card px-6 pb-8 pt-6 dark:bg-[#1e1e1e]"
      >
        <SheetHeader className="mb-5 text-left">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <CheckCircle2 size={18} style={{ color: '#78dc77' }} />
            Marcar como comprado
          </SheetTitle>
          {item && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{item.name}</span>
            </p>
          )}
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="purchase-quantity">
              Quantidade comprada *{' '}
              {unitLabel && <span className="text-xs text-muted-foreground">({unitLabel})</span>}
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
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purchase-price">
              Preço pago (R$) <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <MoneyInput
              id="purchase-price"
              value={data.price}
              onChange={(v) => setData((d) => ({ ...d, price: v }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purchase-date">Data da compra</Label>
            <Input
              id="purchase-date"
              type="date"
              value={data.purchasedAt}
              onChange={(e) => setData((d) => ({ ...d, purchasedAt: e.target.value }))}
              required
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
