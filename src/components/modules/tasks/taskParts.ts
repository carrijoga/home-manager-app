/**
 * Helpers puros da conclusão por pessoa (ADR 0002 da API).
 * `task.isCompleted` só é verdadeiro quando todos os responsáveis concluíram;
 * o checkbox da UI reflete a parte do usuário logado.
 * Sem React — testados por scripts/test-task-parts.ts.
 */
import { NestRole } from '@/schemas/enums';
import type { Task, TaskAssignee } from '@/types';

export const NOT_ASSIGNEE_HINT = 'Você não é responsável por esta tarefa';

type WithAssignees = Pick<Task, 'assignees'>;

export function getMyPart(task: WithAssignees, userId: string): TaskAssignee | null {
  if (!userId) return null;
  return task.assignees.find((a) => a.userId === userId) ?? null;
}

export function isMyPartDone(task: WithAssignees, userId: string): boolean {
  return getMyPart(task, userId)?.isCompleted ?? false;
}

export function canCompleteOthers(role: number): boolean {
  return role === NestRole.Owner || role === NestRole.Admin;
}

/** Owner, Admin ou criador da tarefa. `task === null` = criação (sempre permitido). */
export function canChangeAssignees(
  role: number,
  task: Pick<Task, 'createdBy'> | null,
  userId: string
): boolean {
  if (task === null) return true;
  if (canCompleteOthers(role)) return true;
  return !!userId && task.createdBy === userId;
}

export function partProgress(task: WithAssignees): { done: number; total: number } {
  return {
    done: task.assignees.filter((a) => a.isCompleted).length,
    total: task.assignees.length,
  };
}

/** Mensagem após concluir a minha parte; `null` quando a tarefa inteira fechou. */
export function partProgressMessage(task: Pick<Task, 'assignees' | 'isCompleted'>): string | null {
  if (task.isCompleted) return null;
  const { done, total } = partProgress(task);
  return `Sua parte foi concluída (${done} de ${total}).`;
}

/**
 * Separa as tarefas em que a ação em lote tem efeito na minha parte.
 * `done = true`: minha parte pendente; `done = false`: minha parte concluída.
 * Tarefas em que não sou responsável são contadas em `notAssignee`.
 */
export function partitionForMyPart<T extends WithAssignees>(
  tasks: T[],
  userId: string,
  done: boolean
): { actionable: T[]; notAssignee: number } {
  const actionable: T[] = [];
  let notAssignee = 0;
  for (const task of tasks) {
    const mine = getMyPart(task, userId);
    if (!mine) notAssignee++;
    else if (mine.isCompleted !== done) actionable.push(task);
  }
  return { actionable, notAssignee };
}

export function skippedMessage(count: number): string {
  return count === 1
    ? '1 tarefa ignorada: você não é responsável'
    : `${count} tarefas ignoradas: você não é responsável`;
}

export function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
