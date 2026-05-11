import { z } from 'zod';
import { DateTimeSchema, UuidSchema } from './shared';

// ── Response ──────────────────────────────────────────────────────────────────

export const TaskResponseSchema = z.object({
  taskId: UuidSchema,
  title: z.string(),
  description: z.union([z.string(), z.null()]).optional(),
  details: z.union([z.string(), z.null()]).optional(),
  assignedTo: z.union([UuidSchema, z.null()]).optional(),
  dueDate: z.union([DateTimeSchema, z.null()]).optional(),
  priority: z.union([z.number(), z.string()]).transform(Number),
  priorityLabel: z.string(),
  category: z.union([z.number(), z.string()]).transform(Number),
  categoryLabel: z.string(),
  date: DateTimeSchema,
  isCompleted: z.boolean(),
  completedAt: z.union([DateTimeSchema, z.null()]).optional(),
  isOverdue: z.boolean(),
  createdBy: UuidSchema,
  createdAt: DateTimeSchema,
});
export type TaskResponse = z.infer<typeof TaskResponseSchema>;

export const TaskHistoryResponseSchema = z.object({
  items: z.array(TaskResponseSchema),
  totalCount: z.union([z.number(), z.string()]).transform(Number),
  page: z.union([z.number(), z.string()]).transform(Number),
  pageSize: z.union([z.number(), z.string()]).transform(Number),
});
export type TaskHistoryResponse = z.infer<typeof TaskHistoryResponseSchema>;

// ── Requests ──────────────────────────────────────────────────────────────────

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  details?: string | null;
  assignedTo?: string | null;
  dueDate?: string | null;
  priority: number;
  category: number;
  date?: string | null;
}

export interface CreateQuickTaskRequest {
  title: string;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string | null;
  details?: string | null;
  assignedTo?: string | null;
  dueDate?: string | null;
  priority: number;
  category: number;
  date?: string | null;
}
