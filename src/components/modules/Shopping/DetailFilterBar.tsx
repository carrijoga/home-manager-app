import { motion } from 'framer-motion';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Search,
  Tag,
  Upload,
  X,
} from 'lucide-react';
import React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import type { SectionOption } from './grouping';

interface DetailFilterBarProps {
  isBulkMode: boolean;
  selectedCount: number;
  sortOrder: 'name' | 'count' | 'purchased';
  setSortOrder: (v: 'name' | 'count' | 'purchased') => void;
  categoryFilter: string | null;
  setCategoryFilter: (v: string | null) => void;
  sectionOptions: SectionOption[];
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

const STATUS_FILTERS = [
  { label: 'Todos', value: null },
  { label: 'Pendentes', value: '__unpurchased__' },
  { label: 'No Carrinho', value: '__purchased__' },
  { label: 'Ignorados', value: '__ignored__' },
] as const;

const SORT_OPTIONS = [
  { value: 'name', label: 'Nome' },
  { value: 'count', label: 'Quantidade' },
  { value: 'purchased', label: 'Status' },
] as const;

export function DetailFilterBar(props: DetailFilterBarProps) {
  const {
    isBulkMode,
    selectedCount,
    sortOrder,
    setSortOrder,
    categoryFilter,
    setCategoryFilter,
    sectionOptions,
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
    onScrollCategories,
    onCategoryPointerDown,
    onCategoryPointerMove,
    onCategoryPointerUp,
  } = props;

  /* ── Barra de Modo de Seleção em Massa ── */
  if (isBulkMode) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 shadow-subtle animate-in fade-in">
        <span className="text-sm font-bold text-primary">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selecionado{selectedCount !== 1 ? 's' : ''}
        </span>
        <button
          type="button"
          onClick={onExitBulkMode}
          className="rounded-xl border border-border/70 bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-subtle transition-colors hover:bg-muted active:scale-95"
        >
          Cancelar Seleção
        </button>
      </div>
    );
  }

  const isStatusFilterActive =
    categoryFilter === '__unpurchased__' ||
    categoryFilter === '__purchased__' ||
    categoryFilter === '__ignored__';

  const isCategoryFilterActive = categoryFilter !== null && !isStatusFilterActive;

  return (
    <div className="space-y-2.5">
      {/* ── Nível 1: Busca + Segmented Control de Status ─────────────────── */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar produtos nesta lista..."
            className="h-10 rounded-2xl border-border/70 bg-card pl-10 pr-8 text-sm shadow-subtle focus-visible:ring-primary/20"
          />
          {searchTerm && !isSearchPending && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X size={14} />
            </button>
          )}
          {isSearchPending && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" className="text-muted-foreground" />
            </span>
          )}
        </div>

        {/* Segmented Control de Status com Pill Deslizante */}
        <div className="scrollbar-hide flex gap-1 rounded-2xl bg-muted/50 p-1 overflow-x-auto shrink-0">
          {STATUS_FILTERS.map(({ label, value }) => {
            const isActive =
              value === null
                ? categoryFilter === null || isCategoryFilterActive
                : categoryFilter === value;

            return (
              <button
                key={label}
                type="button"
                onClick={() => setCategoryFilter(value)}
                className={cn(
                  'relative rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors duration-150 active:scale-95 whitespace-nowrap select-none',
                  isActive
                    ? 'text-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="detail-status-pill"
                    className="absolute inset-0 rounded-xl bg-card shadow-xs dark:bg-[#252525]"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 32,
                      mass: 0.8,
                    }}
                    style={{ zIndex: 0 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Nível 2: Carrossel de Categorias + Ações Secundárias ──────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        {/* Chips de Categorias em Scroll Horizontal */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {sectionOptions.length > 0 && (
            <>
              <button
                type="button"
                className="hidden rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted md:flex shrink-0"
                onClick={() => onScrollCategories('left')}
                aria-label="Categorias anteriores"
              >
                <ChevronLeft size={15} />
              </button>

              <div
                ref={categoryScrollRef}
                className="scrollbar-hide flex flex-1 touch-pan-x snap-x flex-nowrap gap-1.5 overflow-x-auto scroll-smooth whitespace-nowrap py-0.5"
                onPointerDown={onCategoryPointerDown}
                onPointerMove={onCategoryPointerMove}
                onPointerUp={onCategoryPointerUp}
                onPointerLeave={onCategoryPointerUp}
              >
                {/* Chip Todas as Categorias */}
                <button
                  type="button"
                  onClick={() => {
                    if (isCategoryFilterActive) setCategoryFilter(null);
                  }}
                  className={cn(
                    'shrink-0 rounded-xl px-3 py-1 text-xs font-semibold transition-all active:scale-95',
                    !isCategoryFilterActive
                      ? 'bg-primary/10 text-primary border border-primary/25 font-bold'
                      : 'border border-border/60 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  Todas
                </button>

                {sectionOptions.map((opt) => {
                  const isSelected = categoryFilter === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setCategoryFilter(isSelected ? null : opt.key)}
                      className={cn(
                        'shrink-0 rounded-xl px-3 py-1 text-xs font-semibold transition-all active:scale-95',
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                          : 'border border-border/60 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {opt.icon ? `${opt.icon} ` : ''}
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="hidden rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted md:flex shrink-0"
                onClick={() => onScrollCategories('right')}
                aria-label="Próximas categorias"
              >
                <ChevronRight size={15} />
              </button>
            </>
          )}
        </div>

        {/* Ações Rápidas da Toolbar: Ordenação, Categorias, Importar, Selecionar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Menu de Ordenação */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-8 items-center gap-1 rounded-xl border border-border/70 bg-card px-2.5 text-xs font-semibold text-muted-foreground shadow-subtle transition-colors hover:bg-muted hover:text-foreground"
                title="Ordenar itens"
              >
                <ArrowUpDown size={12} />
                <span className="hidden sm:inline">
                  {SORT_OPTIONS.find((s) => s.value === sortOrder)?.label ?? 'Ordem'}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setSortOrder(opt.value)}
                  className={cn(
                    'text-xs font-medium',
                    sortOrder === opt.value && 'font-bold text-primary'
                  )}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Gerenciar Categorias */}
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-xl border border-border/70 bg-card px-2.5 text-xs font-semibold text-muted-foreground shadow-subtle transition-colors hover:bg-muted hover:text-foreground"
            onClick={onShowCategories}
            title="Gerenciar categorias da lista"
          >
            <Tag size={12} />
            <span className="hidden sm:inline">Categorias</span>
          </button>

          {/* Importar Planilha */}
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-xl border border-border/70 bg-card px-2.5 text-xs font-semibold text-muted-foreground shadow-subtle transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            onClick={onUploadClick}
            disabled={!detailDataLoaded || isUploading || isFinished}
            title="Importar produtos via CSV / TXT"
          >
            <Upload size={12} />
            <span className="hidden sm:inline">{isUploading ? 'Importando...' : 'Importar'}</span>
          </button>

          {/* Seleção em Massa */}
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-xl border border-border/70 bg-card px-2.5 text-xs font-semibold text-muted-foreground shadow-subtle transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            onClick={onEnterBulkMode}
            disabled={!detailDataLoaded || isFinished}
            title="Selecionar múltiplos itens"
          >
            <ListChecks size={12} />
            <span className="hidden sm:inline">Selecionar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
