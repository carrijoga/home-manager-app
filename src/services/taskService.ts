/**
 * Serviço para gerenciar o Quadro de Tarefas.
 * Suporta API real e modo mock (DATA_MODE === 'mock').
 */

import { CATEGORY_LABELS,PRIORITY_LABELS } from '@/schemas/enums';
import type { CreateQuickTaskRequest, CreateTaskRequest, UpdateTaskRequest } from '@/schemas/tasks';
import { TaskHistoryResponseSchema,TaskResponseSchema } from '@/schemas/tasks';
import type { PaginatedResponse,Task } from '@/types';
import { ApiCategory,ApiPriority } from '@/types';

import { mockTasks } from '../mocks/data';
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
      details: d.details ?? null,
      assignedTo: d.assignedTo ?? null,
      dueDate: d.dueDate ?? null,
      priority: d.priority as Task['priority'],
      priorityLabel: d.priorityLabel,
      category: d.category as Task['category'],
      categoryLabel: d.categoryLabel,
      date: d.date,
      isCompleted: d.isCompleted,
      completedAt: d.completedAt ?? null,
      isOverdue: d.isOverdue,
      createdBy: d.createdBy,
      createdAt: d.createdAt,
    };
  }
  // fallback permissivo
  const r = raw as Record<string, unknown>;
  const priority = Number(r.priority ?? 3);
  const category = Number(r.category ?? 0);
  return {
    taskId: String(r.taskId ?? ''),
    title: String(r.title ?? ''),
    description: (r.description as string) ?? null,
    details: (r.details as string) ?? null,
    assignedTo: (r.assignedTo as string) ?? null,
    dueDate: (r.dueDate as string) ?? null,
    priority: priority as Task['priority'],
    priorityLabel: (r.priorityLabel as string) ?? PRIORITY_LABELS[priority] ?? 'Baixa',
    category: category as Task['category'],
    categoryLabel: (r.categoryLabel as string) ?? CATEGORY_LABELS[category] ?? 'Geral',
    date: String(r.date ?? new Date().toISOString()),
    isCompleted: Boolean(r.isCompleted ?? false),
    completedAt: (r.completedAt as string) ?? null,
    isOverdue: Boolean(r.isOverdue ?? false),
    createdBy: String(r.createdBy ?? ''),
    createdAt: String(r.createdAt ?? new Date().toISOString()),
  };
}

// ── Mock state ────────────────────────────────────────────────────────────────

const _mockState = [...mockTasks];

// ── API ───────────────────────────────────────────────────────────────────────

export async function getActiveTasks(nestId?: string): Promise<Task[]> {
  if (DATA_MODE === 'mock') {
    return new Promise(resolve =>
      setTimeout(() => resolve(
        _mockState
          .filter(t => !t.isCompleted)
          .sort((a, b) => a.priority - b.priority)
      ), 100)
    );
  }
  const data = await httpClient.get<unknown[]>(ENDPOINTS.tasks.list, nestId);
  return (Array.isArray(data) ? data : []).map(apiToTask);
}

export async function createTask(payload: CreateTaskRequest, nestId?: string): Promise<Task> {
  if (DATA_MODE === 'mock') {
    const now = new Date().toISOString();
    const task: Task = {
      taskId: crypto.randomUUID(),
      title: payload.title,
      description: payload.description ?? null,
      details: payload.details ?? null,
      assignedTo: payload.assignedTo ?? null,
      dueDate: payload.dueDate ?? null,
      priority: (payload.priority ?? ApiPriority.Baixa) as Task['priority'],
      priorityLabel: PRIORITY_LABELS[payload.priority ?? ApiPriority.Baixa],
      category: (payload.category ?? ApiCategory.Geral) as Task['category'],
      categoryLabel: CATEGORY_LABELS[payload.category ?? ApiCategory.Geral],
      date: payload.date ?? now,
      isCompleted: false,
      completedAt: null,
      isOverdue: false,
      createdBy: 'user-mock-0001',
      createdAt: now,
    };
    _mockState.unshift(task);
    return new Promise(resolve => setTimeout(() => resolve(task), 100));
  }
  const id = await httpClient.post<string>(ENDPOINTS.tasks.create, payload, { nestId });
  return getTaskById(id, nestId);
}

export async function createQuickTask(title: string, nestId?: string): Promise<Task> {
  if (DATA_MODE === 'mock') {
    return createTask({
      title,
      priority: ApiPriority.Baixa,
      category: ApiCategory.Geral,
    }, nestId);
  }
  const payload: CreateQuickTaskRequest = { title };
  const id = await httpClient.post<string>(ENDPOINTS.tasks.createQuick, payload, { nestId });
  return getTaskById(id, nestId);
}

export async function getTaskById(id: string, nestId?: string): Promise<Task> {
  if (DATA_MODE === 'mock') {
    const task = _mockState.find(t => t.taskId === id);
    return new Promise((resolve, reject) =>
      setTimeout(() => task ? resolve({ ...task }) : reject(new Error('Task not found')), 100)
    );
  }
  const data = await httpClient.get<unknown>(ENDPOINTS.tasks.getById(id), nestId);
  return apiToTask(data);
}

export async function updateTask(id: string, payload: UpdateTaskRequest, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    const idx = _mockState.findIndex(t => t.taskId === id);
    if (idx >= 0) {
      _mockState[idx] = {
        ..._mockState[idx],
        title: payload.title,
        description: payload.description ?? null,
        details: payload.details ?? null,
        assignedTo: payload.assignedTo ?? null,
        dueDate: payload.dueDate ?? null,
        priority: (payload.priority ?? ApiPriority.Baixa) as Task['priority'],
        priorityLabel: PRIORITY_LABELS[payload.priority ?? ApiPriority.Baixa],
        category: (payload.category ?? ApiCategory.Geral) as Task['category'],
        categoryLabel: CATEGORY_LABELS[payload.category ?? ApiCategory.Geral],
      };
    }
    return new Promise(resolve => setTimeout(resolve, 100));
  }
  await httpClient.put<void>(ENDPOINTS.tasks.update(id), payload, nestId);
}

export async function deleteTask(id: string, nestId?: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    const idx = _mockState.findIndex(t => t.taskId === id);
    if (idx >= 0) _mockState.splice(idx, 1);
    return new Promise(resolve => setTimeout(resolve, 100));
  }
  await httpClient.del<void>(ENDPOINTS.tasks.delete(id), nestId);
}

export async function completeTask(id: string, nestId?: string): Promise<Task> {
  if (DATA_MODE === 'mock') {
    const task = _mockState.find(t => t.taskId === id);
    if (task) {
      task.isCompleted = true;
      task.completedAt = new Date().toISOString();
      task.isOverdue = false;
    }
    return new Promise((resolve, reject) =>
      setTimeout(() => task ? resolve({ ...task }) : reject(new Error('Task not found')), 100)
    );
  }
  await httpClient.patch<void>(ENDPOINTS.tasks.complete(id), undefined, nestId);
  return getTaskById(id, nestId);
}

export async function uncompleteTask(id: string, nestId?: string): Promise<Task> {
  if (DATA_MODE === 'mock') {
    const task = _mockState.find(t => t.taskId === id);
    if (task) {
      task.isCompleted = false;
      task.completedAt = null;
    }
    return new Promise((resolve, reject) =>
      setTimeout(() => task ? resolve({ ...task }) : reject(new Error('Task not found')), 100)
    );
  }
  await httpClient.patch<void>(ENDPOINTS.tasks.uncomplete(id), undefined, nestId);
  return getTaskById(id, nestId);
}

export async function getTaskHistory(page = 1, pageSize = 20, nestId?: string): Promise<PaginatedResponse<Task>> {
  if (DATA_MODE === 'mock') {
    const completed = _mockState
      .filter(t => t.isCompleted)
      .sort((a, b) => new Date(b.completedAt ?? b.createdAt).getTime() - new Date(a.completedAt ?? a.createdAt).getTime());
    const start = (page - 1) * pageSize;
    return new Promise(resolve =>
      setTimeout(() => resolve({
        items: completed.slice(start, start + pageSize),
        totalCount: completed.length,
        page,
        pageSize,
      }), 100)
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
