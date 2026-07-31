import { useState } from 'react';

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui';
import type { BankAccountResponse } from '@/schemas/bank-account';

export interface DeleteAccountDialogProps {
  open: boolean;
  account: BankAccountResponse | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteAccountDialog({ open, account, onClose, onConfirm }: DeleteAccountDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  // Este diálogo só é aberto quando canDelete=true (o botão Excluir já vem
  // desabilitado caso contrário) — logo, pela regra de negócio (API-45),
  // qualquer cartão vinculado aqui é necessariamente "vazio" (sem lançamento),
  // senão a exclusão da conta estaria bloqueada. Não é preciso um campo novo
  // da API para essa contagem.
  const emptyCardsCount = account?.paymentCards.length ?? 0;

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
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir conta</AlertDialogTitle>
          <AlertDialogDescription>
            {emptyCardsCount > 0
              ? `Tem certeza que deseja excluir "${account?.name ?? ''}"? ${emptyCardsCount} cartão(ões) vazio(s) vinculado(s) também será(ão) excluído(s). Esta ação não pode ser desfeita.`
              : `Tem certeza que deseja excluir "${account?.name ?? ''}"? Esta ação não pode ser desfeita.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={(e) => { e.preventDefault(); void handleConfirm(); }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {submitting ? 'Excluindo…' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
