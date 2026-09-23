import { formatCurrency } from '@utils/formatters';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import {
  AnimatedCurrency,
  AnimatedNumber,
  AnimatedPercent,
  SpringProgress,
} from '@/components/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { AppShoppingListSummary } from '@/types';

import { ListFormDialog } from './dialogs/ListFormDialog';
import { formatMonthYearPT, formatMonthYearShort } from './helpers';
import type { ListFormData } from './types';

interface ShoppingListsViewProps {
  isLoading?: boolean;
  filteredLists: AppShoppingListSummary[];
  filterMonth: string;
  monthNavDir: 1 | -1;
  showCreateList: boolean;
  setShowCreateList: (v: boolean) => void;
  showEditList: boolean;
  setShowEditList: (v: boolean) => void;
  showDeleteAlert: boolean;
  setShowDeleteAlert: (v: boolean) => void;
  editingListId: string | null;
  setEditingListId: (id: string | null) => void;
  editingListSummaryData: ListFormData | undefined;
  isDeleting: boolean;
  onNavigateMonth: (dir: 1 | -1) => void;
  onResetMonth: () => void;
  onOpenList: (id: string) => void;
  onCreateList: (data: ListFormData) => Promise<void>;
  onEditListFromGrid: (data: ListFormData) => Promise<void>;
  onDeleteListFromGrid: () => Promise<void>;
  onUnfinishList: (id: string) => Promise<void>;
}

export function ShoppingListsView(props: ShoppingListsViewProps) {
  const {
    isLoading = false,
    filteredLists,
    filterMonth,
    monthNavDir,
    showCreateList,
    setShowCreateList,
    showEditList,
    setShowEditList,
    showDeleteAlert,
    setShowDeleteAlert,
    editingListId,
    setEditingListId,
    editingListSummaryData,
    isDeleting,
    onNavigateMonth,
    onResetMonth,
    onOpenList,
    onCreateList,
    onEditListFromGrid,
    onDeleteListFromGrid,
    onUnfinishList,
  } = props;

  // Filtro de status mobile: 'all' | 'active' | 'completed'
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  const activeLists = filteredLists.filter(
    (l) => !(l.finished ?? l.isFinished)
  );
  const completedLists = filteredLists.filter(
    (l) => (l.finished ?? l.isFinished)
  );

  const displayedLists =
    statusFilter === 'active'
      ? activeLists
      : statusFilter === 'completed'
        ? completedLists
        : filteredLists;

  const totalItems = filteredLists.reduce((s, l) => s + l.totalItems, 0);
  const totalPurchasedItems = filteredLists.reduce((s, l) => s + l.purchasedItems, 0);
  const totalSpent = filteredLists.reduce((s, l) => s + (l.totalSpent ?? 0), 0);
  const overallProgress = totalItems > 0 ? Math.round((totalPurchasedItems / totalItems) * 100) : 0;

  return (
    <motion.div
      key="lists"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="max-w-5xl mx-auto space-y-6 pb-28 px-1 sm:px-4"
    >
      {/* ── App Bar / Header Mobile ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <ShoppingCart size={14} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Módulo de Compras
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Minhas Listas
          </h1>
        </div>

        {/* Seletor de Mês Compacto e Touch-Friendly */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 rounded-xl border border-border/70 bg-card p-1 shadow-subtle">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => onNavigateMonth(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Mês anterior"
          >
            <ChevronLeft size={18} />
          </motion.button>

          <div className="relative min-w-[130px] text-center overflow-hidden px-1">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={filterMonth}
                initial={{ opacity: 0, x: monthNavDir * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: monthNavDir * -16, position: 'absolute' }}
                transition={{ duration: 0.2 }}
                className="text-xs sm:text-sm font-semibold capitalize text-foreground"
              >
                {formatMonthYearPT(filterMonth)}
              </motion.span>
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => onNavigateMonth(1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Próximo mês"
          >
            <ChevronRight size={18} />
          </motion.button>

          <button
            onClick={onResetMonth}
            className="ml-1 rounded-lg bg-muted/70 px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Hoje
          </button>
        </div>
      </div>

      {/* ── Hero Summary Card ───────────────────────────────────────── */}
      {filteredLists.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-card">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Gasto Total no Mês
                </span>
                <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  {totalSpent > 0 ? formatCurrency(totalSpent) : 'R$ 0,00'}
                </p>
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Listas Ativas
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary tabular-nums">
                    <Clock size={12} />
                    {activeLists.length}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Concluídas
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 tabular-nums">
                    <CheckCircle2 size={12} />
                    {completedLists.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Progresso Geral de Compras */}
            {totalItems > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="font-medium">Progresso de itens comprados</span>
                  <span className="font-bold text-foreground">
                    {totalPurchasedItems} de {totalItems} ({overallProgress}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Abas de Status / Segmented Control Mobile ────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex gap-1 rounded-2xl bg-muted/50 p-1">
          {[
            { id: 'all' as const, label: 'Todas', count: filteredLists.length },
            { id: 'active' as const, label: 'Em Aberto', count: activeLists.length },
            { id: 'completed' as const, label: 'Concluídas', count: completedLists.length },
          ].map(({ id, label, count }) => {
            const isActive = statusFilter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStatusFilter(id)}
                className={cn(
                  'relative rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors duration-150 active:scale-95 select-none',
                  isActive
                    ? 'text-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="shopping-lists-status-filter"
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
                <span className="relative z-10 flex items-center gap-1">
                  <span>{label}</span>
                  <span className="opacity-75 font-normal">
                    (<AnimatedNumber value={count} animateOnMount={false} />)
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Botão de Nova Lista Inline para desktop/tablet */}
        <Button
          onClick={() => setShowCreateList(true)}
          className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl font-bold"
        >
          <Plus size={16} strokeWidth={3} />
          Nova Lista
        </Button>
      </div>

      {/* ── Grid / Lista de Cards ──────────────────────────────────────────── */}
      {isLoading ? (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-live="polite"
          aria-label="Carregando listas de compras"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-subtle min-h-[160px] space-y-4"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-3.5 w-1/2 rounded-md" />
              </div>
              <div className="space-y-2 pt-2 border-t border-border/40">
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-dashed border-border/80 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShoppingCart size={28} />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-foreground">
              {filteredLists.length === 0
                ? `Nenhuma lista em ${formatMonthYearShort(filterMonth)}`
                : 'Nenhuma lista com este status'}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {filteredLists.length === 0
                ? 'Crie uma nova lista de supermercado ou despensa para começar.'
                : 'Alterne as abas acima para visualizar outras listas.'}
            </p>
          </div>
          <Button
            onClick={() => setShowCreateList(true)}
            className="h-11 rounded-2xl px-5 font-bold shadow-sm"
          >
            <Plus size={16} strokeWidth={3} className="mr-1.5" />
            Criar Nova Lista
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedLists.map((list) => {
            const isComplete = Boolean(list.finished ?? list.isFinished);
            const listPct =
              list.totalItems > 0 ? Math.round((list.purchasedItems / list.totalItems) * 100) : 0;

            return (
              <motion.div
                key={list.shoppingListId}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-subtle transition-all duration-200 hover:border-border/90 hover:shadow-card"
                onClick={() => onOpenList(list.shoppingListId)}
              >
                {/* Top Row: Icon + Badge + Menu */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <CheckCircle2 size={12} strokeWidth={2} />
                        Finalizada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                        <Clock size={12} />
                        Em aberto
                      </span>
                    )}
                  </div>

                  {/* Context Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="Ações da lista"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      {isComplete ? (
                        <DropdownMenuItem
                          className="gap-2 text-primary font-medium"
                          onClick={() => {
                            onUnfinishList(list.shoppingListId);
                            onOpenList(list.shoppingListId);
                          }}
                        >
                          <RotateCcw size={14} />
                          Reabrir Lista
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => {
                              setEditingListId(list.shoppingListId);
                              setShowEditList(true);
                            }}
                          >
                            <Pencil size={14} />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => {
                              setEditingListId(list.shoppingListId);
                              setShowDeleteAlert(true);
                            }}
                          >
                            <Trash2 size={14} />
                            Excluir
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* List Name */}
                <div className="mt-3 space-y-1">
                  <h3 className="font-display text-lg font-bold leading-tight text-foreground line-clamp-1">
                    {list.name}
                  </h3>
                  {list.notes && (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      {list.notes}
                    </p>
                  )}
                </div>

                {/* Progress Bar inside Card */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">
                      <AnimatedNumber value={list.purchasedItems} /> de{' '}
                      <AnimatedNumber value={list.totalItems} /> itens
                    </span>
                    <AnimatedPercent value={listPct} className="font-bold text-foreground" />
                  </div>
                  <SpringProgress
                    value={listPct}
                    variant={isComplete ? 'sage' : 'primary'}
                    className="h-2 bg-muted/60"
                  />
                </div>

                {/* Card Footer: Estimated vs Spent */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/50 pt-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Estimado
                    </span>
                    <p className="font-semibold text-foreground">
                      {list.totalEstimated ? (
                        <AnimatedCurrency value={list.totalEstimated} />
                      ) : (
                        '—'
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Gasto Real
                    </span>
                    <p
                      className={cn(
                        'font-bold',
                        list.totalSpent ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                      )}
                    >
                      {list.totalSpent ? (
                        <AnimatedCurrency value={list.totalSpent} />
                      ) : (
                        '—'
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}
      <ListFormDialog
        open={showCreateList}
        onClose={() => setShowCreateList(false)}
        onSubmit={onCreateList}
        title="Nova Lista de Compras"
      />
      <ListFormDialog
        open={showEditList && !!editingListId}
        onClose={() => {
          setShowEditList(false);
          setEditingListId(null);
        }}
        onSubmit={onEditListFromGrid}
        initialData={editingListSummaryData}
        title="Editar Lista"
      />
      <AlertDialog
        open={showDeleteAlert && !!editingListId}
        onOpenChange={(o) => {
          if (!o) {
            setShowDeleteAlert(false);
            setEditingListId(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lista?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá a lista e todos os itens dela. Não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteListFromGrid}
              disabled={isDeleting}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── FAB Mobile Principal (Alto Contraste, Seguro contra Safe Area) ───── */}
      <motion.div
        className="fixed bottom-6 right-6 z-40 sm:hidden pb-[env(safe-area-inset-bottom)]"
        whileTap={{ scale: 0.92 }}
      >
        <button
          onClick={() => setShowCreateList(true)}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl transition-transform"
          aria-label="Criar nova lista"
        >
          <Plus size={26} strokeWidth={3} />
        </button>
      </motion.div>
    </motion.div>
  );
}
