import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Plus, ShoppingBag } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import * as shoppingService from '@/services/shoppingService';
import type { AppShoppingCategory, AppShoppingItem, AppShoppingListSummary } from '@/types';

export interface DashboardPantryShoppingV2Props {
  nestId?: string;
  className?: string;
  onOpenFullList?: () => void;
}

function getItemEmoji(name: string, categoryName?: string | null): string {
  const lower = `${name} ${categoryName ?? ''}`.toLowerCase();
  if (lower.includes('café') || lower.includes('cafe')) return '☕';
  if (lower.includes('leite') || lower.includes('queijo') || lower.includes('iogurte')) return '🥛';
  if (lower.includes('pão') || lower.includes('pao') || lower.includes('torrada')) return '🍞';
  if (lower.includes('maçã') || lower.includes('maca') || lower.includes('fruta') || lower.includes('banana')) return '🍎';
  if (lower.includes('carne') || lower.includes('frango') || lower.includes('peixe')) return '🥩';
  if (lower.includes('arroz') || lower.includes('feijão') || lower.includes('feijao') || lower.includes('massa')) return '🌾';
  if (lower.includes('sabão') || lower.includes('detergente') || lower.includes('limpeza') || lower.includes('amaciante')) return '🧼';
  if (lower.includes('suco') || lower.includes('água') || lower.includes('refrigerante')) return '🧃';
  return '🛒';
}

const ITEM_COLOR_THEMES = [
  {
    bg: 'bg-[#f7d9cc]/75 dark:bg-[#3d1c14]/40',
    border: 'border-[#f3c2ad] dark:border-[#6a3324]/50',
    text: 'text-[#5e2617] dark:text-[#f8a892]',
  },
  {
    bg: 'bg-[#dcf0fb]/75 dark:bg-[#152e3d]/40',
    border: 'border-[#b8e1f7] dark:border-[#214b63]/50',
    text: 'text-[#134563] dark:text-[#93d2f6]',
  },
  {
    bg: 'bg-[#ddf0dc]/75 dark:bg-[#1b331a]/40',
    border: 'border-[#bce4bb] dark:border-[#2d562b]/50',
    text: 'text-[#1c4d1b] dark:text-[#a0db9e]',
  },
  {
    bg: 'bg-[#fbf1dc]/75 dark:bg-[#3b2d12]/40',
    border: 'border-[#f3dfb2] dark:border-[#634919]/50',
    text: 'text-[#5c420f] dark:text-[#f0cb75]',
  },
];

export function DashboardPantryShoppingV2({
  nestId,
  className,
  onOpenFullList,
}: DashboardPantryShoppingV2Props) {
  const navigate = useNavigate();

  const [activeListSummary, setActiveListSummary] = useState<AppShoppingListSummary | null>(null);
  const [items, setItems] = useState<AppShoppingItem[]>([]);
  const [categories, setCategories] = useState<AppShoppingCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quickInput, setQuickInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mês atual formatado
  const currentMonthName = useMemo(() => {
    const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date());
    return month.charAt(0).toUpperCase() + month.slice(1);
  }, []);

  // Carregar lista e itens
  const loadShoppingData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [lists, cats] = await Promise.all([
        shoppingService.getShoppingLists(undefined, nestId).catch(() => []),
        shoppingService.getShoppingCategories(nestId).catch(() => []),
      ]);

      setCategories(cats);

      // Priorizar lista ativa / não finalizada
      const active = lists.find((l) => !l.finished) || lists[0] || null;
      setActiveListSummary(active);

      if (active) {
        const detail = await shoppingService
          .getShoppingListById(active.shoppingListId, nestId)
          .catch(() => null);
        if (detail?.items) {
          setItems(detail.items.filter((i) => !i.isPurchased));
        }
      } else {
        setItems([]);
      }
    } catch {
      // Silencioso em fallback
    } finally {
      setIsLoading(false);
    }
  }, [nestId]);

  useEffect(() => {
    loadShoppingData();
  }, [loadShoppingData]);

  // Filtragem por categoria selecionada
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return items.slice(0, 6);
    return items
      .filter((i) => {
        if (!i.categoryName) return false;
        return (
          i.categoryName.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          i.shoppingCategoryId === selectedCategory
        );
      })
      .slice(0, 6);
  }, [items, selectedCategory]);

  // Adicionar item rápido
  const handleQuickAddItem = async () => {
    const trimmed = quickInput.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let targetListId = activeListSummary?.shoppingListId;

      // Se não existir lista ainda, cria a lista do mês atual
      if (!targetListId) {
        const now = new Date();
        const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const createdList = await shoppingService.createShoppingList(
          {
            name: `Compras de ${currentMonthName}`,
            monthYear,
          },
          nestId
        );
        targetListId = createdList.shoppingListId;
        setActiveListSummary({
          shoppingListId: createdList.shoppingListId,
          name: createdList.name,
          monthYear: createdList.monthYear,
          totalItems: 0,
          purchasedItems: 0,
          finished: false,
          isFinished: false,
        });
      }

      const newItem = await shoppingService.addShoppingItem(
        {
          shoppingListId: targetListId,
          name: trimmed,
          quantity: 1,
          unitType: 0,
        },
        nestId
      );

      setItems((prev) => [newItem, ...prev]);
      setQuickInput('');
      toast.success('Item adicionado à lista de compras!');
    } catch {
      toast.error('Erro ao adicionar item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickAddItem();
    }
  };

  // Remover item
  const handleDeleteItem = async (itemId: string) => {
    try {
      await shoppingService.deleteShoppingItem(itemId, nestId);
      setItems((prev) => prev.filter((i) => i.shoppingItemId !== itemId));
      toast.success('Item removido.');
    } catch {
      toast.error('Erro ao remover item.');
    }
  };

  return (
    <div
      className={cn(
        'relative flex h-full flex-col justify-between rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-card',
        className
      )}
    >
      <div>
        {/* Header do Bloco */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50/80 p-1 dark:bg-rose-950/30">
              <img
                src="/icons/clay-optimized/shopping_basket.webp"
                alt="Lista de Compras"
                className="size-full object-contain"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))' }}
                loading="lazy"
              />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-foreground">
                Lista de Compras
              </h3>
              <p className="font-ui text-xs text-muted-foreground">
                Reposição e despensa do lar
              </p>
            </div>
          </div>

          <span className="font-ui text-xs font-bold bg-[#fde9df] text-[#8c3f2b] dark:bg-rose-950/50 dark:text-[#f8a892] px-2.5 py-1 rounded-full shrink-0 tabular-nums">
            {items.length === 1 ? '1 item' : `${items.length} itens`}
          </span>
        </div>

        {/* Badges de Seleção da Lista do Mês / Categorias */}
        <div className="flex flex-wrap gap-1.5 pt-3 pb-3">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'font-ui text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all shadow-2xs cursor-pointer',
              selectedCategory === 'all'
                ? 'bg-foreground text-background font-extrabold shadow-sm'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {activeListSummary?.name || `${currentMonthName} (Ativa)`}
          </button>

          {categories.slice(0, 4).map((cat) => {
            const isSelected = selectedCategory === cat.name || selectedCategory === cat.shoppingCategoryId;
            return (
              <button
                key={cat.shoppingCategoryId}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                className={cn(
                  'font-ui text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all shadow-2xs cursor-pointer',
                  isSelected
                    ? 'bg-primary text-primary-foreground font-extrabold shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Lista de Itens */}
        {isLoading ? (
          <div className="space-y-2 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-2xl bg-muted/40"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 mb-2">
              <ShoppingBag size={20} />
            </div>
            <p className="font-ui text-sm font-semibold text-foreground">
              Despensa completa por enquanto!
            </p>
            <p className="font-ui text-xs text-muted-foreground mt-0.5 max-w-xs">
              Adicione itens que estão acabando na cozinha ou área de serviço.
            </p>
          </div>
        ) : (
          <div className="space-y-2 pt-0.5">
            <AnimatePresence>
              {filteredItems.map((item, index) => {
                const theme = ITEM_COLOR_THEMES[index % ITEM_COLOR_THEMES.length];
                const emoji = getItemEmoji(item.name, item.categoryName);

                return (
                  <motion.div
                    key={item.shoppingItemId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'group flex items-center justify-between gap-2.5 rounded-2xl border p-2.5 sm:p-3 transition-all duration-150',
                      theme.bg,
                      theme.border,
                      theme.text
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <span className="text-base shrink-0" aria-hidden="true">
                        {emoji}
                      </span>
                      <span className="font-ui text-xs font-bold truncate">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-background/90 dark:bg-card/90 px-2.5 py-0.5 rounded-xl text-xs font-extrabold shadow-2xs shrink-0 text-foreground">
                      <span className="tabular-nums">
                        {item.quantity} {item.unitType === 1 ? 'kg' : item.unitType === 2 ? 'g' : 'un'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.shoppingItemId)}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-0.5 size-4 flex items-center justify-center rounded-sm"
                        title="Remover item da lista"
                        aria-label="Remover item"
                      >
                        &times;
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input de Adição Rápida e Rodapé */}
      <div>
        <div className="pt-3.5 border-t border-dashed border-border/70 mt-4">
          <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-muted/30 px-3.5 py-1.5 focus-within:border-primary focus-within:bg-card transition-all">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="+ O que acabou em casa? (Enter)"
              className="w-full bg-transparent text-xs font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={handleQuickAddItem}
              disabled={!quickInput.trim() || isSubmitting}
              className="flex size-6 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-200 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              title="Adicionar à lista"
              aria-label="Adicionar item"
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Rodapé com link para lista completa */}
        <div className="pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{items.length} na despensa</span>
          <button
            type="button"
            onClick={() => {
              if (onOpenFullList) onOpenFullList();
              else navigate('/shopping');
            }}
            className="font-ui inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            <span>Ver lista completa</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
