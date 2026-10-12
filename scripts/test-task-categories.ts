import assert from 'node:assert/strict';

import type { CategoryNode } from '@/lib/categories';
import {
  buildCategoryChips,
  formatTaskCategory,
  NO_CATEGORY_LABEL,
  rootCategoryId,
  suggestTaskCategoryId,
  toCategorySummary,
} from '@/lib/taskCategories';

function node(categoryId: string, name: string, icon: string, color: string, children: CategoryNode[] = [], parentCategoryId: string | null = null): CategoryNode {
  return { categoryId, parentCategoryId, name, icon, color, children };
}

const tree: CategoryNode[] = [
  node('casa', 'Casa', '🏠', '#3B82F6', [node('contas', 'Contas', '🧾', '#3B82F6', [], 'casa')]),
  node('limpeza', 'Limpeza', '🧹', '#06B6D4'),
  node('pets', 'Pets', '🐾', '#F59E0B'),
  node('estudos', 'Estudos', '📚', '#A855F7'),
  node('trabalho', 'Trabalho', '💼', '#6366F1'),
  node('familia', 'Família', '👪', '#EC4899'),
];

const contas = { categoryId: 'contas', name: 'Contas', icon: '🧾', color: '#3B82F6', parentCategoryId: 'casa', parentName: 'Casa' };
const limpeza = { categoryId: 'limpeza', name: 'Limpeza', icon: '🧹', color: '#06B6D4', parentCategoryId: null, parentName: null };

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

check('formatTaskCategory: sub, principal e vazio', () => {
  assert.equal(formatTaskCategory(contas), '🧾 Casa › Contas');
  assert.equal(formatTaskCategory(limpeza), '🧹 Limpeza');
  assert.equal(formatTaskCategory(null), NO_CATEGORY_LABEL);
  assert.equal(formatTaskCategory(undefined), 'Sem categoria');
});

check('toCategorySummary monta sumário com o pai', () => {
  assert.deepEqual(toCategorySummary(tree, 'contas'), contas);
  assert.deepEqual(toCategorySummary(tree, 'limpeza'), limpeza);
  assert.equal(toCategorySummary(tree, 'zzz'), null);
  assert.equal(toCategorySummary(tree, null), null);
});

check('rootCategoryId', () => {
  assert.equal(rootCategoryId(contas), 'casa');
  assert.equal(rootCategoryId(limpeza), 'limpeza');
  assert.equal(rootCategoryId(null), null);
});

check('buildCategoryChips: principais únicas, ordenadas, com dados da árvore', () => {
  const chips = buildCategoryChips([contas, limpeza, null, limpeza], tree);
  assert.deepEqual(chips, [
    { categoryId: 'casa', name: 'Casa', icon: '🏠', color: '#3B82F6' },
    { categoryId: 'limpeza', name: 'Limpeza', icon: '🧹', color: '#06B6D4' },
  ]);
});

check('buildCategoryChips sem árvore cai no sumário', () => {
  assert.deepEqual(buildCategoryChips([contas], []), [
    { categoryId: 'casa', name: 'Casa', icon: '🧾', color: '#3B82F6' },
  ]);
});

check('suggestTaskCategoryId por palavra-chave', () => {
  assert.equal(suggestTaskCategoryId('Limpar o banheiro', tree), 'limpeza');
  assert.equal(suggestTaskCategoryId('Pagar conta de luz', tree), 'contas', 'sub antes da principal');
  assert.equal(suggestTaskCategoryId('Comprar ração do gato', tree), 'pets');
  assert.equal(suggestTaskCategoryId('Estudar para a prova', tree), 'estudos');
  assert.equal(suggestTaskCategoryId('Reunião com cliente', tree), 'trabalho');
  assert.equal(suggestTaskCategoryId('Buscar filho na escola', tree), 'familia');
  assert.equal(suggestTaskCategoryId('Trocar lâmpada da sala', tree), 'casa', 'sem Manutenção cai em Casa');
});

check('suggestTaskCategoryId: sem casamento ou sem árvore', () => {
  assert.equal(suggestTaskCategoryId('Assistir filme', tree), null);
  assert.equal(suggestTaskCategoryId('Limpar o banheiro', []), null);
  assert.equal(suggestTaskCategoryId('   ', tree), null);
});

check('suggestTaskCategoryId: grupo sem categoria passa para o próximo', () => {
  const semPets = tree.filter((c) => c.categoryId !== 'pets');
  assert.equal(suggestTaskCategoryId('Comprar ração', semPets), 'contas');
});

if (failures > 0) {
  console.error(`\n${failures} falha(s).`);
  process.exit(1);
}
console.log('\nTodos os testes de categorias de tarefa passaram.');
