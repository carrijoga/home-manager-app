import { z } from 'zod';

import { ApiPrioritySchema } from './enums';
import { DateTimeSchema, UuidSchema } from './shared';

// ── Response ──────────────────────────────────────────────────────────────────

export const NoticeReactionResponseSchema = z.object({
  noticeReactionId: UuidSchema,
  noticeId: UuidSchema,
  userId: UuidSchema,
  userName: z.union([z.string(), z.null()]).optional(),
  userProfilePictureUrl: z.union([z.string(), z.null()]).optional(),
  userAvatar: z.union([z.string(), z.null()]).optional(),
  emoji: z.string(),
  createdAt: DateTimeSchema,
});
export type NoticeReactionResponse = z.infer<typeof NoticeReactionResponseSchema>;

export const NoticeResponseSchema = z.object({
  noticeId: UuidSchema,
  message: z.string(),
  date: DateTimeSchema,
  isPinned: z.boolean(),
  priority: z.union([ApiPrioritySchema, z.null(), z.undefined()]).transform((val) => val ?? 3),
  expiresAt: z.union([DateTimeSchema, z.null()]),
  isActive: z.boolean(),
  createdBy: UuidSchema,
  createdByName: z.union([z.string(), z.null()]).optional(),
  createdByProfilePictureUrl: z.union([z.string(), z.null()]).optional(),
  authorName: z.union([z.string(), z.null()]).optional(),
  authorAvatar: z.union([z.string(), z.null()]).optional(),
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
  priority?: number;
  date?: string;
  expiresAt?: string | null;
}

export interface UpdateNoticeRequest {
  message: string;
  priority?: number;
  expiresAt?: string | null;
}
