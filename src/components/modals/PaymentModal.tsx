import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import MoneyInput from '@/components/common/MoneyInput';
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { checkmarkVariants } from '@/lib/animations';
import type { BankAccountResponse } from '@/schemas/bank-account';
import { ApiPaymentMethod, CardType, FinancialSourceType } from '@/schemas/enums';
import type { AddPaymentRequest, FinancialTransactionResponse } from '@/schemas/financial';
import type { PaymentCardResponse } from '@/schemas/payment-card';
import * as bankAccountService from '@/services/bankAccountService';
import * as paymentCardService from '@/services/paymentCardService';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { getPaidAmount } from '@/utils/financialUtils';

import { SourcePicker } from './payment-modal/SourcePicker';

const PAYMENT_METHOD_OPTIONS = [
  { value: ApiPaymentMethod.Pix, label: 'PIX' },
  { value: ApiPaymentMethod.Cash, label: 'Dinheiro' },
  { value: ApiPaymentMethod.Debit, label: 'Débito' },
  { value: ApiPaymentMethod.Credit, label: 'Crédito' },
  { value: ApiPaymentMethod.Boleto, label: 'Boleto' },
  { value: ApiPaymentMethod.Other, label: 'Outro' },
];

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  transaction: FinancialTransactionResponse | null;
  currentUserId: string;
  nestId: string | undefined;
  onSubmit: (payload: AddPaymentRequest) => Promise<void>;
}

/** Domínio da origem derivado do método — mesma regra do backend (ADR 0001). */
function sourceDomainForMethod(method: number): number {
  return method === ApiPaymentMethod.Debit || method === ApiPaymentMethod.Credit
    ? FinancialSourceType.CreditCard
    : FinancialSourceType.BankAccount;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Registrar pagamento — Valor/Data pré-preenchidos, Método e origem exigem escolha explícita. */
export function PaymentModal({
  open,
  onClose,
  transaction,
  currentUserId,
  nestId,
  onSubmit,
}: PaymentModalProps) {
  const remaining = transaction
    ? Math.max(Number(transaction.value) - getPaidAmount(transaction), 0)
    : 0;

  const [amount, setAmount] = useState<number | null>(null);
  const [paymentDate, setPaymentDate] = useState(todayIso());
  const [method, setMethod] = useState<number | null>(null);
  const [sourceId, setSourceId] = useState('');
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [paymentCards, setPaymentCards] = useState<PaymentCardResponse[]>([]);
  const [discount, setDiscount] = useState<number | null>(null);
  const [interest, setInterest] = useState<number | null>(null);
  const [observation, setObservation] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const prefersReducedMotion = usePrefersReducedMotion();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open || !transaction) return;
    setAmount(Math.max(Number(transaction.value) - getPaidAmount(transaction), 0));
    setPaymentDate(todayIso());
    setMethod(null);
    setSourceId('');
    setDiscount(null);
    setInterest(null);
    setObservation('');
    setStatus('idle');
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, [open, transaction]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    bankAccountService
      .listBankAccounts(nestId)
      .then(setBankAccounts)
      .catch(() => {});
    paymentCardService
      .listPaymentCards(nestId)
      .then(setPaymentCards)
      .catch(() => {});
  }, [open, nestId]);
  const sourceDomain = method !== null ? sourceDomainForMethod(method) : null;
  const activeBankAccounts = bankAccounts.filter((a) => a.isActive);
  // Cartão também precisa bater o tipo com o método — Débito só mostra CardType.Debit,
  // Crédito só mostra CardType.Credit (Pré-pago/Outro não têm método de pagamento aqui).
  const cardTypeForMethod =
    method === ApiPaymentMethod.Debit
      ? CardType.Debit
      : method === ApiPaymentMethod.Credit
        ? CardType.Credit
        : null;
  const activeCards = paymentCards.filter((c) => c.isActive && c.type === cardTypeForMethod);

  const handleMethodChange = (newMethod: number) => {
    const newDomain = sourceDomainForMethod(newMethod);
    if (sourceDomain !== null && newDomain !== sourceDomain) setSourceId('');
    setMethod(newMethod);
  };

  if (!transaction) return null;

  const isValid = amount !== null && amount > 0 && method !== null && Boolean(sourceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || status !== 'idle' || method === null) return;
    setStatus('submitting');
    try {
      await onSubmit({
        transactionId: transaction.financialTransactionId,
        amount: amount as number,
        discount: discount ?? undefined,
        interest: interest ?? undefined,
        method,
        sourceId,
        paymentDate: new Date(`${paymentDate}T12:00:00`).toISOString(),
        paidByUserId: currentUserId,
        observation: observation.trim() || null,
      });
      setStatus('success');
      const holdMs = prefersReducedMotion ? 0 : 450;
      closeTimerRef.current = setTimeout(() => onClose(), holdMs);
    } catch {
      setStatus('idle');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="font-ui rounded-3xl border border-border/80 p-6 shadow-lg sm:max-w-[460px]">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 pb-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-chart-2/15 text-chart-2">
            <CheckCircle2 size={20} strokeWidth={2} />
          </div>
          <div>
            <DialogTitle className="font-editorial text-xl font-bold text-foreground">
              Registrar Pagamento
            </DialogTitle>
            <p className="font-ui text-xs text-muted-foreground">
              Baixa e liquidação de lançamento
            </p>
          </div>
        </DialogHeader>

        {/* Card do Lançamento & Restante */}
        <div className="my-1 flex items-center justify-between rounded-2xl border border-border/60 bg-muted/40 p-3.5">
          <div className="min-w-0 pr-2">
            <p className="font-ui text-xs font-medium text-muted-foreground">Lançamento</p>
            <p className="font-ui truncate text-sm font-bold text-foreground">
              {transaction.description}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-ui text-xs font-medium text-muted-foreground">Restante</p>
            <p className="font-ui text-sm font-extrabold text-chart-2">
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            void handleSubmit(e).catch(() => {});
          }}
          className="space-y-4 pt-1"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-amount" className="text-xs font-semibold">
                Valor a Pagar
              </Label>
              <MoneyInput id="pay-amount" value={amount} onChange={setAmount} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-date" className="text-xs font-semibold">
                Data do Pagamento
              </Label>
              <Input
                id="pay-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-method" className="text-xs font-semibold">
              Método de Pagamento
            </Label>
            <Select
              value={method !== null ? String(method) : undefined}
              onValueChange={(v) => handleMethodChange(Number(v))}
            >
              <SelectTrigger id="pay-method" className="rounded-xl text-xs">
                <SelectValue placeholder="Selecione o método (PIX, Dinheiro, Débito…)" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-source" className="text-xs font-semibold">
              {sourceDomain === FinancialSourceType.CreditCard
                ? 'Cartão de Origem'
                : 'Conta Bancária de Origem'}
            </Label>
            <SourcePicker
              id="pay-source"
              domain={sourceDomain ?? FinancialSourceType.BankAccount}
              bankAccounts={activeBankAccounts}
              cards={activeCards}
              value={sourceId}
              onChange={setSourceId}
              disabled={method === null}
            />
          </div>

          <Collapsible>
            <CollapsibleTrigger className="font-ui group flex items-center gap-1.5 pt-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">
              <ChevronDown
                size={14}
                strokeWidth={2}
                className="transition-transform group-data-[state=open]:rotate-180"
              />{' '}
              Mais detalhes (desconto, juros, observação)
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pay-discount" className="text-xs">
                    Desconto
                  </Label>
                  <MoneyInput id="pay-discount" value={discount} onChange={setDiscount} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pay-interest" className="text-xs">
                    Juros / Multa
                  </Label>
                  <MoneyInput id="pay-interest" value={interest} onChange={setInterest} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pay-observation" className="text-xs">
                  Observação / Comprovante
                </Label>
                <Textarea
                  id="pay-observation"
                  rows={2}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Informações adicionais do pagamento…"
                  className="rounded-xl text-xs"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={status !== 'idle'}
              className="rounded-xl text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={status === 'submitting' || (status === 'idle' && !isValid)}
              className={`rounded-xl text-xs font-semibold transition-all ${
                status === 'success'
                  ? 'bg-chart-2 text-white hover:bg-chart-2'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {status === 'success' ? (
                  <motion.span
                    key="success"
                    initial={{ scale: 1 }}
                    animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="flex items-center gap-1.5"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <motion.path
                        d="M4 12.5L9.5 18L20 6"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={checkmarkVariants}
                        initial="unchecked"
                        animate="checked"
                      />
                    </svg>
                    Pagamento Registrado!
                  </motion.span>
                ) : (
                  <motion.span key="label">
                    {status === 'submitting' ? 'Registrando…' : 'Confirmar Pagamento'}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
