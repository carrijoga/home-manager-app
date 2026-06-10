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
      className="flex flex-col gap-4 p-6 rounded-3xl bg-card border border-border"
      style={{ borderLeft: '3px solid var(--primary)' }}
    >
      <div className="flex items-center gap-3">
        <AlarmClock size={18} className="text-primary" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="font-editorial font-bold text-foreground text-lg">Contas a vencer</h3>
      </div>

      {bills.length === 0 ? (
        <div className="flex items-center gap-2 text-sm font-ui" style={{ color: 'var(--chart-2)' }}>
          <CheckCircle2 size={16} strokeWidth={1.5} aria-hidden="true" />
          <span>Tudo em dia por aqui!</span>
        </div>
      ) : (
        <ul className="flex flex-col">
          {bills.slice(0, 5).map(bill => (
            <li
              key={bill.financialTransactionId}
              className="flex items-center justify-between gap-2 py-2 border-b border-dashed border-border last:border-b-0"
            >
              <div className="min-w-0">
                <p className="font-ui text-sm font-medium text-foreground truncate">{bill.description}</p>
                <p
                  className="font-ui text-xs"
                  style={{ color: bill.isOverdue ? 'var(--destructive)' : 'var(--muted-foreground)' }}
                >
                  {getDueLabel(String(bill.dueDate))}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-ui text-sm font-semibold text-foreground">
                  {formatCurrency(Number(bill.value))}
                </span>
                <button
                  type="button"
                  onClick={() => onPay(bill)}
                  className="font-ui text-xs font-semibold text-primary border border-primary/30 rounded-full px-2.5 py-0.5 hover:bg-primary/10 transition-colors duration-[length:var(--dur-base)]"
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
