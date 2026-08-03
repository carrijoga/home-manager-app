import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { ApiPaymentMethod, FinancialSourceType } from '@/schemas/enums';
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
export function PaymentModal({ open, onClose, transaction, currentUserId, nestId, onSubmit }: PaymentModalProps) {
  const remaining = transaction ? Math.max(Number(transaction.value) - getPaidAmount(transaction), 0) : 0;

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
  }, [open, transaction]);

  useEffect(() => {
    if (!open) return;
    bankAccountService.listBankAccounts(nestId)
      .then(setBankAccounts)
      .catch(() => {});
    paymentCardService.listPaymentCards(nestId)
      .then(setPaymentCards)
      .catch(() => {});
  }, [open, nestId]);

  const sourceDomain = method !== null ? sourceDomainForMethod(method) : null;
  // BankAccountResponse não expõe isActive (confirmado em src/schemas/bank-account.ts) — lista tudo que o service retorna.
  const activeBankAccounts = bankAccounts;
  const activeCards = paymentCards.filter(c => c.isActive);

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
      setTimeout(() => onClose(), holdMs);
    } catch {
      setStatus('idle');
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
        </DialogHeader>

        <p className="font-ui text-sm text-muted-foreground -mt-2">
          {transaction.description} · restante <b className="text-foreground">{formatCurrency(remaining)}</b>
        </p>

        <form onSubmit={e => { void handleSubmit(e).catch(() => {}); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="pay-amount">Valor pago</Label>
              <MoneyInput id="pay-amount" value={amount} onChange={setAmount} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pay-date">Data</Label>
              <Input id="pay-date" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="pay-method">Método</Label>
            <Select
              value={method !== null ? String(method) : undefined}
              onValueChange={v => handleMethodChange(Number(v))}
            >
              <SelectTrigger id="pay-method">
                <SelectValue placeholder="Selecionar…" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="pay-source">
              {sourceDomain === FinancialSourceType.CreditCard ? 'Cartão' : 'Conta'}
            </Label>
            <SourcePicker
              domain={sourceDomain ?? FinancialSourceType.BankAccount}
              bankAccounts={activeBankAccounts}
              cards={activeCards}
              value={sourceId}
              onChange={setSourceId}
              disabled={method === null}
            />
          </div>

          <Collapsible>
            <CollapsibleTrigger className="group flex items-center gap-1 font-ui text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown size={14} strokeWidth={1.5} className="transition-transform group-data-[state=open]:rotate-180" /> Mais detalhes (desconto, juros, observação)
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="pay-discount">Desconto</Label>
                  <MoneyInput id="pay-discount" value={discount} onChange={setDiscount} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pay-interest">Juros</Label>
                  <MoneyInput id="pay-interest" value={interest} onChange={setInterest} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="pay-observation">Observação</Label>
                <Textarea
                  id="pay-observation"
                  rows={2}
                  value={observation}
                  onChange={e => setObservation(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={status !== 'idle'}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={status === 'submitting' || (status === 'idle' && !isValid)}
              className={status === 'success' ? 'bg-[var(--chart-2)] hover:bg-[var(--chart-2)] text-white' : undefined}
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
                    Pago!
                  </motion.span>
                ) : (
                  <motion.span key="label">
                    {status === 'submitting' ? 'Registrando…' : 'Confirmar pagamento'}
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
