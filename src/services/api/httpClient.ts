/**
 * Cliente HTTP unificado para todas as requisições à API.
 * Gerencia refresh automático de token (401) via cookie HttpOnly.
 */

// Vazio por padrão: as requisições ficam relativas à origem atual e são
// encaminhadas pelo proxy do dev server (ver `server.proxy` em vite.config.ts).
// Defina VITE_API_URL apenas para apontar direto a uma API externa.
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TIMEOUT_MS = 10_000;

// ── Erro tipado ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ── Armazenamento de Tokens (Bearer Token & Refresh) ─────────────────────────

const ACCESS_TOKEN_KEY = 'ninho_access_token';
const REFRESH_TOKEN_KEY = 'ninho_refresh_token';

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken?: string, refreshToken?: string): void => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ── Refresh singleton (evita múltiplas chamadas paralelas) ────────────────────

let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken();
  const accessToken = tokenStorage.getAccessToken();

  const refreshHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (refreshToken) {
    refreshHeaders['Authorization'] = `Bearer ${refreshToken}`;
  } else if (accessToken) {
    refreshHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: refreshHeaders,
    body: JSON.stringify({
      refreshToken: refreshToken ?? '',
      accessToken: accessToken ?? '',
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    tokenStorage.clearTokens();
    throw new ApiError('Sessão expirada. Faça login novamente.', response.status);
  }

  const data = await response.json().catch(() => null);
  const newAccessToken = data?.accessToken || data?.token || data?.access_token;
  const newRefreshToken = data?.refreshToken || data?.refresh_token;
  if (newAccessToken || newRefreshToken) {
    tokenStorage.setTokens(newAccessToken, newRefreshToken);
  }
}

async function refreshOnce(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ── Base request ──────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: BodyInit;
  headers?: Record<string, string>;
  /** Desabilita retry automático em 401 (ex: endpoints de auth) */
  skipRefresh?: boolean;
}

function buildHeaders(
  body: BodyInit | undefined,
  headers: Record<string, string>
): Record<string, string> {
  const baseHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  const accessToken = tokenStorage.getAccessToken();
  if (accessToken && !baseHeaders['Authorization']) {
    baseHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  if (typeof body === 'string') {
    return {
      'Content-Type': 'application/json',
      ...baseHeaders,
    };
  }

  return baseHeaders;
}

async function baseRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, skipRefresh = false } = options;
  const requestHeaders = buildHeaders(body, headers);

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    body,
    credentials: 'include',
    headers: requestHeaders,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  // Tenta refresh em 401 e repete uma vez
  if (response.status === 401 && !skipRefresh) {
    try {
      await refreshOnce();
    } catch {
      tokenStorage.clearTokens();
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      throw new ApiError('Sessão expirada. Faça login novamente.', 401);
    }

    const retryHeaders = buildHeaders(body, headers);
    const retryResponse = await fetch(`${BASE_URL}${path}`, {
      method,
      body,
      credentials: 'include',
      headers: retryHeaders,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (retryResponse.status === 401) {
      tokenStorage.clearTokens();
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }

    return parseResponse<T>(retryResponse);
  }

  return parseResponse<T>(response);
}

function extractErrorMessage(data: unknown): string {
  if (!data) return 'Erro ao comunicar com o servidor.';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message) {
      return obj.message;
    }
    if (obj.errors && typeof obj.errors === 'object') {
      const errorEntries = Object.entries(obj.errors as Record<string, unknown>);
      const messages: string[] = [];
      for (const [, fieldErrors] of errorEntries) {
        if (Array.isArray(fieldErrors)) {
          messages.push(...fieldErrors.map(String));
        } else if (typeof fieldErrors === 'string') {
          messages.push(fieldErrors);
        }
      }
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }
    if (typeof obj.detail === 'string' && obj.detail) {
      return obj.detail;
    }
    if (typeof obj.title === 'string' && obj.title) {
      return obj.title;
    }
  }
  return 'Erro ao comunicar com o servidor.';
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = extractErrorMessage(data);
    throw new ApiError(message, response.status);
  }

  return data as T;
}


// ── Nest header helper ───────────────────────────────────────────────────────

const NEST_HEADER_EXCLUDED_PREFIXES = [
  '/api/auth',
  '/api/users',
  '/api/admin',
  '/api/nests/create',
];

function shouldIncludeNestHeader(path: string): boolean {
  return !NEST_HEADER_EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function buildNestHeaders(path: string, nestId?: string): Record<string, string> {
  if (nestId && shouldIncludeNestHeader(path)) {
    return { 'X-Nest-Id': nestId };
  }
  return {};
}

// ── Métodos públicos tipados ──────────────────────────────────────────────────

export const httpClient = {
  get<T>(path: string, nestId?: string, headers?: Record<string, string>): Promise<T> {
    return baseRequest<T>(path, {
      method: 'GET',
      headers: { ...buildNestHeaders(path, nestId), ...headers },
      skipRefresh: false,
    });
  },

  post<T>(
    path: string,
    body?: unknown,
    options?: Pick<RequestOptions, 'skipRefresh' | 'headers'> & { nestId?: string }
  ): Promise<T> {
    return baseRequest<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: { ...buildNestHeaders(path, options?.nestId), ...options?.headers },
      skipRefresh: options?.skipRefresh,
    });
  },

  postForm<T>(
    path: string,
    body: FormData,
    options?: Pick<RequestOptions, 'skipRefresh' | 'headers'> & { nestId?: string }
  ): Promise<T> {
    return baseRequest<T>(path, {
      method: 'POST',
      body,
      headers: { ...buildNestHeaders(path, options?.nestId), ...options?.headers },
      skipRefresh: options?.skipRefresh,
    });
  },

  put<T>(path: string, body?: unknown, nestId?: string): Promise<T> {
    return baseRequest<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: buildNestHeaders(path, nestId),
    });
  },

  patch<T>(path: string, body?: unknown, nestId?: string): Promise<T> {
    return baseRequest<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: buildNestHeaders(path, nestId),
    });
  },

  del<T = void>(path: string, nestId?: string): Promise<T> {
    return baseRequest<T>(path, { method: 'DELETE', headers: buildNestHeaders(path, nestId) });
  },

  /** Expõe o refresh para uso explícito (ex: checkSession) */
  refresh: refreshOnce,
};
