import { formatCurrency } from '@utils/formatters';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, MoreVertical, Pencil, Plus, RotateCcw, ShoppingCart, Sparkles, Trash2 } from 'lucide-react';

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
import { cn } from '@/lib/utils';
import type { AppShoppingListSummary } from '@/types';

import { ListFormDialog } from './dialogs/ListFormDialog';
import { formatMonthYearPT, formatMonthYearShort } from './helpers';
import type { ListFormData } from './types';

interface ShoppingListsViewProps {
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

  const cardIcons = [ShoppingCart, Flame, Sparkles] as const;
  const cardIconBgs = [
    'bg-honey-400/10 text-honey-400',
    'bg-terracotta-400/10 text-terracotta-400',
    'bg-sage-500/10 text-sage-500',
  ] as const;

  const activeLists = filteredLists.filter(
    (l) => l.purchasedItems < l.totalItems || l.totalItems === 0
  ).length;
  const totalItems = filteredLists.reduce((s, l) => s + l.totalItems, 0);
  const totalSpent = filteredLists.reduce((s, l) => s + (l.totalSpent ?? 0), 0);

  return (
    <motion.div
      key="lists"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className="max-w-full space-y-8 pb-24"
    >
      {/* Editorial header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1 border-l-4 border-honey-400 pl-7">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-honey-400">
            Lista de Compras
          </p>
          <div className="relative overflow-hidden" style={{ minHeight: '2.5rem' }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.h2
                key={filterMonth}
                initial={{ opacity: 0, x: monthNavDir * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: monthNavDir * -24,
                  position: 'absolute',
                }}
                transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                className="font-display text-3xl font-bold text-foreground"
              >
                {(() => {
                  const s = formatMonthYearPT(filterMonth);
                  return s.charAt(0).toUpperCase() + s.slice(1);
                })()}
              </motion.h2>
            </AnimatePresence>
          </div>
        </div>

        {/* Month nav */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.85 }}
            transition={{ duration: 0.1 }}
            onClick={() => {
              onNavigateMonth(-1);
            }}
            className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft size={16} />
          </motion.button>
          <button
            onClick={() => {
              onResetMonth();
            }}
            className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Hoje
          </button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            transition={{ duration: 0.1 }}
            onClick={() => {
              onNavigateMonth(1);
            }}
            className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>

      {/* Stats summary card */}
      {filteredLists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="flex items-center justify-around gap-4 rounded-2xl border border-border bg-card px-8 py-7"
        >
          <div className="flex-1 space-y-1 text-center">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Gasto no Mês
            </p>
            <p className="font-display text-2xl font-bold text-honey-400 dark:text-honey-300">
              {totalSpent > 0 ? formatCurrency(totalSpent) : '—'}
            </p>
          </div>
          <div className="h-12 w-px shrink-0 bg-border" />
          <div className="flex-1 space-y-1 text-center">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Listas Ativas
            </p>
            <p className="font-display text-2xl font-bold" style={{ color: '#adc6ff' }}>
              {String(activeLists).padStart(2, '0')}
            </p>
          </div>
          <div className="h-12 w-px shrink-0 bg-border" />
          <div className="flex-1 space-y-1 text-center">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Items Totais
            </p>
            <p className="font-display text-2xl font-bold text-foreground">{totalItems}</p>
          </div>
        </motion.div>
      )}

      {/* Bento grid / empty state */}
      {filteredLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-honey-200/60 bg-gradient-to-br from-honey-100 to-linen-200 dark:border-honey-800/30 dark:from-honey-900/30 dark:to-muted">
            <ShoppingCart size={28} className="text-honey-600 dark:text-honey-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Nenhuma lista em {formatMonthYearShort(filterMonth)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Use o botão + para criar uma lista.
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {filteredLists.map((list, idx) => {
            const isComplete = list.isFinished;
            const Icon = cardIcons[idx % 3];
            const iconBg = cardIconBgs[idx % 3];
            return (
              <motion.div
                key={list.shoppingListId}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
                  },
                }}
                className="group relative"
              >
                {/* Card body */}
                <div
                  role="button"
                  tabIndex={0}
                  className="w-full cursor-pointer space-y-4 rounded-3xl border border-border bg-card p-6 text-left transition-all duration-200 hover:border-honey-300 hover:shadow-md dark:hover:border-honey-700"
                  onClick={() => onOpenList(list.shoppingListId)}
                  onKeyDown={(e) => e.key === 'Enter' && onOpenList(list.shoppingListId)}
                >
                  {/* Icon + context menu */}
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                        iconBg
                      )}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button className="peer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg focus-within:flex peer-focus:flex">
                        {isComplete ? (
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnfinishList(list.shoppingListId);
                              onOpenList(list.shoppingListId);
                            }}
                          >
                            <RotateCcw size={13} />
                            Reabrir
                          </button>
                        ) : (
                          <>
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingListId(list.shoppingListId);
                                setShowEditList(true);
                              }}
                            >
                              <Pencil size={13} />
                              Editar
                            </button>
                            <button
                              className="hover:bg-destructive/10 flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-destructive transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingListId(list.shoppingListId);
                                setShowDeleteAlert(true);
                              }}
                            >
                              <Trash2 size={13} />
                              Excluir
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name + status badge */}
                  <div className="space-y-1.5">
                    <p className="font-display text-xl font-bold leading-snug text-foreground">
                      {list.name}
                    </p>
                    {isComplete ? (
                      <span className="inline-block rounded-xl bg-sage-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-sage-500">
                        Finalizada
                      </span>
                    ) : (
                      <span
                        className="inline-block rounded-xl px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ background: 'rgba(173,198,255,0.15)', color: '#adc6ff' }}
                      >
                        Em aberto
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {list.notes && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {list.notes}
                    </p>
                  )}

                  {/* Divider + footer stats */}
                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                        Itens
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {list.totalItems} produtos
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                        Total Est.
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {list.totalEstimated ? formatCurrency(list.totalEstimated) : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Dialogs */}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lista?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os itens serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteListFromGrid} disabled={isDeleting}>
              {isDeleting ? 'Excluindo…' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Action Button */}
      <motion.div
        className="group fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute right-[72px] whitespace-nowrap rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Nova Lista
          </span>
          <button
            className="flex h-16 w-16 items-center justify-center rounded-xl shadow-2xl"
            style={{ backgroundColor: '#adc6ff' }}
            onClick={() => setShowCreateList(true)}
            aria-label="Nova Lista"
          >
            <Plus size={20} style={{ color: '#131313' }} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
