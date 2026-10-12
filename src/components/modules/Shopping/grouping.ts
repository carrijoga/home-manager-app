/**
 * Agrupamento de itens de compra por categoria principal.
 * Puro — testado por scripts/test-shopping-grouping.ts.
 */
import type { CategoryNode } from '@/lib/categories';
import type { CategorySummaryResponse } from '@/schemas/category';
import type { AppShoppingItem } from '@/types';

export const NO_CATEGORY_KEY = 'none';
export const NO_CATEGORY_LABEL = 'Sem categoria';

export interface ItemSection<T = AppShoppingItem> {
  key: string;
  label: string;
  icon: string | null;
  color: string | null;
  items: T[];
}

export type SectionOption = Pick<ItemSection, 'key' | 'label' | 'icon'>;

type Categorized = { category?: CategorySummaryResponse | null };

/** Chave da seção: id da principal (a própria categoria, se já for principal) ou "none". */
export function getMainCategoryKey(item: Categorized): string {
  const c = item.category;
  if (!c) return NO_CATEGORY_KEY;
  return c.parentCategoryId ?? c.categoryId;
}

function buildSection<T>(
  key: string,
  category: CategorySummaryResponse | null,
  roots: Map<string, CategoryNode>
): ItemSection<T> {
  if (key === NO_CATEGORY_KEY || !category) {
    return { key: NO_CATEGORY_KEY, label: NO_CATEGORY_LABEL, icon: null, color: null, items: [] };
  }
  const root = roots.get(key);
  if (root) return { key, label: root.name, icon: root.icon, color: root.color, items: [] };
  // Principal fora da árvore (apagada ou árvore ainda carregando): usa o sumário do item.
  return {
    key,
    label: category.parentName ?? category.name,
    icon: category.icon,
    color: category.color,
    items: [],
  };
}

/** Seções em ordem alfabética (igual à árvore), "Sem categoria" por último. Itens mantêm a ordem de entrada. */
export function groupItemsByMainCategory<T extends Categorized>(
  items: T[],
  tree: CategoryNode[]
): ItemSection<T>[] {
  const roots = new Map(tree.map((r) => [r.categoryId, r]));
  const sections = new Map<string, ItemSection<T>>();
  for (const item of items) {
    const key = getMainCategoryKey(item);
    let section = sections.get(key);
    if (!section) {
      section = buildSection<T>(key, item.category ?? null, roots);
      sections.set(key, section);
    }
    section.items.push(item);
  }
  return [...sections.values()].sort((a, b) => {
    if (a.key === NO_CATEGORY_KEY) return 1;
    if (b.key === NO_CATEGORY_KEY) return -1;
    return a.label.localeCompare(b.label, 'pt-BR');
  });
}
