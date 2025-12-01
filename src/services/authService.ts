const DEFAULT_API_URL = (import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5026').replace(/\/$/, '');

const AUTH_ENDPOINTS = {
  register: '/api/Account/register',
  login: '/api/Account/login',
  refresh: '/api/Account/refresh',
  logout: '/api/Account/logout',
  googleLogin: '/api/Account/google-login',
  profile: '/api/User/profile',
} as const;

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SuccessResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface GoogleLoginRequest {
  code: string;
}

export interface UserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  profilePicture?: string | null;
}

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestConfig {
  retryOnUnauthorized?: boolean;
}

async function baseRequest<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${DEFAULT_API_URL}${path}`, {
    method: options.method || 'GET',
    ...options,
    credentials: options.credentials ?? 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = data?.message || 'Erro ao comunicar com o servidor.';
    throw new ApiError(message, response.status);
  }

  return data as T;
}

let refreshPromise: Promise<LoginResponse> | null = null;

export async function refreshToken(): Promise<LoginResponse> {
  if (!refreshPromise) {
    refreshPromise = baseRequest<LoginResponse>(AUTH_ENDPOINTS.refresh, {
      method: 'POST',
      body: JSON.stringify(null), // Body vazio - API lê do cookie
    }).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit,
  config: RequestConfig = {}
): Promise<T> {
  const { retryOnUnauthorized = true } = config;

  try {
    return await baseRequest<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && retryOnUnauthorized) {
      await refreshToken();
      return request<T>(path, options, { retryOnUnauthorized: false });
    }
    throw error;
  }
}

// Verifica se o usuário está autenticado tentando fazer refresh do token
// A API lerá o refreshToken do cookie HttpOnly
export async function checkSession(): Promise<boolean> {
  try {
    // Tenta fazer refresh do token
    // Se o cookie refreshToken for válido, a API retornará sucesso
    await refreshToken();
    return true;
  } catch (error) {
    // Se falhar (401), o cookie expirou ou não existe
    return false;
  }
}

export async function register(payload: RegisterRequest): Promise<SuccessResponse> {
  return request<SuccessResponse>(
    AUTH_ENDPOINTS.register,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    { retryOnUnauthorized: false }
  );
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  // A API já configura os cookies HttpOnly automaticamente na resposta
  return request<LoginResponse>(
    AUTH_ENDPOINTS.login,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    { retryOnUnauthorized: false }
  );
}

export async function loginWithGoogle(code: string): Promise<LoginResponse> {
  // A API já configura os cookies HttpOnly automaticamente na resposta
  return request<LoginResponse>(
    AUTH_ENDPOINTS.googleLogin,
    {
      method: 'POST',
      body: JSON.stringify({ code }),
    },
    { retryOnUnauthorized: false }
  );
}

export async function logout(): Promise<void> {
  // A API removerá os cookies HttpOnly automaticamente
  await baseRequest<void>(AUTH_ENDPOINTS.logout, {
    method: 'POST',
  });
}

// Busca o perfil do usuário autenticado
export async function getUserProfile(): Promise<UserProfileResponse> {
  return request<UserProfileResponse>(
    AUTH_ENDPOINTS.profile,
    {
      method: 'GET',
    }
  );
}
