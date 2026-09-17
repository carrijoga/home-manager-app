import { motion } from 'framer-motion';
import { ArrowUpDown, ChevronLeft, ChevronRight, ListChecks, Search, X } from 'lucide-react';
import React, { useRef } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { ApiCategory } from '@/types';
import { TASK_CATEGORY_LABELS } from './constants';

export type TaskStatusFilter = 'all' | 'pending' | 'in_progress' | 'overdue' | 'completed_today';
export type TaskSortOrder = 'dueDate' | 'priority' | 'title';

interface TaskFilterBarProps {
  isBulkMode: boolean;
  selectedCount: number;
  sortOrder: TaskSortOrder;
  setSortOrder: (v: TaskSortOrder) => void;
  statusFilter: TaskStatusFilter;
  setStatusFilter: (v: TaskStatusFilter) => void;
  categoryFilter: ApiCategory | null;
  setCategoryFilter: (v: ApiCategory | null) => void;
  categoriesInView: ApiCategory[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  isSearchPending: boolean;
  onExitBulkMode: () => void;
  onEnterBulkMode: () => void;
}

const STATUS_FILTERS: { label: string; value: TaskStatusFilter }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Em Andamento', value: 'in_progress' },
  { label: 'Atrasadas', value: 'overdue' },
];

const SORT_OPTIONS: { value: TaskSortOrder; label: string }[] = [
  { value: 'dueDate', label: 'Vencimento' },
  { value: 'priority', label: 'Prioridade' },
  { value: 'title', label: 'Nome' },
];

export function TaskFilterBar(props: TaskFilterBarProps) {
  const {
    isBulkMode,
    selectedCount,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    categoriesInView,
    searchTerm,
    setSearchTerm,
    isSearchPending,
    onExitBulkMode,
    onEnterBulkMode,
  } = props;

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onScrollCategories = (dir: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const amount = dir === 'left' ? -200 : 200;
      categoryScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const onCategoryPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (categoryScrollRef.current?.offsetLeft || 0);
    scrollLeft.current = categoryScrollRef.current?.scrollLeft || 0;
  };

  const onCategoryPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - (categoryScrollRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  const onCategoryPointerUp = () => {
    isDragging.current = false;
  };

  if (isBulkMode) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 shadow-subtle animate-in fade-in">
        <span className="text-sm font-bold text-primary">
          {selectedCount} tarefa{selectedCount !== 1 ? 's' : ''} selecionada{selectedCount !== 1 ? 's' : ''}
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

  return (
    <div className="space-y-2.5">
      {/* ── Nível 1: Busca + Segmented Control de Status ─────────────────── */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar tarefas..."
            className="h-10 rounded-2xl border-border/70 bg-card pl-10 pr-8 text-sm shadow-subtle focus-visible:ring-primary/20"
          />
          {searchTerm && !isSearchPending && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

        <div className="scrollbar-hide flex gap-1 rounded-2xl bg-muted/50 p-1 overflow-x-auto shrink-0">
          {STATUS_FILTERS.map(({ label, value }) => {
            const isActive = statusFilter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={cn(
                  'relative rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors duration-150 active:scale-95 whitespace-nowrap select-none',
                  isActive ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="tasks-status-pill"
                    className="absolute inset-0 rounded-xl bg-card shadow-xs dark:bg-[#252525]"
                    transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }}
                    style={{ zIndex: 0 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Nível 2: Carrossel de Categorias + Ordenação + Bulk ──────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <button
            type="button"
            className="hidden rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted md:flex shrink-0"
            onClick={() => onScrollCategories('left')}
          >
            <ChevronLeft size={15} />
          </button>

          <div
            ref={categoryScrollRef}
            className="scrollbar-hide flex flex-1 touch-pan-x snap-x flex-nowrap gap-1.5 overflow-x-auto scroll-smooth whitespace-nowrap py-0.5 cursor-grab active:cursor-grabbing"
            onPointerDown={onCategoryPointerDown}
            onPointerMove={onCategoryPointerMove}
            onPointerUp={onCategoryPointerUp}
            onPointerLeave={onCategoryPointerUp}
          >
            <button
              type="button"
              onClick={() => setCategoryFilter(null)}
              className={cn(
                'shrink-0 rounded-xl px-3 py-1 text-xs font-semibold transition-all active:scale-95',
                categoryFilter === null
                  ? 'bg-primary/10 text-primary border border-primary/25 font-bold'
                  : 'border border-border/60 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              Todas
            </button>
            {categoriesInView.map((cat) => {
              const isSelected = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(isSelected ? null : cat)}
                  className={cn(
                    'shrink-0 rounded-xl px-3 py-1 text-xs font-semibold transition-all active:scale-95',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                      : 'border border-border/60 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {TASK_CATEGORY_LABELS[cat] || 'Geral'}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="hidden rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted md:flex shrink-0"
            onClick={() => onScrollCategories('right')}
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 items-center gap-1 rounded-xl border border-border/70 bg-card px-2.5 text-xs font-semibold text-muted-foreground shadow-subtle transition-colors hover:bg-muted hover:text-foreground">
                <ArrowUpDown size={12} />
                <span className="hidden sm:inline">
                  {SORT_OPTIONS.find((s) => s.value === sortOrder)?.label}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setSortOrder(opt.value)}
                  className={cn('text-xs font-medium', sortOrder === opt.value && 'font-bold text-primary')}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-xl border border-border/70 bg-card px-2.5 text-xs font-semibold text-muted-foreground shadow-subtle transition-colors hover:bg-muted hover:text-foreground"
            onClick={onEnterBulkMode}
          >
            <ListChecks size={12} />
            <span className="hidden sm:inline">Selecionar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
