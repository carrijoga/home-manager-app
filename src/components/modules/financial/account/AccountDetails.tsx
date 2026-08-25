import { CreditCard, PowerOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { BankAccountResponse } from '@/schemas/bank-account';
import { CARD_TYPE_LABELS } from '@/schemas/enums';
import { formatCurrency } from '@/utils/dashboardMetrics';

import { accountTypeLabel } from './accountType';

interface AccountDetailsProps {
  account: BankAccountResponse;
}

export function AccountDetails({ account }: AccountDetailsProps) {
  const balance = Number(account.balance);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6">
      {!account.isActive && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2">
          <PowerOff size={15} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
          <p className="font-ui text-sm text-muted-foreground">Esta conta está inativa.</p>
        </div>
      )}

      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn('h-10 w-10 shrink-0 rounded-full', !account.isActive && 'opacity-60')}
          style={{ backgroundColor: account.color }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h3 className="font-editorial truncate text-lg font-bold text-foreground">
            {account.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="font-ui text-sm text-muted-foreground">
              {accountTypeLabel(account.type)}
            </p>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
                account.isActive
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {account.isActive ? 'Ativa' : 'Inativa'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 border-t border-dashed border-border pt-4">
        <div>
          <p className="font-ui text-[11px] uppercase tracking-wide text-muted-foreground">Saldo</p>
          <p
            className="font-editorial mt-1 text-3xl font-bold"
            style={
              account.isActive
                ? { color: balance < 0 ? 'var(--destructive)' : 'var(--chart-2)' }
                : { color: 'var(--muted-foreground)' }
            }
          >
            {formatCurrency(balance)}
          </p>
        </div>
        <div>
          <p className="font-ui text-[11px] uppercase tracking-wide text-muted-foreground">
            Saldo inicial
          </p>
          <p className="font-editorial mt-1 text-lg font-semibold text-foreground">
            {formatCurrency(Number(account.initialBalance))}
          </p>
        </div>
      </div>

      <div className="border-t border-dashed border-border pt-4">
        <p className="font-ui text-[11px] uppercase tracking-wide text-muted-foreground">
          Cartões vinculados
        </p>
        {account.paymentCards.length === 0 ? (
          <p className="font-ui mt-2 text-sm text-muted-foreground">
            Nenhum cartão vinculado a esta conta.
          </p>
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
                  <p className="font-ui truncate text-sm font-medium text-foreground">
                    {card.name}
                  </p>
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
