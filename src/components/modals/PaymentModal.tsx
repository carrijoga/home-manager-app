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
import { ApiPaymentMethod } from '@/schemas/enums';
import type { AddPaymentRequest, FinancialTransactionResponse } from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { getPaidAmount } from '@/utils/financialUtils';

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
  onSubmit: (payload: AddPaymentRequest) => Promise<void>;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Registrar pagamento — pré-preenchido com o valor restante, hoje, usuário atual e PIX. */
export function PaymentModal({ open, onClose, transaction, currentUserId, onSubmit }: PaymentModalProps) {
  const remaining = transaction ? Math.max(Number(transaction.value) - getPaidAmount(transaction), 0) : 0;

  const [amount, setAmount] = useState<number | null>(null);
  const [paymentDate, setPaymentDate] = useState(todayIso());
  const [method, setMethod] = useState<number>(ApiPaymentMethod.Pix);
  const [discount, setDiscount] = useState<number | null>(null);
  const [interest, setInterest] = useState<number | null>(null);
  const [observation, setObservation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !transaction) return;
    setAmount(Math.max(Number(transaction.value) - getPaidAmount(transaction), 0));
    setPaymentDate(todayIso());
    setMethod(ApiPaymentMethod.Pix);
    setDiscount(null);
    setInterest(null);
    setObservation('');
  }, [open, transaction]);

  if (!transaction) return null;

  const isValid = amount !== null && amount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        transactionId: transaction.financialTransactionId,
        amount: amount as number,
        discount: discount ?? undefined,
        interest: interest ?? undefined,
        method,
        paymentDate: new Date(`${paymentDate}T12:00:00`).toISOString(),
        paidByUserId: currentUserId,
        observation: observation.trim() || null,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
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
            <Select value={String(method)} onValueChange={v => setMethod(Number(v))}>
              <SelectTrigger id="pay-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? 'Registrando…' : 'Confirmar pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
