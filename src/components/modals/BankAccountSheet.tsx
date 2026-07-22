import { useEffect, useState } from 'react';

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
  SheetTitle,
} from '@/components/ui';
import { useIsMobile } from '@/hooks/use-mobile';
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

export function BankAccountSheet({ open, onClose, account, onCreate, onUpdate }: BankAccountSheetProps) {
  const isEdit = account !== null;
  const isMobile = useIsMobile();

  const [name, setName] = useState('');
  const [type, setType] = useState<number>(AccountType.Checking);
  const [balance, setBalance] = useState<string>('0');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (account) {
      setName(account.name);
      setType(account.type);
      setBalance(String(Number(account.balance)));
      setColor(account.color || DEFAULT_COLOR);
    } else {
      setName('');
      setType(AccountType.Checking);
      setBalance('0');
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
        const balanceNum = Number(balance) || 0;
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
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={isMobile
          ? 'rounded-t-2xl px-4 pb-6 pt-3 max-h-[92dvh] overflow-y-auto focus:outline-none'
          : 'w-[420px] px-6 pb-6 pt-4 overflow-y-auto focus:outline-none'}
      >
        {isMobile && <div className="w-9 h-1 rounded-full bg-border mx-auto mb-4" aria-hidden />}

        <form onSubmit={(e) => { void handleSubmit(e).catch(() => {}); }} className="space-y-4">
          <SheetTitle className="text-lg font-semibold text-foreground">
            {isEdit ? 'Editar conta' : 'Nova conta'}
          </SheetTitle>

          <div className="space-y-1.5">
            <Label htmlFor="acc-name" className="text-xs text-muted-foreground uppercase tracking-wide">Nome</Label>
            <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Conta Corrente"
              className="bg-muted/30 border-border/40" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acc-type" className="text-xs text-muted-foreground uppercase tracking-wide">Tipo</Label>
            <Select
              value={String(type)}
              onValueChange={(v) => setType(Number(v))}
              disabled={isEdit}
            >
              <SelectTrigger id="acc-type" className="bg-muted/30 border-border/40">
                <SelectValue placeholder="Selecionar…" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEdit && <p className="text-xs text-muted-foreground">O tipo não pode ser alterado.</p>}
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="acc-balance" className="text-xs text-muted-foreground uppercase tracking-wide">Saldo inicial (R$)</Label>
              <Input id="acc-balance" type="number" step="0.01" value={balance}
                onChange={(e) => setBalance(e.target.value)} placeholder="0,00"
                className="bg-muted/30 border-border/40" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="acc-color" className="text-xs text-muted-foreground uppercase tracking-wide">Cor</Label>
            <div className="flex items-center gap-3">
              <input id="acc-color" type="color" value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 rounded-md border border-input bg-background cursor-pointer" />
              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
          </div>

          <Button type="submit" disabled={submitting || !isValid} className="w-full font-semibold">
            {submitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar conta'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
