import { DollarSign, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import MoneyInput from '@/components/common/MoneyInput';
import {
  Button,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import type { AdjustBalanceRequest, BankAccountResponse } from '@/schemas/bank-account';
import { formatCurrency } from '@/utils/dashboardMetrics';

export interface AdjustBalanceDialogProps {
  open: boolean;
  account: BankAccountResponse | null;
  onClose: () => void;
  onConfirm: (id: string, payload: AdjustBalanceRequest) => Promise<void>;
}

export function AdjustBalanceDialog({
  open,
  account,
  onClose,
  onConfirm,
}: AdjustBalanceDialogProps) {
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [observation, setObservation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentBalance = account ? Number(account.balance) : 0;

  useEffect(() => {
    if (open && account) {
      setNewBalance(Number(account.balance));
      setObservation('');
      setError(null);
      setSubmitting(false);
    }
  }, [open, account]);

  const isValid = newBalance !== null && !isNaN(newBalance);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !isValid || submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(account.bankAccountId, {
        newBalance,
        observation: observation.trim() || undefined,
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível alterar o saldo.';
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
        className="max-h-[92dvh] overflow-y-auto rounded-t-3xl border-border bg-card p-5 sm:max-w-md sm:rounded-3xl sm:p-6 mx-auto"
      >
        <div className="mx-auto -mt-1 mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/25 sm:hidden" />
        <SheetHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <DollarSign className="size-5" />
              <SheetTitle className="text-lg font-bold text-foreground">Alterar Saldo</SheetTitle>
            </div>
            <SheetDescription className="mt-1 text-xs text-muted-foreground">
              Defina manualmente um novo saldo para a conta{' '}
              {account?.name ? `"${account.name}"` : ''}.
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
          {/* Saldo atual (somente leitura) */}
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-3.5">
            <p className="font-ui text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Saldo atual da conta
            </p>
            <p
              className="font-editorial mt-1 text-2xl font-bold"
              style={{
                color:
                  currentBalance < 0
                    ? 'var(--destructive)'
                    : account?.isActive
                      ? 'var(--chart-2)'
                      : 'var(--muted-foreground)',
              }}
            >
              {formatCurrency(currentBalance)}
            </p>
          </div>

          {/* Campo Novo Saldo */}
          <div className="space-y-1.5">
            <Label
              htmlFor="adjust-new-balance"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Novo saldo desejado <span className="text-destructive">*</span>
            </Label>
            <MoneyInput
              id="adjust-new-balance"
              value={newBalance}
              onChange={setNewBalance}
              allowNegative
              placeholder="R$ 0,00"
              className="h-12 rounded-2xl border-border/60 bg-muted/20 text-base font-semibold"
            />
          </div>

          {/* Campo Observação */}
          <div className="space-y-1.5">
            <Label
              htmlFor="adjust-observation"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Observação <span className="font-normal normal-case tracking-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="adjust-observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ex: Reconciliação com extrato do banco"
              rows={2}
              className="resize-none rounded-2xl border-border/60 bg-muted/20 text-sm"
            />
          </div>

          {/* Aviso informativo de auditoria */}
          <div className="flex items-start gap-2 rounded-xl border border-border/50 bg-muted/20 p-2.5 text-xs text-muted-foreground">
            <Info size={14} className="mt-0.5 shrink-0 text-primary" />
            <p className="leading-relaxed">
              Este ajuste gera um registro interno de auditoria e não afeta os totais de
              receita/despesa do dashboard.
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 p-2 text-xs font-medium text-destructive">
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
                  Salvando…
                </span>
              ) : (
                'Confirmar Ajuste'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
