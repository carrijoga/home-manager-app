import { z } from 'zod';

import { CategorySummaryResponseSchema } from './category';
import { DateTimeSchema, UuidSchema } from './shared';

// ── Response ──────────────────────────────────────────────────────────────────

export const TaskAssigneeResponseSchema = z.object({
  userId: UuidSchema,
  name: z.string(),
  photoUrl: z.union([z.string(), z.null()]).optional().default(null),
  isCompleted: z.boolean(),
  completedAt: z.union([DateTimeSchema, z.null()]).optional().default(null),
});
export type TaskAssigneeResponse = z.infer<typeof TaskAssigneeResponseSchema>;

export const TaskResponseSchema = z.object({
  taskId: UuidSchema,
  title: z.string(),
  description: z.union([z.string(), z.null()]).optional(),
  dueDate: z.union([DateTimeSchema, z.null()]).optional(),
  priority: z.union([z.number(), z.string()]).transform(Number),
  priorityLabel: z.string(),
  category: z.union([CategorySummaryResponseSchema, z.null()]).optional().default(null),
  date: DateTimeSchema,
  isCompleted: z.boolean(),
  completedAt: z.union([DateTimeSchema, z.null()]).optional(),
  isOverdue: z.boolean(),
  createdBy: UuidSchema,
  createdAt: DateTimeSchema,
  assignees: z.array(TaskAssigneeResponseSchema).default([]),
});
export type TaskResponse = z.infer<typeof TaskResponseSchema>;

export const TaskHistoryResponseSchema = z.object({
  items: z.array(TaskResponseSchema),
  totalCount: z.union([z.number(), z.string()]).transform(Number),
  page: z.union([z.number(), z.string()]).transform(Number),
  pageSize: z.union([z.number(), z.string()]).transform(Number),
});
export type TaskHistoryResponse = z.infer<typeof TaskHistoryResponseSchema>;

export const TaskPagedResponseSchema = z.object({
  items: z.array(TaskResponseSchema),
  totalCount: z.union([z.number(), z.string()]).transform(Number),
  page: z.union([z.number(), z.string()]).transform(Number),
  pageSize: z.union([z.number(), z.string()]).transform(Number),
});
export type TaskPagedResponse = z.infer<typeof TaskPagedResponseSchema>;

// ── Requests ──────────────────────────────────────────────────────────────────

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  assigneeIds?: string[] | null;
  dueDate?: string | null;
  priority: number;
  categoryId?: string | null;
  date?: string | null;
}

export interface CreateQuickTaskRequest {
  title: string;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string | null;
  assigneeIds?: string[] | null;
  dueDate?: string | null;
  priority: number;
  categoryId?: string | null;
  date?: string | null;
}
