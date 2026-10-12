import assert from 'node:assert/strict';

import {
  getItemSpentTotal,
  getQuantityDisplay,
  getSavingsInfo,
  getSpentQuantity,
} from '@/components/modules/Shopping/helpers';
import {
  getMainCategoryKey,
  groupItemsByMainCategory,
  NO_CATEGORY_KEY,
} from '@/components/modules/Shopping/grouping';
import { suggestCategoryForItem } from '@/components/modules/Shopping/smartCategory';
import type { CategoryNode } from '@/lib/categories';

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

// ── Gasto ─────────────────────────────────────────────────────────────────────

check('getSpentQuantity usa a comprada quando > 0, senão 1', () => {
  assert.equal(getSpentQuantity({ purchasedQuantity: 7 }), 7);
  assert.equal(getSpentQuantity({ purchasedQuantity: '2.5' }), 2.5);
  assert.equal(getSpentQuantity({ purchasedQuantity: 0 }), 1);
  assert.equal(getSpentQuantity({ purchasedQuantity: null }), 1);
  assert.equal(getSpentQuantity({}), 1);
});

check('getItemSpentTotal multiplica pela comprada em unidade por item', () => {
  assert.equal(getItemSpentTotal({ price: 10, purchasedQuantity: 7, unitType: 1 }), 70); // kg
  assert.equal(getItemSpentTotal({ price: 10, purchasedQuantity: null, unitType: 1 }), 10);
  assert.equal(getItemSpentTotal({ price: 10, purchasedQuantity: 0, unitType: 0 }), 10);
});

check('getItemSpentTotal ignora a quantidade em unidades de medida (g, mL)', () => {
  assert.equal(getItemSpentTotal({ price: 10, purchasedQuantity: 500, unitType: 2 }), 10);
  assert.equal(getItemSpentTotal({ price: 10, purchasedQuantity: 500, unitType: 4 }), 10);
});

check('getItemSpentTotal sem preço é 0', () => {
  assert.equal(getItemSpentTotal({ price: null, purchasedQuantity: 3, unitType: 0 }), 0);
});

check('getSavingsInfo compara preço na mesma quantidade (a comprada)', () => {
  // estimado 10/un, pago 9/un, comprou 7 (planejado 5) → economia de 7 (10%)
  assert.deepEqual(
    getSavingsInfo({ estimatedPrice: 10, price: 9, purchasedQuantity: 7, unitType: 0 }),
    { type: 'savings', diff: 7, pct: 10 }
  );
  // mesmo preço, quantidade diferente → sem variação
  assert.deepEqual(
    getSavingsInfo({ estimatedPrice: 10, price: 10, purchasedQuantity: 7, unitType: 0 }),
    { type: 'equal', diff: 0, pct: 0 }
  );
  assert.equal(getSavingsInfo({ estimatedPrice: null, price: 9, purchasedQuantity: 1, unitType: 0 }), null);
});

// ── Exibição planejado × comprado ─────────────────────────────────────────────

check('getQuantityDisplay mostra comprada e o planejado quando difere', () => {
  assert.deepEqual(
    getQuantityDisplay({ quantity: 5, purchasedQuantity: 7, unitType: 1, isPurchased: true, status: 1 }),
    { label: '7 kg', plannedLabel: '(planejado 5 kg)' }
  );
});

check('getQuantityDisplay omite o planejado quando igual', () => {
  assert.deepEqual(
    getQuantityDisplay({ quantity: 5, purchasedQuantity: 5, unitType: 1, isPurchased: true, status: 1 }),
    { label: '5 kg', plannedLabel: null }
  );
});

check('getQuantityDisplay em item pendente usa a planejada', () => {
  assert.deepEqual(
    getQuantityDisplay({ quantity: 3, purchasedQuantity: null, unitType: 0, isPurchased: false, status: 0 }),
    { label: '3 un', plannedLabel: null }
  );
});

// ── Agrupamento ───────────────────────────────────────────────────────────────

const HORTI = { categoryId: 'h', name: 'Hortifruti', icon: '🥦', color: '#84CC16', parentCategoryId: null, parentName: null };
const LIMPEZA = { categoryId: 'l', name: 'Limpeza', icon: '🧼', color: '#06B6D4', parentCategoryId: null, parentName: null };
const LAVANDERIA = { categoryId: 'l1', name: 'Lavanderia', icon: '🧺', color: '#06B6D4', parentCategoryId: 'l', parentName: 'Limpeza' };
const ORFA = { categoryId: 'x1', name: 'Sub órfã', icon: '❓', color: '#64748B', parentCategoryId: 'x', parentName: 'Apagada' };

const shopTree: CategoryNode[] = [
  { categoryId: 'h', parentCategoryId: null, name: 'Hortifruti', icon: '🥦', color: '#84CC16', children: [] },
  {
    categoryId: 'l',
    parentCategoryId: null,
    name: 'Limpeza',
    icon: '🧼',
    color: '#06B6D4',
    children: [{ categoryId: 'l1', parentCategoryId: 'l', name: 'Lavanderia', icon: '🧺', color: '#06B6D4', children: [] }],
  },
];

const groupItems = [
  { id: '1', category: LAVANDERIA },
  { id: '2', category: null },
  { id: '3', category: HORTI },
  { id: '4', category: LIMPEZA },
  { id: '5', category: ORFA },
];

check('getMainCategoryKey usa a principal', () => {
  assert.equal(getMainCategoryKey({ category: LAVANDERIA }), 'l');
  assert.equal(getMainCategoryKey({ category: HORTI }), 'h');
  assert.equal(getMainCategoryKey({ category: null }), NO_CATEGORY_KEY);
  assert.equal(getMainCategoryKey({}), NO_CATEGORY_KEY);
});

check('groupItemsByMainCategory agrupa sub na principal, alfabético e "Sem categoria" por último', () => {
  const sections = groupItemsByMainCategory(groupItems, shopTree);
  assert.deepEqual(
    sections.map((s) => [s.key, s.label, s.items.map((i) => i.id)]),
    [
      ['x', 'Apagada', ['5']],
      ['h', 'Hortifruti', ['3']],
      ['l', 'Limpeza', ['1', '4']],
      ['none', 'Sem categoria', ['2']],
    ]
  );
});

check('seção vem da árvore; principal fora da árvore usa o sumário do item', () => {
  const sections = groupItemsByMainCategory(groupItems, shopTree);
  const limpeza = sections.find((s) => s.key === 'l')!;
  assert.equal(limpeza.icon, '🧼');
  assert.equal(limpeza.color, '#06B6D4');
  const orfa = sections.find((s) => s.key === 'x')!;
  assert.equal(orfa.icon, '❓');
  const none = sections.find((s) => s.key === NO_CATEGORY_KEY)!;
  assert.equal(none.icon, null);
  assert.equal(none.color, null);
});

check('groupItemsByMainCategory com árvore vazia ainda agrupa pelo sumário', () => {
  const sections = groupItemsByMainCategory([{ category: LAVANDERIA }], []);
  assert.deepEqual(sections.map((s) => [s.key, s.label]), [['l', 'Limpeza']]);
});

// ── Sugestão ──────────────────────────────────────────────────────────────────

function node(id: string, name: string, children: CategoryNode[] = []): CategoryNode {
  return {
    categoryId: id,
    parentCategoryId: null,
    name,
    icon: '🛒',
    color: '#64748B',
    children: children.map((c) => ({ ...c, parentCategoryId: id })),
  };
}

// Catálogo padrão pt-BR de Compras + sub "Lavanderia" em Limpeza
const catalog: CategoryNode[] = [
  node('hort', 'Hortifruti'),
  node('acou', 'Açougue e peixaria'),
  node('pada', 'Padaria'),
  node('frio', 'Frios e laticínios'),
  node('merc', 'Mercearia'),
  node('cong', 'Congelados'),
  node('bebi', 'Bebidas'),
  node('limp', 'Limpeza', [node('lava', 'Lavanderia')]),
  node('higi', 'Higiene e beleza'),
  node('farm', 'Farmácia'),
  node('pet', 'Pet'),
  node('casa', 'Casa e utilidades'),
  node('outr', 'Outros'),
];

check('sugestão: banana → Hortifruti', () => {
  assert.equal(suggestCategoryForItem('banana', catalog), 'hort');
});

check('sugestão: picanha → Açougue e peixaria', () => {
  assert.equal(suggestCategoryForItem('Picanha', catalog), 'acou');
});

check('sugestão: iogurte → Frios e laticínios', () => {
  assert.equal(suggestCategoryForItem('iogurte natural', catalog), 'frio');
});

check('sugestão: dipirona → Farmácia', () => {
  assert.equal(suggestCategoryForItem('dipirona', catalog), 'farm');
});

check('sugestão: sub vence a principal (sabão em pó → Lavanderia)', () => {
  assert.equal(suggestCategoryForItem('Sabão em pó', catalog), 'lava');
});

check('sugestão: detergente fica na principal Limpeza', () => {
  assert.equal(suggestCategoryForItem('detergente', catalog), 'limp');
});

check('sugestão: sem correspondência → null', () => {
  assert.equal(suggestCategoryForItem('xyzabc', catalog), null);
  assert.equal(suggestCategoryForItem('banana', []), null);
  assert.equal(suggestCategoryForItem('ração', [node('hort', 'Hortifruti')]), null);
  assert.equal(suggestCategoryForItem('  ', catalog), null);
});

if (failures > 0) {
  console.error(`\n${failures} falha(s).`);
  process.exit(1);
}
console.log('\nTodos os testes de compras passaram.');
