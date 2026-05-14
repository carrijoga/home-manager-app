import { mockNotifications } from '@/mocks/data';
import type { AuthTokenResponse, LoginRequest, RegisterRequest } from '@/schemas/auth';
import { LoginRequestSchema, RegisterRequestSchema } from '@/schemas/auth';
import type { UserProfileResponse } from '@/schemas/user';
import { UserProfileResponseSchema } from '@/schemas/user';

import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { ApiError, httpClient } from './api/httpClient';

export type { AuthTokenResponse, LoginRequest, RegisterRequest, UserProfileResponse };
export { ApiError } from './api/httpClient';

// ── Mock user (usado quando DATA_MODE === 'mock') ─────────────────────────────

const MOCK_USER_PROFILE: UserProfileResponse = {
  userId: 'user-mock-0001',
  firstName: 'Usuário',
  lastName: 'Mock',
  fullName: 'Usuário Mock',
  callbyName: 'Usuário',
  username: 'usuario_mock',
  email: 'mock@ninho.local',
  profilePictureUrl: null,
  profile: {
    profileId: 'mock-profile-id-0000-0000-000000001',
    userId: 'mock-user-id-0000-0000-000000000001',
    configuration: {
      userConfigurationId: 'mock-config-id-0000-0000-000000000001',
      receivePushNotifications: true,
      isDarkModeEnabled: false,
      profileId: 'mock-profile-id-0000-0000-000000001',
    },
    notifications: mockNotifications,
  },
  nests: [
    {
      userId: 'mock-user-id-0000-0000-000000000001',
      nestId: 'mock-nest-id-0000-0000-000000000001',
      name: 'Ninho Mock',
      icon: null,
      isDefault: true,
      role: 3,
      joinedAt: new Date().toString(),
    }
  ],
};

// ── Geração de username sugerido ──────────────────────────────────────────────

export async function generateUsername(
  firstName: string,
  lastName: string,
): Promise<{ username: string }> {
  if (!firstName || !lastName) {
    throw new ApiError('O nome e sobrenome são obrigatórios.', 400);
  }
  const params = new URLSearchParams({ firstName, lastName });
  return httpClient.post<{ username: string }>(
    `${ENDPOINTS.users.usernamePreview}?${params}`,
    undefined,
    { skipRefresh: false },
  );
}

// ── Sessão ────────────────────────────────────────────────────────────────────

/** Verifica se há sessão ativa tentando renovar o token via cookie HttpOnly. */
export async function checkSession(): Promise<boolean> {
  if (DATA_MODE === 'mock') return true;
  try {
    await httpClient.refresh();
    return true;
  } catch {
    return false;
  }
}

// ── Autenticação ──────────────────────────────────────────────────────────────

export async function register(payload: RegisterRequest): Promise<{ message: string }> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve({ message: 'Conta criada com sucesso!' }), 100));
  }
  RegisterRequestSchema.parse(payload);
  return httpClient.post<{ message: string }>(ENDPOINTS.auth.register, payload, {
    skipRefresh: true,
  });
}

export async function login(payload: LoginRequest): Promise<AuthTokenResponse> {
  if (DATA_MODE === 'mock') {
    if (!payload.usernameOrEmail?.includes('@')) {
      throw new ApiError('Informe um e-mail válido (com @) para o modo mock.', 400);
    }
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          }),
        200,
      ),
    );
  }
  LoginRequestSchema.parse(payload);
  return httpClient.post<AuthTokenResponse>(ENDPOINTS.auth.login, payload, {
    skipRefresh: true,
  });
}

export async function loginWithGoogle(code: string): Promise<AuthTokenResponse> {
  return httpClient.post<AuthTokenResponse>(
    ENDPOINTS.auth.googleCallback,
    { code },
    { skipRefresh: true },
  );
}

export async function logout(): Promise<void> {
  if (DATA_MODE === 'mock') return;
  await httpClient.post<void>(ENDPOINTS.auth.logout, null, { skipRefresh: true });
}

export async function refreshToken(): Promise<void> {
  return httpClient.refresh();
}

// ── Perfil do usuário ─────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfileResponse> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_USER_PROFILE), 100));
  }

  const raw = await httpClient.get<unknown>(ENDPOINTS.users.meProfile);
  const result = UserProfileResponseSchema.safeParse(raw);

  if (!result.success) {
    if (import.meta.env.DEV) {
      console.warn('[authService] getUserProfile: schema inesperado', result.error.flatten());
    }
    // Retorna os dados brutos com cast para não travar a UI em produção
    return raw as UserProfileResponse;
  }

  return result.data;
}
