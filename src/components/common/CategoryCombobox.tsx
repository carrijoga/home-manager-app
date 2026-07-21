import { Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { cn } from '@/lib/utils';
import type { CategoryResponse } from '@/schemas/category';
import { TransactionType } from '@/schemas/enums';

export interface CategoryComboboxProps {
  categories: CategoryResponse[];
  value: string;
  onChange: (categoryId: string) => void;
  defaultType: number;
  onCreateCategory: (payload: { name: string; type: number }) => Promise<CategoryResponse>;
  placeholder?: string;
}

export function CategoryCombobox({
  categories,
  value,
  onChange,
  defaultType,
  onCreateCategory,
  placeholder = 'Selecionar…',
}: CategoryComboboxProps) {
  const { showError } = useToastNotifications();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newType, setNewType] = useState<number>(defaultType);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setNewType(defaultType);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSearch('');
      setSaving(false);
    }
  }, [open, defaultType]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [categories],
  );

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sortedCategories;
    return sortedCategories.filter(c => c.name.toLowerCase().includes(term));
  }, [sortedCategories, search]);

  const selectedCategoryName = useMemo(
    () => categories.find(c => c.categoryId === value)?.name ?? null,
    [categories, value],
  );

  const trimmedSearch = search.trim();

  const handleCreate = async () => {
    if (!trimmedSearch || saving) return;
    setSaving(true);
    try {
      const created = await onCreateCategory({ name: trimmedSearch, type: newType });
      onChange(created.categoryId);
      setOpen(false);
    } catch {
      showError('Erro ao cadastrar categoria.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          <span className={selectedCategoryName ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedCategoryName ?? placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            placeholder="Buscar categoria..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filteredCategories.length === 0 ? (
              <CommandEmpty className="px-3 py-3 text-left space-y-3">
                <p className="text-sm text-muted-foreground">Nenhuma categoria encontrada.</p>
                {trimmedSearch && (
                  <div className="space-y-2 border-t border-border/40 pt-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Cadastrar &quot;{trimmedSearch}&quot; como
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewType(TransactionType.Expense)}
                        className={cn(
                          'flex-1 rounded-md border px-2 py-1.5 text-sm transition-colors',
                          newType === TransactionType.Expense
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border/40 text-muted-foreground',
                        )}
                      >
                        Despesa
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewType(TransactionType.Income)}
                        className={cn(
                          'flex-1 rounded-md border px-2 py-1.5 text-sm transition-colors',
                          newType === TransactionType.Income
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border/40 text-muted-foreground',
                        )}
                      >
                        Receita
                      </button>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      disabled={saving}
                      onClick={() => { void handleCreate(); }}
                    >
                      {saving ? 'Cadastrando…' : 'Cadastrar categoria'}
                    </Button>
                  </div>
                )}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredCategories.map(c => (
                  <CommandItem
                    key={c.categoryId}
                    value={c.name}
                    onSelect={() => {
                      onChange(c.categoryId);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === c.categoryId ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {c.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
