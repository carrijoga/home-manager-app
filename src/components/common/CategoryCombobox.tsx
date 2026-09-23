import { ArrowLeft, Check, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { cn } from '@/lib/utils';
import type { CategoryOptionResponse, CategoryResponse } from '@/schemas/category';
import { TransactionType } from '@/schemas/enums';

export interface CategoryComboboxProps {
  categories: Array<CategoryResponse | CategoryOptionResponse>;
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
  const { showSuccess, showError } = useToastNotifications();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [createName, setCreateName] = useState('');
  const [newType, setNewType] = useState<number>(defaultType);
  const [saving, setSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const createInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setNewType(defaultType);
      setIsCreatingMode(false);
      setCreateName('');
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSearch('');
      setIsCreatingMode(false);
      setCreateName('');
      setSaving(false);
    }
  }, [open, defaultType]);

  useEffect(() => {
    if (isCreatingMode) {
      setTimeout(() => createInputRef.current?.focus(), 0);
    }
  }, [isCreatingMode]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [categories]
  );

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sortedCategories;
    return sortedCategories.filter((c) => c.name.toLowerCase().includes(term));
  }, [sortedCategories, search]);

  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.categoryId === value)?.name ?? null,
    [categories, value]
  );

  const trimmedSearch = search.trim();

  const exactMatchExists = useMemo(() => {
    if (!trimmedSearch) return false;
    return categories.some((c) => c.name.toLowerCase() === trimmedSearch.toLowerCase());
  }, [categories, trimmedSearch]);

  const handleStartCreate = (initialName?: string) => {
    setCreateName(initialName ?? trimmedSearch);
    setIsCreatingMode(true);
  };

  const handleQuickCreate = async (nameToCreate: string) => {
    const finalName = nameToCreate.trim();
    if (!finalName || saving) return;
    setSaving(true);
    try {
      const created = await onCreateCategory({ name: finalName, type: defaultType });
      onChange(created.categoryId);
      setOpen(false);
      showSuccess(`Categoria "${finalName}" criada com sucesso!`);
    } catch {
      showError('Erro ao cadastrar categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteCreate = async () => {
    const finalName = createName.trim();
    if (!finalName || saving) return;
    setSaving(true);
    try {
      const created = await onCreateCategory({ name: finalName, type: newType });
      onChange(created.categoryId);
      setOpen(false);
      showSuccess(`Categoria "${finalName}" criada com sucesso!`);
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
          <span
            className={
              selectedCategoryName ? 'font-medium text-foreground' : 'text-muted-foreground'
            }
          >
            {selectedCategoryName ?? placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        {isCreatingMode ? (
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground">
                <Plus className="h-3.5 w-3.5 text-primary" />
                Nova Categoria
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingMode(false)}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" />
                Voltar
              </button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="combobox-new-cat-name" className="text-xs text-muted-foreground">
                Nome da categoria
              </label>
              <input
                id="combobox-new-cat-name"
                ref={createInputRef}
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Ex: Assinaturas, Pet, etc."
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleExecuteCreate();
                  }
                }}
              />
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs text-muted-foreground">Tipo de lançamento</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewType(TransactionType.Expense)}
                  className={cn(
                    'flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
                    newType === TransactionType.Expense
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/40 text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setNewType(TransactionType.Income)}
                  className={cn(
                    'flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
                    newType === TransactionType.Income
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/40 text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  Receita
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setIsCreatingMode(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1 text-xs"
                disabled={saving || !createName.trim()}
                onClick={() => {
                  void handleExecuteCreate();
                }}
              >
                {saving ? 'Cadastrando…' : 'Salvar'}
              </Button>
            </div>
          </div>
        ) : (
          <Command shouldFilter={false}>
            <CommandInput
              ref={inputRef}
              placeholder="Buscar categoria..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {filteredCategories.length === 0 && !trimmedSearch && (
                <CommandEmpty className="px-3 py-4 text-center text-xs text-muted-foreground">
                  Nenhuma categoria cadastrada.
                </CommandEmpty>
              )}

              {filteredCategories.length === 0 && trimmedSearch && exactMatchExists && (
                <CommandEmpty className="px-3 py-4 text-center text-xs text-muted-foreground">
                  Nenhuma categoria encontrada.
                </CommandEmpty>
              )}

              {filteredCategories.length > 0 && (
                <CommandGroup heading="Categorias">
                  {filteredCategories.map((c) => (
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
                          value === c.categoryId ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {c.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {trimmedSearch && !exactMatchExists && (
                <CommandGroup heading="Ação rápida">
                  <CommandItem
                    value={`create-${trimmedSearch}`}
                    onSelect={() => {
                      void handleQuickCreate(trimmedSearch);
                    }}
                    className="cursor-pointer font-medium text-primary"
                    disabled={saving}
                  >
                    <Plus className="mr-2 h-4 w-4 text-primary" />
                    {saving ? 'Criando…' : `Criar "${trimmedSearch}"`}
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>

            <div className="border-t border-border/40 bg-muted/20 p-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
                disabled={saving}
                onClick={() => {
                  if (trimmedSearch) {
                    void handleQuickCreate(trimmedSearch);
                  } else {
                    handleStartCreate();
                  }
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                {trimmedSearch ? `Criar "${trimmedSearch}"` : 'Nova categoria'}
              </Button>
            </div>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
