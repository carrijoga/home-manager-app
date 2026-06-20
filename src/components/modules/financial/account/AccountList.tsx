import { Plus } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { BankAccountResponse } from '@/schemas/bank-account';

import { accountTypeLabel, formatMoney } from './accountType';

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
        <Plus size={16} /> Nova conta
      </Button>

      <div className="flex gap-3 flex-row overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {accounts.map((acc) => (
          <button
            key={acc.bankAccountId}
            type="button"
            onClick={() => onSelect(acc.bankAccountId)}
            className={cn(
              'min-w-[220px] lg:min-w-0 text-left rounded-2xl border p-3 transition-colors',
              acc.bankAccountId === selectedId
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-muted/50',
            )}
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: acc.color }} aria-hidden />
              <span className="font-semibold text-foreground truncate">{acc.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{accountTypeLabel(acc.type)}</p>
            <p className="text-sm font-medium text-foreground mt-1">{formatMoney(Number(acc.balance))}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
