import { z } from 'zod';

// ── Schemas de UI (validação de formulários, não espelham a API diretamente) ──

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

// ── Contrato da API — PUT /api/users/me/configuration ─────────────────────────

export const UpdateUserConfigurationRequestSchema = z.object({
  userId: z.string().uuid().optional(),
  theme: z.number().int().optional(),
  language: z.number().int().optional(),
  city: z.string().nullable().optional(),
  allowLocationByIp: z.boolean().optional(),
  allowLocationByGps: z.boolean().optional(),
  notifyInformative: z.boolean().optional(),
  notifyWarning: z.boolean().optional(),
  notifyError: z.boolean().optional(),
  notifySuccess: z.boolean().optional(),
  shareDataForAnalytics: z.boolean().optional(),
});
export type UpdateUserConfigurationRequest = z.infer<typeof UpdateUserConfigurationRequestSchema>;
