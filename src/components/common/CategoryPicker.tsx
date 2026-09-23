import { Check, ChevronsUpDown, Plus, Settings2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCategories } from '@/hooks/useCategories';
import { CATEGORY_EMOJIS, CATEGORY_NAME_MAX, findCategory, formatCategoryLabel, nextPaletteColor } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { CategoryScope } from '@/schemas/category';

export interface CategoryPickerProps {
  scope: CategoryScope;
  value: string | null;
  onChange: (categoryId: string | null) => void;
  allowCreate?: boolean;
  allowClear?: boolean;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

const SCOPE_QUERY: Record<CategoryScope, string> = {
  [CategoryScope.Expense]: 'expense',
  [CategoryScope.Income]: 'income',
  [CategoryScope.Shopping]: 'shopping',
  [CategoryScope.Task]: 'task',
};

export function CategoryPicker({
  scope,
  value,
  onChange,
  allowCreate = true,
  allowClear = false,
  placeholder = 'Selecione uma categoria',
  disabled,
  id,
}: CategoryPickerProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { tree, loading, error, reload, create } = useCategories(scope);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);

  const selected = useMemo(() => findCategory(tree, value), [tree, value]);
  const trimmed = search.trim();
  const exactMatch = useMemo(() => {
    const q = trimmed.toLowerCase();
    return tree.some((r) => r.name.toLowerCase() === q || r.children.some((c) => c.name.toLowerCase() === q));
  }, [tree, trimmed]);

  const select = (categoryId: string | null) => {
    onChange(categoryId);
    setOpen(false);
    setSearch('');
  };

  const handleCreate = async () => {
    if (!trimmed || trimmed.length > CATEGORY_NAME_MAX || creating) return;
    setCreating(true);
    try {
      const newId = await create({
        parentCategoryId: null,
        name: trimmed,
        icon: CATEGORY_EMOJIS[scope][0],
        color: nextPaletteColor(tree.map((r) => r.color)),
      });
      toast.success(`Categoria “${trimmed}” criada.`);
      select(newId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar a categoria.');
    } finally {
      setCreating(false);
    }
  };

  const goManage = () => {
    setOpen(false);
    navigate(`/settings/categories?scope=${SCOPE_QUERY[scope]}`);
  };

  const list = (
    <Command shouldFilter>
      <CommandInput placeholder="Buscar categoria…" value={search} onValueChange={setSearch} />
      <CommandList className="max-h-[320px]">
        {loading && <div className="py-6 text-center text-sm text-muted-foreground">Carregando…</div>}
        {!loading && error != null && (
          <div className="flex flex-col items-center gap-2 py-6 text-sm text-muted-foreground">
            Não foi possível carregar as categorias.
            <Button size="sm" variant="outline" onClick={() => reload().catch(() => {})}>
              Tentar novamente
            </Button>
          </div>
        )}
        {!loading && error == null && <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>}
        {allowClear && value && (
          <CommandGroup>
            <CommandItem value="__clear__" onSelect={() => select(null)}>
              <X className="mr-2 size-4 opacity-60" /> Sem categoria
            </CommandItem>
          </CommandGroup>
        )}
        {tree.map((root) => (
          <CommandGroup key={root.categoryId}>
            <CommandItem value={`${root.name} ${root.categoryId}`} onSelect={() => select(root.categoryId)}>
              <span className="mr-2 inline-block size-2 shrink-0 rounded-full" style={{ backgroundColor: root.color }} />
              <span className="mr-1.5">{root.icon}</span>
              <span className="truncate font-medium">{root.name}</span>
              <Check className={cn('ml-auto size-4', value === root.categoryId ? 'opacity-100' : 'opacity-0')} />
            </CommandItem>
            {root.children.map((child) => (
              <CommandItem
                key={child.categoryId}
                value={`${root.name} ${child.name} ${child.categoryId}`}
                onSelect={() => select(child.categoryId)}
                className="pl-8"
              >
                <span className="mr-1.5">{child.icon}</span>
                <span className="truncate">{child.name}</span>
                <Check className={cn('ml-auto size-4', value === child.categoryId ? 'opacity-100' : 'opacity-0')} />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        {allowCreate && trimmed && !exactMatch && !loading && (
          <CommandGroup>
            <CommandItem value={`__create__ ${trimmed}`} onSelect={handleCreate} disabled={creating}>
              <Plus className="mr-2 size-4" /> Criar “{trimmed}”
            </CommandItem>
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup>
          <CommandItem value="__manage__" onSelect={goManage}>
            <Settings2 className="mr-2 size-4 opacity-60" /> Gerenciar categorias
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );

  const trigger = (
    <Button
      id={id}
      type="button"
      variant="outline"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      onClick={() => setOpen(true)}
      className="w-full justify-between font-normal"
    >
      {selected ? (
        <span className="flex min-w-0 items-center gap-2">
          <span
            className="inline-block size-2 shrink-0 rounded-full"
            style={{ backgroundColor: selected.category.color }}
          />
          <span className="truncate">{formatCategoryLabel(selected.category, selected.parent)}</span>
        </span>
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
    </Button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl p-0">
            <SheetHeader className="px-4 pt-4">
              <SheetTitle>Categoria</SheetTitle>
            </SheetHeader>
            <div className="p-2">{list}</div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[260px] p-0" align="start">
        {list}
      </PopoverContent>
    </Popover>
  );
}
