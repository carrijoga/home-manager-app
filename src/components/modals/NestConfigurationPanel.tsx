import { AlertTriangle, Info, Save, ShieldAlert, ShoppingBag } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui';
import type { CategoryResponse } from '@/schemas/category';
import { NestRole, TransactionType } from '@/schemas/enums';
import * as categoryService from '@/services/categoryService';
import * as nestService from '@/services/nestService';
import type { AppUserNest } from '@/types';

interface NestConfigurationPanelProps {
  nest: AppUserNest;
}

export function NestConfigurationPanel({ nest }: NestConfigurationPanelProps) {
  const isOwnerOrAdmin = nest.role === NestRole.Owner || nest.role === NestRole.Admin;

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [categories, setCategories] = React.useState<CategoryResponse[]>([]);

  const [finishedShoppingListGenerateFinancial, setFinishedShoppingListGenerateFinancial] =
    React.useState(false);
  const [defaultShoppingExpenseCategoryId, setDefaultShoppingExpenseCategoryId] = React.useState<
    string | null
  >(null);

  const fetchConfiguration = React.useCallback(async () => {
    setLoading(true);
    try {
      const [configData, catsData] = await Promise.all([
        nestService.getNestConfiguration(nest.nestId),
        categoryService.listCategories({ types: [TransactionType.Expense] }, nest.nestId),
      ]);

      setFinishedShoppingListGenerateFinancial(
        configData.finishedShoppingListGenerateFinancial ?? false
      );
      setDefaultShoppingExpenseCategoryId(configData.defaultShoppingExpenseCategoryId ?? null);
      setCategories(catsData ?? []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[NestConfigurationPanel] Erro ao carregar configurações:', error);
      }
      toast.error('Não foi possível carregar as configurações do ninho.');
    } finally {
      setLoading(false);
    }
  }, [nest.nestId]);

  React.useEffect(() => {
    fetchConfiguration();
  }, [fetchConfiguration]);

  const isCategoryRequiredMissing =
    finishedShoppingListGenerateFinancial && !defaultShoppingExpenseCategoryId;

  const isSaveDisabled = !isOwnerOrAdmin || saving || loading || isCategoryRequiredMissing;

  const handleSave = async () => {
    if (isSaveDisabled) return;

    setSaving(true);
    try {
      await nestService.updateNestConfiguration(
        {
          finishedShoppingListGenerateFinancial,
          defaultShoppingExpenseCategoryId: finishedShoppingListGenerateFinancial
            ? defaultShoppingExpenseCategoryId
            : null,
        },
        nest.nestId
      );
      toast.success('Configurações do ninho atualizadas com sucesso!');
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Erro ao atualizar as configurações do ninho.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Configurações e Permissões</h3>
        <p className="text-xs text-muted-foreground">
          Gerencie regras de automação e preferências para este ninho.
        </p>
      </div>

      {!isOwnerOrAdmin && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-400">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-medium">Acesso restrito</p>
            <p className="opacity-90">
              Apenas o Dono ou Administradores podem alterar as configurações do ninho.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Carregando configurações...
          </div>
        </div>
      ) : (
        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary">
              <ShoppingBag className="size-4" />
              <CardTitle className="text-sm font-semibold">Automação de Compras</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Gere despesas financeiras automaticamente ao concluir listas de compras.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* Toggle */}
            <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5 bg-muted/30">
              <div className="space-y-0.5">
                <Label htmlFor="shopping-financial-toggle" className="text-sm font-medium">
                  Gerar despesa automaticamente ao finalizar lista de compras
                </Label>
                <p className="text-xs text-muted-foreground">
                  Cria um lançamento de despesa no módulo financeiro com o valor total dos itens comprados.
                </p>
              </div>
              <Switch
                id="shopping-financial-toggle"
                checked={finishedShoppingListGenerateFinancial}
                onCheckedChange={setFinishedShoppingListGenerateFinancial}
                disabled={!isOwnerOrAdmin || saving}
              />
            </div>

            {/* Informational Callout */}
            <div className="flex items-start gap-2.5 rounded-md border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-300">
              <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                Ao ativar, finalizar uma lista de compras gera automaticamente uma despesa na categoria selecionada, somando os itens marcados como comprados.
              </span>
            </div>

            {/* Category Select - visible & active when toggle is ON */}
            {finishedShoppingListGenerateFinancial && (
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="expense-category-select" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Categoria de despesa padrão <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={defaultShoppingExpenseCategoryId ?? ''}
                  onValueChange={(val) => setDefaultShoppingExpenseCategoryId(val || null)}
                  disabled={!isOwnerOrAdmin || saving}
                >
                  <SelectTrigger id="expense-category-select" className="w-full bg-muted/30 border-border/40 hover:border-border/80 transition-colors font-normal">
                    <SelectValue placeholder="Selecione uma categoria de despesa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="p-2 text-center text-xs text-muted-foreground">
                        Nenhuma categoria de despesa encontrada neste ninho.
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {isCategoryRequiredMissing && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="size-3 shrink-0" />
                    Selecione uma categoria para salvar quando a automação estiver ativa.
                  </p>
                )}
              </div>
            )}

            {/* Save Button */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaveDisabled}
                className="w-full sm:w-auto"
                size="sm"
              >
                {saving ? (
                  <>
                    <div className="mr-2 size-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-3.5" />
                    Salvar configurações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
