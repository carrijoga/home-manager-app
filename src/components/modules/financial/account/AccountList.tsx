import { MoreVertical, Pencil, Plus, Power, PowerOff, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { BankAccountResponse } from '@/schemas/bank-account';

import { accountTypeLabel } from './accountType';

interface AccountListProps {
  accounts: BankAccountResponse[];
  selectedId: string | null;
  canDeleteMap: Record<string, boolean>;
  onSelect: (id: string) => void;
  onEdit: (account: BankAccountResponse) => void;
  onToggleActive: (account: BankAccountResponse) => void;
  onDelete: (account: BankAccountResponse) => void;
  onAdd: () => void;
}

export function AccountList({
  accounts, selectedId, canDeleteMap, onSelect, onEdit, onToggleActive, onDelete, onAdd,
}: AccountListProps) {
  const activeAccounts = accounts.filter((acc) => acc.isActive);
  const inactiveAccounts = accounts.filter((acc) => !acc.isActive);

  const renderTile = (acc: BankAccountResponse) => {
    const selected = acc.bankAccountId === selectedId;
    // Só a conta selecionada tem canDelete verificado (ver FinancialAccount.tsx);
    // as demais assumem true (otimista) — o DELETE real ainda é bloqueado pelo
    // servidor (400 + toast) se a checagem otimista estiver errada.
    const canDelete = canDeleteMap[acc.bankAccountId] ?? true;

    return (
      <div
        key={acc.bankAccountId}
        className={cn(
          'relative min-w-[220px] lg:min-w-0 rounded-2xl border-2 bg-card transition-colors',
          selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:bg-muted/50',
          !acc.isActive && 'opacity-50',
        )}
        style={{
          borderColor: acc.color,
          ...(selected ? { background: 'var(--primary-subtle)' } : {}),
        }}
      >
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => onSelect(acc.bankAccountId)}
          className="w-full text-left p-4 pr-11"
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
        </button>

        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Ações da conta"
              >
                <MoreVertical size={16} strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onEdit(acc)} className="gap-2">
                <Pencil size={14} strokeWidth={1.5} /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(acc)} className="gap-2">
                {acc.isActive ? <PowerOff size={14} strokeWidth={1.5} /> : <Power size={14} strokeWidth={1.5} />}
                {acc.isActive ? 'Inativar' : 'Ativar'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={canDelete ? () => onDelete(acc) : undefined}
                disabled={!canDelete}
                title={canDelete ? undefined : 'Esta conta possui lançamentos vinculados. Apenas inativação é permitida.'}
                className={cn(
                  'gap-2',
                  canDelete ? 'text-destructive focus:text-destructive' : 'text-destructive/50',
                )}
              >
                <Trash2 size={14} strokeWidth={1.5} /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

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
