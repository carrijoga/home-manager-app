import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
} from '@/components/ui';

interface CreateNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (message: string, noteId?: string) => Promise<void>;
  initialData?: { id?: string; message: string } | null;
}

export function CreateNoteModal({ open, onClose, onSave, initialData }: CreateNoteModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (open) {
      setMessage(initialData?.message || '');
    }
  }, [open, initialData]);

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onSave(trimmed, initialData?.id);
      toast.success(isEditing ? 'Recado atualizado com sucesso!' : 'Recado criado com sucesso!');
      handleClose();
    } catch {
      toast.error(isEditing ? 'Erro ao atualizar recado.' : 'Erro ao criar recado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar recado' : 'Criar recado'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="note-message">Mensagem</Label>
            <Textarea
              id="note-message"
              placeholder="Escreva seu recado para a família..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting
                ? isEditing
                  ? 'Salvando...'
                  : 'Criando...'
                : isEditing
                  ? 'Salvar alterações'
                  : 'Criar recado'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
