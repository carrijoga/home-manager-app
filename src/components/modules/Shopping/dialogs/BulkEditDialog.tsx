import MoneyInput from '@components/common/MoneyInput';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { UNIT_TYPE_FULL_LABELS } from '@/schemas/enums';
import type { AppShoppingItem } from '@/types';

import type { BulkEditPatch } from '../types';

interface BulkEditDialogProps {
  open: boolean;
  onClose: () => void;
  selectedItems: AppShoppingItem[];
  categories: Array<{ shoppingCategoryId: string; name: string }>;
  onSubmit: (patch: BulkEditPatch) => Promise<void>;
}

export function BulkEditDialog({
  open,
  onClose,
  selectedItems,
  categories,
  onSubmit,
}: BulkEditDialogProps) {
  const [quantity, setQuantity] = useState('');
  const [unitType, setUnitType] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [unitOpen, setUnitOpen] = useState(false);
  const [unitSearch, setUnitSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement | null>(null);
  const unitInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (categoryOpen) {
      setTimeout(() => categoryInputRef.current?.focus(), 0);
    } else {
      setCategorySearch('');
    }
  }, [categoryOpen]);

  useEffect(() => {
    if (unitOpen) {
      setTimeout(() => unitInputRef.current?.focus(), 0);
    } else {
      setUnitSearch('');
    }
  }, [unitOpen]);

  useEffect(() => {
    if (open) {
      setQuantity('');
      setUnitType('');
      setCategoryId('');
      setEstimatedPrice(null);
      setCategoryOpen(false);
      setCategorySearch('');
      setUnitOpen(false);
      setUnitSearch('');
      setSaving(false);
    }
  }, [open]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [categories]
  );

  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.shoppingCategoryId === categoryId)?.name ?? null,
    [categories, categoryId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-t border-border bg-card px-6 pb-8 pt-6 dark:bg-[#1e1e1e]"
      >
        <SheetHeader className="mb-4 text-left">
          <SheetTitle>
            Editar {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'}
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Apenas os campos preenchidos serão alterados.
          </p>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bulk-qty">Quantidade</Label>
              <Input
                id="bulk-qty"
                type="number"
                min="0.001"
                step="any"
                placeholder="Ex: 2"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unidade</Label>
              <Popover open={unitOpen} onOpenChange={setUnitOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                    onKeyDown={(e) => {
                      if (!unitOpen && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
                        setUnitSearch(e.key);
                        setUnitOpen(true);
                      }
                    }}
                  >
                    <span className={unitType ? 'text-foreground' : 'text-muted-foreground'}>
                      {unitType ? UNIT_TYPE_FULL_LABELS[Number(unitType)] : '— sem alteração —'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput
                      ref={unitInputRef}
                      placeholder="Buscar unidade..."
                      value={unitSearch}
                      onValueChange={setUnitSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
                      <CommandGroup>
                        {Object.entries(UNIT_TYPE_FULL_LABELS).map(([val, lbl]) => (
                          <CommandItem
                            key={val}
                            value={lbl}
                            onSelect={() => {
                              setUnitType(val);
                              setUnitOpen(false);
                            }}
                          >
                            {lbl}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                  onKeyDown={(e) => {
                    if (!categoryOpen && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
                      setCategorySearch(e.key);
                      setCategoryOpen(true);
                    }
                  }}
                >
                  <span
                    className={selectedCategoryName ? 'text-foreground' : 'text-muted-foreground'}
                  >
                    {categoryId === '__clear__'
                      ? 'Remover categoria'
                      : (selectedCategoryName ?? '— sem alteração —')}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput
                    ref={categoryInputRef}
                    placeholder="Buscar categoria..."
                    value={categorySearch}
                    onValueChange={setCategorySearch}
                  />
                  <CommandList>
                    <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="__clear__"
                        onSelect={() => {
                          setCategoryId('__clear__');
                          setCategoryOpen(false);
                        }}
                      >
                        Remover categoria
                      </CommandItem>
                      {sortedCategories.map((c) => (
                        <CommandItem
                          key={c.shoppingCategoryId}
                          value={c.name}
                          onSelect={() => {
                            setCategoryId(c.shoppingCategoryId);
                            setCategoryOpen(false);
                          }}
                        >
                          {c.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bulk-price">Preço estimado (R$)</Label>
            <MoneyInput
              id="bulk-price"
              value={estimatedPrice}
              onChange={(v) => setEstimatedPrice(v)}
            />
          </div>

          <div className="space-y-1 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Itens afetados
            </p>
            {previewNames.map((name) => (
              <p key={name} className="flex items-center gap-1.5 text-xs text-foreground">
                <span className="text-primary">•</span>
                {name}
              </p>
            ))}
            {overflow > 0 && (
              <p className="text-xs italic text-muted-foreground">
                e mais +{overflow} {overflow === 1 ? 'item' : 'itens'}
              </p>
            )}
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
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
