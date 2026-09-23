import { Check, FolderMinus, Plus, Search, Tag, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface CategoryPickerSheetProps {
  open: boolean;
  onClose: () => void;
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  categories: Array<{ shoppingCategoryId: string; name: string }>;
  onCreateCategory?: (name: string) => Promise<void>;
}

export function CategoryPickerSheet({
  open,
  onClose,
  selectedCategoryId,
  onSelectCategory,
  categories,
  onCreateCategory,
}: CategoryPickerSheetProps) {
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const newCatInputRef = useRef<HTMLInputElement | null>(null);

  // Fecha o teclado virtual ativo ao abrir a gaveta de categorias
  useEffect(() => {
    if (open) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setSearch('');
      setIsCreating(false);
      setNewCatName('');
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (isCreating) {
      setTimeout(() => newCatInputRef.current?.focus(), 100);
    }
  }, [isCreating]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [categories]
  );

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sortedCategories;
    return sortedCategories.filter((c) => c.name.toLowerCase().includes(term));
  }, [sortedCategories, search]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed || !onCreateCategory || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onCreateCategory(trimmed);
      // Localiza a categoria criada ou seleciona pelo nome
      const matched = categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
      if (matched) {
        onSelectCategory(matched.shoppingCategoryId);
      }
      setIsCreating(false);
      setNewCatName('');
      onClose();
    } catch {
      // erro tratado no hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="flex max-h-[90dvh] flex-col rounded-t-3xl border-t border-border bg-card p-0 sm:max-w-md sm:mx-auto sm:rounded-3xl sm:border dark:bg-[#181818]"
      >
        <SheetHeader className="border-b border-border/40 px-6 py-4 text-left pr-12">
          <SheetTitle className="text-lg font-bold text-foreground">
            Selecionar Categoria
          </SheetTitle>

          {/* Busca (apenas se houver mais de 5 categorias) */}
          {categories.length > 5 && (
            <div className="relative mt-2">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar categoria..."
                className="h-10 rounded-xl bg-muted/40 pl-9 text-base"
              />
            </div>
          )}
        </SheetHeader>

        {/* Lista de Categorias com rolagem nativa suave */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2">
          {/* Opção: Sem Categoria */}
          <button
            type="button"
            onClick={() => {
              onSelectCategory('');
              onClose();
            }}
            className={cn(
              'flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-colors active:scale-[0.99]',
              !selectedCategoryId
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:bg-accent/40'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl',
                  !selectedCategoryId ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                )}
              >
                <FolderMinus size={16} />
              </div>
              <span>Sem categoria</span>
            </div>
            {!selectedCategoryId && <Check size={18} className="text-primary" />}
          </button>

          {/* Categorias cadastradas */}
          {filteredCategories.map((c) => {
            const isSelected = selectedCategoryId === c.shoppingCategoryId;
            return (
              <button
                key={c.shoppingCategoryId}
                type="button"
                onClick={() => {
                  onSelectCategory(c.shoppingCategoryId);
                  onClose();
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-colors active:scale-[0.99]',
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-accent/40'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl',
                      isSelected ? 'bg-primary/20 text-primary' : 'bg-muted/70 text-muted-foreground'
                    )}
                  >
                    <Tag size={16} />
                  </div>
                  <span>{c.name}</span>
                </div>
                {isSelected && <Check size={18} className="text-primary" />}
              </button>
            );
          })}

          {filteredCategories.length === 0 && search && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma categoria encontrada para &quot;{search}&quot;.
            </div>
          )}
        </div>

        {/* Rodapé: Criar Nova Categoria */}
        {onCreateCategory && (
          <div className="border-t border-border/40 bg-card p-4 pb-6 dark:bg-[#181818]">
            {isCreating ? (
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <Input
                  ref={newCatInputRef}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Nome da categoria..."
                  className="h-11 rounded-xl text-base"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !newCatName.trim()}
                  className="h-11 rounded-xl px-4 font-bold"
                >
                  {isSubmitting ? 'Criando...' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl px-3"
                >
                  <X size={16} />
                </Button>
              </form>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(true)}
                className="h-11 w-full gap-2 rounded-2xl border-dashed font-semibold text-foreground hover:bg-accent"
              >
                <Plus size={16} />
                Nova Categoria
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
