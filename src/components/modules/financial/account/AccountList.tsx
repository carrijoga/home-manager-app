import { Plus } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { BankAccountResponse } from '@/schemas/bank-account';
import { formatCurrency } from '@/utils/dashboardMetrics';

import { accountTypeLabel } from './accountType';

interface AccountListProps {
  accounts: BankAccountResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function AccountList({ accounts, selectedId, onSelect, onAdd }: AccountListProps) {
  return (
    <div className="flex flex-col gap-3">
      <Button onClick={onAdd} className="w-full gap-2 font-semibold">
        <Plus size={16} strokeWidth={1.5} /> Nova conta
      </Button>

      <div className="flex gap-3 flex-row overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {accounts.map((acc) => (
          <button
            key={acc.bankAccountId}
            type="button"
            aria-pressed={acc.bankAccountId === selectedId}
            onClick={() => onSelect(acc.bankAccountId)}
            className={cn(
              'min-w-[220px] lg:min-w-0 text-left rounded-2xl border bg-card p-4 transition-colors',
              acc.bankAccountId === selectedId
                ? 'border-primary'
                : 'border-border hover:bg-muted/50',
            )}
            style={
              acc.bankAccountId === selectedId
                ? { background: 'var(--primary-subtle)' }
                : undefined
            }
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: acc.color }}
                aria-hidden="true"
              />
              <span className="font-ui font-semibold text-foreground truncate">{acc.name}</span>
            </div>
            <p className="font-ui text-[11px] uppercase tracking-wide text-muted-foreground mt-1.5">
              {accountTypeLabel(acc.type)}
            </p>
            <p
              className="font-ui text-sm font-semibold mt-1"
              style={{ color: Number(acc.balance) < 0 ? 'var(--destructive)' : 'var(--chart-2)' }}
            >
              {formatCurrency(Number(acc.balance))}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
