/**
 * Serviço para gerenciar o Quadro de Tarefas.
 * Suporta API real e modo mock (DATA_MODE === 'mock').
 */

import { toCategorySummary } from '@/lib/taskCategories';
import { CategorySummaryResponseSchema } from '@/schemas/category';
import { PRIORITY_LABELS } from '@/schemas/enums';
import type { CreateQuickTaskRequest, CreateTaskRequest, UpdateTaskRequest } from '@/schemas/tasks';
import { TaskHistoryResponseSchema, TaskPagedResponseSchema, TaskResponseSchema } from '@/schemas/tasks';
import type { PaginatedResponse, Task } from '@/types';
import { ApiPriority } from '@/types';

import { MOCK_USER_ID, mockCategoryTree, mockTasks } from '../mocks/data';
import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

// ── Mappers ───────────────────────────────────────────────────────────────────

function apiToTask(raw: unknown): Task {
  const parsed = TaskResponseSchema.safeParse(raw);
  if (parsed.success) {
    const d = parsed.data;
    return {
      taskId: d.taskId,
      title: d.title,
      description: d.description ?? null,
      dueDate: d.dueDate ?? null,
      priority: d.priority as Task['priority'],
      priorityLabel: d.priorityLabel,
      category: d.category ?? null,
      date: d.date,
      isCompleted: d.isCompleted,
      completedAt: d.completedAt ?? null,
      isOverdue: d.isOverdue,
      createdBy: d.createdBy,
      createdAt: d.createdAt,
      assignees: d.assignees ?? [],
    };
  }
  // fallback permissivo
  const r = raw as Record<string, unknown>;
  const priority = Number(r.priority ?? 3);
  const rawAssignees = Array.isArray(r.assignees) ? r.assignees : [];
  return {
    taskId: String(r.taskId ?? ''),
    title: String(r.title ?? ''),
    description: (r.description as string) ?? null,
    dueDate: (r.dueDate as string) ?? null,
    priority: priority as Task['priority'],
    priorityLabel: (r.priorityLabel as string) ?? PRIORITY_LABELS[priority] ?? 'Baixa',
    category: (() => {
      const c = CategorySummaryResponseSchema.safeParse(r.category);
      return c.success ? c.data : null;
    })(),
    date: String(r.date ?? new Date().toISOString()),
    isCompleted: Boolean(r.isCompleted ?? false),
    completedAt: (r.completedAt as string) ?? null,
    isOverdue: Boolean(r.isOverdue ?? false),
    createdBy: String(r.createdBy ?? ''),
    createdAt: String(r.createdAt ?? new Date().toISOString()),
    assignees: rawAssignees.map((a: any) => ({
      userId: String(a.userId ?? ''),
      name: String(a.name ?? 'Membro'),
      photoUrl: (a.photoUrl as string) ?? null,
      isCompleted: Boolean(a.isCompleted ?? false),
      completedAt: (a.completedAt as string) ?? null,
    })),
  };
}

/** Request de update a partir de uma tarefa carregada. `assigneeIds: null` mantém os responsáveis. */
export function taskToUpdateRequest(
  task: Task,
  overrides: Partial<UpdateTaskRequest> = {}
): UpdateTaskRequest {
  return {
    title: task.title,
    description: task.description ?? null,
    assigneeIds: null,
    dueDate: task.dueDate ?? null,
    priority: task.priority,
    categoryId: task.category?.categoryId ?? null,
    date: task.date,
    ...overrides,
  };
}

// ── Mock state ────────────────────────────────────────────────────────────────

const _mockState = [...mockTasks];

/** Espelha Task.RecalculateCompletion do backend: fecha só quando todos concluíram. */
function recalcMockCompletion(task: Task): void {
  const all = task.assignees.length > 0 && task.assignees.every((a) => a.isCompleted);
  task.isCompleted = all;
  task.completedAt = all
    ? task.assignees.reduce<string>(
        (max, a) => (a.completedAt && a.completedAt > max ? a.completedAt : max),
        ''
      ) || new Date().toISOString()
    : null;
  if (all) task.isOverdue = false;
}

/** Sem `assigneeId`, age sobre o usuário mock (como o backend age sobre quem chama). */
function applyMockPart(task: Task, assigneeId: string | undefined, done: boolean): void {
  const target = assigneeId ?? MOCK_USER_ID;
  if (!task.assignees.some((a) => a.userId === target)) {
    throw new Error('Você não é responsável por esta tarefa.');
  }
  const nowIso = new Date().toISOString();
  task.assignees = task.assignees.map((a) =>
    a.userId === target ? { ...a, isCompleted: done, completedAt: done ? nowIso : null } : a
  );
  recalcMockCompletion(task);
}

// ── API ───────────────────────────────────────────────────────────────────────

export async function getActiveTasks(
  pageOrNestId?: number | string,
  pageSize = 10,
  nestId?: string
): Promise<PaginatedResponse<Task>> {
  let page = 1;
  let targetNestId = nestId;

  if (typeof pageOrNestId === 'number') {
    page = pageOrNestId;
  } else if (typeof pageOrNestId === 'string') {
    targetNestId = pageOrNestId;
  }

  if (DATA_MODE === 'mock') {
    const active = _mockState
      .filter((t) => !t.isCompleted)
      .sort((a, b) => a.priority - b.priority);
    const start = (page - 1) * pageSize;
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            items: active.slice(start, start + pageSize),
            totalCount: active.length,
            page,
            pageSize,
          }),
        100
      )
    );
  }
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  const data = await httpClient.get<unknown>(`${ENDPOINTS.tasks.list}?${params}`, targetNestId);
  const parsed = TaskPagedResponseSchema.safeParse(data);
  if (parsed.success) {
    return {
      items: parsed.data.items.map(apiToTask),
      totalCount: parsed.data.totalCount,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    };
  }
  if (Array.isArray(data)) {
    const items = data.map(apiToTask);
    return { items, totalCount: items.length, page, pageSize };
  }
  return { items: [], totalCount: 0, page, pageSize };
}

export async function createTask(payload: CreateTaskRequest, nestId?: string): Promise<Task> {
  if (DATA_MODE === 'mock') {
    const now = new Date().toISOString();
    const task: Task = {
      taskId: crypto.randomUUID(),
      title: payload.title,
      description: payload.description ?? null,
      dueDate: payload.dueDate ?? null,
      priority: (payload.priority ?? ApiPriority.Baixa) as Task['priority'],
      priorityLabel: PRIORITY_LABELS[payload.priority ?? ApiPriority.Baixa],
      category: toCategorySummary(mockCategoryTree, payload.categoryId),
      date: payload.date ?? now,
      isCompleted: false,
      completedAt: null,
      isOverdue: false,
      createdBy: MOCK_USER_ID,
      createdAt: now,
      assignees: (payload.assigneeIds?.length ? payload.assigneeIds : [MOCK_USER_ID]).map((id) => ({
        userId: id,
        name: 'Usuário Mock',
        photoUrl: null,
        isCompleted: false,
        completedAt: null,
      })),
    };
    _mockState.unshift(task);
    return new Promise((resolve) => setTimeout(() => resolve(task), 100));
  }
  const id = await httpClient.post<string>(ENDPOINTS.tasks.create, payload, { nestId });
  return getTaskById(id, nestId);
}

export async function createQuickTask(title: string, nestId?: string): Promise<Task> {
  if (DATA_MODE === 'mock') {
    return createTask(
      {
        title,
        priority: ApiPriority.Baixa,
        categoryId: null,
      },
      nestId
    );
  }
  const payload: CreateQuickTaskRequest = { title };
  const id = await httpClient.post<string>(ENDPOINTS.tasks.createQuick, payload, { nestId });
  return getTaskById(id, nestId);
}

export async function getTaskById(id: string, nestId?: string): Promise<Task> {
  if (DATA_MODE === 'mock') {
    const task = _mockState.find((t) => t.taskId === id);
    return new Promise((resolve, reject) =>
      setTimeout(() => (task ? resolve({ ...task }) : reject(new Error('Task not found'))), 100)
    );
  }
  const data = await httpClient.get<unknown>(ENDPOINTS.tasks.getById(id), nestId);
  return apiToTask(data);
}

export async function updateTask(
  id: string,
  payload: UpdateTaskRequest,
  nestId?: string
): Promise<void> {
  if (DATA_MODE === 'mock') {
    const idx = _mockState.findIndex((t) => t.taskId === id);
    if (idx >= 0) {
      _mockState[idx] = {
        ..._mockState[idx],
        title: payload.title,
        description: payload.description ?? null,
        dueDate: payload.dueDate ?? null,
        priority: (payload.priority ?? ApiPriority.Baixa) as Task['priority'],
        priorityLabel: PRIORITY_LABELS[payload.priority ?? ApiPriority.Baixa],
        category: toCategorySummary(mockCategoryTree, payload.categoryId),
        assignees: payload.assigneeIds
          ? payload.assigneeIds.map((uId) => {
              const existing = _mockState[idx].assignees.find((a) => a.userId === uId);
              return (
                existing ?? {
                  userId: uId,
                  name: 'Usuário Mock',
                  photoUrl: null,
                  isCompleted: false,
                  completedAt: null,
                }
              );
            })
          : _mockState[idx].assignees,
      };
      recalcMockCompletion(_mockState[idx]);
    }
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
  await httpClient.put<void>(ENDPOINTS.tasks.update(id), payload, nestId);
}

export async function deleteTask(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    const idx = _mockState.findIndex((t) => t.taskId === id);
    if (idx >= 0) _mockState.splice(idx, 1);
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
  await httpClient.del<void>(ENDPOINTS.tasks.delete(id), nestId);
}

export async function completeTask(id: string, nestId?: string, assigneeId?: string): Promise<Task> {
  if (DATA_MODE === 'mock') {
    const task = _mockState.find((t) => t.taskId === id);
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        if (!task) return reject(new Error('Task not found'));
        try {
          applyMockPart(task, assigneeId, true);
          resolve({ ...task });
        } catch (err) {
          reject(err);
        }
      }, 100)
    );
  }
  const url = assigneeId
    ? `${ENDPOINTS.tasks.complete(id)}?assigneeId=${encodeURIComponent(assigneeId)}`
    : ENDPOINTS.tasks.complete(id);
  await httpClient.patch<void>(url, undefined, nestId);
  return getTaskById(id, nestId);
}

export async function uncompleteTask(id: string, nestId?: string, assigneeId?: string): Promise<Task> {
  if (DATA_MODE === 'mock') {
    const task = _mockState.find((t) => t.taskId === id);
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        if (!task) return reject(new Error('Task not found'));
        try {
          applyMockPart(task, assigneeId, false);
          resolve({ ...task });
        } catch (err) {
          reject(err);
        }
      }, 100)
    );
  }
  const url = assigneeId
    ? `${ENDPOINTS.tasks.uncomplete(id)}?assigneeId=${encodeURIComponent(assigneeId)}`
    : ENDPOINTS.tasks.uncomplete(id);
  await httpClient.patch<void>(url, undefined, nestId);
  return getTaskById(id, nestId);
}

export async function getTaskHistory(
  page = 1,
  pageSize = 20,
  nestId?: string
): Promise<PaginatedResponse<Task>> {
  if (DATA_MODE === 'mock') {
    const completed = _mockState
      .filter((t) => t.isCompleted)
      .sort(
        (a, b) =>
          new Date(b.completedAt ?? b.createdAt).getTime() -
          new Date(a.completedAt ?? a.createdAt).getTime()
      );
    const start = (page - 1) * pageSize;
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            items: completed.slice(start, start + pageSize),
            totalCount: completed.length,
            page,
            pageSize,
          }),
        100
      )
    );
  }
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  const data = await httpClient.get<unknown>(`${ENDPOINTS.tasks.history}?${params}`, nestId);
  const parsed = TaskHistoryResponseSchema.safeParse(data);
  if (parsed.success) {
    return { ...parsed.data, items: parsed.data.items.map(apiToTask) };
  }
  return { items: [], totalCount: 0, page, pageSize };
}

// Compat aliases para AppContext legado
/** @deprecated use getActiveTasks */
export const getAllTasks = getActiveTasks;
/** @deprecated use completeTask */
export const toggleTaskCompletion = completeTask;
/** @deprecated use createTask */
export const addTask = createTask;
