import { useEffect, useState } from 'react';

import MoneyInput from '@/components/common/MoneyInput';
import { ACCOUNT_TYPE_OPTIONS } from '@/components/modules/financial/account/accountType';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import type {
  BankAccountResponse,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
} from '@/schemas/bank-account';
import { AccountType } from '@/schemas/enums';

export interface BankAccountSheetProps {
  open: boolean;
  onClose: () => void;
  account: BankAccountResponse | null;
  onCreate: (payload: CreateBankAccountRequest) => Promise<void>;
  onUpdate: (id: string, payload: UpdateBankAccountRequest) => Promise<void>;
}

const DEFAULT_COLOR = '#3b82f6';

export function BankAccountSheet({
  open,
  onClose,
  account,
  onCreate,
  onUpdate,
}: BankAccountSheetProps) {
  const isEdit = account !== null;

  const [name, setName] = useState('');
  const [type, setType] = useState<number>(AccountType.Checking);
  const [balance, setBalance] = useState<number | null>(0);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (account) {
      setName(account.name);
      setType(account.type);
      setBalance(Number(account.balance));
      setColor(account.color || DEFAULT_COLOR);
    } else {
      setName('');
      setType(AccountType.Checking);
      setBalance(0);
      setColor(DEFAULT_COLOR);
    }
  }, [open, account]);

  const isValid = name.trim().length > 0 && color.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      if (isEdit && account) {
        await onUpdate(account.bankAccountId, {
          bankAccountId: account.bankAccountId,
          name: name.trim(),
          color,
        });
      } else {
        const balanceNum = balance ?? 0;
        await onCreate({
          name: name.trim(),
          type,
          balance: balanceNum,
          initialBalance: balanceNum,
          color,
        });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        className="flex max-h-[90dvh] flex-col rounded-t-3xl border-t border-border bg-card p-0 sm:max-w-md sm:mx-auto sm:rounded-3xl sm:border dark:bg-[#181818]"
      >
        <SheetHeader className="border-b border-border/40 px-6 py-4 text-left">
          <SheetTitle className="text-lg font-bold text-foreground">
            {isEdit ? 'Editar Conta' : 'Nova Conta'}
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(e).catch(() => {});
          }}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">

          <div className="space-y-1.5">
            <Label
              htmlFor="acc-name"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Nome
            </Label>
            <Input
              id="acc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Conta Corrente"
              className="border-border/40 bg-muted/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="acc-type"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Tipo
            </Label>
            <Select
              value={String(type)}
              onValueChange={(v) => setType(Number(v))}
              disabled={isEdit}
            >
              <SelectTrigger id="acc-type" className="border-border/40 bg-muted/30">
                <SelectValue placeholder="Selecionar…" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEdit && (
              <p className="text-xs text-muted-foreground">O tipo não pode ser alterado.</p>
            )}
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label
                htmlFor="acc-balance"
                className="text-xs uppercase tracking-wide text-muted-foreground"
              >
                Saldo inicial (R$)
              </Label>
              <MoneyInput
                id="acc-balance"
                value={balance}
                onChange={setBalance}
                allowNegative
                placeholder="R$ 0,00"
                className="border-border/40 bg-muted/30"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="acc-color"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Cor
            </Label>
            <div className="flex items-center gap-3">
              <input
                id="acc-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background"
              />
              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
          </div>
          </div>

          <div className="border-t border-border/40 bg-card p-4 pb-6 dark:bg-[#181818]">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || !isValid}
                className="h-12 flex-[2] rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Salvando...
                  </span>
                ) : isEdit ? (
                  'Salvar alterações'
                ) : (
                  'Criar conta'
                )}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
