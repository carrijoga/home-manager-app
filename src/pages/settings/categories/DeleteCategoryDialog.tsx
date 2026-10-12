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
import { useTranslation } from '@/hooks/useTranslation';
import { getCurrentLanguage, getDefaultErrorMessage, getErrorMessageByCode } from '@/i18n';
import type { CategoryResponse, CategoryUsageResponse } from '@/schemas/category';
import * as categoryService from '@/services/categoryService';

const KNOWN_MODULES = ['FinancialTransactions', 'NestConfiguration', 'ShoppingItems', 'Tasks'];

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
  const { t } = useTranslation();
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
        const message = err instanceof Error ? err.message : t('categoriesSettings.deleteDialog.usageError');
        setLoadError(message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category.categoryId]);

  const handleConfirm = async () => {
    if (saving || !usage?.canDelete) return;
    setSaving(true);
    try {
      await onConfirm(category.categoryId);
      toast.success(t('categoriesSettings.deleteDialog.deleted'));
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('categoriesSettings.deleteDialog.deleteError');
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
          <AlertDialogTitle>{t('categoriesSettings.deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                {t('categoriesSettings.deleteDialog.confirm', {
                  label: `${category.icon} ${category.name}`,
                })}
              </p>

              {!usage && !loadError && (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>{t('categoriesSettings.deleteDialog.checking')}</span>
                </div>
              )}

              {loadError && <p className="text-destructive">{loadError}</p>}

              {usage && (
                <>
                  {usagesWithCount.length > 0 && (
                    <ul className="list-inside list-disc">
                      {usagesWithCount.map((u) => (
                        <li key={u.module}>
                          {t('categoriesSettings.deleteDialog.usedIn', {
                            count: u.count,
                            module: KNOWN_MODULES.includes(u.module)
                              ? t(`categoriesSettings.modules.${u.module}`)
                              : u.module,
                          })}
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
                    <p>{t('categoriesSettings.deleteDialog.softUsage')}</p>
                  )}

                  {usage.canDelete && usagesWithCount.length === 0 && (
                    <p>{t('categoriesSettings.deleteDialog.irreversible')}</p>
                  )}
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>{t('categoriesSettings.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            disabled={saving || !usage?.canDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {saving ? t('categoriesSettings.form.saving') : t('categoriesSettings.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
