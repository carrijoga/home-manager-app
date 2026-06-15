import type { CreditCardInvoice } from '@/schemas/credit-card';
import { formatCurrency } from '@/utils/dashboardMetrics';

const formatMonth = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

interface CreditCardInvoiceProps {
  invoice: CreditCardInvoice | null;
  loading: boolean;
}

export function CreditCardInvoiceSection({ invoice, loading }: CreditCardInvoiceProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground capitalize">
          {invoice ? `Fatura de ${formatMonth(invoice.month)}` : 'Fatura'}
        </h3>
        <span className="text-[10px] rounded-full bg-honey-100 text-honey-700 px-2 py-0.5 dark:bg-honey-400/15 dark:text-honey-300">
          mock · aguardando back-end
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      ) : !invoice || invoice.items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
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
                <span className="font-medium text-foreground">{formatCurrency(Number(item.amount))}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-border">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-base font-bold text-foreground">{formatCurrency(Number(invoice.total))}</span>
          </div>
        </>
      )}
    </div>
  );
}
