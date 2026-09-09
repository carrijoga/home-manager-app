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

const COMMON_SUGGESTIONS = [
  { name: 'Leite', icon: '🥛' },
  { name: 'Pão', icon: '🍞' },
  { name: 'Café', icon: '☕' },
  { name: 'Ovos', icon: '🥚' },
  { name: 'Arroz', icon: '🍚' },
  { name: 'Banana', icon: '🍌' },
  { name: 'Detergente', icon: '🧼' },
  { name: 'Papel Higiênico', icon: '🧻' },
  { name: 'Manteiga', icon: '🧈' },
  { name: 'Carne', icon: '🥩' },
];

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
      // erro já capturado no hook com toast
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuickAdd(name);
  };

  return (
    <div className="space-y-2">
      <form
        onSubmit={handleSubmit}
        className={cn(
          'relative flex items-center rounded-2xl border bg-card p-1.5 shadow-sm transition-all duration-200 dark:bg-[#181818]',
          isFocused
            ? 'border-primary ring-2 ring-primary/20 shadow-md'
            : 'border-border/80 hover:border-border'
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Adicionar produto rápido (ex: Leite, Maçã...)"
          disabled={disabled || isAdding}
          maxLength={120}
          className="flex-1 bg-transparent px-3 py-2 text-sm md:text-base font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-50"
        />

        {/* Badge de auto-sugestão de categoria */}
        {suggestedCategory && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mr-1.5 animate-in fade-in zoom-in-95">
            <Sparkles size={11} />
            {suggestedCategory.name}
          </span>
        )}

        <div className="flex items-center gap-1">
          {/* Botão de abrir modal com mais detalhes */}
          <button
            type="button"
            onClick={() => onOpenDetailedForm(name)}
            disabled={disabled || isAdding}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95 disabled:opacity-50"
            title="Mais detalhes (preço, quantidade, categoria, notas)"
            aria-label="Abrir formulário detalhado"
          >
            <SlidersHorizontal size={16} />
          </button>

          {/* Botão de Adicionar Rápido (Alto Contraste) */}
          <button
            type="submit"
            disabled={disabled || isAdding || !name.trim()}
            className={cn(
              'flex h-9 min-w-[38px] items-center justify-center gap-1 rounded-xl px-3 font-bold transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none',
              name.trim()
                ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                : 'bg-muted text-muted-foreground'
            )}
            title="Adicionar item agora"
            aria-label="Adicionar item"
          >
            {isAdding ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Plus size={16} strokeWidth={3} />
                <span className="hidden text-xs sm:inline">Adicionar</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Sugestões rápidas de itens comuns com ícones amigáveis */}
      {!name && (
        <div className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto py-0.5 whitespace-nowrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 pr-1">
            Sugestões:
          </span>
          {COMMON_SUGGESTIONS.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => handleQuickAdd(item.name)}
              disabled={disabled || isAdding}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-accent active:scale-95 dark:bg-[#181818]"
            >
              <span className="text-xs">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
