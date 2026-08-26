import { mockNotifications } from '@/mocks/data';
import type {
  AuthTokenResponse,
  LoginRequest,
  RegisterRequest,
  RequestPasswordRecovery,
  ResetPasswordRequest,
} from '@/schemas/auth';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  RequestPasswordRecoverySchema,
  ResetPasswordRequestSchema,
} from '@/schemas/auth';
import type { UserProfileResponse } from '@/schemas/user';
import { UserProfileResponseSchema } from '@/schemas/user';

import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { ApiError, httpClient, tokenStorage } from './api/httpClient';

export type {
  AuthTokenResponse,
  LoginRequest,
  RegisterRequest,
  RequestPasswordRecovery,
  ResetPasswordRequest,
  UserProfileResponse,
};

export { ApiError } from './api/httpClient';

// ── Mock user (usado quando DATA_MODE === 'mock') ─────────────────────────────

export const MOCK_USER_PROFILE: UserProfileResponse = {
  userId: 'user-mock-0001',
  firstName: 'Usuário',
  lastName: 'Mock',
  fullName: 'Usuário Mock',
  callbyName: 'Usuário',
  username: 'usuario_mock',
  email: 'mock@ninho.local',
  profilePictureUrl: null,
  avatarSlug: 'face-beaming',
  profile: {
    profileId: 'mock-profile-id-0000-0000-000000001',
    userId: 'mock-user-id-0000-0000-000000000001',
    configuration: {
      userConfigurationId: 'mock-config-id-0000-0000-000000000001',
      theme: 0,
      language: 0,
      city: null,
      allowLocationByIp: false,
      allowLocationByGps: false,
      notifyInformative: true,
      notifyWarning: true,
      notifyError: true,
      notifySuccess: true,
      shareDataForAnalytics: false,
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
    },
  ],
};

// ── Geração de username sugerido ──────────────────────────────────────────────

export async function generateUsername(
  firstName: string,
  lastName: string
): Promise<{ username: string }> {
  if (!firstName || !lastName) {
    throw new ApiError('O nome e sobrenome são obrigatórios.', 400);
  }
  const params = new URLSearchParams({ firstName, lastName });
  return httpClient.post<{ username: string }>(
    `${ENDPOINTS.users.usernamePreview}?${params}`,
    undefined,
    { skipRefresh: false }
  );
}

// ── Sessão ────────────────────────────────────────────────────────────────────

/** Verifica se há tokens de sessão salvos localmente. */
export async function checkSession(): Promise<boolean> {
  if (DATA_MODE === 'mock') return true;
  const hasAccessToken = !!tokenStorage.getAccessToken();
  const hasRefreshToken = !!tokenStorage.getRefreshToken();
  return hasAccessToken || hasRefreshToken;
}

// ── Autenticação ──────────────────────────────────────────────────────────────

export async function register(payload: RegisterRequest): Promise<{ message: string }> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ message: 'Conta criada com sucesso!' }), 100)
    );
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
    const mockTokens: AuthTokenResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };
    tokenStorage.setTokens(mockTokens.accessToken, mockTokens.refreshToken);
    return new Promise((resolve) => setTimeout(() => resolve(mockTokens), 200));
  }

  LoginRequestSchema.parse(payload);
  const response = await httpClient.post<AuthTokenResponse>(ENDPOINTS.auth.login, payload, {
    skipRefresh: true,
  });

  const resAny = response as unknown as Record<string, unknown>;
  const accessToken =
    typeof response?.accessToken === 'string'
      ? response.accessToken
      : typeof resAny?.token === 'string'
        ? resAny.token
        : typeof resAny?.access_token === 'string'
          ? resAny.access_token
          : undefined;
  const refreshToken =
    typeof response?.refreshToken === 'string'
      ? response.refreshToken
      : typeof resAny?.refresh_token === 'string'
        ? resAny.refresh_token
        : undefined;

  if (accessToken || refreshToken) {
    tokenStorage.setTokens(accessToken, refreshToken);
  }

  return response;
}

export async function loginWithGoogle(code: string): Promise<AuthTokenResponse> {
  const response = await httpClient.post<AuthTokenResponse>(
    ENDPOINTS.auth.googleCallback,
    { code },
    { skipRefresh: true }
  );

  const resAny = response as unknown as Record<string, unknown>;
  const accessToken =
    typeof response?.accessToken === 'string'
      ? response.accessToken
      : typeof resAny?.token === 'string'
        ? resAny.token
        : typeof resAny?.access_token === 'string'
          ? resAny.access_token
          : undefined;
  const refreshToken =
    typeof response?.refreshToken === 'string'
      ? response.refreshToken
      : typeof resAny?.refresh_token === 'string'
        ? resAny.refresh_token
        : undefined;

  if (accessToken || refreshToken) {
    tokenStorage.setTokens(accessToken, refreshToken);
  }

  return response;
}

export async function logout(): Promise<void> {
  if (DATA_MODE === 'mock') {
    tokenStorage.clearTokens();
    return;
  }
  try {
    await httpClient.post<void>(ENDPOINTS.auth.logout, null, { skipRefresh: true });
  } finally {
    tokenStorage.clearTokens();
  }
}

export async function refreshToken(): Promise<void> {
  return httpClient.refresh();
}

export async function requestPasswordRecovery(
  payload: RequestPasswordRecovery
): Promise<{ message?: string }> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ message: 'Instruções enviadas para o seu e-mail.' }), 200)
    );
  }
  RequestPasswordRecoverySchema.parse(payload);
  const emailVal = payload.userEmail;
  return httpClient.post<{ message?: string }>(
    ENDPOINTS.security.requestPasswordRecovery,
    { userEmail: emailVal, email: emailVal },
    { skipRefresh: true }
  );
}


export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<{ message?: string }> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ message: 'Senha redefinida com sucesso!' }), 200)
    );
  }
  ResetPasswordRequestSchema.parse(payload);

  const { token, newPassword } = payload;

  const queryParams = new URLSearchParams({
    token,
    Token: token,
    newPassword,
    NewPassword: newPassword,
    password: newPassword,
    Password: newPassword,
  }).toString();

  const body = {
    token,
    Token: token,
    newPassword,
    NewPassword: newPassword,
    password: newPassword,
    Password: newPassword,
  };

  return httpClient.post<{ message?: string }>(
    `${ENDPOINTS.security.resetPassword}?${queryParams}`,
    body,
    { skipRefresh: true }
  );
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
