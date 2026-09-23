import { Plus, SlidersHorizontal, Sparkles } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import { suggestCategoryForItem } from './smartCategory';
import type { ItemFormData } from './types';

interface QuickAddItemBarProps {
  onAddItem: (data: ItemFormData) => Promise<void>;
  onOpenDetailedForm: (initialName?: string) => void;
  categories: Array<{ shoppingCategoryId: string; name: string }>;
  disabled?: boolean;
}

export function QuickAddItemBar({
  onAddItem,
  onOpenDetailedForm,
  categories,
  disabled = false,
}: QuickAddItemBarProps) {
  const [name, setName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const suggestedCategoryId = useMemo(() => {
    return suggestCategoryForItem(name, categories);
  }, [name, categories]);

  const suggestedCategory = useMemo(() => {
    if (!suggestedCategoryId) return null;
    return categories.find((c) => c.shoppingCategoryId === suggestedCategoryId);
  }, [suggestedCategoryId, categories]);

  const handleQuickAdd = async (itemName: string) => {
    const trimmed = itemName.trim();
    if (!trimmed || isAdding || disabled) return;

    setIsAdding(true);
    const catId = suggestCategoryForItem(trimmed, categories) ?? '';

    try {
      await onAddItem({
        name: trimmed,
        quantity: '1',
        unitType: '0',
        categoryId: catId,
        estimatedPrice: null,
        notes: '',
      });
      setName('');
      inputRef.current?.focus();
    } catch {
      // erro capturado no hook com toast
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuickAdd(name);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'relative flex items-center rounded-2xl border bg-card p-1.5 shadow-subtle transition-all duration-200',
        isFocused
          ? 'border-primary ring-2 ring-primary/20 shadow-card'
          : 'border-border/70 hover:border-border'
      )}
    >
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Adicionar produto rápido (ex: Café em grãos, Leite integral...)"
        disabled={disabled || isAdding}
        maxLength={120}
        className="flex-1 bg-transparent px-3 py-2 text-sm md:text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
      />

      {/* Badge de auto-sugestão de categoria */}
      {suggestedCategory && (
        <span className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-bold text-primary mr-1.5 animate-in fade-in zoom-in-95">
          <Sparkles size={11} />
          {suggestedCategory.name}
        </span>
      )}

      <div className="flex items-center gap-1">
        {/* Botão de abrir modal com mais detalhes (preço, notas, etc) */}
        <button
          type="button"
          onClick={() => onOpenDetailedForm(name)}
          disabled={disabled || isAdding}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-50"
          title="Adicionar com detalhes (unidade, valor estimado, observações)"
          aria-label="Abrir formulário detalhado"
        >
          <SlidersHorizontal size={15} />
        </button>

        {/* Botão de Adicionar Rápido */}
        <button
          type="submit"
          disabled={disabled || isAdding || !name.trim()}
          className={cn(
            'flex h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 font-bold transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none',
            name.trim()
              ? 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90'
              : 'bg-muted text-muted-foreground'
          )}
          title="Adicionar item agora"
          aria-label="Adicionar item"
        >
          {isAdding ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Plus size={15} strokeWidth={3} />
              <span className="text-xs font-bold">Adicionar</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
