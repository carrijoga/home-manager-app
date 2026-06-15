import { useEffect, useState } from 'react';

import { cardGradient } from '@/components/modules/financial/credit-card/gradient';
import { Button, Input, Label, Sheet, SheetContent } from '@/components/ui';
import { useIsMobile } from '@/hooks/use-mobile';
import type { BankAccountResponse } from '@/schemas/bank-account';
import type {
  CreateCreditCardRequest,
  CreditCardResponse,
  UpdateCreditCardRequest,
} from '@/schemas/credit-card';

export interface CreditCardSheetProps {
  open: boolean;
  onClose: () => void;
  card: CreditCardResponse | null;
  bankAccounts: BankAccountResponse[];
  onCreate: (payload: CreateCreditCardRequest) => Promise<void>;
  onUpdate: (id: string, payload: UpdateCreditCardRequest) => Promise<void>;
}

const DEFAULT_COLOR = '#c2613f';

export function CreditCardSheet({
  open, onClose, card, bankAccounts, onCreate, onUpdate,
}: CreditCardSheetProps) {
  const isEdit = card !== null;
  const isMobile = useIsMobile();

  const [name, setName] = useState('');
  const [limit, setLimit] = useState<string>('');
  const [dueDay, setDueDay] = useState<string>('10');
  const [closingDay, setClosingDay] = useState<string>('3');
  const [previousBalance, setPreviousBalance] = useState<string>('0');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (card) {
      setName(card.name);
      setLimit(String(Number(card.creditLimit)));
      setDueDay(String(Number(card.dueDay)));
      setClosingDay(String(Number(card.closingDay)));
      setPreviousBalance(String(Number(card.previousBalance)));
      setColor(card.color || DEFAULT_COLOR);
      setBankAccountId(card.bankAccountId ?? '');
    } else {
      setName('');
      setLimit('');
      setDueDay('10');
      setClosingDay('3');
      setPreviousBalance('0');
      setColor(DEFAULT_COLOR);
      setBankAccountId('');
    }
  }, [open, card]);

  const isValid =
    name.trim().length > 0 &&
    Number(limit) > 0 &&
    Number(dueDay) >= 1 && Number(dueDay) <= 31;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      if (isEdit && card) {
        await onUpdate(card.creditCardId, {
          name: name.trim(),
          color,
          creditLimit: Number(limit),
          closingDay: Number(closingDay),
        });
      } else {
        await onCreate({
          name: name.trim(),
          limit: Number(limit),
          dueDay: Number(dueDay),
          previousBalance: Number(previousBalance) || 0,
          color,
          bankAccountId: bankAccountId || null,
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
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? 'Editar cartão' : 'Novo cartão'}
          </h2>

          <div
            className="h-20 rounded-2xl flex items-end p-3 text-white"
            style={{ background: cardGradient(color) }}
          >
            <span className="text-sm font-semibold drop-shadow-sm">{name || 'Nome do cartão'}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cc-name">Nome</Label>
            <Input id="cc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Nubank" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cc-limit">Limite (R$)</Label>
            <Input id="cc-limit" type="number" min="0" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="5000" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cc-due">Dia de vencimento</Label>
              <Input id="cc-due" type="number" min="1" max="31" value={dueDay}
                onChange={(e) => setDueDay(e.target.value)} disabled={isEdit} />
            </div>
            {isEdit ? (
              <div className="space-y-1.5">
                <Label htmlFor="cc-closing">Dia de fechamento</Label>
                <Input id="cc-closing" type="number" min="1" max="31" value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)} />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="cc-prev">Saldo anterior (R$)</Label>
                <Input id="cc-prev" type="number" min="0" step="0.01" value={previousBalance}
                  onChange={(e) => setPreviousBalance(e.target.value)} />
              </div>
            )}
          </div>

          {!isEdit && bankAccounts.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="cc-bank">Conta vinculada (opcional)</Label>
              <select
                id="cc-bank"
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Nenhuma</option>
                {bankAccounts.map((acc) => (
                  <option key={acc.bankAccountId} value={acc.bankAccountId}>{acc.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="cc-color">Cor</Label>
            <div className="flex items-center gap-3">
              <input id="cc-color" type="color" value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 rounded-md border border-input bg-background cursor-pointer" />
              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
          </div>

          <Button type="submit" disabled={submitting || !isValid} className="w-full font-semibold">
            {submitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar cartão'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
