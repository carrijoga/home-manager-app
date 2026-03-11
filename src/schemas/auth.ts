import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Usuário ou e-mail é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthTokenResponse = z.infer<typeof AuthTokenResponseSchema>;

export const RequestPasswordRecoverySchema = z.object({
  userEmail: z.string().email('E-mail inválido'),
});
export type RequestPasswordRecovery = z.infer<typeof RequestPasswordRecoverySchema>;
