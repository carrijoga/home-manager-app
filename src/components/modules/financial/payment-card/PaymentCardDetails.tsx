import { PowerOff } from 'lucide-react';

import { CARD_TYPE_LABELS, CardType } from '@/schemas/enums';
import type { PaymentCardInvoice, PaymentCardResponse } from '@/schemas/payment-card';
import { formatCurrency } from '@/utils/dashboardMetrics';

import { PaymentCardInvoiceSection } from './PaymentCardInvoice';

function InactiveBanner() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2">
      <PowerOff size={15} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
      <p className="font-ui text-sm text-muted-foreground">Este cartão está inativo.</p>
    </div>
  );
}

interface PaymentCardDetailsProps {
  card: PaymentCardResponse;
  used: number;
  invoice: PaymentCardInvoice | null;
  invoiceLoading: boolean;
}

export function PaymentCardDetails({ card, used, invoice, invoiceLoading }: PaymentCardDetailsProps) {
  const isCredit = card.type === CardType.Credit;
  const limit = Number(card.creditLimit ?? 0);
  const usedPct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  if (!isCredit) {
    return (
      <div className="flex flex-col gap-3">
        {!card.isActive && <InactiveBanner />}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Tipo</div>
          <div className="text-xl font-bold text-foreground">{CARD_TYPE_LABELS[card.type]}</div>
          <div className="text-sm text-muted-foreground">
            {card.bankAccountId ? 'Vinculado a uma conta' : 'Não vinculado a uma conta'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!card.isActive && <InactiveBanner />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Limite usado</div>
          <div className="text-xl font-bold text-foreground">
            {formatCurrency(used)} <span className="text-xs font-normal text-muted-foreground">/ {formatCurrency(limit)}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${usedPct}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Vencimento</div>
          <div className="text-xl font-bold text-foreground">Dia {Number(card.dueDay ?? 0)}</div>
          <div className="text-xs text-muted-foreground">Fecha dia {Number(card.closingDay ?? 0)}</div>
        </div>
      </div>

      <PaymentCardInvoiceSection invoice={invoice} loading={invoiceLoading} />
    </div>
  );
}
