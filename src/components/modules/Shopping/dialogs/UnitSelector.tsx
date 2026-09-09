import { Check } from 'lucide-react';
import { useEffect } from 'react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { UNIT_TYPE_FULL_LABELS, UNIT_TYPE_LABELS } from '@/schemas/enums';

interface UnitSelectorProps {
  value: string | number;
  onChange: (val: string) => void;
  className?: string;
}

// 8 unidades oficiais do sistema
const UNITS = [
  { val: '0', label: 'un', full: 'Unidade (un)' },
  { val: '1', label: 'kg', full: 'Quilogramas (kg)' },
  { val: '2', label: 'g', full: 'Gramas (g)' },
  { val: '3', label: 'L', full: 'Litros (L)' },
  { val: '7', label: 'pct', full: 'Pacote (pct)' },
  { val: '6', label: 'cx', full: 'Caixa (cx)' },
  { val: '5', label: 'dz', full: 'Dúzia (dz)' },
  { val: '4', label: 'mL', full: 'Mililitros (mL)' },
];

/**
 * Seletor de unidades em chips rápidos para toque imediato no mobile sem abrir teclado.
 */
export function UnitChips({ value, onChange, className }: UnitSelectorProps) {
  const currentVal = String(value);

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {UNITS.map((u) => {
        const isSelected = currentVal === u.val;
        return (
          <button
            key={u.val}
            type="button"
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              onChange(u.val);
            }}
            className={cn(
              'h-9 min-w-[42px] rounded-xl px-2.5 text-xs font-semibold transition-all active:scale-95',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border/80 bg-muted/40 text-muted-foreground hover:border-border hover:bg-accent/50 hover:text-foreground'
            )}
            title={u.full}
          >
            {u.label}
          </button>
        );
      })}
    </div>
  );
}

interface UnitPickerSheetProps {
  open: boolean;
  onClose: () => void;
  value: string | number;
  onChange: (val: string) => void;
}

/**
 * Gaveta inferior completa para seleção de unidade (sem input nem teclado)
 */
export function UnitPickerSheet({ open, onClose, value, onChange }: UnitPickerSheetProps) {
  const currentVal = String(value);

  useEffect(() => {
    if (open && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="flex max-h-[80dvh] flex-col rounded-t-3xl border-t border-border bg-card p-0 sm:max-w-md sm:mx-auto sm:rounded-3xl sm:border dark:bg-[#181818]"
      >
        <SheetHeader className="border-b border-border/40 px-6 py-4 text-left pr-12">
          <SheetTitle className="text-lg font-bold text-foreground">
            Unidade de Medida
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto overscroll-contain px-4 py-2">
          {Object.entries(UNIT_TYPE_FULL_LABELS).map(([val, fullLabel]) => {
            const isSelected = currentVal === val;
            const shortLabel = UNIT_TYPE_LABELS[Number(val)] ?? 'un';
            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  onChange(val);
                  onClose();
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-colors active:scale-[0.99]',
                  isSelected
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-foreground hover:bg-accent/40'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-9 w-11 items-center justify-center rounded-xl text-xs font-bold uppercase',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {shortLabel}
                  </span>
                  <span>{fullLabel}</span>
                </div>
                {isSelected && <Check size={18} className="text-primary" />}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
