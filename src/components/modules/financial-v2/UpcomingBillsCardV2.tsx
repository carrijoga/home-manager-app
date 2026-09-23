import {
  AlarmClock,
  AlertOctagon,
  ArrowUpRight,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';

import { AnimatedCurrency, AnimatedNumber } from '@/components/common/AnimatedNumber';
import type { FinancialTransactionUpcomingBillResponse } from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { getDueLabel } from '@/utils/financialUtils';

interface UpcomingBillsCardV2Props {
  bills: FinancialTransactionUpcomingBillResponse[];
  onPay: (bill: FinancialTransactionUpcomingBillResponse) => void;
  onViewAllUnpaid: () => void;
}

/**
 * UpcomingBillsCardV2 — Central de Contas a Vencer e Vencidas V2.
 * Traz categorização por criticidade (vencidas, vencendo hoje, próximos dias),
 * badges semânticos de urgência e ação rápida de 1 clique para dar baixa.
 */
export function UpcomingBillsCardV2({
  bills,
  onPay,
  onViewAllUnpaid,
}: UpcomingBillsCardV2Props) {
  const overdueBills = bills.filter((b) => b.isOverdue);
  const overdueCount = overdueBills.length;
  const overdueTotal = overdueBills.reduce((sum, b) => sum + Number(b.value), 0);
  const totalUpcomingValue = bills.reduce((sum, b) => sum + Number(b.value), 0);

  // Ordena colocando as vencidas primeiro (data mais antiga primeiro), seguidas das próximas
  const sortedBills = [...bills].sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return new Date(String(a.dueDate)).getTime() - new Date(String(b.dueDate)).getTime();
  });

  return (
    <div
      className={`flex flex-col gap-4 rounded-3xl border bg-card p-5 shadow-xs transition-all sm:p-6 ${
        overdueCount > 0
          ? 'border-destructive/30 ring-1 ring-destructive/15'
          : 'border-border/80'
      }`}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors ${
              overdueCount > 0
                ? 'bg-destructive/15 text-destructive'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {overdueCount > 0 ? (
              <AlertOctagon size={20} strokeWidth={2.2} aria-hidden="true" />
            ) : (
              <AlarmClock size={20} strokeWidth={2.2} aria-hidden="true" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-lg font-bold leading-tight text-foreground">
                Contas a Vencer
              </h3>
              {bills.length > 0 && (
                <span className="font-ui rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                  <AnimatedNumber value={bills.length} />
                </span>
              )}
            </div>
            {overdueCount > 0 ? (
              <p className="font-ui text-xs font-semibold text-destructive">
                <AnimatedNumber value={overdueCount} /> {overdueCount === 1 ? 'conta vencida' : 'contas vencidas'} (
                <AnimatedCurrency value={overdueTotal} />)
              </p>
            ) : (
              <p className="font-ui text-xs text-muted-foreground">
                Total pendente: <AnimatedCurrency value={totalUpcomingValue} />
              </p>
            )}
          </div>
        </div>

        {bills.length > 0 && (
          <button
            type="button"
            onClick={onViewAllUnpaid}
            className="font-ui flex items-center gap-1 text-xs font-semibold text-primary transition-all hover:underline"
          >
            Ver todas <ArrowUpRight size={14} />
          </button>
        )}
      </div>

      {/* Lista de Contas */}
      {bills.length === 0 ? (
        <div className="font-ui flex flex-col items-center justify-center gap-2 rounded-2xl border border-chart-2/20 bg-chart-2/10 p-5 text-center text-chart-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/20">
            <Sparkles size={20} />
          </div>
          <p className="text-sm font-bold">Tudo quitado e em dia!</p>
          <p className="text-xs text-chart-2/80">Nenhuma conta pendente ou vencida para este período.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {sortedBills.slice(0, 5).map((bill) => {
            const dueText = getDueLabel(String(bill.dueDate));
            const isToday = dueText.includes('hoje');

            return (
              <li
                key={bill.financialTransactionId}
                className={`group flex items-center justify-between gap-3 rounded-2xl border p-3 transition-all ${
                  bill.isOverdue
                    ? 'border-destructive/30 bg-destructive/5 hover:border-destructive/50 hover:bg-destructive/10'
                    : isToday
                      ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10'
                      : 'border-border/50 bg-muted/25 hover:border-border/80 hover:bg-muted/50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-ui truncate text-xs font-bold text-foreground">
                    {bill.description}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`font-ui inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        bill.isOverdue
                          ? 'bg-destructive/15 text-destructive'
                          : isToday
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {bill.isOverdue ? (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
                      ) : (
                        <Clock size={10} />
                      )}
                      {dueText}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <span
                    className={`font-ui text-xs font-bold sm:text-sm ${
                      bill.isOverdue ? 'text-destructive' : 'text-foreground'
                    }`}
                  >
                    {formatCurrency(Number(bill.value))}
                  </span>
                  <button
                    type="button"
                    onClick={() => onPay(bill)}
                    aria-label={`Pagar conta ${bill.description}`}
                    className="font-ui flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
                  >
                    <Check size={12} strokeWidth={2.5} />
                    <span className="text-[11px]">Pagar</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

