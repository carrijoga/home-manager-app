import { CreditCard, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui';
import type { BankAccountResponse } from '@/schemas/bank-account';
import { CARD_TYPE_LABELS } from '@/schemas/enums';
import { formatCurrency } from '@/utils/dashboardMetrics';

import { accountTypeLabel } from './accountType';

interface AccountDetailsProps {
  account: BankAccountResponse;
  onEdit: (account: BankAccountResponse) => void;
  onDelete: (account: BankAccountResponse) => void;
}

export function AccountDetails({ account, onEdit, onDelete }: AccountDetailsProps) {
  const balance = Number(account.balance);

  return (
    <div className="flex flex-col gap-4 p-6 rounded-3xl bg-card border border-border">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="h-10 w-10 rounded-full shrink-0"
            style={{ backgroundColor: account.color }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="font-editorial font-bold text-foreground text-lg truncate">{account.name}</h3>
            <p className="font-ui text-sm text-muted-foreground">{accountTypeLabel(account.type)}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onEdit(account)}>
            <Pencil size={15} strokeWidth={1.5} /> Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={() => onDelete(account)}
          >
            <Trash2 size={15} strokeWidth={1.5} /> Excluir
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t border-dashed border-border flex flex-wrap gap-6">
        <div>
          <p className="font-ui text-[11px] uppercase tracking-wide text-muted-foreground">Saldo</p>
          <p
            className="font-editorial text-3xl font-bold mt-1"
            style={{ color: balance < 0 ? 'var(--destructive)' : 'var(--chart-2)' }}
          >
            {formatCurrency(balance)}
          </p>
        </div>
        <div>
          <p className="font-ui text-[11px] uppercase tracking-wide text-muted-foreground">Saldo inicial</p>
          <p className="font-editorial text-lg font-semibold mt-1 text-foreground">
            {formatCurrency(Number(account.initialBalance))}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-dashed border-border">
        <p className="font-ui text-[11px] uppercase tracking-wide text-muted-foreground">
          Cartões vinculados
        </p>
        {account.paymentCards.length === 0 ? (
          <p className="font-ui text-sm text-muted-foreground mt-2">Nenhum cartão vinculado a esta conta.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {account.paymentCards.map((card) => (
              <li
                key={card.paymentCardId}
                className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: card.color ?? 'var(--muted)' }}
                >
                  <CreditCard size={14} strokeWidth={1.5} className="text-white" />
                </span>
                <div className="min-w-0">
                  <p className="font-ui text-sm font-medium text-foreground truncate">{card.name}</p>
                  <p className="font-ui text-xs text-muted-foreground">
                    {CARD_TYPE_LABELS[card.type]}
                    {!card.isActive && ' · Inativo'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
