import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Plus,
  Search,
  Tag,
  Upload,
} from 'lucide-react';
import React from 'react';

import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface DetailFilterBarProps {
  isBulkMode: boolean;
  selectedCount: number;
  sortOrder: 'name' | 'count' | 'purchased';
  setSortOrder: (v: 'name' | 'count' | 'purchased') => void;
  categoryFilter: string | null;
  setCategoryFilter: (v: string | null) => void;
  categoriesInDetail: string[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  isSearchPending: boolean;
  isFinished: boolean;
  isUploading: boolean;
  detailDataLoaded: boolean;
  categoryScrollRef: React.RefObject<HTMLDivElement | null>;
  onExitBulkMode: () => void;
  onShowCategories: () => void;
  onUploadClick: () => void;
  onEnterBulkMode: () => void;
  onAddItem: () => void;
  onScrollCategories: (dir: 'left' | 'right') => void;
  onCategoryPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onCategoryPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onCategoryPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function DetailFilterBar(props: DetailFilterBarProps) {
  const {
    isBulkMode,
    selectedCount,
    sortOrder,
    setSortOrder,
    categoryFilter,
    setCategoryFilter,
    categoriesInDetail,
    searchTerm,
    setSearchTerm,
    isSearchPending,
    isFinished,
    isUploading,
    detailDataLoaded,
    categoryScrollRef,
    onExitBulkMode,
    onShowCategories,
    onUploadClick,
    onEnterBulkMode,
    onAddItem,
    onScrollCategories,
    onCategoryPointerDown,
    onCategoryPointerMove,
    onCategoryPointerUp,
  } = props;

  return (
    <div className="space-y-3">
      {/* ── Sort + action toolbar ─────────────────────────────────────────────── */}
      {isBulkMode ? (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 shadow-sm">
          <span className="text-sm font-bold text-primary">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selecionado{selectedCount !== 1 ? 's' : ''}
          </span>
          <button
            className="ml-auto rounded-xl border border-border/80 bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
            onClick={onExitBulkMode}
          >
            Cancelar Seleção
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Status filter pills */}
          <div className="scrollbar-hide flex gap-1.5 overflow-x-auto pb-0.5">
            {(
              [
                { label: 'Todos', value: null },
                { label: 'Pendentes', value: '__unpurchased__' },
                { label: 'No Carrinho', value: '__purchased__' },
                { label: 'Ignorados', value: '__ignored__' },
              ] as { label: string; value: string | null }[]
            ).map(({ label, value }) => {
              const isActive = categoryFilter === value;
              return (
                <button
                  key={label}
                  onClick={() =>
                    setCategoryFilter(value !== null && categoryFilter === value ? null : value)
                  }
                  className={cn(
                    'shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border border-border/70 bg-card text-muted-foreground hover:bg-accent hover:text-foreground dark:bg-[#181818]'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Action buttons (Categorias, Importar, Selecionar, + Adicionar) */}
          <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
            <button
              className="flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground dark:bg-[#181818]"
              onClick={onShowCategories}
              title="Gerenciar categorias da lista"
            >
              <Tag size={13} />
              <span className="hidden sm:inline">Categorias</span>
            </button>
            <button
              className="flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50 dark:bg-[#181818]"
              onClick={onUploadClick}
              disabled={!detailDataLoaded || isUploading || isFinished}
              title="Importar lista via planilha"
            >
              <Upload size={13} />
              <span className="hidden sm:inline">{isUploading ? 'Importando...' : 'Importar'}</span>
            </button>
            <button
              className="flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50 dark:bg-[#181818]"
              onClick={onEnterBulkMode}
              disabled={!detailDataLoaded || isFinished}
              title="Selecionar múltiplos itens para edição"
            >
              <ListChecks size={13} />
              <span className="hidden sm:inline">Selecionar</span>
            </button>

            {/* BOTÃO ADICIONAR ITEM - ALTO CONTRASTE, VISÍVEL E DESTACADO */}
            <button
              className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              onClick={onAddItem}
              disabled={!detailDataLoaded || isFinished}
              title="Adicionar novo item com todos os detalhes"
            >
              <Plus size={15} strokeWidth={3} />
              <span>Adicionar</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Search + Category filter pills ───────────────────────────────────────── */}
      {!isBulkMode && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar produtos na lista..."
              className="h-10 rounded-xl bg-card pl-9 pr-8 text-sm dark:bg-[#181818]"
            />
            {isSearchPending && (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner size="sm" className="text-muted-foreground" />
              </span>
            )}
          </div>

          {/* Sort pills */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <ArrowUpDown size={12} className="text-muted-foreground shrink-0" />
            <span className="text-[11px] font-semibold text-muted-foreground">Ordem:</span>
            {(
              [
                { value: 'name', label: 'Nome' },
                { value: 'count', label: 'Qtd.' },
                { value: 'purchased', label: 'Status' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSortOrder(value)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                  sortOrder === value
                    ? 'bg-muted font-bold text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category filter horizontal scroll */}
      {!isBulkMode && categoriesInDetail.length > 0 && (
        <div className="flex items-center gap-1.5">
          <button
            className="hidden rounded-lg border border-border p-1 text-muted-foreground transition-colors hover:bg-accent md:flex"
            onClick={() => onScrollCategories('left')}
            aria-label="Categorias anteriores"
          >
            <ChevronLeft size={14} />
          </button>
          <div
            ref={categoryScrollRef}
            className="scrollbar-hide flex flex-1 touch-pan-x snap-x flex-nowrap gap-1.5 overflow-x-auto scroll-smooth whitespace-nowrap py-0.5"
            onPointerDown={onCategoryPointerDown}
            onPointerMove={onCategoryPointerMove}
            onPointerUp={onCategoryPointerUp}
            onPointerLeave={onCategoryPointerUp}
          >
            {categoriesInDetail.map((cat) => {
              const isSelected = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(isSelected ? null : cat)}
                  className={cn(
                    'shrink-0 rounded-xl px-3 py-1 text-xs font-medium transition-colors',
                    isSelected
                      ? 'bg-primary/15 font-bold text-primary border border-primary/30'
                      : 'border border-border/70 bg-card/60 text-muted-foreground hover:bg-accent hover:text-foreground dark:bg-[#181818]'
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <button
            className="hidden rounded-lg border border-border p-1 text-muted-foreground transition-colors hover:bg-accent md:flex"
            onClick={() => onScrollCategories('right')}
            aria-label="Próximas categorias"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
