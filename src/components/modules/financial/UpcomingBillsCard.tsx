import { AlarmClock, CheckCircle2 } from 'lucide-react';

import type { FinancialTransactionUpcomingBillResponse } from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { getDueLabel } from '@/utils/financialUtils';

interface UpcomingBillsCardProps {
  bills: FinancialTransactionUpcomingBillResponse[];
  onPay: (bill: FinancialTransactionUpcomingBillResponse) => void;
}

/** Contas não pagas: vencidas + vencendo em breve (dados do dashboard). */
export function UpcomingBillsCard({ bills, onPay }: UpcomingBillsCardProps) {
  return (
    <div
      className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6"
      style={{ borderLeft: '3px solid var(--primary)' }}
    >
      <div className="flex items-center gap-3">
        <AlarmClock size={18} className="text-primary" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="font-editorial text-lg font-bold text-foreground">Contas a vencer</h3>
      </div>

      {bills.length === 0 ? (
        <div
          className="font-ui flex items-center gap-2 text-sm"
          style={{ color: 'var(--chart-2)' }}
        >
          <CheckCircle2 size={16} strokeWidth={1.5} aria-hidden="true" />
          <span>Tudo em dia por aqui!</span>
        </div>
      ) : (
        <ul className="flex flex-col">
          {bills.slice(0, 5).map((bill) => (
            <li
              key={bill.financialTransactionId}
              className="flex items-center justify-between gap-2 border-b border-dashed border-border py-2 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="font-ui truncate text-sm font-medium text-foreground">
                  {bill.description}
                </p>
                <p
                  className="font-ui text-xs"
                  style={{
                    color: bill.isOverdue ? 'var(--destructive)' : 'var(--muted-foreground)',
                  }}
                >
                  {getDueLabel(String(bill.dueDate))}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-ui text-sm font-semibold text-foreground">
                  {formatCurrency(Number(bill.value))}
                </span>
                <button
                  type="button"
                  onClick={() => onPay(bill)}
                  className="font-ui duration-[length:var(--dur-base)] rounded-full border border-primary/30 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  ✓ Pagar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
