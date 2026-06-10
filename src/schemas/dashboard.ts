import { z } from 'zod';

import { DateTimeSchema, MoneySchema, UuidSchema } from './shared';

// ── Sub-schemas ───────────────────────────────────────────────────────────────

export const DashboardFinancialSummarySchema = z.object({
  totalMonthSpent: MoneySchema,
  totalLastMonthSpent: MoneySchema,
  monthVariation: z.union([z.number(), z.string()]).transform(Number),
});

export const DashboardShoppingListSummarySchema = z.object({
  totalMonthItems: z.union([z.number(), z.string()]).transform(Number),
  totalMonthEstimatedValue: MoneySchema,
});

export const DashboardTasksSummarySchema = z.object({
  totalDayTasks: z.union([z.number(), z.string()]).transform(Number),
  totalDayFinishedTasks: z.union([z.number(), z.string()]).transform(Number),
  rateTasks: z.union([z.number(), z.string()]).transform(Number),
});

export const DashboardEventsSummarySchema = z.object({
  totalWeekEvents: z.union([z.number(), z.string()]).transform(Number),
  nextEventDate: z.union([DateTimeSchema, z.null()]),
  nextEventName: z.string(),
});

export const DashboardNoticeReactionSchema = z.object({
  noticeReactionId: UuidSchema,
  noticeId: UuidSchema,
  userId: UuidSchema,
  emoji: z.string(),
  createdAt: DateTimeSchema,
});

export const DashboardNoticeSchema = z.object({
  noticeId: UuidSchema,
  message: z.string(),
  date: DateTimeSchema,
  isPinned: z.boolean(),
  expiresAt: z.union([DateTimeSchema, z.null()]),
  isActive: z.boolean(),
  createdBy: UuidSchema,
  createdAt: DateTimeSchema,
  reactions: z.array(DashboardNoticeReactionSchema),
});

export const DashboardEventSchema = z.object({
  date: DateTimeSchema,
  title: z.string(),
  description: z.string(),
});

export const DashboardResponseSchema = z.object({
  financial: DashboardFinancialSummarySchema,
  shoppingList: DashboardShoppingListSummarySchema,
  task: DashboardTasksSummarySchema,
  event: DashboardEventsSummarySchema,
  notices: z.array(DashboardNoticeSchema),
  events: z.array(DashboardEventSchema),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type DashboardFinancialSummary = z.infer<typeof DashboardFinancialSummarySchema>;
export type DashboardShoppingListSummary = z.infer<typeof DashboardShoppingListSummarySchema>;
export type DashboardTasksSummary = z.infer<typeof DashboardTasksSummarySchema>;
export type DashboardEventsSummary = z.infer<typeof DashboardEventsSummarySchema>;
export type DashboardNotice = z.infer<typeof DashboardNoticeSchema>;
export type DashboardEvent = z.infer<typeof DashboardEventSchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
