import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui';
import type { BankAccountResponse } from '@/schemas/bank-account';

import { accountTypeLabel, formatMoney } from './accountType';

interface AccountDetailsProps {
  account: BankAccountResponse;
  onEdit: (account: BankAccountResponse) => void;
  onDelete: (account: BankAccountResponse) => void;
}

export function AccountDetails({ account, onEdit, onDelete }: AccountDetailsProps) {
  return (
    <div className="rounded-2xl border border-border p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full" style={{ backgroundColor: account.color }} aria-hidden />
          <div>
            <h2 className="text-xl font-semibold text-foreground">{account.name}</h2>
            <p className="text-sm text-muted-foreground">{accountTypeLabel(account.type)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onEdit(account)}>
            <Pencil size={15} /> Editar
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
            onClick={() => onDelete(account)}>
            <Trash2 size={15} /> Excluir
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground">Saldo</p>
        <p className="text-3xl font-semibold text-foreground">{formatMoney(Number(account.balance))}</p>
      </div>
    </div>
  );
}
