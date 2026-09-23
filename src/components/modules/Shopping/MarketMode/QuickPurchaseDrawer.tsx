import MoneyInput from '@components/common/MoneyInput';
import { formatCurrency } from '@utils/formatters';
import { Check, Minus, Pencil, Plus, Scale, Tag, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { UNIT_TYPE_LABELS } from '@/schemas/enums';
import type { AppShoppingItem } from '@/types';

interface QuickPurchaseDrawerProps {
  open: boolean;
  item: AppShoppingItem | null;
  onClose: () => void;
  onConfirm: (data: {
    quantity: string;
    price: number | null;
    purchasedAt: string;
    unitType?: number;
  }) => Promise<void>;
  onEditItemFull?: (item: AppShoppingItem) => void;
  isSaving?: boolean;
}

export function QuickPurchaseDrawer({
  open,
  item,
  onClose,
  onConfirm,
  onEditItemFull,
  isSaving = false,
}: QuickPurchaseDrawerProps) {
  const [calcMode, setCalcMode] = useState<'total' | 'unit'>('total');
  const [qty, setQty] = useState<string>('1');
  const [unitType, setUnitType] = useState<number>(0);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [unitPrice, setUnitPrice] = useState<number | null>(null);

  const isWeightUnit = unitType === 1; // 1 = Kg
  const unitLabel = UNIT_TYPE_LABELS[unitType] ?? 'un';

  // Inicializa os dados ao abrir a gaveta
  useEffect(() => {
    if (open && item) {
      const initialQty = item.quantity > 0 ? String(item.quantity) : '1';
      setQty(initialQty);
      setUnitType(item.unitType ?? 0);
      setShowUnitPicker(false);

      // Preenche preço inicial estimado ou nulo
      if (item.estimatedPrice != null) {
        setTotalPrice(Number(item.estimatedPrice));
        const numQty = parseFloat(initialQty) || 1;
        setUnitPrice(numQty > 0 ? Number(item.estimatedPrice) / numQty : Number(item.estimatedPrice));
      } else {
        setTotalPrice(null);
        setUnitPrice(null);
      }

      setCalcMode('total');
    }
  }, [open, item]);

  if (!item) return null;

  const currentNumericQty = Math.max(0.01, parseFloat(qty) || 1);

  // Ajusta a quantidade pelo stepper
  const handleAdjustQty = (delta: number) => {
    const next = Math.max(isWeightUnit ? 0.1 : 1, currentNumericQty + delta);
    const formattedNext = isWeightUnit ? next.toFixed(2).replace(/\.?0+$/, '') : String(Math.round(next));
    setQty(formattedNext);

    // Se estiver no modo unitário, recalcula o preço total
    if (calcMode === 'unit' && unitPrice != null) {
      setTotalPrice(Math.round(unitPrice * next * 100) / 100);
    }
  };

  const handleShortcutAdd = (amount: number) => {
    const next = currentNumericQty + amount;
    const formattedNext = isWeightUnit ? next.toFixed(2).replace(/\.?0+$/, '') : String(Math.round(next));
    setQty(formattedNext);

    if (calcMode === 'unit' && unitPrice != null) {
      setTotalPrice(Math.round(unitPrice * next * 100) / 100);
    }
  };

  // Ao mudar o modo de preço
  const handleSwitchMode = (newMode: 'total' | 'unit') => {
    if (newMode === calcMode) return;
    setCalcMode(newMode);

    if (newMode === 'unit' && totalPrice != null) {
      setUnitPrice(Math.round((totalPrice / currentNumericQty) * 100) / 100);
    } else if (newMode === 'total' && unitPrice != null) {
      setTotalPrice(Math.round(unitPrice * currentNumericQty * 100) / 100);
    }
  };

  const handleTotalPriceChange = (val: number | null) => {
    setTotalPrice(val);
    if (val != null && currentNumericQty > 0) {
      setUnitPrice(Math.round((val / currentNumericQty) * 100) / 100);
    } else {
      setUnitPrice(null);
    }
  };

  const handleUnitPriceChange = (val: number | null) => {
    setUnitPrice(val);
    if (val != null) {
      setTotalPrice(Math.round(val * currentNumericQty * 100) / 100);
    } else {
      setTotalPrice(null);
    }
  };

  const handleApplyEstimated = () => {
    if (item.estimatedPrice != null) {
      setTotalPrice(item.estimatedPrice);
      if (currentNumericQty > 0) {
        setUnitPrice(Math.round((item.estimatedPrice / currentNumericQty) * 100) / 100);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    const todayIso = new Date().toISOString();
    await onConfirm({
      quantity: qty,
      price: totalPrice,
      purchasedAt: todayIso,
      unitType,
    });
    onClose();
  };

  const handleQuickWithoutPrice = async () => {
    if (isSaving) return;
    const todayIso = new Date().toISOString();
    // Salva com o preço estimado se houver, ou null
    await onConfirm({
      quantity: qty,
      price: item.estimatedPrice ?? null,
      purchasedAt: todayIso,
      unitType,
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="flex max-h-[92dvh] flex-col rounded-t-[32px] border-t border-border/60 bg-card p-0 sm:max-w-md sm:mx-auto sm:rounded-3xl sm:border dark:bg-[#181716]"
      >
        {/* Puxador Tátil Superior */}
        <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-muted-foreground/25" />

        <SheetHeader className="border-b border-border/40 px-5 pt-2 pb-3 pr-12 text-left">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {item.categoryName || 'Item da Lista'}
              </span>
              {item.estimatedPrice != null && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  Estimado: {formatCurrency(item.estimatedPrice)}
                </span>
              )}
              {onEditItemFull && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditItemFull(item);
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-muted/40 hover:bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  title="Editar nome, categoria ou notas"
                >
                  <Pencil size={10} />
                  <span>Editar dados</span>
                </button>
              )}
            </div>
            <SheetTitle className="font-display truncate text-xl font-bold tracking-tight text-foreground">
              {item.name}
            </SheetTitle>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-5 py-4">
            
            {/* ── 1. Seletor de Modo de Preço ── */}
            <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border/50 bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => handleSwitchMode('total')}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all',
                  calcMode === 'total'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Scale size={13} />
                <span>Preço na Balança</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('unit')}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all',
                  calcMode === 'unit'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Tag size={13} />
                <span>Preço Unitário</span>
              </button>
            </div>

            {/* ── 2. Stepper Tátil de Quantidade / Peso com Seletor Sutil de Unidade ── */}
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Quantidade / Peso Comprado
                </span>

                {/* Pílula sutil para alterar a unidade (ex: dz -> pct) */}
                <button
                  type="button"
                  onClick={() => setShowUnitPicker((prev) => !prev)}
                  className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all active:scale-95"
                  title="Toque para mudar a unidade (un, kg, g, pct, dz, etc.)"
                >
                  <span>{unitLabel}</span>
                  <Pencil size={10} className="opacity-70" />
                </button>
              </div>

              {/* Seletor Rápido de Unidade quando expandido */}
              {showUnitPicker && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-background/95 p-2 shadow-inner animate-in fade-in duration-150">
                  {Object.entries(UNIT_TYPE_LABELS).map(([code, label]) => {
                    const numCode = Number(code);
                    const isCurrent = numCode === unitType;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setUnitType(numCode);
                          setShowUnitPicker(false);
                        }}
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-xs font-bold transition-all active:scale-95',
                          isCurrent
                            ? 'bg-primary text-primary-foreground shadow-2xs'
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleAdjustQty(isWeightUnit ? -0.1 : -1)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-background text-lg font-bold text-foreground shadow-xs transition-all hover:bg-muted active:scale-90"
                  aria-label="Diminuir"
                >
                  <Minus size={18} />
                </button>

                <div className="flex flex-1 items-baseline justify-center gap-1 text-center">
                  <span className="font-display text-3xl font-black text-foreground tabular-nums">
                    {qty}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">
                    {unitLabel}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdjustQty(isWeightUnit ? 0.1 : 1)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-background text-lg font-bold text-foreground shadow-xs transition-all hover:bg-muted active:scale-90"
                  aria-label="Aumentar"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Atalhos Rápidos no Polegar */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {isWeightUnit ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleShortcutAdd(0.2)}
                      className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      +200g
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShortcutAdd(0.5)}
                      className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      +500g
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShortcutAdd(1.0)}
                      className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      +1 kg
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleShortcutAdd(1)}
                      className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      +1 {unitLabel}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShortcutAdd(2)}
                      className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      +2 {unitLabel}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShortcutAdd(5)}
                      className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      +5 {unitLabel}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ── 3. Entrada de Preço Pago ── */}
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {calcMode === 'total' ? 'Preço Total Pago (R$)' : `Preço por ${unitLabel} (R$)`}
                </span>
                {item.estimatedPrice != null && (
                  <button
                    type="button"
                    onClick={handleApplyEstimated}
                    className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/20"
                  >
                    <Zap size={10} />
                    Usar Estimado ({formatCurrency(item.estimatedPrice)})
                  </button>
                )}
              </div>

              {calcMode === 'total' ? (
                <MoneyInput
                  value={totalPrice}
                  onChange={handleTotalPriceChange}
                  placeholder="0,00"
                  className="h-13 rounded-2xl bg-background text-2xl font-black text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-primary text-right"
                />
              ) : (
                <div className="space-y-1.5">
                  <MoneyInput
                    value={unitPrice}
                    onChange={handleUnitPriceChange}
                    placeholder="0,00"
                    className="h-13 rounded-2xl bg-background text-2xl font-black text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-primary text-right"
                  />
                  {totalPrice != null && (
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Total calculado:</span>
                      <span className="font-bold text-foreground tabular-nums">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* ── Botões de Ação Inferiores (No Polegar) ── */}
          <div className="border-t border-border/40 bg-card p-4 pb-6 dark:bg-[#181716]">
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleQuickWithoutPrice}
                disabled={isSaving}
                className="col-span-1 h-13 rounded-2xl text-xs font-semibold leading-tight text-muted-foreground hover:text-foreground"
              >
                Pegar s/ Preço
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="col-span-2 h-13 rounded-2xl bg-emerald-600 text-white font-display text-sm font-bold shadow-md hover:bg-emerald-700 active:scale-[0.98] transition-all dark:bg-emerald-500"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Colocando...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Check size={18} strokeWidth={3} />
                    Colocar no Carrinho
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
