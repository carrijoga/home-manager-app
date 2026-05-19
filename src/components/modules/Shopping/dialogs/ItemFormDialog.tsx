import MoneyInput from '@components/common/MoneyInput';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { UNIT_TYPE_FULL_LABELS } from '@/schemas/enums';

import { emptyItemForm } from '../helpers';
import type { ItemFormData } from '../types';

interface ItemFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: ItemFormData;
  onSubmit: (data: ItemFormData) => Promise<void>;
  title: string;
  categories: Array<{ shoppingCategoryId: string; name: string }>;
}

export function ItemFormDialog({
  open,
  onClose,
  initialData,
  onSubmit,
  title,
  categories,
}: ItemFormDialogProps) {
  const [data, setData] = useState<ItemFormData>(initialData ?? emptyItemForm());
  const [saving, setSaving] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryInputRef = useRef<HTMLInputElement | null>(null);
  const [unitOpen, setUnitOpen] = useState(false);
  const [unitSearch, setUnitSearch] = useState('');
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
      setData(initialData ?? emptyItemForm());
      setSaving(false);
      setCategoryOpen(false);
      setCategorySearch('');
      setUnitOpen(false);
      setUnitSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [categories]
  );

  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.shoppingCategoryId === data.categoryId)?.name ?? null,
    [categories, data.categoryId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim()) return;
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
        className="rounded-t-2xl border-t border-border bg-card px-6 pb-8 pt-6 dark:bg-[#1e1e1e]"
      >
        <SheetHeader className="mb-4 text-left">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="item-name">Item *</Label>
            <Input
              id="item-name"
              placeholder="Ex: Arroz"
              value={data.name}
              onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
              required
              autoFocus
              maxLength={150}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="item-qty">Quantidade *</Label>
              <Input
                id="item-qty"
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
                    <span className="text-foreground">
                      {UNIT_TYPE_FULL_LABELS[Number(data.unitType)] ?? 'Unidade — un'}
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
                              setData((d) => ({ ...d, unitType: val }));
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
                    {selectedCategoryName ?? 'Sem categoria'}
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
                        value="__none__"
                        onSelect={() => {
                          setData((d) => ({ ...d, categoryId: '' }));
                          setCategoryOpen(false);
                        }}
                      >
                        Sem categoria
                      </CommandItem>
                      {sortedCategories.map((c) => (
                        <CommandItem
                          key={c.shoppingCategoryId}
                          value={c.name}
                          onSelect={() => {
                            setData((d) => ({ ...d, categoryId: c.shoppingCategoryId }));
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
            <Label htmlFor="item-price">Preço estimado (R$)</Label>
            <MoneyInput
              id="item-price"
              value={data.estimatedPrice}
              onChange={(v) => setData((d) => ({ ...d, estimatedPrice: v }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-notes">Observações</Label>
            <Input
              id="item-notes"
              placeholder="Opcional..."
              value={data.notes}
              onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
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
            <Button type="submit" className="flex-1" disabled={saving || !data.name.trim()}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
