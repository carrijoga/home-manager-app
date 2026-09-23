import { Tag, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
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
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        hideBuiltinClose
        className="max-h-[92dvh] overflow-y-auto rounded-t-3xl border-border bg-card p-5 sm:max-w-md sm:rounded-3xl sm:p-6 mx-auto"
      >
        <div className="mx-auto -mt-1 mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/25 sm:hidden" />
        <SheetHeader className="flex flex-row items-start justify-between space-y-0 text-left pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 text-primary">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Tag className="size-4" />
              </div>
              <SheetTitle className="text-base sm:text-lg font-bold">Nova Categoria</SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground pt-1">
              Cadastre uma nova categoria de despesa ou receita para organizar seus lançamentos.
            </SheetDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground shrink-0"
            aria-label="Fechar"
          >
            <X className="size-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-modal-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nome da categoria <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-modal-name"
              placeholder="Ex: Assinaturas, Mercado, Freelance..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              className="h-12 rounded-2xl bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors text-sm"
            />
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tipo de Lançamento
            </Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType(TransactionType.Expense)}
                className={cn(
                  'flex-1 rounded-xl border py-2 text-xs font-medium transition-colors',
                  type === TransactionType.Expense
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold shadow-2xs'
                    : 'border-border/50 text-muted-foreground hover:bg-muted/50'
                )}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setType(TransactionType.Income)}
                className={cn(
                  'flex-1 rounded-xl border py-2 text-xs font-medium transition-colors',
                  type === TransactionType.Income
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs'
                    : 'border-border/50 text-muted-foreground hover:bg-muted/50'
                )}
              >
                Receita
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-modal-desc" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="cat-modal-desc"
              placeholder="Detalhes ou finalidade desta categoria"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-2xl bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors resize-none text-sm"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !name.trim()}
              className="h-12 flex-[2] rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                'Cadastrar Categoria'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
