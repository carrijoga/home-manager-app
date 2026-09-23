import { CopyPlus } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { addMonths, formatMonthYearPT, fromISOMonthYear } from '@/components/modules/Shopping/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';

export interface ReplicateSource {
  shoppingListId: string;
  name: string;
  monthYear: string; // ISO
}

interface ReplicateListDialogProps {
  source: ReplicateSource | null;
  onClose: () => void;
  /** Deve lançar em erro — o diálogo continua aberto. */
  onConfirm: (source: ReplicateSource, monthYear: string) => Promise<void>;
}

export function ReplicateListDialog({ source, onClose, onConfirm }: ReplicateListDialogProps) {
  const [month, setMonth] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (source) {
      setMonth(addMonths(fromISOMonthYear(source.monthYear), 1));
      setSaving(false);
    }
  }, [source]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !month || saving) return;
    setSaving(true);
    try {
      await onConfirm(source, month);
      onClose();
    } catch {
      // toast já exibido pela ação; mantém o diálogo aberto
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={!!source} onOpenChange={(v) => !v && !saving && onClose()}>
      <SheetContent
        side="bottom"
        className="flex max-h-[90dvh] flex-col rounded-t-3xl border-t border-border bg-card p-0 sm:max-w-md sm:mx-auto sm:rounded-3xl sm:border dark:bg-[#181818]"
      >
        <SheetHeader className="border-b border-border/40 px-6 py-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <CopyPlus size={18} className="text-primary" />
            Replicar para outro mês
          </SheetTitle>
          {source && (
            <p className="pt-0.5 text-sm text-muted-foreground">
              {source.name} · {formatMonthYearPT(source.monthYear)}
            </p>
          )}
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="replicate-month"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Mês de destino *
              </Label>
              <Input
                id="replicate-month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
                className="h-12 rounded-2xl bg-muted/30 px-4 text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Todos os itens serão copiados como pendentes.
            </p>
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
                disabled={saving || !month}
                className="h-12 flex-[2] rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:bg-primary/90 active:scale-[0.98]"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Replicando...
                  </span>
                ) : (
                  'Replicar lista'
                )}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
