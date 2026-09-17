import { ArrowLeftRight, ArrowRight, Info, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import MoneyInput from '@/components/common/MoneyInput';
import { accountTypeLabel } from '@/components/modules/financial/account/accountType';
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import type { BankAccountResponse, TransferBankAccountRequest } from '@/schemas/bank-account';
import { formatCurrency } from '@/utils/dashboardMetrics';

export interface TransferAccountDialogProps {
  open: boolean;
  accounts: BankAccountResponse[];
  defaultSourceId?: string | null;
  onClose: () => void;
  onConfirm: (payload: TransferBankAccountRequest) => Promise<void>;
}

export function TransferAccountDialog({
  open,
  accounts,
  defaultSourceId,
  onClose,
  onConfirm,
}: TransferAccountDialogProps) {
  const activeAccounts = useMemo(() => accounts.filter((a) => a.isActive), [accounts]);

  const [sourceId, setSourceId] = useState<string>('');
  const [destinationId, setDestinationId] = useState<string>('');
  const [amount, setAmount] = useState<number | null>(null);
  const [observation, setObservation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const initialSource =
      defaultSourceId && activeAccounts.some((a) => a.bankAccountId === defaultSourceId)
        ? defaultSourceId
        : (activeAccounts[0]?.bankAccountId ?? '');

    const initialDest =
      activeAccounts.find((a) => a.bankAccountId !== initialSource)?.bankAccountId ?? '';

    setSourceId(initialSource);
    setDestinationId(initialDest);
    setAmount(null);
    setObservation('');
    setError(null);
    setSubmitting(false);
  }, [open, defaultSourceId, activeAccounts]);

  const sourceAccount = activeAccounts.find((a) => a.bankAccountId === sourceId);
  const destAccount = activeAccounts.find((a) => a.bankAccountId === destinationId);
  const sourceBalance = sourceAccount ? Number(sourceAccount.balance) : 0;

  const isSameAccount = Boolean(sourceId && destinationId && sourceId === destinationId);
  const isAmountValid = amount !== null && amount > 0;
  const isValid = Boolean(sourceId && destinationId && !isSameAccount && isAmountValid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !destinationId) {
      setError('Selecione as contas de origem e destino.');
      return;
    }
    if (isSameAccount) {
      setError('A conta de origem e de destino não podem ser a mesma.');
      return;
    }
    if (!isAmountValid) {
      setError('O valor da transferência deve ser maior que zero.');
      return;
    }
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      await onConfirm({
        sourceBankAccountId: sourceId,
        destinationBankAccountId: destinationId,
        amount: amount!,
        observation: observation.trim() || undefined,
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível realizar a transferência.';
      setError(msg);
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
        hideBuiltinClose
        className="max-h-[92dvh] overflow-y-auto rounded-t-3xl border-border bg-card p-5 sm:max-w-lg sm:rounded-3xl sm:p-6 mx-auto"
      >
        <div className="mx-auto -mt-1 mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/25 sm:hidden" />
        <SheetHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <ArrowLeftRight className="size-5" />
              <SheetTitle className="text-lg font-bold text-foreground">Transferir entre Contas</SheetTitle>
            </div>
            <SheetDescription className="mt-1 text-xs text-muted-foreground">
              Transfira saldo instantaneamente entre contas bancárias do seu ninho.
            </SheetDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Seletor Conta de Origem */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="transfer-source"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Conta de Origem <span className="text-destructive">*</span>
              </Label>
              {sourceAccount && (
                <span className="text-[11px] text-muted-foreground">
                  Saldo atual:{' '}
                  <strong className="font-semibold text-foreground">
                    {formatCurrency(sourceBalance)}
                  </strong>
                </span>
              )}
            </div>
            <Select
              value={sourceId}
              onValueChange={(val) => {
                setSourceId(val);
                setError(null);
              }}
            >
              <SelectTrigger id="transfer-source" className="h-12 w-full rounded-2xl border-border/40 bg-muted/30 text-sm">
                <SelectValue placeholder="Selecione a conta de origem" />
              </SelectTrigger>
              <SelectContent>
                {activeAccounts.map((acc) => (
                  <SelectItem key={acc.bankAccountId} value={acc.bankAccountId}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: acc.color }}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-foreground">{acc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({accountTypeLabel(acc.type)} · {formatCurrency(Number(acc.balance))})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Indicador visual de transferência */}
          <div className="flex items-center justify-center -my-1 text-muted-foreground">
            <ArrowRight size={16} className="rotate-90 text-primary sm:rotate-0" />
          </div>

          {/* Seletor Conta de Destino */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="transfer-destination"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Conta de Destino <span className="text-destructive">*</span>
              </Label>
              {destAccount && (
                <span className="text-[11px] text-muted-foreground">
                  Saldo atual:{' '}
                  <strong className="font-semibold text-foreground">
                    {formatCurrency(Number(destAccount.balance))}
                  </strong>
                </span>
              )}
            </div>
            <Select
              value={destinationId}
              onValueChange={(val) => {
                setDestinationId(val);
                setError(null);
              }}
            >
              <SelectTrigger id="transfer-destination" className="h-12 w-full rounded-2xl border-border/40 bg-muted/30 text-sm">
                <SelectValue placeholder="Selecione a conta de destino" />
              </SelectTrigger>
              <SelectContent>
                {activeAccounts.map((acc) => (
                  <SelectItem key={acc.bankAccountId} value={acc.bankAccountId}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: acc.color }}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-foreground">{acc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({accountTypeLabel(acc.type)})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Validação visual de contas iguais */}
          {isSameAccount && (
            <p className="text-[11px] text-destructive font-medium">
              A conta de destino deve ser diferente da conta de origem.
            </p>
          )}

          {/* Valor da transferência */}
          <div className="space-y-1.5">
            <Label
              htmlFor="transfer-amount"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Valor da transferência <span className="text-destructive">*</span>
            </Label>
            <MoneyInput
              id="transfer-amount"
              value={amount}
              onChange={(val) => {
                setAmount(val);
                setError(null);
              }}
              allowNegative={false}
              placeholder="R$ 0,00"
              className="h-12 rounded-2xl border-border/60 bg-muted/20 text-base font-semibold"
            />
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <Label
              htmlFor="transfer-observation"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Observação <span className="font-normal normal-case tracking-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="transfer-observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ex: Reserva de emergência, divisão de despesas..."
              rows={2}
              className="resize-none rounded-2xl border-border/60 bg-muted/20 text-sm"
            />
          </div>

          {/* Informações da transferência */}
          <div className="flex items-start gap-2 rounded-xl border border-border/50 bg-muted/20 p-2.5 text-xs text-muted-foreground">
            <Info size={14} className="mt-0.5 shrink-0 text-primary" />
            <p className="leading-relaxed">
              O saldo será debitado da conta de origem e creditado na conta de destino, gerando uma transação do tipo Transferência.
            </p>
          </div>

          {/* Erro inline retornado do backend ou validação */}
          {error && (
            <p className="rounded-lg bg-destructive/10 p-2.5 text-xs font-medium text-destructive border border-destructive/20">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors"
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
                  Transferindo…
                </span>
              ) : (
                'Confirmar Transferência'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
