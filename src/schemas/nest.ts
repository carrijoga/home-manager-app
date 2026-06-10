import { z } from 'zod';

import { InviteStatusSchema, NestRoleSchema } from './enums';
import { DateTimeSchema, UuidSchema } from './shared';

// ── Responses ─────────────────────────────────────────────────────────────────

export const NestInviteSchema = z.object({
  nestInviteId: UuidSchema,
  nestId: UuidSchema,
  email: z.string().email(),
  role: NestRoleSchema,
  status: InviteStatusSchema,
  createdAtUtc: DateTimeSchema,
});
export type NestInvite = z.infer<typeof NestInviteSchema>;

export const NestMemberSchema = z.object({
  userId: UuidSchema,
  name: z.string(),
  nestId: UuidSchema,
  role: NestRoleSchema,
});
export type NestMember = z.infer<typeof NestMemberSchema>;

// ── Requests ─────────────────────────────────────────────────────────────────

export const CreateNestRequestSchema = z.object({
  name: z.string().min(1, 'Nome do ninho é obrigatório'),
  description: z.string().optional().default(''),
  icon: z.string().nullable().optional(),
});
export type CreateNestRequest = z.infer<typeof CreateNestRequestSchema>;

export const UpdateNestMembersSchema = z.object({
  userId: UuidSchema,
  role: NestRoleSchema,
  removeFromNest: z.boolean().optional(),
});
export type UpdateNestMembers = z.infer<typeof UpdateNestMembersSchema>;

export const UpdateNestRequestSchema = z.object({
  userId: UuidSchema.optional(),
  nestId: UuidSchema,
  name: z.string().min(1, 'Nome do ninho é obrigatório').optional(),
  description: z.string().optional(),
  icon: z.string().nullable().optional(),
  isDefault: z.boolean().optional(),
  members: z.array(UpdateNestMembersSchema).optional(),
});
export type UpdateNestRequest = z.infer<typeof UpdateNestRequestSchema>;
