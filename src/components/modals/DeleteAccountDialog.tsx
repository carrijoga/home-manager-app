import { useEffect, useState } from 'react';

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui';
import type { BankAccountResponse } from '@/schemas/bank-account';
import { canDeleteBankAccount } from '@/services/bankAccountService';

export interface DeleteAccountDialogProps {
  open: boolean;
  account: BankAccountResponse | null;
  nestId?: string;
  onClose: () => void;
  onConfirm: (confirmDeletion: boolean) => Promise<void>;
}

export function DeleteAccountDialog({ open, account, nestId, onClose, onConfirm }: DeleteAccountDialogProps) {
  const [checking, setChecking] = useState(false);
  const [linkedCount, setLinkedCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !account) return;
    let active = true;
    setChecking(true);
    setLinkedCount(0);
    canDeleteBankAccount(account.bankAccountId, nestId)
      .then((res) => { if (active) setLinkedCount(Number(res.linkedTransactionsCount)); })
      .catch(() => { if (active) setLinkedCount(0); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [open, account, nestId]);

  const hasLinked = linkedCount > 0;

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(hasLinked);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir conta</AlertDialogTitle>
          <AlertDialogDescription>
            {checking
              ? 'Verificando transações vinculadas…'
              : hasLinked
                ? `Esta conta tem ${linkedCount} transação(ões) vinculada(s). Excluir a conta também excluirá essas transações. Esta ação não pode ser desfeita.`
                : `Tem certeza que deseja excluir "${account?.name ?? ''}"? Esta ação não pode ser desfeita.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={checking || submitting}
            onClick={(e) => { e.preventDefault(); void handleConfirm(); }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {submitting ? 'Excluindo…' : hasLinked ? 'Excluir conta e transações' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
