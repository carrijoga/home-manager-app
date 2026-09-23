import { useEffect, useState } from 'react';
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
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import { useApp } from '@/contexts/AppContext';
import { getCurrentLanguage, getDefaultErrorMessage, getErrorMessageByCode } from '@/i18n';
import type { CategoryResponse, CategoryUsageResponse } from '@/schemas/category';
import * as categoryService from '@/services/categoryService';

const MODULE_LABELS: Record<string, string> = {
  FinancialTransactions: 'transações',
  NestConfiguration: 'configuração do ninho',
  ShoppingItems: 'itens de compra',
  Tasks: 'tarefas',
};

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  category: CategoryResponse;
  onConfirm: (id: string) => Promise<void>;
}) {
  const { activeNestId } = useApp();
  const [usage, setUsage] = useState<CategoryUsageResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUsage(null);
    setLoadError(null);
    categoryService
      .getCategoryUsage(activeNestId ?? undefined, category.categoryId)
      .then(setUsage)
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Não foi possível verificar o uso da categoria.';
        setLoadError(message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category.categoryId]);

  const handleConfirm = async () => {
    if (saving || !usage?.canDelete) return;
    setSaving(true);
    try {
      await onConfirm(category.categoryId);
      toast.success('Categoria excluída.');
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível excluir a categoria.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const usagesWithCount = usage?.usages.filter((u) => u.count > 0) ?? [];
  const hasSoftUsage = usagesWithCount.some(
    (u) => (u.module === 'ShoppingItems' || u.module === 'Tasks') && u.count > 0
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Tem certeza que deseja excluir &ldquo;{category.icon} {category.name}&rdquo;?
              </p>

              {!usage && !loadError && (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Verificando uso…</span>
                </div>
              )}

              {loadError && <p className="text-destructive">{loadError}</p>}

              {usage && (
                <>
                  {usagesWithCount.length > 0 && (
                    <ul className="list-inside list-disc">
                      {usagesWithCount.map((u) => (
                        <li key={u.module}>
                          Usada em {u.count} {MODULE_LABELS[u.module] ?? u.module}
                        </li>
                      ))}
                    </ul>
                  )}

                  {!usage.canDelete && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-destructive">
                      {usage.blockingReason
                        ? (getErrorMessageByCode(usage.blockingReason, getCurrentLanguage()) ??
                          getDefaultErrorMessage(getCurrentLanguage()))
                        : getDefaultErrorMessage(getCurrentLanguage())}
                    </div>
                  )}

                  {usage.canDelete && hasSoftUsage && (
                    <p>Esses itens ficarão sem categoria.</p>
                  )}

                  {usage.canDelete && usagesWithCount.length === 0 && (
                    <p>Esta ação não pode ser desfeita.</p>
                  )}
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            disabled={saving || !usage?.canDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {saving ? 'Salvando…' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
