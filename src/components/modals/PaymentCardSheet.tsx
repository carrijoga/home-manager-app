import { HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cardGradient } from '@/components/modules/financial/payment-card/gradient';
import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { useIsMobile } from '@/hooks/use-mobile';
import type { BankAccountResponse } from '@/schemas/bank-account';
import { CARD_TYPE_LABELS, CardType } from '@/schemas/enums';
import type {
  CreatePaymentCardRequest,
  PaymentCardResponse,
  UpdateCreditPaymentCardSettingsRequest,
  UpdatePaymentCardDetailsRequest,
} from '@/schemas/payment-card';

export interface PaymentCardSheetProps {
  open: boolean;
  onClose: () => void;
  card: PaymentCardResponse | null;
  bankAccounts: BankAccountResponse[];
  onCreate: (payload: CreatePaymentCardRequest) => Promise<void>;
  onUpdateDetails: (id: string, payload: UpdatePaymentCardDetailsRequest) => Promise<void>;
  onUpdateCreditSettings: (
    id: string,
    payload: UpdateCreditPaymentCardSettingsRequest,
  ) => Promise<void>;
}

const DEFAULT_COLOR = '#c2613f';
const CARD_TYPE_OPTIONS = [CardType.Credit, CardType.Debit, CardType.Prepaid, CardType.Other];

export function PaymentCardSheet({
  open, onClose, card, bankAccounts, onCreate, onUpdateDetails, onUpdateCreditSettings,
}: PaymentCardSheetProps) {
  const isEdit = card !== null;
  const isMobile = useIsMobile();

  const [cardType, setCardType] = useState<CardType>(CardType.Credit);
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
      setCardType(card.type);
      setName(card.name);
      setLimit(card.creditLimit != null ? String(Number(card.creditLimit)) : '');
      setDueDay(card.dueDay != null ? String(Number(card.dueDay)) : '10');
      setClosingDay(card.closingDay != null ? String(Number(card.closingDay)) : '3');
      setPreviousBalance(card.previousBalance != null ? String(Number(card.previousBalance)) : '0');
      setColor(card.color || DEFAULT_COLOR);
      setBankAccountId(card.bankAccountId ?? '');
    } else {
      setCardType(CardType.Credit);
      setName('');
      setLimit('');
      setDueDay('10');
      setClosingDay('3');
      setPreviousBalance('0');
      setColor(DEFAULT_COLOR);
      setBankAccountId('');
    }
  }, [open, card]);

  // Regras por tipo (espelham o backend / prompt)
  const isCredit = cardType === CardType.Credit;
  const isDebit = cardType === CardType.Debit;
  const isOther = cardType === CardType.Other;
  const showBank = !isOther; // Credit/Debit/Prepaid mostram conta; Other não
  const bankRequired = isCredit || isDebit;
  const day = (v: string) => Number(v) >= 1 && Number(v) <= 28;

  // Validação de criação por tipo
  const createValid =
    name.trim().length > 0 &&
    (!bankRequired || bankAccountId.length > 0) &&
    (!isCredit || (Number(limit) > 0 && (day(dueDay) || day(closingDay))));

  // Na edição, o nome é sempre obrigatório; se Credit, limite > 0 e ao menos
  // um dos dias (vencimento/fechamento) válido — espelha a regra da criação,
  // senão o update-credit-settings enviaria ambos os dias null e tomaria 400.
  const editValid =
    name.trim().length > 0 &&
    (!isCredit || (Number(limit) > 0 && (day(dueDay) || day(closingDay))));
  const isValid = isEdit ? editValid : createValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      if (isEdit && card) {
        await onUpdateDetails(card.paymentCardId, {
          name: name.trim(),
          color,
        });
        if (card.type === CardType.Credit) {
          await onUpdateCreditSettings(card.paymentCardId, {
            creditLimit: Number(limit),
            dueDay: day(dueDay) ? Number(dueDay) : null,
            closingDay: day(closingDay) ? Number(closingDay) : null,
          });
        }
      } else {
        await onCreate({
          cardType,
          name: name.trim(),
          color,
          bankAccountId: showBank ? (bankAccountId || null) : null,
          creditLimit: isCredit ? Number(limit) : null,
          dueDay: isCredit && day(dueDay) ? Number(dueDay) : null,
          closingDay: isCredit && day(closingDay) ? Number(closingDay) : null,
          previousBalance: isCredit ? (Number(previousBalance) || 0) : null,
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

          {/* Tipo de cartão — só na criação (o tipo é imutável após criado) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="pc-type">Tipo de cartão</Label>
              <select
                id="pc-type"
                value={cardType}
                onChange={(e) => setCardType(Number(e.target.value) as CardType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CARD_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{CARD_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="pc-name">Nome</Label>
            <Input id="pc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Nubank" />
          </div>

          {/* Config. de crédito — só p/ Credit (criação e edição) */}
          {isCredit && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="pc-limit">Limite (R$)</Label>
                <Input id="pc-limit" type="number" min="0" step="0.01" value={limit}
                  onChange={(e) => setLimit(e.target.value)} placeholder="5000" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pc-due">Dia de vencimento</Label>
                  <Input id="pc-due" type="number" min="1" max="28" value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pc-closing">Dia de fechamento</Label>
                  <Input id="pc-closing" type="number" min="1" max="28" value={closingDay}
                    onChange={(e) => setClosingDay(e.target.value)} />
                </div>
              </div>

              {!isEdit && (
                <div className="space-y-1.5">
                  <Label htmlFor="pc-prev">Saldo anterior (R$)</Label>
                  <Input id="pc-prev" type="number" min="0" step="0.01" value={previousBalance}
                    onChange={(e) => setPreviousBalance(e.target.value)} />
                </div>
              )}
            </>
          )}

          {/* Conta vinculada — Credit/Debit/Prepaid (não Other), só na criação */}
          {!isEdit && showBank && (
            <div className="space-y-1.5">
              <Label htmlFor="pc-bank" className="flex items-center gap-1.5">
                Conta vinculada{bankRequired ? '' : ' (opcional)'}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Por que informar uma conta?"
                      >
                        <HelpCircle size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[220px]">
                      <p>
                        {bankRequired
                          ? 'Cartões de crédito e débito são vinculados a uma conta bancária para acompanhar limites, faturas e lançamentos.'
                          : 'Vincule uma conta para acompanhar os lançamentos deste cartão junto ao saldo da conta.'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              {bankAccounts.length > 0 ? (
                <select
                  id="pc-bank"
                  value={bankAccountId}
                  onChange={(e) => setBankAccountId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">{bankRequired ? 'Selecione uma conta' : 'Nenhuma'}</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.bankAccountId} value={acc.bankAccountId}>{acc.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-muted-foreground rounded-md border border-dashed border-border px-3 py-2">
                  {bankRequired
                    ? 'Cadastre uma conta bancária antes de criar um cartão de crédito ou débito.'
                    : 'Nenhuma conta bancária cadastrada.'}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="pc-color">Cor</Label>
            <div className="flex items-center gap-3">
              <input id="pc-color" type="color" value={color}
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
