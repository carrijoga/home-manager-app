import { CreditCard, Pencil, PowerOff } from 'lucide-react';

import { CARD_TYPE_LABELS, CardType } from '@/schemas/enums';
import type { PaymentCardInvoice, PaymentCardResponse } from '@/schemas/payment-card';
import { formatCurrency } from '@/utils/formatters';

import { PaymentCardInvoiceSection } from './PaymentCardInvoice';

interface PaymentCardDetailsProps {
  card: PaymentCardResponse;
  used: number;
  invoice: PaymentCardInvoice | null;
  invoiceLoading: boolean;
  onEdit?: (card: PaymentCardResponse) => void;
}

export function PaymentCardDetails({
  card,
  used,
  invoice,
  invoiceLoading,
  onEdit,
}: PaymentCardDetailsProps) {
  const isCredit = card.type === CardType.Credit;
  const limit = Number(card.creditLimit ?? 0);
  const available = Math.max(0, limit - used);
  const usedPct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const closingDay = card.closingDay ? Number(card.closingDay) : null;
  const dueDay = card.dueDay ? Number(card.dueDay) : null;

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-lg space-y-4 dark:bg-[#1C1B19]">
      {/* Aviso de Inatividade */}
      {!card.isActive && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2">
          <PowerOff size={15} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">Este cartão está inativo.</p>
        </div>
      )}

      {/* Header do Item Selecionado */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white font-bold text-xs shadow-xs"
            style={{ backgroundColor: card.color || '#C05621' }}
          >
            <CreditCard size={16} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight truncate">
              {card.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {CARD_TYPE_LABELS[card.type]}
              </span>
              <span className="text-muted-foreground/40 font-bold">·</span>
              <span className="text-xs text-muted-foreground">
                {card.bankAccountId ? 'Vinculado a uma conta' : 'Avulso'}
              </span>
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={() => onEdit(card)}
            className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Editar detalhes do cartão"
          >
            <Pencil size={15} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {isCredit ? (
        <div className="space-y-4">
          {/* Bento Stats do Limite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Limite Usado
              </span>
              <span className="text-xl font-black tabular-nums text-foreground mt-0.5 block">
                {formatCurrency(used)}
              </span>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Disponível
              </span>
              <span className="text-xl font-black tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {formatCurrency(available)}
              </span>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                de {formatCurrency(limit)} limite
              </span>
            </div>
          </div>

          {/* Bento Ciclo Fechamento / Vencimento */}
          {(closingDay != null || dueDay != null) && (
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Fechamento
                </span>
                <span className="text-sm font-bold text-foreground mt-0.5 block">
                  {closingDay != null ? `Dia ${closingDay}` : '—'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Vencimento
                </span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {dueDay != null ? `Dia ${dueDay}` : '—'}
                </span>
              </div>
            </div>
          )}

          {/* Fatura Detalhada */}
          <div className="pt-2 border-t border-border/60">
            <PaymentCardInvoiceSection invoice={invoice} loading={invoiceLoading} />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
            Configurações de Débito
          </div>
          <p className="text-sm text-foreground font-medium">
            {card.bankAccountId
              ? 'Este cartão opera em modalidade de débito direto na conta vinculada.'
              : 'Cartão de débito não vinculado a nenhuma conta cadastrada.'}
          </p>
        </div>
      )}
    </div>
  );
}
