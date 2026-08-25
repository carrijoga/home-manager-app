import { Tag } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { CategoryResponse } from '@/schemas/category';
import { TransactionType } from '@/schemas/enums';
import * as categoryService from '@/services/categoryService';

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  nestId?: string;
  onCategoryCreated?: (category: CategoryResponse) => void;
  defaultType?: number;
}

export function CreateCategoryModal({
  open,
  onClose,
  nestId,
  onCategoryCreated,
  defaultType = TransactionType.Expense,
}: CreateCategoryModalProps) {
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<number>(defaultType);
  const [description, setDescription] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName('');
      setType(defaultType);
      setDescription('');
      setSaving(false);
    }
  }, [open, defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || saving) return;

    setSaving(true);
    try {
      const created = await categoryService.createCategory(
        {
          name: trimmedName,
          type,
          description: description.trim() || undefined,
        },
        nestId
      );
      toast.success(`Categoria "${trimmedName}" cadastrada com sucesso!`);
      onCategoryCreated?.(created);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível cadastrar a categoria.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Tag className="size-5" />
            <DialogTitle className="text-base font-semibold">Nova Categoria</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Cadastre uma nova categoria de despesa ou receita para organizar seus lançamentos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-modal-name" className="text-xs font-medium">
              Nome da categoria <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-modal-name"
              placeholder="Ex: Assinaturas, Mercado, Freelance..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Tipo de Lançamento</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType(TransactionType.Expense)}
                className={cn(
                  'flex-1 rounded-md border py-2 text-xs font-medium transition-colors',
                  type === TransactionType.Expense
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'border-border/50 text-muted-foreground hover:bg-muted/50'
                )}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setType(TransactionType.Income)}
                className={cn(
                  'flex-1 rounded-md border py-2 text-xs font-medium transition-colors',
                  type === TransactionType.Income
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-border/50 text-muted-foreground hover:bg-muted/50'
                )}
              >
                Receita
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-modal-desc" className="text-xs font-medium">
              Descrição <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="cat-modal-desc"
              placeholder="Detalhes ou finalidade desta categoria"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving || !name.trim()}>
              {saving ? 'Cadastrando...' : 'Cadastrar Categoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
