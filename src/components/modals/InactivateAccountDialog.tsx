import { AlertTriangle } from 'lucide-react';
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
      <AlertDialogContent className="rounded-2xl sm:rounded-3xl border border-border/60 p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
            <AlertTriangle className="size-5" />
            Inativar conta
          </AlertDialogTitle>
          <AlertDialogDescription>
            {linkedCardsCount > 0
              ? `"${account?.name ?? ''}" será inativada. ${linkedCardsCount} cartão(ões) vinculado(s) também será(ão) inativado(s).`
              : `Tem certeza que deseja inativar "${account?.name ?? ''}"?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 pt-3 border-t border-border/40 sm:space-x-0">
          <AlertDialogCancel disabled={submitting} className="h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors mt-0">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            className="h-12 flex-[2] rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            {submitting ? 'Inativando…' : 'Inativar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
