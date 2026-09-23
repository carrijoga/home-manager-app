import assert from 'node:assert/strict';

import {
  CATEGORY_COLORS,
  type CategoryNode,
  filterTree,
  findCategory,
  flattenTree,
  formatCategoryLabel,
  isHexColor,
  isSingleEmoji,
  nextPaletteColor,
} from '@/lib/categories';

const tree: CategoryNode[] = [
  {
    categoryId: 'a',
    parentCategoryId: null,
    name: 'Mercado',
    icon: '🛒',
    color: '#22C55E',
    children: [
      { categoryId: 'a1', parentCategoryId: 'a', name: 'Hortifruti', icon: '🥦', color: '#22C55E', children: [] },
    ],
  },
  { categoryId: 'b', parentCategoryId: null, name: 'Moradia', icon: '🏠', color: '#3B82F6', children: [] },
];

let failures = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    failures++;
    console.error(`[FAIL] ${name}`, err);
  }
}

check('flattenTree ordena pai antes do filho com depth', () => {
  const flat = flattenTree(tree);
  assert.deepEqual(flat.map((f) => [f.category.categoryId, f.depth, f.parent?.categoryId ?? null]), [
    ['a', 0, null],
    ['a1', 1, 'a'],
    ['b', 0, null],
  ]);
});

check('findCategory acha sub com o pai', () => {
  const found = findCategory(tree, 'a1');
  assert.equal(found?.category.name, 'Hortifruti');
  assert.equal(found?.parent?.name, 'Mercado');
  assert.equal(findCategory(tree, 'zzz'), null);
  assert.equal(findCategory(tree, null), null);
});

check('formatCategoryLabel', () => {
  assert.equal(formatCategoryLabel({ icon: '🥦', name: 'Hortifruti' }, { name: 'Mercado' }), '🥦 Mercado › Hortifruti');
  assert.equal(formatCategoryLabel({ icon: '🏠', name: 'Moradia' }), '🏠 Moradia');
});

check('filterTree mantém pai quando só o filho casa e ignora acento/caixa', () => {
  const r = filterTree(tree, 'hortifrúti');
  assert.equal(r.length, 1);
  assert.equal(r[0].categoryId, 'a');
  assert.deepEqual(r[0].children.map((c) => c.categoryId), ['a1']);
});

check('filterTree com pai casando mantém todos os filhos', () => {
  const r = filterTree(tree, 'merc');
  assert.deepEqual(r[0].children.map((c) => c.categoryId), ['a1']);
});

check('filterTree com query vazia devolve a árvore', () => {
  assert.equal(filterTree(tree, '  ').length, 2);
});

check('isSingleEmoji', () => {
  for (const ok of ['🛒', '🏠', '❤️', '👍🏽', '👨‍👩‍👧', '🇧🇷']) assert.equal(isSingleEmoji(ok), true, ok);
  for (const bad of ['', 'a', '🛒🛒', 'ab', ' 🛒', '1']) assert.equal(isSingleEmoji(bad), false, bad);
});

check('isHexColor', () => {
  assert.equal(isHexColor('#22C55E'), true);
  assert.equal(isHexColor('#22c55e'), true);
  assert.equal(isHexColor('22C55E'), false);
  assert.equal(isHexColor('#FFF'), false);
});

check('nextPaletteColor escolhe a primeira não usada e recicla', () => {
  assert.equal(nextPaletteColor([]), CATEGORY_COLORS[0]);
  assert.equal(nextPaletteColor([CATEGORY_COLORS[0]]), CATEGORY_COLORS[1]);
  assert.equal(nextPaletteColor([...CATEGORY_COLORS]), CATEGORY_COLORS[0]);
});

if (failures > 0) {
  console.error(`\n${failures} falha(s).`);
  process.exit(1);
}
console.log('\nTodos os testes de categorias passaram.');
