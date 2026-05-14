import { z } from 'zod';

import { NestRoleSchema, NotificationTypeSchema } from './enums';
import { DateTimeSchema,UuidSchema } from './shared';

export const UserConfigurationResponseSchema = z.object({
  userConfigurationId: UuidSchema,
  receivePushNotifications: z.boolean(),
  isDarkModeEnabled: z.boolean(),
  profileId: UuidSchema,
});
export type UserConfigurationResponse = z.infer<typeof UserConfigurationResponseSchema>;

export const UserNotificationResponseSchema = z.object({
  notificationId: UuidSchema,
  title: z.string(),
  message: z.string(),
  type: NotificationTypeSchema,
  isRead: z.boolean(),
  isEnabled: z.boolean(),
});
export type UserNotificationResponse = z.infer<typeof UserNotificationResponseSchema>;

export const ProfileResponseSchema = z.object({
  profileId: UuidSchema,
  userId: UuidSchema,
  configuration: UserConfigurationResponseSchema,
  notifications: z.array(UserNotificationResponseSchema),
});
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

export const UserNestResponseSchema = z.object({
  userId: UuidSchema,
  nestId: UuidSchema,
  name: z.string(),
  icon: z.string().nullable().optional(),
  isDefault: z.boolean(),
  role: NestRoleSchema,
  joinedAt: DateTimeSchema,
});
export type UserNestResponse = z.infer<typeof UserNestResponseSchema>;

export const UserSummaryResponseSchema = z.object({
  userId: UuidSchema,
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string().email(),
  callbyName: z.string(),
  profilePictureUrl: z.string().nullable().optional(),
});
export type UserSummaryResponse = z.infer<typeof UserSummaryResponseSchema>;

export const UserProfileResponseSchema = z.object({
  userId: UuidSchema,
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  callbyName: z.string(),
  username: z.string(),
  email: z.string().email(),
  profilePictureUrl: z.string().nullable().optional(),
  profile: ProfileResponseSchema.optional(),
  nests: z.array(UserNestResponseSchema).optional(),
});
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;

export const UpdateProfileRequestSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  callbyName: z.string().min(1, 'Apelido é obrigatório'),
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

export const CreateNestRequestSchema = z.object({
  name: z.string().min(1, 'Nome do ninho é obrigatório'),
  description: z.string().optional().default(''),
  icon: z.string().nullable().optional(),
});
export type CreateNestRequest = z.infer<typeof CreateNestRequestSchema>;

export const UpdateNestMembersSchema = z.object({
  userId: UuidSchema,
  role: z.string(),
});
export type UpdateNestMembers = z.infer<typeof UpdateNestMembersSchema>;

export const UpdateNestRequestSchema = z.object({
  userId: UuidSchema.optional(),
  nestId: UuidSchema,
  name: z.string().min(1, 'Nome do ninho é obrigatório'),
  description: z.string().optional(),
  icon: z.string().nullable().optional(),
  isDefault: z.boolean().optional(),
  members: z.array(UpdateNestMembersSchema).optional(),
});
export type UpdateNestRequest = z.infer<typeof UpdateNestRequestSchema>;
