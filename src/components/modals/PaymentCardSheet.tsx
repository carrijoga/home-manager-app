import { HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cardGradient } from '@/components/modules/financial/payment-card/gradient';
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
    payload: UpdateCreditPaymentCardSettingsRequest
  ) => Promise<void>;
}

const DEFAULT_COLOR = '#c2613f';
const CARD_TYPE_OPTIONS = [CardType.Credit, CardType.Debit, CardType.Prepaid, CardType.Other];

export function PaymentCardSheet({
  open,
  onClose,
  card,
  bankAccounts,
  onCreate,
  onUpdateDetails,
  onUpdateCreditSettings,
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
  const activeBankAccounts = bankAccounts.filter((acc) => acc.isActive);

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
          bankAccountId: showBank ? bankAccountId || null : null,
          creditLimit: isCredit ? Number(limit) : null,
          dueDay: isCredit && day(dueDay) ? Number(dueDay) : null,
          closingDay: isCredit && day(closingDay) ? Number(closingDay) : null,
          previousBalance: isCredit ? Number(previousBalance) || 0 : null,
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
        side={isMobile ? 'bottom' : 'right'}
        className={
          isMobile
            ? 'max-h-[92dvh] overflow-y-auto rounded-t-2xl px-5 pb-6 pt-3 focus:outline-none'
            : 'w-full overflow-y-auto px-7 pb-7 pt-5 focus:outline-none sm:w-[500px] sm:max-w-xl md:w-[540px]'
        }
      >
        {isMobile && <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" aria-hidden />}

        <form
          onSubmit={(e) => {
            void handleSubmit(e).catch(() => {});
          }}
          className="space-y-4"
        >
          <SheetTitle className="text-lg font-semibold text-foreground">
            {isEdit ? 'Editar cartão' : 'Novo cartão'}
          </SheetTitle>

          <div
            className="flex h-20 items-end rounded-2xl p-3 text-white"
            style={{ background: cardGradient(color) }}
          >
            <span className="text-sm font-semibold drop-shadow-sm">{name || 'Nome do cartão'}</span>
          </div>

          {/* Tipo de cartão — só na criação (o tipo é imutável após criado) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label
                htmlFor="pc-type"
                className="text-xs uppercase tracking-wide text-muted-foreground"
              >
                Tipo de cartão
              </Label>
              <Select
                value={String(cardType)}
                onValueChange={(v) => setCardType(Number(v) as CardType)}
              >
                <SelectTrigger id="pc-type" className="border-border/40 bg-muted/30">
                  <SelectValue placeholder="Selecionar…" />
                </SelectTrigger>
                <SelectContent>
                  {CARD_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={String(t)}>
                      {CARD_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="pc-name"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Nome
            </Label>
            <Input
              id="pc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nubank"
              className="border-border/40 bg-muted/30"
            />
          </div>

          {/* Config. de crédito — só p/ Credit (criação e edição) */}
          {isCredit && (
            <>
              <div className="space-y-1.5">
                <Label
                  htmlFor="pc-limit"
                  className="text-xs uppercase tracking-wide text-muted-foreground"
                >
                  Limite (R$)
                </Label>
                <Input
                  id="pc-limit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="5000"
                  className="border-border/40 bg-muted/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="pc-due"
                    className="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Dia de vencimento
                  </Label>
                  <Input
                    id="pc-due"
                    type="number"
                    min="1"
                    max="28"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="border-border/40 bg-muted/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="pc-closing"
                    className="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Dia de fechamento
                  </Label>
                  <Input
                    id="pc-closing"
                    type="number"
                    min="1"
                    max="28"
                    value={closingDay}
                    onChange={(e) => setClosingDay(e.target.value)}
                    className="border-border/40 bg-muted/30"
                  />
                </div>
              </div>

              {!isEdit && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="pc-prev"
                    className="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Saldo anterior (R$)
                  </Label>
                  <Input
                    id="pc-prev"
                    type="number"
                    min="0"
                    step="0.01"
                    value={previousBalance}
                    onChange={(e) => setPreviousBalance(e.target.value)}
                    className="border-border/40 bg-muted/30"
                  />
                </div>
              )}
            </>
          )}

          {/* Conta vinculada — Credit/Debit/Prepaid (não Other), só na criação */}
          {!isEdit && showBank && (
            <div className="space-y-1.5">
              <Label
                htmlFor="pc-bank"
                className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground"
              >
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
              {activeBankAccounts.length > 0 ? (
                <Select value={bankAccountId} onValueChange={setBankAccountId}>
                  <SelectTrigger id="pc-bank" className="border-border/40 bg-muted/30">
                    <SelectValue placeholder="Selecionar…" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBankAccounts.map((acc) => (
                      <SelectItem key={acc.bankAccountId} value={acc.bankAccountId}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                  {bankRequired
                    ? 'Cadastre uma conta bancária ativa antes de criar um cartão de crédito ou débito.'
                    : 'Nenhuma conta bancária ativa cadastrada.'}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="pc-color"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Cor
            </Label>
            <div className="flex items-center gap-3">
              <input
                id="pc-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background"
              />
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
