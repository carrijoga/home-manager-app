/**
 * Cliente HTTP unificado para todas as requisições à API.
 * Gerencia refresh automático de token (401) via cookie HttpOnly.
 */

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5026').replace(/\/$/, '');
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

// ── Refresh singleton (evita múltiplas chamadas paralelas) ────────────────────

let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(null),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new ApiError('Sessão expirada. Faça login novamente.', response.status);
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
  body?: string;
  headers?: Record<string, string>;
  /** Desabilita retry automático em 401 (ex: endpoints de auth) */
  skipRefresh?: boolean;
}

async function baseRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, skipRefresh = false } = options;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    body,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  // Tenta refresh em 401 e repete uma vez
  if (response.status === 401 && !skipRefresh) {
    try {
      await refreshOnce();
    } catch {
      throw new ApiError('Sessão expirada. Faça login novamente.', 401);
    }

    const retryResponse = await fetch(`${BASE_URL}${path}`, {
      method,
      body,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    return parseResponse<T>(retryResponse);
  }

  return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ?? 'Erro ao comunicar com o servidor.';
    throw new ApiError(message, response.status);
  }

  return data as T;
}

// ── Nest header helper ───────────────────────────────────────────────────────

const NEST_HEADER_EXCLUDED_PREFIXES = ['/api/auth', '/api/users', '/api/admin'];

function shouldIncludeNestHeader(path: string): boolean {
  return !NEST_HEADER_EXCLUDED_PREFIXES.some(prefix => path.startsWith(prefix));
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
    return baseRequest<T>(path, { method: 'GET', headers: { ...buildNestHeaders(path, nestId), ...headers }, skipRefresh: false });
  },

  post<T>(path: string, body?: unknown, options?: Pick<RequestOptions, 'skipRefresh' | 'headers'> & { nestId?: string }): Promise<T> {
    return baseRequest<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
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

  del<T = void>(path: string, nestId?: string): Promise<T> {
    return baseRequest<T>(path, { method: 'DELETE', headers: buildNestHeaders(path, nestId) });
  },

  /** Expõe o refresh para uso explícito (ex: checkSession) */
  refresh: refreshOnce,
};
