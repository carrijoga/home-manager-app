import { MessageSquare, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { ApiPriority } from '@/types';

interface CreateNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (message: string, noteId?: string, priority?: ApiPriority) => Promise<void>;
  initialData?: { id?: string; message: string; priority?: ApiPriority } | null;
}

export function CreateNoteModal({ open, onClose, onSave, initialData }: CreateNoteModalProps) {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<ApiPriority>(ApiPriority.Baixa);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (open) {
      setMessage(initialData?.message || '');
      setPriority(initialData?.priority ?? ApiPriority.Baixa);
    }
  }, [open, initialData]);

  const handleClose = () => {
    setMessage('');
    setPriority(ApiPriority.Baixa);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onSave(trimmed, initialData?.id, priority);
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
      <DialogContent hideBuiltinClose className="sm:max-w-[460px] rounded-2xl border border-border/60 p-6">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 text-primary">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <MessageSquare className="size-4" />
              </div>
              <DialogTitle className="text-base font-semibold">
                {isEditing ? 'Editar recado' : 'Criar recado'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Escreva um recado para a família ou fixe avisos importantes.
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground shrink-0"
            aria-label="Fechar"
          >
            <X className="size-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="note-message" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mensagem <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="note-message"
              placeholder="Escreva seu recado para a família..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              autoFocus
              className="rounded-xl bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note-priority" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Prioridade
            </Label>
            <Select
              value={String(priority)}
              onValueChange={(val) => setPriority(Number(val) as ApiPriority)}
            >
              <SelectTrigger
                id="note-priority"
                className="h-10 rounded-xl bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
              >
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(ApiPriority.Urgente)}>🔴 Urgente</SelectItem>
                <SelectItem value={String(ApiPriority.Alta)}>🟠 Alta</SelectItem>
                <SelectItem value={String(ApiPriority.Media)}>🟡 Média</SelectItem>
                <SelectItem value={String(ApiPriority.Baixa)}>🟢 Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-9 rounded-xl border-border/60"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !message.trim()}
              className="h-9 rounded-xl font-medium shadow-xs"
            >
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
