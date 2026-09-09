import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { emptyListForm } from '../helpers';
import type { ListFormData } from '../types';

interface ListFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: ListFormData;
  onSubmit: (data: ListFormData) => Promise<void>;
  title: string;
}

export function ListFormDialog({
  open,
  onClose,
  initialData,
  onSubmit,
  title,
}: ListFormDialogProps) {
  const [data, setData] = useState<ListFormData>(initialData ?? emptyListForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setData(initialData ?? emptyListForm());
      setSaving(false);
    }
  }, [open, initialData]);

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
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="flex max-h-[90dvh] flex-col rounded-t-3xl border-t border-border bg-card p-0 sm:max-w-md sm:mx-auto sm:rounded-3xl sm:border dark:bg-[#181818]"
      >
        <SheetHeader className="border-b border-border/40 px-6 py-4 text-left">
          <SheetTitle className="text-lg font-bold text-foreground">{title}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="list-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nome da Lista *
              </Label>
              <Input
                id="list-name"
                placeholder="Ex: Mercado Semanal, Feira..."
                value={data.name}
                onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                required
                autoFocus
                maxLength={100}
                className="h-12 rounded-2xl bg-muted/30 px-4 text-base font-medium shadow-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="list-month" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mês de Referência *
              </Label>
              <Input
                id="list-month"
                type="month"
                value={data.monthYear}
                onChange={(e) => setData((d) => ({ ...d, monthYear: e.target.value }))}
                required
                className="h-12 rounded-2xl bg-muted/30 px-4 text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="list-notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Observações <span className="text-[11px] font-normal lowercase">(opcional)</span>
              </Label>
              <Textarea
                id="list-notes"
                placeholder="Ex: Compras prioritárias da primeira quinzena..."
                value={data.notes}
                onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
                rows={3}
                className="rounded-2xl bg-muted/30 p-3.5 text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary"
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
                disabled={saving || !data.name.trim()}
                className="h-12 flex-[2] rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:bg-primary/90 active:scale-[0.98]"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Salvando...
                  </span>
                ) : (
                  'Salvar Lista'
                )}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
