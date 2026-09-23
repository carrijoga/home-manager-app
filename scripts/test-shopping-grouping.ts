import assert from 'node:assert/strict';

import {
  getItemSpentTotal,
  getQuantityDisplay,
  getSavingsInfo,
  getSpentQuantity,
} from '@/components/modules/Shopping/helpers';

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

// ── (Tarefa 4 acrescenta agrupamento e sugestão aqui) ─────────────────────────

if (failures > 0) {
  console.error(`\n${failures} falha(s).`);
  process.exit(1);
}
console.log('\nTodos os testes de compras passaram.');
