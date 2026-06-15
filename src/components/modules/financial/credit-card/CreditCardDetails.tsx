import type { CreditCardInvoice, CreditCardResponse } from '@/schemas/credit-card';

import { CreditCardInvoiceSection } from './CreditCardInvoice';

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface CreditCardDetailsProps {
  card: CreditCardResponse;
  used: number;
  invoice: CreditCardInvoice | null;
  invoiceLoading: boolean;
}

export function CreditCardDetails({ card, used, invoice, invoiceLoading }: CreditCardDetailsProps) {
  const limit = Number(card.creditLimit);
  const usedPct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Limite usado</div>
          <div className="text-xl font-bold text-foreground">
            {brl(used)} <span className="text-xs font-normal text-muted-foreground">/ {brl(limit)}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${usedPct}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Vencimento</div>
          <div className="text-xl font-bold text-foreground">Dia {Number(card.dueDay)}</div>
          <div className="text-xs text-muted-foreground">Fecha dia {Number(card.closingDay)}</div>
        </div>
      </div>

      <CreditCardInvoiceSection invoice={invoice} loading={invoiceLoading} />
    </div>
  );
}
