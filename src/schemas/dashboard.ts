import { z } from 'zod';

import { DateTimeSchema, MoneySchema, UuidSchema } from './shared';

// ── Sub-schemas ───────────────────────────────────────────────────────────────

export const DashboardFinancialSummarySchema = z.object({
  totalMonthSpent: MoneySchema.optional().default(0),
  totalLastMonthSpent: MoneySchema.optional().default(0),
  monthVariation: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => Number(val ?? 0))
    .default(0),
});

export const DashboardShoppingListSummarySchema = z.object({
  totalMonthItems: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => Number(val ?? 0))
    .default(0),
  totalMonthEstimatedValue: MoneySchema.optional().default(0),
});

export const DashboardTasksSummarySchema = z.object({
  totalDayTasks: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => Number(val ?? 0))
    .default(0),
  totalDayFinishedTasks: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => Number(val ?? 0))
    .default(0),
  rateTasks: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => Number(val ?? 0))
    .default(0),
});

export const DashboardEventsSummarySchema = z.object({
  totalWeekEvents: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => Number(val ?? 0))
    .default(0),
  nextEventDate: z.union([DateTimeSchema, z.null(), z.undefined()]).optional().default(null),
  nextEventName: z.string().nullable().optional().default(''),
});

export const DashboardNoticeReactionSchema = z.object({
  noticeReactionId: UuidSchema.optional().default(''),
  noticeId: UuidSchema.optional().default(''),
  userId: UuidSchema.optional().default(''),
  emoji: z.string().optional().default(''),
  createdAt: DateTimeSchema.optional().default(''),
});

export const DashboardNoticeSchema = z.object({
  noticeId: UuidSchema.optional().default(''),
  message: z.string().optional().default(''),
  date: DateTimeSchema.optional().default(''),
  isPinned: z.boolean().optional().default(false),
  expiresAt: z.union([DateTimeSchema, z.null(), z.undefined()]).optional().default(null),
  isActive: z.boolean().optional().default(true),
  createdBy: UuidSchema.nullable().optional().default(''),
  createdAt: DateTimeSchema.optional().default(''),
  reactions: z
    .array(DashboardNoticeReactionSchema)
    .nullish()
    .transform((val) => val ?? []),
});

export const DashboardEventSchema = z.object({
  date: DateTimeSchema.optional().default(''),
  title: z.string().optional().default(''),
  description: z.string().nullable().optional().default(''),
});

export const DashboardResponseSchema = z.object({
  financial: DashboardFinancialSummarySchema.optional().default({
    totalMonthSpent: 0,
    totalLastMonthSpent: 0,
    monthVariation: 0,
  }),
  shoppingList: DashboardShoppingListSummarySchema.optional().default({
    totalMonthItems: 0,
    totalMonthEstimatedValue: 0,
  }),
  task: DashboardTasksSummarySchema.optional().default({
    totalDayTasks: 0,
    totalDayFinishedTasks: 0,
    rateTasks: 0,
  }),
  event: DashboardEventsSummarySchema.optional().default({
    totalWeekEvents: 0,
    nextEventDate: null,
    nextEventName: '',
  }),
  notices: z
    .array(DashboardNoticeSchema)
    .nullish()
    .transform((val) => val ?? []),
  events: z
    .array(DashboardEventSchema)
    .nullish()
    .transform((val) => val ?? []),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type DashboardFinancialSummary = z.infer<typeof DashboardFinancialSummarySchema>;
export type DashboardShoppingListSummary = z.infer<typeof DashboardShoppingListSummarySchema>;
export type DashboardTasksSummary = z.infer<typeof DashboardTasksSummarySchema>;
export type DashboardEventsSummary = z.infer<typeof DashboardEventsSummarySchema>;
export type DashboardNotice = z.infer<typeof DashboardNoticeSchema>;
export type DashboardEvent = z.infer<typeof DashboardEventSchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
