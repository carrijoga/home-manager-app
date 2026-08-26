import { z } from 'zod';

import { DateTimeSchema, UuidSchema } from './shared';

// ── Response ──────────────────────────────────────────────────────────────────

export const NoticeReactionResponseSchema = z.object({
  noticeReactionId: UuidSchema,
  noticeId: UuidSchema,
  userId: UuidSchema,
  emoji: z.string(),
  createdAt: DateTimeSchema,
});
export type NoticeReactionResponse = z.infer<typeof NoticeReactionResponseSchema>;

export const NoticeResponseSchema = z.object({
  noticeId: UuidSchema,
  message: z.string(),
  date: DateTimeSchema,
  isPinned: z.boolean(),
  expiresAt: z.union([DateTimeSchema, z.null()]),
  isActive: z.boolean(),
  createdBy: UuidSchema,
  createdAt: DateTimeSchema,
  reactions: z.array(NoticeReactionResponseSchema),
});
export type NoticeResponse = z.infer<typeof NoticeResponseSchema>;

export const NoticeHistoryResponseSchema = z.object({
  items: z.array(NoticeResponseSchema),
  totalCount: z.union([z.number(), z.string()]).transform(Number),
  page: z.union([z.number(), z.string()]).transform(Number),
  pageSize: z.union([z.number(), z.string()]).transform(Number),
});
export type NoticeHistoryResponse = z.infer<typeof NoticeHistoryResponseSchema>;

// ── Requests ──────────────────────────────────────────────────────────────────

export interface CreateNoticeRequest {
  message: string;
  date: string;
  expiresAt?: string | null;
}

export interface UpdateNoticeRequest {
  message: string;
  expiresAt?: string | null;
}
