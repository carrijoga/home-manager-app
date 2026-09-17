import {
  ArrowLeftRight,
  CreditCard,
  DollarSign,
  MoreVertical,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  Wallet,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { BankAccountResponse } from '@/schemas/bank-account';
import { formatCurrency } from '@/utils/formatters';

import { accountTypeLabel } from './accountType';

interface AccountListProps {
  accounts: BankAccountResponse[];
  selectedId: string | null;
  canDeleteMap: Record<string, boolean>;
  onSelect: (id: string) => void;
  onEdit: (account: BankAccountResponse) => void;
  onAdjustBalance: (account: BankAccountResponse) => void;
  onTransfer?: (account: BankAccountResponse) => void;
  onToggleActive: (account: BankAccountResponse) => void;
  onDelete: (account: BankAccountResponse) => void;
}

export function AccountList({
  accounts,
  selectedId,
  canDeleteMap,
  onSelect,
  onEdit,
  onAdjustBalance,
  onTransfer,
  onToggleActive,
  onDelete,
}: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Nenhuma conta encontrada nesta categoria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {accounts.map((acc) => {
        const isSelected = acc.bankAccountId === selectedId;
        const canDelete = canDeleteMap[acc.bankAccountId] ?? true;
        const balance = Number(acc.balance);
        const cardCount = acc.paymentCards?.length ?? 0;

        return (
          <div
            key={acc.bankAccountId}
            onClick={() => onSelect(acc.bankAccountId)}
            className={cn(
              'group flex items-center justify-between gap-3.5 rounded-2xl p-3.5 sm:p-4 transition-all duration-150 cursor-pointer',
              isSelected
                ? 'border-2 border-primary bg-card shadow-md ring-1 ring-primary/20'
                : 'border border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30 shadow-subtle',
              !acc.isActive && 'opacity-60 grayscale-[40%]'
            )}
          >
            {/* Esquerda: Squircle com cor/ícone + Metadados */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-xs font-bold text-sm"
                style={{ backgroundColor: acc.color || '#C05621' }}
              >
                {acc.name ? acc.name.slice(0, 2).toUpperCase() : <Wallet size={18} />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-bold text-foreground truncate">
                    {acc.name}
                  </span>
                  {!acc.isActive && (
                    <span className="rounded-full bg-muted px-2 py-0.2 text-[10px] font-semibold text-muted-foreground">
                      Inativa
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate">
                  <span>{accountTypeLabel(acc.type)}</span>
                  {cardCount > 0 && (
                    <>
                      <span className="text-muted-foreground/40 font-bold">·</span>
                      <span className="text-primary font-medium flex items-center gap-1">
                        <CreditCard size={12} className="shrink-0" />
                        {cardCount} {cardCount === 1 ? 'cartão' : 'cartões'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Direita: Saldo e Dropdown de Ações */}
            <div className="flex items-center gap-2 shrink-0 pl-2">
              <div className="text-right">
                <span
                  className={cn(
                    'text-sm sm:text-base font-bold tabular-nums block',
                    acc.isActive
                      ? balance < 0
                        ? 'text-destructive'
                        : 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  )}
                >
                  {formatCurrency(balance)}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                  saldo atual
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                    aria-label="Ações da conta"
                  >
                    <MoreVertical size={18} strokeWidth={1.8} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => onEdit(acc)} className="gap-2 cursor-pointer">
                    <Pencil size={14} strokeWidth={1.8} /> Editar
                  </DropdownMenuItem>
                  {onTransfer && acc.isActive && (
                    <DropdownMenuItem onClick={() => onTransfer(acc)} className="gap-2 cursor-pointer">
                      <ArrowLeftRight size={14} strokeWidth={1.8} /> Transferir
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onAdjustBalance(acc)} className="gap-2 cursor-pointer">
                    <DollarSign size={14} strokeWidth={1.8} /> Alterar saldo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleActive(acc)} className="gap-2 cursor-pointer">
                    {acc.isActive ? (
                      <PowerOff size={14} strokeWidth={1.8} />
                    ) : (
                      <Power size={14} strokeWidth={1.8} />
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
                      'gap-2 cursor-pointer',
                      canDelete ? 'text-destructive focus:text-destructive' : 'text-destructive/50'
                    )}
                  >
                    <Trash2 size={14} strokeWidth={1.8} /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
