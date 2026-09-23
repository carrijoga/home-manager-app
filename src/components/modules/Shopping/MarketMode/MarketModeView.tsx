import { formatCurrency } from '@utils/formatters';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Lightbulb,
  Pencil,
  Plus,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Undo2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useWakeLock } from '@/hooks/useWakeLock';
import { cn } from '@/lib/utils';
import type { AppShoppingItem, AppShoppingList } from '@/types';

import { ItemFormDialog } from '../dialogs/ItemFormDialog';
import {
  getItemEstimatedTotal,
  getItemSpentTotal,
  getQuantityDisplay,
  getSavingsInfo,
  quantityLabel,
} from '../helpers';
import type { ItemFormData, PurchaseFormData } from '../types';
import { MarketFinishModal } from './MarketFinishModal';
import {
  hasCompletedMarketOnboarding,
  MarketOnboardingModal,
} from './MarketOnboardingModal';
import { QuickPurchaseDrawer } from './QuickPurchaseDrawer';

interface MarketModeViewProps {
  detailData: AppShoppingList | null;
  uniqueCategories: Array<{ shoppingCategoryId: string; name: string; isDefault: boolean }>;
  onExit: () => void;
  onMarkAsPurchased: (item: AppShoppingItem, data: PurchaseFormData) => Promise<void>;
  onUnmarkAsPurchased: (item: AppShoppingItem) => Promise<void>;
  onAddItem: (data: ItemFormData) => Promise<void>;
  onEditItem?: (item: AppShoppingItem, data: ItemFormData) => Promise<void>;
  onFinishList: () => Promise<void>;
}

export function MarketModeView({
  detailData,
  uniqueCategories,
  onExit,
  onMarkAsPurchased,
  onUnmarkAsPurchased,
  onAddItem,
  onEditItem,
  onFinishList,
}: MarketModeViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [purchaseItem, setPurchaseItem] = useState<AppShoppingItem | null>(null);
  const [editingItem, setEditingItem] = useState<AppShoppingItem | null>(null);
  const [isSavingPurchase, setIsSavingPurchase] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !hasCompletedMarketOnboarding());
  const [isCartCollapsed, setIsCartCollapsed] = useState(false);

  const { isSupported: wakeLockSupported, isActive: wakeLockActive, toggle: toggleWakeLock } =
    useWakeLock();

  const allItems = useMemo(() => detailData?.items ?? [], [detailData?.items]);

  // Separação entre pendentes e no carrinho
  const pendingItems = useMemo(
    () => allItems.filter((i) => !i.isPurchased && i.status !== 1 && i.status !== 2 && i.status !== 3),
    [allItems]
  );

  const cartItems = useMemo(
    () => allItems.filter((i) => i.isPurchased || i.status === 1),
    [allItems]
  );

  // Totais financeiros
  const totalCount = allItems.length;
  const purchasedCount = cartItems.length;
  const progressPct = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

  const totalEstimated = useMemo(
    () =>
      allItems.reduce(
        (acc, i) => acc + getItemEstimatedTotal(i.estimatedPrice, i.quantity, i.unitType),
        0
      ),
    [allItems]
  );

  const totalSpent = useMemo(
    () =>
      cartItems.reduce((acc, i) => acc + getItemSpentTotal(i), 0),
    [cartItems]
  );

  const cartEstimatedTotal = useMemo(
    () =>
      cartItems.reduce(
        (acc, i) => acc + getItemEstimatedTotal(i.estimatedPrice, i.quantity, i.unitType),
        0
      ),
    [cartItems]
  );

  const balanceDiff = totalSpent - cartEstimatedTotal;
  const hasSavings = balanceDiff < 0;

  // Filtragem por corredor/categoria
  const displayedPendingItems = useMemo(() => {
    if (!selectedCategory) return pendingItems;
    return pendingItems.filter(
      (i) => (i.categoryName || 'Sem Categoria') === selectedCategory
    );
  }, [pendingItems, selectedCategory]);

  const displayedCartItems = useMemo(() => {
    if (!selectedCategory) return cartItems;
    return cartItems.filter(
      (i) => (i.categoryName || 'Sem Categoria') === selectedCategory
    );
  }, [cartItems, selectedCategory]);

  // Contagem por categoria de itens pendentes
  const categoriesWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    pendingItems.forEach((i) => {
      const cat = i.categoryName || 'Sem Categoria';
      map.set(cat, (map.get(cat) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [pendingItems]);

  const handleConfirmPurchase = async (data: {
    quantity: string;
    price: number | null;
    purchasedAt: string;
    unitType?: number;
  }) => {
    if (!purchaseItem) return;
    setIsSavingPurchase(true);
    try {
      // Se a unidade foi alterada no drawer (ex: dz -> pct), atualiza o cadastro do item
      if (
        data.unitType !== undefined &&
        data.unitType !== purchaseItem.unitType &&
        onEditItem
      ) {
        await onEditItem(purchaseItem, {
          name: purchaseItem.name,
          quantity: String(purchaseItem.quantity),
          unitType: String(data.unitType),
          categoryId: purchaseItem.shoppingCategoryId ?? '',
          estimatedPrice: purchaseItem.estimatedPrice ?? null,
          notes: purchaseItem.notes ?? '',
        });
      }

      await onMarkAsPurchased(purchaseItem, {
        quantity: data.quantity,
        price: data.price,
        purchasedAt: data.purchasedAt.split('T')[0],
      });
      setPurchaseItem(null);
    } finally {
      setIsSavingPurchase(false);
    }
  };

  const editItemInitialData = useMemo(() => {
    if (!editingItem) return undefined;
    return {
      name: editingItem.name,
      quantity: String(editingItem.quantity),
      unitType: String(editingItem.unitType),
      categoryId: editingItem.shoppingCategoryId ?? '',
      estimatedPrice: editingItem.estimatedPrice ?? null,
      notes: editingItem.notes ?? '',
    };
  }, [editingItem]);

  return (
    <div className="market-mode-active relative min-h-[calc(100dvh-4rem)] flex flex-col pb-36 animate-in fade-in duration-200 select-none">
      
      {/* ── BARRA SUPERIOR: Modo Mercado + Tela Ativa + Ajuda ───────────── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-3 py-2.5 sm:px-6">
        <div className="flex items-center justify-between gap-1.5 max-w-4xl mx-auto">
          <button
            onClick={onExit}
            className="flex items-center gap-1 rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground shrink-0"
          >
            <ArrowLeft size={13} />
            <span>Sair</span>
          </button>

          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>🛒 Modo Mercado</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {wakeLockSupported && (
              <button
                onClick={toggleWakeLock}
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border transition-all',
                  wakeLockActive
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'border-border/60 bg-card text-muted-foreground hover:bg-muted'
                )}
                title="Mantém a tela do celular sempre acesa no supermercado"
              >
                <Lightbulb size={13} className={wakeLockActive ? 'fill-amber-500 text-amber-500' : ''} />
                <span className="hidden sm:inline">
                  {wakeLockActive ? 'Tela Acesa' : 'Tela Acesa'}
                </span>
              </button>
            )}

            <button
              onClick={() => setShowOnboarding(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-2xs"
              title="Como funciona o Modo Mercado"
              aria-label="Ajuda do Modo Mercado"
            >
              <HelpCircle size={15} />
            </button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddItem(true)}
              className="h-8 rounded-full border-primary/30 bg-primary/5 px-2.5 sm:px-3 text-xs font-bold text-primary hover:bg-primary/10"
            >
              <Plus size={14} className="mr-0.5" />
              <span>Item Extra</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-4 space-y-4">
        
        {/* ── PLACAR HUD FLUTUANTE: Total Gasto e Progresso ───────────────── */}
        <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/70 p-5 shadow-lg relative overflow-hidden dark:bg-[#1C1B19]">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total no Carrinho
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-display text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatCurrency(totalSpent)}
                </span>
                {totalEstimated > 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    de {formatCurrency(totalEstimated)} orçados
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Itens no Carrinho
              </span>
              <div className="font-display text-lg sm:text-xl font-bold text-foreground tabular-nums mt-0.5">
                <span>{purchasedCount}</span>{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  / {totalCount} itens ({progressPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Progresso Tátil */}
          <div className="h-2.5 w-full rounded-full bg-muted/60 p-0.5 border border-border/40 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Rodapé do HUD: Economia em Tempo Real */}
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Sparkles size={13} className="text-primary" />
              <span>Toque em um item para lançar preço e peso</span>
            </span>

            {purchasedCount > 0 && cartEstimatedTotal > 0 && (
              <div>
                {hasSavings ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    <TrendingDown size={13} />
                    Economia de {formatCurrency(Math.abs(balanceDiff))}
                  </span>
                ) : balanceDiff > 0 ? (
                  <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    <TrendingUp size={13} />
                    +{formatCurrency(balanceDiff)} acima
                  </span>
                ) : (
                  <span className="font-semibold text-muted-foreground">Dentro da estimativa</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── CORREDORES / CATEGORIAS FÍSICAS (Filtros em Pílula) ─────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs',
              selectedCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'border border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            Todos ({pendingItems.length})
          </button>

          {categoriesWithCounts.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(name === selectedCategory ? null : name)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5',
                selectedCategory === name
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'border border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{name}</span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums',
                  selectedCategory === name
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── SEÇÃO 1: ITENS PENDENTES (Falta Pegar) ──────────────────────── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span>📋</span>
              <span>Falta Pegar ({displayedPendingItems.length})</span>
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Toque para colocar no carrinho
            </span>
          </div>

          {displayedPendingItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-8 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-sm font-bold text-foreground">
                {selectedCategory
                  ? `Nenhum item pendente no corredor "${selectedCategory}"!`
                  : 'Tudo pronto! Todos os itens foram para o carrinho!'}
              </p>
              <p className="text-xs text-muted-foreground">
                Você pode concluir suas compras no botão abaixo.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayedPendingItems.map((item) => (
                <div
                  key={item.shoppingItemId}
                  onClick={() => setPurchaseItem(item)}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-subtle transition-all duration-150 hover:border-primary/50 hover:bg-muted/30 active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Botão de Checkbox Circular Tátil */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-border/90 bg-background text-transparent transition-all group-hover:border-primary group-hover:text-primary/60 group-hover:bg-primary/5 shadow-2xs">
                      <Check size={16} strokeWidth={3} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm sm:text-base font-bold text-foreground">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate">
                        <span className="font-bold text-primary shrink-0 tabular-nums">
                          {quantityLabel(item.quantity, item.unitType)}
                        </span>
                        {item.categoryName && (
                          <>
                            <span className="text-muted-foreground/40 font-bold">·</span>
                            <span className="truncate">{item.categoryName}</span>
                          </>
                        )}
                        {item.notes && (
                          <>
                            <span className="text-muted-foreground/40 font-bold">·</span>
                            <span className="inline-flex items-center gap-1 italic text-muted-foreground/80 truncate">
                              <FileText size={10} className="shrink-0" />
                              <span className="truncate">{item.notes}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-1">
                    {/* Preço Estimado */}
                    <div className="text-right">
                      <span className="font-display text-sm font-bold text-foreground tabular-nums block">
                        {item.estimatedPrice != null
                          ? formatCurrency(
                              getItemEstimatedTotal(item.estimatedPrice, item.quantity, item.unitType)
                            )
                          : '—'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">previsto</span>
                    </div>

                    {/* Botão Sutil de Edição Rápida */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(item);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
                      title="Editar dados ou unidade do item"
                      aria-label={`Editar ${item.name}`}
                    >
                      <Pencil size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SEÇÃO 2: NO CARRINHO (Já Comprados) ─────────────────────────── */}
        {cartItems.length > 0 && (
          <div className="pt-3 space-y-2">
            <button
              onClick={() => setIsCartCollapsed(!isCartCollapsed)}
              className="w-full flex items-center justify-between py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity"
            >
              <span className="flex items-center gap-1.5">
                <span>✅</span>
                <span>No Carrinho ({displayedCartItems.length})</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                {isCartCollapsed ? (
                  <>
                    <span>Expandir</span> <ChevronDown size={14} />
                  </>
                ) : (
                  <>
                    <span>Ocultar</span> <ChevronUp size={14} />
                  </>
                )}
              </span>
            </button>

            {!isCartCollapsed && (
              <div className="space-y-1.5">
                {displayedCartItems.map((item) => {
                  const savings = getSavingsInfo(item);

                  return (
                    <div
                      key={item.shoppingItemId}
                      onClick={() => onUnmarkAsPurchased(item)}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 sm:p-3.5 transition-all hover:bg-emerald-500/10 cursor-pointer"
                      title="Toque para devolver à lista de pendentes"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                          <Check size={14} strokeWidth={3} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="truncate text-sm font-semibold text-foreground/80 line-through decoration-emerald-500/50 block">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="font-semibold text-foreground/80 tabular-nums">
                              {getQuantityDisplay(item).label} colocado
                            </span>
                            {getQuantityDisplay(item).plannedLabel && (
                              <span className="text-muted-foreground/75 tabular-nums">
                                {getQuantityDisplay(item).plannedLabel}
                              </span>
                            )}
                            <span className="text-muted-foreground/40 font-bold">·</span>
                            <span className="text-muted-foreground/75 flex items-center gap-1">
                              <Undo2 size={10} /> desfazer
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <span className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block">
                          {item.price != null
                            ? formatCurrency(getItemSpentTotal(item))
                            : 'Comprado'}
                        </span>
                        {savings && savings.type === 'savings' && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            -{formatCurrency(savings.diff)}
                          </span>
                        )}
                        {savings && savings.type === 'increase' && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                            +{formatCurrency(savings.diff)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DOCK INFERIOR FLUTUANTE (No Polegar) ─────────────────────────── */}
      <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40">
        <div className="rounded-3xl border border-border/80 bg-card/95 backdrop-blur-md p-3.5 shadow-2xl flex items-center justify-between gap-3 dark:bg-[#1B1A18]/95">
          <div className="flex flex-col pl-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Atual
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                ({purchasedCount} itens)
              </span>
            </div>
          </div>

          <Button
            onClick={() => setShowFinishModal(true)}
            className="h-12 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-display text-sm font-bold shadow-md hover:brightness-105 active:scale-95 transition-all"
          >
            <ShoppingBag size={16} className="mr-1.5" />
            Concluir Compra
          </Button>
        </div>
      </div>

      {/* ── GAVETA TÁTIL DE REGISTRO RÁPIDO DE PREÇO/PESO ────────────────── */}
      <QuickPurchaseDrawer
        open={Boolean(purchaseItem)}
        item={purchaseItem}
        onClose={() => setPurchaseItem(null)}
        onConfirm={handleConfirmPurchase}
        onEditItemFull={(item) => setEditingItem(item)}
        isSaving={isSavingPurchase}
      />

      {/* ── MODAL DE FINALIZAÇÃO DA COMPRA ──────────────────────────────── */}
      <MarketFinishModal
        open={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onFinishList={onFinishList}
        listName={detailData?.name ?? 'Lista de Compras'}
        totalSpent={totalSpent}
        totalEstimated={totalEstimated}
        purchasedCount={purchasedCount}
        totalCount={totalCount}
      />

      {/* ── MODAL DE ONBOARDING GUIADO (Primeira Vez ou Ajuda) ──────────── */}
      <MarketOnboardingModal
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* ── DIALOG PARA ADICIONAR ITEM EXTRA NÃO PLANEJADO ──────────────── */}
      <ItemFormDialog
        open={showAddItem}
        onClose={() => setShowAddItem(false)}
        title="Adicionar Item Extra no Mercado"
        categories={uniqueCategories}
        onSubmit={async (data) => {
          await onAddItem(data);
          setShowAddItem(false);
        }}
      />

      {/* ── DIALOG PARA EDIÇÃO DE ITEM EXISTENTE ────────────────────────── */}
      <ItemFormDialog
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Editar Item"
        initialData={editItemInitialData}
        categories={uniqueCategories}
        onSubmit={async (data) => {
          if (editingItem && onEditItem) {
            await onEditItem(editingItem, data);
          }
          setEditingItem(null);
        }}
      />

    </div>
  );
}
