/**
 * Helpers puros para a árvore de categorias unificadas.
 * Sem dependência de React ou serviços — testados por scripts/test-categories.ts.
 */

export interface CategoryNode {
  categoryId: string;
  parentCategoryId: string | null;
  name: string;
  icon: string;
  color: string;
  children: CategoryNode[];
}

export interface FlatCategory<T extends CategoryNode = CategoryNode> {
  category: T;
  parent: T | null;
  depth: 0 | 1;
}

export const CATEGORY_NAME_MAX = 100;

export const CATEGORY_COLORS: readonly string[] = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#84CC16',
  '#22C55E',
  '#14B8A6',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#A855F7',
  '#EC4899',
  '#64748B',
];

/** Emojis sugeridos por escopo (1=Despesa, 2=Receita, 3=Compras, 4=Tarefas). */
export const CATEGORY_EMOJIS: Record<1 | 2 | 3 | 4, readonly string[]> = {
  1: ['🏠', '💡', '💧', '🔥', '📶', '🛒', '🍽️', '🚗', '⛽', '🚌', '💊', '🏥', '🎓', '📚', '👕', '🎮', '🎬', '✈️', '🐾', '🎁', '💳', '🧾', '🛠️', '📱'],
  2: ['💰', '💼', '🏦', '📈', '🎁', '🧾', '🏷️', '💸', '🪙', '🤝', '🏠', '🎓'],
  3: ['🛒', '🥦', '🍎', '🥩', '🐟', '🧀', '🥛', '🍞', '🥫', '🍝', '🧂', '🍫', '🥤', '☕', '🧴', '🧻', '🧼', '🧹', '🐶', '👶', '💊', '🍷'],
  4: ['🧹', '🧺', '🍳', '🧽', '🗑️', '🛏️', '🪴', '🐾', '🛠️', '🚗', '🧾', '📦', '👶', '📚', '🛒', '🏠'],
};

export function flattenTree<T extends CategoryNode>(tree: T[]): FlatCategory<T>[] {
  const result: FlatCategory<T>[] = [];
  for (const root of tree) {
    result.push({ category: root, parent: null, depth: 0 });
    for (const child of root.children as T[]) {
      result.push({ category: child, parent: root, depth: 1 });
    }
  }
  return result;
}

export function findCategory<T extends CategoryNode>(
  tree: T[],
  id: string | null | undefined
): FlatCategory<T> | null {
  if (!id) return null;
  return flattenTree(tree).find((f) => f.category.categoryId === id) ?? null;
}

export function formatCategoryLabel(
  cat: { icon: string; name: string },
  parent?: { name: string } | null
): string {
  return parent ? `${cat.icon} ${parent.name} › ${cat.name}` : `${cat.icon} ${cat.name}`;
}

export interface CategoryOption {
  categoryId: string;
  label: string;
  name: string;
  color: string;
}

export function toCategoryOptions<T extends CategoryNode>(flat: FlatCategory<T>[]): CategoryOption[] {
  return flat.map(({ category, parent }) => ({
    categoryId: category.categoryId,
    label: formatCategoryLabel(category, parent),
    name: category.name,
    color: category.color,
  }));
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Filtra por nome. Pai que casa mantém todos os filhos; pai que não casa mantém só os filhos que casam. */
export function filterTree<T extends CategoryNode>(tree: T[], query: string): T[] {
  const q = normalize(query);
  if (!q) return tree;
  const result: T[] = [];
  for (const root of tree) {
    if (normalize(root.name).includes(q)) {
      result.push(root);
      continue;
    }
    const children = (root.children as T[]).filter((c) => normalize(c.name).includes(q));
    if (children.length > 0) result.push({ ...root, children });
  }
  return result;
}

// Um único emoji: pictográfico (com seletor de variação/modificador de pele opcional),
// sequências ZWJ, ou bandeira (par de indicadores regionais). Espelha a regra do backend
// (um único elemento de texto cujo primeiro rune é símbolo).
const SINGLE_EMOJI_RE =
  /^(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?(?:‍\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?)*)$/u;

export function isSingleEmoji(value: string): boolean {
  return SINGLE_EMOJI_RE.test(value);
}

export function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function nextPaletteColor(used: string[]): string {
  const usedUpper = new Set(used.map((c) => c.toUpperCase()));
  return CATEGORY_COLORS.find((c) => !usedUpper.has(c.toUpperCase())) ?? CATEGORY_COLORS[0];
}

/** Mesmo formato de `CategorySummaryResponse` da API (item de compra/transação). */
export interface CategorySummary {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  parentCategoryId: string | null;
  parentName: string | null;
}

export function toCategorySummary<T extends CategoryNode>(
  tree: T[],
  id: string | null | undefined
): CategorySummary | null {
  const found = findCategory(tree, id);
  if (!found) return null;
  const { category, parent } = found;
  return {
    categoryId: category.categoryId,
    name: category.name,
    icon: category.icon,
    color: category.color,
    parentCategoryId: parent?.categoryId ?? null,
    parentName: parent?.name ?? null,
  };
}
