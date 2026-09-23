import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MoreVertical,
  Pencil,
  Share2,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

import {
  AnimatedCurrency,
  AnimatedNumber,
  AnimatedPercent,
} from '@/components/common/AnimatedNumber';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SpringProgress } from '@/components/ui/spring-progress';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { cn } from '@/lib/utils';
import { UNIT_TYPE_LABELS } from '@/schemas/enums';
import type { AppShoppingList } from '@/types';

import { getQuantityDisplay } from './helpers';

interface DetailHeaderProps {
  detailData: AppShoppingList | null;
  totalEstimated: number;
  totalSpent: number;
  remaining: number;
  onBack: () => void;
  onEditList?: () => void;
  onDeleteList?: () => void;
  onStartMarketMode?: () => void;
}

export function DetailHeader(props: DetailHeaderProps) {
  const {
    detailData,
    totalEstimated,
    totalSpent,
    remaining,
    onBack,
    onEditList,
    onDeleteList,
    onStartMarketMode,
  } = props;
  const { showSuccess } = useToastNotifications();

  const totalItems = detailData?.items.length ?? 0;
  const purchasedItems =
    detailData?.items.filter((i) => i.status === 1 || i.isPurchased).length ?? 0;
  const pct = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;
  const isComplete = Boolean(detailData?.finished);
  const pendingCount = Math.max(0, totalItems - purchasedItems);

  const handleShareList = () => {
    if (!detailData) return;

    const unpurchased = detailData.items.filter((i) => i.status !== 1 && !i.isPurchased);
    const purchased = detailData.items.filter((i) => i.status === 1 || i.isPurchased);

    let text = `🛒 *Lista de Compras: ${detailData.name}*\n\n`;

    if (unpurchased.length > 0) {
      text += `*Pendentes (${unpurchased.length}):*\n`;
      unpurchased.forEach((i) => {
        const u = UNIT_TYPE_LABELS[i.unitType] ?? 'un';
        text += `▫ ${i.name} — ${i.quantity} ${u}\n`;
      });
      text += '\n';
    }

    if (purchased.length > 0) {
      text += `*Comprados (${purchased.length}):*\n`;
      purchased.forEach((i) => {
        text += `✅ ${i.name} — ${getQuantityDisplay(i).label}\n`;
      });
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showSuccess('Lista copiada! Pronta para colar no WhatsApp.');
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Barra Superior: Navegação e Ações da Lista ────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground shadow-subtle transition-colors hover:bg-muted active:bg-muted/80"
            title="Voltar para Minhas Listas"
            aria-label="Voltar para Minhas Listas"
          >
            <ArrowLeft size={18} />
          </motion.button>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15 text-primary">
                <ShoppingCart size={11} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Lista de Compras
              </span>
              {isComplete ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.2 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <CheckCircle2 size={10} /> Finalizada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.2 text-[10px] font-bold text-primary">
                  <Clock size={10} /> Em aberto
                </span>
              )}
            </div>

            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground truncate">
              {detailData?.name ?? 'Carregando lista...'}
            </h1>
          </div>
        </div>

        {/* Botão Modo Mercado + Compartilhar + Menu da Lista */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onStartMarketMode && !isComplete && totalItems > 0 && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onStartMarketMode}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 text-xs font-bold text-white shadow-xs hover:brightness-105 active:scale-95 transition-all"
              title="Abrir o Modo Mercado para compras no supermercado"
            >
              <ShoppingCart size={13} />
              <span>Modo Mercado</span>
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleShareList}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-border/70 bg-card px-2.5 sm:px-3 text-xs font-semibold text-muted-foreground shadow-subtle transition-colors hover:bg-muted hover:text-foreground"
            title="Copiar lista formatada para WhatsApp"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Compartilhar</span>
          </motion.button>

          {(onEditList || onDeleteList) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground shadow-subtle transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Opções da lista"
                >
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEditList && (
                  <DropdownMenuItem onClick={onEditList} className="gap-2 font-medium">
                    <Pencil size={14} />
                    Editar Lista
                  </DropdownMenuItem>
                )}
                {onDeleteList && (
                  <DropdownMenuItem
                    onClick={onDeleteList}
                    className="gap-2 text-destructive focus:text-destructive font-medium"
                  >
                    <Trash2 size={14} />
                    Excluir Lista
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* ── Hero Card de Resumo de Orçamento e Progresso ─────────────────── */}
      {detailData && (
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-card">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Gasto Real no Carrinho
                </span>
                <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  <AnimatedCurrency value={totalSpent} />
                </p>
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Pendentes
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary tabular-nums">
                    <Clock size={12} />
                    <AnimatedNumber value={pendingCount} />
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    No Carrinho
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 tabular-nums">
                    <CheckCircle2 size={12} />
                    <AnimatedNumber value={purchasedItems} />
                  </span>
                </div>
              </div>
            </div>

            {/* Progresso de itens comprados */}
            {totalItems > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="font-medium">Progresso de itens comprados</span>
                  <span className="font-bold text-foreground tabular-nums">
                    <AnimatedNumber value={purchasedItems} /> de <AnimatedNumber value={totalItems} /> (<AnimatedPercent value={pct} />)
                  </span>
                </div>
                <SpringProgress
                  value={pct}
                  variant={isComplete ? 'sage' : 'primary'}
                  className="h-2 bg-muted/60"
                />
              </div>
            )}

            {/* 3 Métricas: Estimado, Pago, Restante */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-border/50 pt-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Estimado
                </span>
                <p className="font-semibold text-foreground tabular-nums">
                  {totalEstimated > 0 ? <AnimatedCurrency value={totalEstimated} /> : '—'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Gasto Real
                </span>
                <p
                  className={cn(
                    'font-bold tabular-nums',
                    totalSpent > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-foreground'
                  )}
                >
                  {totalSpent > 0 ? <AnimatedCurrency value={totalSpent} /> : '—'}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Restante Estimado
                </span>
                <p className="font-semibold text-foreground tabular-nums">
                  {totalEstimated > 0 ? <AnimatedCurrency value={remaining} /> : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
