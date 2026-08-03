import { Check, CreditCard } from 'lucide-react';
import { useState } from 'react';

import { cardGradient } from '@/components/modules/financial/payment-card/gradient';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import {
  Command, CommandEmpty, CommandGroup, CommandItem, CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import type { BankAccountResponse } from '@/schemas/bank-account';
import { FinancialSourceType } from '@/schemas/enums';
import type { PaymentCardResponse } from '@/schemas/payment-card';
import { formatCurrency } from '@/utils/dashboardMetrics';

export interface SourcePickerProps {
  domain: number;
  bankAccounts: BankAccountResponse[];
  cards: PaymentCardResponse[];
  value: string;
  onChange: (id: string) => void;
  disabled: boolean;
}

/**
 * Trigger compacto (dot/ícone) + popover rico (saldo para contas, gradiente
 * real para cartões) — origem do Payment, domínio derivado do Método (ADR 0001).
 */
export function SourcePicker({
  domain, bankAccounts, cards, value, onChange, disabled,
}: SourcePickerProps) {
  const [open, setOpen] = useState(false);
  const isCard = domain === FinancialSourceType.CreditCard;

  const selectedAccount = bankAccounts.find(a => a.bankAccountId === value) ?? null;
  const selectedCard = cards.find(c => c.paymentCardId === value) ?? null;

  const list = isCard ? cards : bankAccounts;
  const hasOptions = list.length > 0;

  const triggerContent = () => {
    if (disabled) {
      return <span className="text-muted-foreground">Escolha um método primeiro</span>;
    }
    if (isCard && selectedCard) {
      return (
        <span className="flex items-center gap-2 text-foreground">
          <CreditCard size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
          {selectedCard.name}
        </span>
      );
    }
    if (!isCard && selectedAccount) {
      return (
        <span className="flex items-center gap-2 text-foreground">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: selectedAccount.color }}
            aria-hidden="true"
          />
          {selectedAccount.name}
        </span>
      );
    }
    return <span className="text-muted-foreground">Selecionar…</span>;
  };

  if (!hasOptions && !disabled) {
    return (
      <p className="text-xs text-muted-foreground bg-muted/30 border border-border/40 rounded-md px-3 py-2">
        {isCard
          ? 'Nenhum cartão ativo cadastrado — crie um na tela de Cartões.'
          : 'Nenhuma conta bancária cadastrada — crie uma na tela de Contas.'}
      </p>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between font-normal bg-muted/30 border-border/40"
        >
          {triggerContent()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
        <Command>
          <CommandList>
            <CommandEmpty className="px-3 py-3 text-sm text-muted-foreground">
              Nenhuma opção encontrada.
            </CommandEmpty>
            <CommandGroup>
              {isCard
                ? cards.map(c => {
                    const selected = c.paymentCardId === value;
                    return (
                      <CommandItem
                        key={c.paymentCardId}
                        value={c.name}
                        onSelect={() => { onChange(c.paymentCardId); setOpen(false); }}
                        className="rounded-md p-0 aria-selected:bg-transparent"
                      >
                        <div
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-white"
                          style={{ background: cardGradient(c.color ?? '') }}
                        >
                          <CreditCard size={16} strokeWidth={1.5} className="shrink-0" />
                          <span className="flex-1 text-sm font-medium truncate">{c.name}</span>
                          {selected && <Check size={16} className="shrink-0" />}
                        </div>
                      </CommandItem>
                    );
                  })
                : bankAccounts.map(a => {
                    const selected = a.bankAccountId === value;
                    return (
                      <CommandItem
                        key={a.bankAccountId}
                        value={a.name}
                        onSelect={() => { onChange(a.bankAccountId); setOpen(false); }}
                        className={cn('gap-2', selected && 'bg-accent')}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: a.color }}
                          aria-hidden="true"
                        />
                        <span className="flex-1 truncate">
                          <span className="block text-sm font-medium">{a.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {formatCurrency(Number(a.balance))}
                          </span>
                        </span>
                        {selected && <Check size={16} className="shrink-0" />}
                      </CommandItem>
                    );
                  })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
