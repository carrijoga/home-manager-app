import { CheckCircle2, DollarSign, ShoppingBag, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { AnimatedCurrency, AnimatedNumber } from '@/components/common/AnimatedNumber';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface MarketFinishModalProps {
  open: boolean;
  onClose: () => void;
  onFinishList: () => Promise<void>;
  listName: string;
  totalSpent: number;
  totalEstimated: number;
  purchasedCount: number;
  totalCount: number;
}

export function MarketFinishModal({
  open,
  onClose,
  onFinishList,
  listName,
  totalSpent,
  totalEstimated,
  purchasedCount,
  totalCount,
}: MarketFinishModalProps) {
  const [isFinishing, setIsFinishing] = useState(false);
  const navigate = useNavigate();

  const diff = totalSpent - totalEstimated;
  const hasSavings = diff < 0;
  const isPendingRemaining = totalCount - purchasedCount > 0;

  const handleFinish = async (redirectToFinance: boolean = false) => {
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      await onFinishList();
      if (redirectToFinance) {
        // Redireciona para o módulo financeiro com parâmetros de nova transação
        navigate('/financial');
      }
      onClose();
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && !isFinishing && onClose()}>
      <AlertDialogContent className="max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl dark:bg-[#1B1A18]">
        <AlertDialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40 space-y-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
              <ShoppingBag size={18} />
            </span>
            <AlertDialogTitle className="font-display text-lg font-bold text-foreground">
              Finalizar Compras
            </AlertDialogTitle>
          </div>
          <button
            onClick={onClose}
            disabled={isFinishing}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={16} />
          </button>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          {/* Extrato Resumido das Compras */}
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Lista:</span>
              <span className="font-semibold text-foreground truncate max-w-[200px]">
                {listName}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Itens colocados no carrinho:</span>
              <span className="font-bold text-foreground tabular-nums">
                <AnimatedNumber value={purchasedCount} /> de <AnimatedNumber value={totalCount} /> itens
              </span>
            </div>

            <div className="flex justify-between items-center text-sm pt-2 border-t border-border/40">
              <span className="font-semibold text-foreground">Total Real Pago:</span>
              <span className="font-display text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                <AnimatedCurrency value={totalSpent} />
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Total Previsto:</span>
              <span className="font-medium text-muted-foreground tabular-nums">
                <AnimatedCurrency value={totalEstimated} />
              </span>
            </div>

            {totalEstimated > 0 && totalSpent > 0 && (
              <div className="flex justify-between items-center text-xs pt-1.5 border-t border-border/30">
                <span className="font-medium text-foreground">Balanço do Mercado:</span>
                {hasSavings ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    <TrendingDown size={12} />
                    Economia de <AnimatedCurrency value={Math.abs(diff)} />
                  </span>
                ) : diff > 0 ? (
                  <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    <TrendingUp size={12} />
                    +<AnimatedCurrency value={diff} /> acima do previsto
                  </span>
                ) : (
                  <span className="font-medium text-muted-foreground">Exatamente o previsto</span>
                )}
              </div>
            )}
          </div>

          {isPendingRemaining && (
            <p className="text-xs text-muted-foreground px-1 leading-relaxed">
              ⚠️ Restam {totalCount - purchasedCount} itens pendentes. Ao finalizar, eles serão mantidos como não comprados na lista.
            </p>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <Button
            type="button"
            onClick={() => handleFinish(false)}
            disabled={isFinishing}
            className="h-12 w-full rounded-2xl bg-emerald-600 text-white font-display text-sm font-bold shadow-md hover:bg-emerald-700 active:scale-[0.98] transition-all dark:bg-emerald-500"
          >
            {isFinishing ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" /> Finalizando lista...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                Concluir e Fechar Lista
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleFinish(true)}
            disabled={isFinishing}
            className="h-12 w-full rounded-2xl border-primary/40 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-colors"
          >
            <DollarSign size={14} className="mr-1" />
            Concluir e Lançar no Financeiro
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isFinishing}
            className="h-10 w-full rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Continuar no Mercado
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
