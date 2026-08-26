import { AlarmClock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

import type { FinancialTransactionUpcomingBillResponse } from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { getDueLabel } from '@/utils/financialUtils';

interface UpcomingBillsCardV2Props {
  bills: FinancialTransactionUpcomingBillResponse[];
  onPay: (bill: FinancialTransactionUpcomingBillResponse) => void;
  onViewAllUnpaid: () => void;
}

/**
 * UpcomingBillsCardV2 — Contas a Vencer V2 com badges de destaque de prazo,
 * botão de pagamento rápido e atalho para filtrar a lista.
 */
export function UpcomingBillsCardV2({ bills, onPay, onViewAllUnpaid }: UpcomingBillsCardV2Props) {
  const overdueCount = bills.filter((b) => b.isOverdue).length;

  return (
    <div
      className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-6"
      style={{
        borderLeft: overdueCount > 0 ? '4px solid var(--destructive)' : '4px solid var(--primary)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background:
                overdueCount > 0
                  ? 'color-mix(in srgb, var(--destructive) 15%, transparent)'
                  : 'color-mix(in srgb, var(--primary) 15%, transparent)',
              color: overdueCount > 0 ? 'var(--destructive)' : 'var(--primary)',
            }}
          >
            <AlarmClock size={18} strokeWidth={1.8} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold leading-tight text-foreground">
              Contas a Vencer
            </h3>
            {overdueCount > 0 ? (
              <span className="font-ui text-xs font-semibold text-destructive">
                {overdueCount} {overdueCount === 1 ? 'conta vencida' : 'contas vencidas'}
              </span>
            ) : (
              <span className="font-ui text-xs text-muted-foreground">Próximos vencimentos</span>
            )}
          </div>
        </div>

        {bills.length > 0 && (
          <button
            type="button"
            onClick={onViewAllUnpaid}
            className="font-ui flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
          >
            Ver todas <ArrowUpRight size={13} />
          </button>
        )}
      </div>

      {bills.length === 0 ? (
        <div className="font-ui flex items-center gap-2 rounded-2xl bg-chart-2/10 p-3 text-xs font-medium text-chart-2">
          <CheckCircle2 size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>Tudo quitado e em dia por aqui!</span>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {bills.slice(0, 5).map((bill) => {
            const dueText = getDueLabel(String(bill.dueDate));
            return (
              <li
                key={bill.financialTransactionId}
                className="flex items-center justify-between gap-2 rounded-2xl border border-border/40 bg-muted/30 p-2.5 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-ui truncate text-xs font-semibold text-foreground">
                    {bill.description}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`font-ui rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        bill.isOverdue
                          ? 'bg-destructive/15 text-destructive'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {dueText}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-ui text-xs font-bold text-foreground">
                    {formatCurrency(Number(bill.value))}
                  </span>
                  <button
                    type="button"
                    onClick={() => onPay(bill)}
                    className="font-ui rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
                  >
                    ✓ Pagar
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
