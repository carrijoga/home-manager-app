import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
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
import type { AppUserNest } from '@/types';

interface CategoriesPanelProps {
  nest: AppUserNest;
}

type FilterType = 'all' | 'expense' | 'income';

export function CategoriesPanel({ nest }: CategoriesPanelProps) {
  const [categories, setCategories] = React.useState<CategoryResponse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<FilterType>('all');

  // Modal de Criação / Edição
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<CategoryResponse | null>(null);
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<number>(TransactionType.Expense);
  const [description, setDescription] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  // Modal de Exclusão
  const [deletingCategory, setDeletingCategory] = React.useState<CategoryResponse | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const loadCategories = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.listCategories(undefined, nest.nestId);
      setCategories(data ?? []);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[CategoriesPanel] Erro ao carregar categorias:', err);
      }
      toast.error('Erro ao carregar categorias do ninho.');
    } finally {
      setLoading(false);
    }
  }, [nest.nestId]);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleStartCreate = () => {
    setEditingCategory(null);
    setName('');
    setType(TransactionType.Expense);
    setDescription('');
    setIsFormOpen(true);
  };

  const handleStartEdit = (cat: CategoryResponse) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setDescription(cat.description ?? '');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setName('');
    setDescription('');
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || saving) return;

    setSaving(true);
    try {
      if (editingCategory) {
        // Atualizar
        const updated = await categoryService.updateCategory(
          editingCategory.categoryId,
          {
            name: trimmedName,
            type,
            description: description.trim() || undefined,
          },
          nest.nestId
        );
        toast.success(`Categoria "${trimmedName}" atualizada com sucesso!`);
        setCategories((prev) =>
          prev.map((c) => (c.categoryId === editingCategory.categoryId ? updated : c))
        );
      } else {
        // Criar
        const created = await categoryService.createCategory(
          {
            name: trimmedName,
            type,
            description: description.trim() || undefined,
          },
          nest.nestId
        );
        toast.success(`Categoria "${trimmedName}" criada com sucesso!`);
        setCategories((prev) => [...prev, created]);
      }

      handleCloseForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar categoria.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory || isDeleting) return;

    setIsDeleting(true);
    try {
      await categoryService.deleteCategory(deletingCategory.categoryId, nest.nestId);
      toast.success(`Categoria "${deletingCategory.name}" excluída.`);
      setCategories((prev) => prev.filter((c) => c.categoryId !== deletingCategory.categoryId));
      setDeletingCategory(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir categoria.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = React.useMemo(() => {
    if (filter === 'expense') return categories.filter((c) => c.type === TransactionType.Expense);
    if (filter === 'income') return categories.filter((c) => c.type === TransactionType.Income);
    return categories;
  }, [categories, filter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold">Categorias do Ninho</h3>
          <p className="text-xs text-muted-foreground">
            Gerencie as categorias de despesas e receitas utilizadas pela sua família.
          </p>
        </div>
        <Button type="button" size="sm" onClick={handleStartCreate} className="gap-1.5 self-start sm:self-auto">
          <Plus className="size-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Categorias List & Filtros */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                filter === 'all'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Todas ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('expense')}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                filter === 'expense'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Despesas ({categories.filter((c) => c.type === TransactionType.Expense).length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('income')}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                filter === 'income'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Receitas ({categories.filter((c) => c.type === TransactionType.Income).length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Carregando categorias...
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
            Nenhuma categoria encontrada neste filtro.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {filteredCategories.map((cat) => {
              const isExpense = cat.type === TransactionType.Expense;
              return (
                <div
                  key={cat.categoryId}
                  className="group flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-md border',
                        isExpense
                          ? 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      )}
                    >
                      <Tag className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1 truncate">
                      <p className="truncate text-sm font-medium text-foreground">{cat.name}</p>
                      {cat.description && (
                        <p className="truncate text-xs text-muted-foreground">{cat.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-semibold',
                        isExpense
                          ? 'border-rose-500/30 text-rose-600 dark:text-rose-400'
                          : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      )}
                    >
                      {isExpense ? 'Despesa' : 'Receita'}
                    </Badge>

                    {/* Action buttons (hover/focus) */}
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        aria-label="Editar categoria"
                        onClick={() => handleStartEdit(cat)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        aria-label="Excluir categoria"
                        onClick={() => setDeletingCategory(cat)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal limpa de Criação e Edição */}
      <Dialog open={isFormOpen} onOpenChange={(v) => !v && handleCloseForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <Tag className="size-5" />
              <DialogTitle className="text-base font-semibold">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {editingCategory
                ? `Altere as informações da categoria "${editingCategory.name}".`
                : 'Cadastre uma nova categoria de despesa ou receita para o ninho.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 py-1">
            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-dialog-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nome da Categoria <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat-dialog-name"
                placeholder="Ex: Transporte, Educação, Pet..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
                className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
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
                    'flex-1 rounded-md border py-2 text-xs font-medium transition-colors',
                    type === TransactionType.Expense
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
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
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'border-border/50 text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  Receita
                </button>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-dialog-desc" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="cat-dialog-desc"
                placeholder="Ex: Gastos com transporte público e combustível"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={handleCloseForm} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={saving || !name.trim()}>
                {saving ? 'Salvar...' : editingCategory ? 'Salvar Alterações' : 'Cadastrar Categoria'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <AlertDialog open={deletingCategory !== null} onOpenChange={(o) => !o && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria{' '}
              <strong className="text-foreground">&quot;{deletingCategory?.name}&quot;</strong>? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
