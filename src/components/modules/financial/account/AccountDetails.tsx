import { ArrowLeftRight, CreditCard, DollarSign, Pencil, PowerOff, Wallet } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { BankAccountResponse } from '@/schemas/bank-account';
import { CARD_TYPE_LABELS } from '@/schemas/enums';
import { formatCurrency } from '@/utils/formatters';

import { accountTypeLabel } from './accountType';

interface AccountDetailsProps {
  account: BankAccountResponse;
  onEdit?: (account: BankAccountResponse) => void;
  onAdjustBalance?: (account: BankAccountResponse) => void;
  onTransfer?: (account: BankAccountResponse) => void;
}

export function AccountDetails({
  account,
  onEdit,
  onAdjustBalance,
  onTransfer,
}: AccountDetailsProps) {
  const balance = Number(account.balance);
  const initialBalance = Number(account.initialBalance);

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-lg space-y-4 dark:bg-[#1C1B19]">
      {/* Aviso de Inatividade */}
      {!account.isActive && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2">
          <PowerOff size={15} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">Esta conta está inativa.</p>
        </div>
      )}

      {/* Header do Item Selecionado */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white font-bold text-xs shadow-xs"
            style={{ backgroundColor: account.color || '#C05621' }}
          >
            {account.name ? account.name.slice(0, 2).toUpperCase() : <Wallet size={16} />}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight truncate">
              {account.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {accountTypeLabel(account.type)}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-bold',
                  account.isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {account.isActive ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={() => onEdit(account)}
            className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Editar detalhes da conta"
          >
            <Pencil size={15} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {/* Bento Grid Stats da Conta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Saldo Atual
          </span>
          <span
            className={cn(
              'text-xl font-black tabular-nums mt-0.5 block',
              account.isActive
                ? balance < 0
                  ? 'text-destructive'
                  : 'text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground'
            )}
          >
            {formatCurrency(balance)}
          </span>
        </div>

        <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Saldo Inicial
          </span>
          <span className="text-xl font-black text-foreground/80 tabular-nums mt-0.5 block">
            {formatCurrency(initialBalance)}
          </span>
        </div>
      </div>

      {/* Ações Rápidas Contextuais */}
      <div className="flex flex-wrap gap-2">
        {onAdjustBalance && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAdjustBalance(account)}
            className="h-9 flex-1 min-w-[130px] rounded-xl border border-border/70 bg-card font-bold gap-1.5 shadow-subtle hover:bg-muted active:scale-[0.98]"
          >
            <DollarSign size={14} className="text-primary" />
            <span>Alterar Saldo</span>
          </Button>
        )}

        {onTransfer && account.isActive && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onTransfer(account)}
            className="h-9 flex-1 min-w-[130px] rounded-xl border border-border/70 bg-card font-bold gap-1.5 shadow-subtle hover:bg-muted active:scale-[0.98]"
          >
            <ArrowLeftRight size={14} className="text-primary" />
            <span>Transferir</span>
          </Button>
        )}
      </div>

      {/* Cartões Vinculados */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Cartões Vinculados ({account.paymentCards.length})
          </span>
        </div>

        {account.paymentCards.length === 0 ? (
          <p className="text-xs text-muted-foreground py-1">
            Nenhum cartão vinculado a esta conta.
          </p>
        ) : (
          <div className="space-y-1.5">
            {account.paymentCards.map((card) => (
              <div
                key={card.paymentCardId}
                className="rounded-xl border border-border/60 bg-muted/25 p-2.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white shadow-2xs shrink-0"
                    style={{ backgroundColor: card.color ?? '#C05621' }}
                  >
                    <CreditCard size={13} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-foreground block truncate">
                      {card.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {CARD_TYPE_LABELS[card.type]}
                      {!card.isActive && ' · Inativo'}
                    </span>
                  </div>
                </div>

                <span
                  className={cn(
                    'text-[11px] font-bold tabular-nums',
                    card.isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  )}
                >
                  {card.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
