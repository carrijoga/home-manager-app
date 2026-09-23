import { MoreHorizontal, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/hooks/useCategories';
import { filterTree } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { type CategoryResponse, CategoryScope } from '@/schemas/category';

const SCOPES: Array<{ key: string; scope: CategoryScope; label: string }> = [
  { key: 'expense', scope: CategoryScope.Expense, label: 'Despesas' },
  { key: 'income', scope: CategoryScope.Income, label: 'Receitas' },
  { key: 'shopping', scope: CategoryScope.Shopping, label: 'Compras' },
  { key: 'task', scope: CategoryScope.Task, label: 'Tarefas' },
];

export type DialogState =
  | { kind: 'none' }
  | { kind: 'form'; mode: 'create'; parent: CategoryResponse | null }
  | { kind: 'form'; mode: 'edit'; category: CategoryResponse; parent: CategoryResponse | null }
  | { kind: 'move'; category: CategoryResponse; parent: CategoryResponse | null }
  | { kind: 'delete'; category: CategoryResponse };

export default function CategoriesSettings() {
  const [params, setParams] = useSearchParams();
  const current = SCOPES.find((s) => s.key === params.get('scope')) ?? SCOPES[0];
  const { tree, loading, error, reload } = useCategories(current.scope);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });
  void dialog; // usado por Tarefa 6 (diálogos)

  const visible = useMemo(() => filterTree(tree, search), [tree, search]);

  const changeScope = (key: string) => {
    setSearch('');
    setParams({ scope: key }, { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Categorias
          </h1>
          <p className="text-sm text-muted-foreground">
            Organize as categorias do ninho usadas em finanças, compras e tarefas.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setDialog({ kind: 'form', mode: 'create', parent: null })}
          className="h-10 rounded-xl px-3.5 gap-1.5 self-start sm:self-auto font-medium shadow-xs"
        >
          <Plus className="size-4" />
          Nova categoria
        </Button>
      </div>

      {/* Abas de escopo */}
      <div
        role="tablist"
        aria-label="Escopo de categorias"
        className="flex gap-1 overflow-x-auto rounded-xl border border-border/50 bg-muted/40 p-1"
      >
        {SCOPES.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={current.key === s.key}
            onClick={() => changeScope(s.key)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              current.key === s.key
                ? 'bg-background font-semibold text-foreground shadow-xs border border-border/30'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoria…"
          className="h-10 rounded-xl bg-muted/30 border-border/40 pl-9 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
        />
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
          <p className="text-sm text-muted-foreground">Não foi possível carregar as categorias.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => reload()}
            className="mt-3 h-9 rounded-xl border-border/60"
          >
            Tentar novamente
          </Button>
        </div>
      ) : tree.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma categoria de {current.label.toLowerCase()} ainda.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => setDialog({ kind: 'form', mode: 'create', parent: null })}
            className="mt-3 h-9 rounded-xl font-medium shadow-xs"
          >
            Criar categoria
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
          <p className="text-sm text-muted-foreground">Nada encontrado para &ldquo;{search}&rdquo;.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((root) => (
            <div
              key={root.categoryId}
              className="rounded-xl border border-border/50 bg-card/70 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl text-base"
                    style={{ backgroundColor: root.color }}
                  >
                    {root.icon}
                  </span>
                  <div className="min-w-0 flex-1 truncate">
                    <p className="truncate text-sm font-semibold text-foreground">{root.name}</p>
                    {root.children.length > 0 && (
                      <p className="truncate text-xs text-muted-foreground">
                        {root.children.length} subcategoria{root.children.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label="Mais ações"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        setDialog({ kind: 'form', mode: 'edit', category: root, parent: null })
                      }
                    >
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDialog({ kind: 'form', mode: 'create', parent: root })}
                    >
                      Adicionar subcategoria
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDialog({ kind: 'move', category: root, parent: null })}
                    >
                      Mover
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDialog({ kind: 'delete', category: root })}
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {root.children.length > 0 && (
                <div className="ml-6 mt-2 space-y-1 border-l pl-3">
                  {root.children.map((child) => (
                    <div
                      key={child.categoryId}
                      className="flex items-center justify-between gap-2 rounded-lg py-1"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 text-sm">{child.icon}</span>
                        <p className="truncate text-sm text-foreground">{child.name}</p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                            aria-label="Mais ações"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setDialog({
                                kind: 'form',
                                mode: 'edit',
                                category: child,
                                parent: root,
                              })
                            }
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setDialog({ kind: 'move', category: child, parent: root })
                            }
                          >
                            Mover
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDialog({ kind: 'delete', category: child })}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Diálogos: Tarefa 6 */}
    </div>
  );
}
