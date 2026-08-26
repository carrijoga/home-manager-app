import type { PaymentCardInvoice } from '@/schemas/payment-card';
import { formatCurrency } from '@/utils/dashboardMetrics';

const formatMonth = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

interface PaymentCardInvoiceProps {
  invoice: PaymentCardInvoice | null;
  loading: boolean;
}

export function PaymentCardInvoiceSection({ invoice, loading }: PaymentCardInvoiceProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold capitalize text-foreground">
          {invoice ? `Fatura de ${formatMonth(invoice.month)}` : 'Fatura'}
        </h3>
        <span className="rounded-full bg-honey-100 px-2 py-0.5 text-[10px] text-honey-700 dark:bg-honey-400/15 dark:text-honey-300">
          mock · aguardando back-end
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : !invoice || invoice.items.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Nenhum lançamento nesta fatura.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-border">
            {invoice.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <span aria-hidden>{item.icon}</span>
                  <span>{item.description}</span>
                  <span className="text-xs text-muted-foreground">· {item.categoryName}</span>
                </span>
                <span className="font-medium text-foreground">
                  {formatCurrency(Number(item.amount))}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-base font-bold text-foreground">
              {formatCurrency(Number(invoice.total))}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
