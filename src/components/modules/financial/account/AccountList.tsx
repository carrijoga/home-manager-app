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
  const activeAccounts = accounts.filter((acc) => acc.isActive);
  const inactiveAccounts = accounts.filter((acc) => !acc.isActive);

  const renderTile = (acc: BankAccountResponse) => (
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
        !acc.isActive && 'opacity-50 grayscale',
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
      {acc.isActive && (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold mt-1.5 bg-emerald-500/10 text-emerald-600">
          Ativa
        </span>
      )}
      <p
        className="font-ui text-sm font-semibold mt-1.5"
        style={
          acc.isActive
            ? { color: Number(acc.balance) < 0 ? 'var(--destructive)' : 'var(--chart-2)' }
            : { color: 'var(--muted-foreground)' }
        }
      >
        {formatCurrency(Number(acc.balance))}
      </p>
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={onAdd} className="w-full gap-2 font-semibold">
        <Plus size={16} strokeWidth={1.5} /> Nova conta
      </Button>

      <div className="flex gap-3 flex-row overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {activeAccounts.map(renderTile)}
      </div>

      {inactiveAccounts.length > 0 && (
        <div className="flex flex-col gap-3 pt-3 border-t border-dashed border-border">
          <p className="font-ui text-[11px] uppercase tracking-wide text-muted-foreground">
            Inativas
          </p>
          <div className="flex gap-3 flex-row overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {inactiveAccounts.map(renderTile)}
          </div>
        </div>
      )}
    </div>
  );
}
