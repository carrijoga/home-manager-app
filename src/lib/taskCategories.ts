/**
 * Helpers puros de categoria para o módulo de Tarefas (escopo Task da árvore unificada).
 * Sem React ou serviços — testados por scripts/test-task-categories.ts.
 */
import { type CategoryNode, flattenTree, formatCategoryLabel } from '@/lib/categories';
import type { CategorySummaryResponse } from '@/schemas/category';

export { toCategorySummary } from '@/lib/categories';

export const NO_CATEGORY_LABEL = 'Sem categoria';

export interface TaskCategoryChip {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
}

/** "🧾 Casa › Contas", "🧹 Limpeza" ou "Sem categoria". */
export function formatTaskCategory(category: CategorySummaryResponse | null | undefined): string {
  if (!category) return NO_CATEGORY_LABEL;
  return formatCategoryLabel(category, category.parentName ? { name: category.parentName } : null);
}

/** Id da categoria principal (a própria, se já for principal). */
export function rootCategoryId(category: CategorySummaryResponse | null | undefined): string | null {
  if (!category) return null;
  return category.parentCategoryId ?? category.categoryId;
}

/** Chips do filtro: principais presentes nas tarefas, sem repetição, por nome. */
export function buildCategoryChips<T extends CategoryNode>(
  categories: Array<CategorySummaryResponse | null | undefined>,
  tree: T[]
): TaskCategoryChip[] {
  const byId = new Map<string, TaskCategoryChip>();
  for (const c of categories) {
    const rootId = rootCategoryId(c);
    if (!c || !rootId || byId.has(rootId)) continue;
    const root = tree.find((r) => r.categoryId === rootId);
    byId.set(
      rootId,
      root
        ? { categoryId: root.categoryId, name: root.name, icon: root.icon, color: root.color }
        : { categoryId: rootId, name: c.parentName ?? c.name, icon: c.icon, color: c.color }
    );
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Palavras-chave (sem acento, casadas no início de palavra) → nomes-alvo em ordem de preferência.
 * Os alvos seguem o catálogo padrão de Tarefas (Casa, Pessoal, Família, Trabalho, Estudos, Pets, Outros);
 * nomes mais específicos (Limpeza, Manutenção, Contas) vêm antes para aproveitar subcategorias do usuário.
 * O primeiro grupo cujas palavras casam E cujo alvo existe na árvore vence.
 */
const KEYWORD_GROUPS: ReadonlyArray<{ keywords: readonly string[]; targets: readonly string[] }> = [
  { keywords: ['cachorro', 'gato', 'racao', 'veterinario', 'pet', 'banho e tosa'], targets: ['Pets'] },
  { keywords: ['estudar', 'prova', 'curso', 'aula', 'licao', 'dever de casa'], targets: ['Estudos'] },
  { keywords: ['reuniao', 'trabalho', 'relatorio', 'cliente', 'apresentacao'], targets: ['Trabalho'] },
  { keywords: ['mae', 'pai', 'filho', 'filha', 'criancas', 'escola', 'vovo', 'avo'], targets: ['Família'] },
  {
    keywords: ['limpar', 'limpeza', 'lavar', 'varrer', 'esfregar', 'pano', 'louca', 'lixo', 'organizar', 'cozinhar'],
    targets: ['Limpeza', 'Casa'],
  },
  {
    keywords: ['consertar', 'arrumar', 'trocar', 'lampada', 'torneira', 'cano', 'pia', 'furar', 'parafuso', 'pintar', 'bateria', 'filtro'],
    targets: ['Manutenção', 'Casa'],
  },
  {
    keywords: ['pagar', 'conta', 'boleto', 'imposto', 'comprar', 'fatura', 'transferir', 'dinheiro', 'pix', 'banco'],
    targets: ['Contas', 'Casa'],
  },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Sugere um `categoryId` do escopo Task a partir do título; subcategorias antes de principais. */
export function suggestTaskCategoryId<T extends CategoryNode>(title: string, tree: T[]): string | null {
  const text = normalize(title);
  if (!text || tree.length === 0) return null;
  const flat = flattenTree(tree);
  const ordered = [...flat.filter((f) => f.depth === 1), ...flat.filter((f) => f.depth === 0)];

  for (const group of KEYWORD_GROUPS) {
    const matches = group.keywords.some((kw) => new RegExp(`\\b${escapeRegExp(kw)}`).test(text));
    if (!matches) continue;
    for (const target of group.targets) {
      const t = normalize(target);
      const hit = ordered.find((f) => {
        const n = normalize(f.category.name);
        return n.length >= 3 && (n.includes(t) || t.includes(n));
      });
      if (hit) return hit.category.categoryId;
    }
  }
  return null;
}
