import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  callmeby: z.string().max(20, 'Apelido deve ter no máximo 20 caracteres').optional(),
});
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export const updateUsernameSchema = z.object({
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres').max(30),
});
export type UpdateUsernameData = z.infer<typeof updateUsernameSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export const updateNotificationsSchema = z.object({
  tasks: z.boolean(),
  financial: z.boolean(),
  shopping: z.boolean(),
  notices: z.boolean(),
});
export type UpdateNotificationsData = z.infer<typeof updateNotificationsSchema>;

export const updatePrivacySchema = z.object({
  anonymousDataSharing: z.boolean(),
});
export type UpdatePrivacyData = z.infer<typeof updatePrivacySchema>;
