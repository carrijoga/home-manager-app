import assert from 'node:assert/strict';

import {
  canChangeAssignees,
  canCompleteOthers,
  getMyPart,
  isMyPartDone,
  NOT_ASSIGNEE_HINT,
  partitionForMyPart,
  partProgress,
  partProgressMessage,
  skippedMessage,
  toErrorMessage,
} from '@/components/modules/tasks/taskParts';

const ME = 'user-me';
const OTHER = 'user-other';

function part(userId: string, isCompleted: boolean) {
  return { userId, name: userId, photoUrl: null, isCompleted, completedAt: isCompleted ? '2026-09-23T10:00:00Z' : null };
}

const minePending = { taskId: 't1', assignees: [part(ME, false), part(OTHER, true)], isCompleted: false };
const mineDone = { taskId: 't2', assignees: [part(ME, true), part(OTHER, false)], isCompleted: false };
const notMine = { taskId: 't3', assignees: [part(OTHER, false)], isCompleted: false };
const closed = { taskId: 't4', assignees: [part(ME, true), part(OTHER, true)], isCompleted: true };

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

check('getMyPart: responsável pendente, concluído e não responsável', () => {
  assert.equal(getMyPart(minePending, ME)?.isCompleted, false);
  assert.equal(getMyPart(mineDone, ME)?.isCompleted, true);
  assert.equal(getMyPart(notMine, ME), null);
  assert.equal(getMyPart(minePending, ''), null);
});

check('isMyPartDone', () => {
  assert.equal(isMyPartDone(minePending, ME), false);
  assert.equal(isMyPartDone(mineDone, ME), true);
  assert.equal(isMyPartDone(notMine, ME), false);
});

check('canCompleteOthers: Owner/Admin sim, Membro não', () => {
  assert.equal(canCompleteOthers(1), true);
  assert.equal(canCompleteOthers(2), true);
  assert.equal(canCompleteOthers(3), false);
});

check('canChangeAssignees', () => {
  assert.equal(canChangeAssignees(3, null, ME), true, 'criação sempre habilitada');
  assert.equal(canChangeAssignees(1, { createdBy: OTHER }, ME), true, 'Owner');
  assert.equal(canChangeAssignees(2, { createdBy: OTHER }, ME), true, 'Admin');
  assert.equal(canChangeAssignees(3, { createdBy: ME }, ME), true, 'membro criador');
  assert.equal(canChangeAssignees(3, { createdBy: OTHER }, ME), false, 'membro não criador');
  assert.equal(canChangeAssignees(3, { createdBy: '' }, ''), false, 'sem usuário');
});

check('partProgress e partProgressMessage', () => {
  assert.deepEqual(partProgress(minePending), { done: 1, total: 2 });
  assert.equal(partProgressMessage(mineDone), 'Sua parte foi concluída (1 de 2).');
  assert.equal(partProgressMessage(closed), null);
});

check('partitionForMyPart concluindo', () => {
  const r = partitionForMyPart([minePending, mineDone, notMine], ME, true);
  assert.deepEqual(r.actionable.map((t) => t.taskId), ['t1']);
  assert.equal(r.notAssignee, 1);
});

check('partitionForMyPart reabrindo', () => {
  const r = partitionForMyPart([minePending, mineDone, notMine, closed], ME, false);
  assert.deepEqual(r.actionable.map((t) => t.taskId), ['t2', 't4']);
  assert.equal(r.notAssignee, 1);
});

check('skippedMessage singular/plural', () => {
  assert.equal(skippedMessage(1), '1 tarefa ignorada: você não é responsável');
  assert.equal(skippedMessage(3), '3 tarefas ignoradas: você não é responsável');
});

check('toErrorMessage', () => {
  assert.equal(toErrorMessage(new Error('Falhou'), 'fallback'), 'Falhou');
  assert.equal(toErrorMessage(new Error(''), 'fallback'), 'fallback');
  assert.equal(toErrorMessage('texto', 'fallback'), 'fallback');
});

check('NOT_ASSIGNEE_HINT', () => {
  assert.equal(NOT_ASSIGNEE_HINT, 'Você não é responsável por esta tarefa');
});

if (failures > 0) {
  console.error(`\n${failures} falha(s).`);
  process.exit(1);
}
console.log('\nTodos os testes de partes de tarefa passaram.');
