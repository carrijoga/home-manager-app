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
  accounts,
  selectedId,
  canDeleteMap,
  onSelect,
  onEdit,
  onToggleActive,
  onDelete,
  onAdd,
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
          'relative min-w-[220px] overflow-hidden rounded-2xl border bg-card transition-colors lg:min-w-0',
          selected ? 'border-primary' : 'border-border',
          !acc.isActive && 'opacity-50'
        )}
      >
        {/*
          A cor da conta é livre (color picker) e o tema muda entre claro e
          escuro, então ela entra como camada sobreposta ao bg-card em baixa
          opacidade, em vez de compor a cor final via color-mix — que resolveria
          var(--card) no escopo errado ao alternar o tema.
        */}
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{ backgroundColor: acc.color }}
          aria-hidden="true"
        />

        <button
          type="button"
          aria-pressed={selected}
          onClick={() => onSelect(acc.bankAccountId)}
          className="relative w-full p-4 pr-11 text-left"
        >
          <span className="font-ui block truncate font-semibold text-foreground">{acc.name}</span>
          <p className="font-ui mt-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            {accountTypeLabel(acc.type)}
          </p>
        </button>

        <div className="absolute right-3 top-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
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
                {acc.isActive ? (
                  <PowerOff size={14} strokeWidth={1.5} />
                ) : (
                  <Power size={14} strokeWidth={1.5} />
                )}
                {acc.isActive ? 'Inativar' : 'Ativar'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={canDelete ? () => onDelete(acc) : undefined}
                disabled={!canDelete}
                title={
                  canDelete
                    ? undefined
                    : 'Esta conta possui lançamentos vinculados. Apenas inativação é permitida.'
                }
                className={cn(
                  'gap-2',
                  canDelete ? 'text-destructive focus:text-destructive' : 'text-destructive/50'
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

      <div className="flex flex-row gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {activeAccounts.map(renderTile)}
      </div>

      {inactiveAccounts.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-dashed border-border pt-3">
          <p className="font-ui text-[11px] uppercase tracking-wide text-muted-foreground">
            Inativas
          </p>
          <div className="flex flex-row gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {inactiveAccounts.map(renderTile)}
          </div>
        </div>
      )}
    </div>
  );
}
