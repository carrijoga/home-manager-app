import { ArrowUpDown, ChevronLeft, ChevronRight, ListChecks, Plus, Tag, Upload } from 'lucide-react';
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
    <>
      {/* ── Sort + action toolbar ─────────────────────────────────────────────── */}
      {isBulkMode ? (
        <div className="flex items-center gap-3 rounded-xl border border-[rgba(120,160,255,0.2)] bg-[rgba(120,160,255,0.07)] px-4 py-2.5">
          <span className="text-sm font-semibold text-[#7ba0ff]">
            {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
          </span>
          <button
            className="ml-auto rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={onExitBulkMode}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="border-border/50 flex flex-col gap-2 border-b pb-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          {/* Sort pills */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ArrowUpDown size={12} className="shrink-0 text-muted-foreground" />
            <span className="hidden text-xs font-medium uppercase tracking-widest text-muted-foreground sm:inline">
              Ordenar por
            </span>
            {(
              [
                { value: 'name', label: 'Nome' },
                { value: 'count', label: 'Qtd.' },
                { value: 'purchased', label: 'Pendentes' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSortOrder(value)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors sm:px-4 sm:py-1.5 sm:text-xs',
                  sortOrder === value
                    ? 'border-[rgba(216,226,255,0.3)] bg-[rgba(216,226,255,0.2)] text-[#adc6ff]'
                    : 'border-border/40 bg-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              className="flex items-center gap-1 rounded-full border border-[#adc6ff]/50 px-2.5 py-1 text-[10px] font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50 sm:gap-1.5 sm:px-4 sm:py-1.5 sm:text-xs"
              onClick={onShowCategories}
            >
              <Tag size={11} />
              Categorias
            </button>
            <button
              className="flex items-center gap-1 rounded-full border border-[#adc6ff]/50 px-2.5 py-1 text-[10px] font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50 sm:gap-1.5 sm:px-4 sm:py-1.5 sm:text-xs"
              onClick={onUploadClick}
              disabled={!detailDataLoaded || isUploading || isFinished}
            >
              <Upload size={11} />
              {isUploading ? 'Importando...' : 'Importar'}
            </button>
            <button
              className="flex items-center gap-1 rounded-full border border-[#adc6ff]/50 px-2.5 py-1 text-[10px] font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50 sm:gap-1.5 sm:px-4 sm:py-1.5 sm:text-xs"
              onClick={onEnterBulkMode}
              disabled={!detailDataLoaded || isFinished}
            >
              <ListChecks size={11} />
              Selecionar
            </button>
            <button
              className="flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold transition-colors disabled:opacity-50 sm:gap-1.5 sm:px-5 sm:py-1.5 sm:text-xs"
              style={{
                background: 'rgba(173,198,255,0.26)',
                border: '1px solid #adc6ff',
                color: '#e5e2e1',
              }}
              onClick={onAddItem}
              disabled={!detailDataLoaded || isFinished}
            >
              <Plus size={11} />
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* ── Status filter pills ───────────────────────────────────────────────── */}
      {!isBulkMode && (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto">
          {(
            [
              { label: 'Todos', value: null },
              { label: 'Não Comprados', value: '__unpurchased__' },
              { label: 'Comprados', value: '__purchased__' },
            ] as { label: string; value: string | null }[]
          ).map(({ label, value }) => (
            <button
              key={label}
              onClick={() =>
                setCategoryFilter(value !== null && categoryFilter === value ? null : value)
              }
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors',
                categoryFilter === value
                  ? 'border-[rgba(216,226,255,0.3)] bg-[rgba(216,226,255,0.2)] text-[#adc6ff]'
                  : 'border-border/40 bg-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Category filter pills ─────────────────────────────────────────────── */}
      {!isBulkMode && categoriesInDetail.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            className="hidden rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex"
            onClick={() => onScrollCategories('left')}
            aria-label="Categorias anteriores"
          >
            <ChevronLeft size={14} />
          </button>
          <div
            ref={categoryScrollRef}
            className="scrollbar-hide flex flex-1 touch-pan-x snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto scroll-smooth whitespace-nowrap"
            onPointerDown={onCategoryPointerDown}
            onPointerMove={onCategoryPointerMove}
            onPointerUp={onCategoryPointerUp}
            onPointerLeave={onCategoryPointerUp}
          >
            {categoriesInDetail.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors',
                  categoryFilter === cat
                    ? 'border-[rgba(216,226,255,0.3)] bg-[rgba(216,226,255,0.2)] text-[#adc6ff]'
                    : 'border-border/40 bg-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            className="hidden rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex"
            onClick={() => onScrollCategories('right')}
            aria-label="Próximas categorias"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Search input */}
      {!isBulkMode && (
        <div className="relative flex items-center">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar itens..."
            className="rounded-xl pr-8"
          />
          {isSearchPending && (
            <span className="pointer-events-none absolute right-2 flex items-center">
              <Spinner size="sm" className="text-muted-foreground" />
            </span>
          )}
        </div>
      )}
    </>
  );
}
