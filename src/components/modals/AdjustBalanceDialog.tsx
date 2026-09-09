import { DollarSign, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

import MoneyInput from '@/components/common/MoneyInput';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
} from '@/components/ui';
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
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <DollarSign className="size-5" />
            <DialogTitle className="text-base font-semibold">Alterar Saldo</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Defina manualmente um novo saldo para a conta{' '}
            {account?.name ? `"${account.name}"` : ''}.
          </DialogDescription>
        </DialogHeader>

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
            <Label htmlFor="adjust-new-balance" className="text-xs font-medium">
              Novo saldo desejado <span className="text-destructive">*</span>
            </Label>
            <MoneyInput
              id="adjust-new-balance"
              value={newBalance}
              onChange={setNewBalance}
              allowNegative
              placeholder="R$ 0,00"
              className="border-border/60 bg-muted/20 text-base font-semibold"
            />
          </div>

          {/* Campo Observação */}
          <div className="space-y-1.5">
            <Label htmlFor="adjust-observation" className="text-xs font-medium">
              Observação <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="adjust-observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ex: Reconciliação com extrato do banco"
              rows={2}
              className="resize-none border-border/60 bg-muted/20"
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

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={submitting || !isValid}>
              {submitting ? 'Salvando…' : 'Confirmar Ajuste'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
