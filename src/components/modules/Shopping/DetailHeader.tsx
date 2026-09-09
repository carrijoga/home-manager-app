import { formatCurrency } from '@utils/formatters';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { cn } from '@/lib/utils';
import { UNIT_TYPE_LABELS } from '@/schemas/enums';
import type { AppShoppingList } from '@/types';

interface DetailHeaderProps {
  detailData: AppShoppingList | null;
  totalEstimated: number;
  totalSpent: number;
  remaining: number;
  onBack: () => void;
  onEditList?: () => void;
  onDeleteList?: () => void;
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
  } = props;
  const { showSuccess } = useToastNotifications();

  const totalItems = detailData?.items.length ?? 0;
  const purchasedItems =
    detailData?.items.filter((i) => i.status === 1 || i.isPurchased).length ?? 0;
  const pct = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;
  const isComplete = Boolean(detailData?.finished);

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
        const u = UNIT_TYPE_LABELS[i.unitType] ?? 'un';
        text += `✅ ${i.name} — ${i.quantity} ${u}\n`;
      });
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showSuccess('Lista copiada! Pronta para colar no WhatsApp.');
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Top Bar Mobile: Voltar, Título e Menu ────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-card text-foreground shadow-sm transition-all hover:bg-accent active:scale-90 dark:bg-[#181818]"
            title="Voltar para listas"
            aria-label="Voltar para listas"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {detailData?.name ?? 'Carregando lista...'}
              </h1>
              {isComplete ? (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 size={11} /> Finalizada
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary shrink-0">
                  <Clock size={11} /> Em aberto
                </span>
              )}
            </div>

            {detailData && (
              <p className="text-[11px] font-medium text-muted-foreground capitalize">
                {new Date(detailData.monthYear).toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'UTC',
                })}
              </p>
            )}
          </div>
        </div>

        {/* Botão de Compartilhar + Menu da Lista */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleShareList}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-2.5 sm:px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95 dark:bg-[#181818]"
            title="Copiar lista formatada para WhatsApp"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>

          {(onEditList || onDeleteList) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground dark:bg-[#181818]"
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

      {/* ── Unified Hero Budget & Progress Card ──────────────────────────── */}
      {detailData && (
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/20 p-4 sm:p-5 shadow-sm dark:bg-[#181818]">
          <div className="space-y-3">
            {/* Top Row: Progress status info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-2xl',
                    isComplete
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-primary/15 text-primary'
                  )}
                >
                  {isComplete ? <CheckCircle2 size={18} /> : <ShoppingCart size={18} />}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {purchasedItems} de {totalItems} itens no carrinho
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {totalItems - purchasedItems === 0
                      ? 'Todos os itens foram comprados!'
                      : `${totalItems - purchasedItems} item(ns) pendente(s)`}
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  'rounded-xl px-2.5 py-1 text-xs font-extrabold',
                  isComplete
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-primary/10 text-primary'
                )}
              >
                {pct}%
              </span>
            </div>

            {/* Smooth Progress Bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isComplete ? 'bg-emerald-500' : 'bg-primary'
                )}
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Bottom Row: 3 Metrics */}
            <div className="grid grid-cols-3 gap-2 border-t border-border/40 pt-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Estimado
                </span>
                <p className="font-bold text-foreground sm:text-sm">
                  {totalEstimated > 0 ? formatCurrency(totalEstimated) : '—'}
                </p>
              </div>

              <div className="text-center sm:text-left border-x border-border/40 px-1 sm:px-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Pago até agora
                </span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 sm:text-sm">
                  {totalSpent > 0 ? formatCurrency(totalSpent) : '—'}
                </p>
              </div>

              <div className="text-right sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Restante
                </span>
                <p className="font-bold text-foreground sm:text-sm">
                  {totalEstimated > 0 ? formatCurrency(remaining) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
