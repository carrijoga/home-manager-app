import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui';
import type { BankAccountResponse } from '@/schemas/bank-account';

export interface InactivateAccountDialogProps {
  open: boolean;
  account: BankAccountResponse | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function InactivateAccountDialog({
  open,
  account,
  onClose,
  onConfirm,
}: InactivateAccountDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const linkedCardsCount = account?.paymentCards.length ?? 0;

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Inativar conta</AlertDialogTitle>
          <AlertDialogDescription>
            {linkedCardsCount > 0
              ? `"${account?.name ?? ''}" será inativada. ${linkedCardsCount} cartão(ões) vinculado(s) também será(ão) inativado(s).`
              : `Tem certeza que deseja inativar "${account?.name ?? ''}"?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
          >
            {submitting ? 'Inativando…' : 'Inativar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
