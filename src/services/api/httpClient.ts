/**
 * Cliente HTTP unificado para todas as requisições à API.
 * Gerencia refresh automático de token (401) via cookie HttpOnly.
 */

// Vazio por padrão: as requisições ficam relativas à origem atual e são
// encaminhadas pelo proxy do dev server (ver `server.proxy` em vite.config.ts).
// Defina VITE_API_URL apenas para apontar direto a uma API externa.
const BASE_URL = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');
const TIMEOUT_MS = 10_000;

import { getCurrentLanguage, getDefaultErrorMessage, getErrorMessageByCode, getRateLimitMessage } from '@/i18n';

// ── Erro tipado ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status?: number;
  code?: string;
  fallbackMessage?: string;
  details?: unknown;

  constructor(
    message: string,
    status?: number,
    code?: string,
    fallbackMessage?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fallbackMessage = fallbackMessage;
    this.details = details;
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
    const expiredMsg =
      getErrorMessageByCode('Auth_InvalidOrExpiredRefreshToken', getCurrentLanguage()) ??
      'Sessão expirada. Faça login novamente.';
    throw new ApiError(
      expiredMsg,
      response.status,
      'Auth_InvalidOrExpiredRefreshToken',
      'Refresh token is invalid or expired.'
    );
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
  signal?: AbortSignal;
}

function combineSignals(timeoutMs: number, callerSignal?: AbortSignal): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  if (!callerSignal) return timeoutSignal;
  if ('any' in AbortSignal && typeof (AbortSignal as unknown as { any: (signals: AbortSignal[]) => AbortSignal }).any === 'function') {
    return (AbortSignal as unknown as { any: (signals: AbortSignal[]) => AbortSignal }).any([timeoutSignal, callerSignal]);
  }
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  timeoutSignal.addEventListener('abort', onAbort, { once: true });
  callerSignal.addEventListener('abort', onAbort, { once: true });
  return controller.signal;
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
  const { method = 'GET', body, headers = {}, skipRefresh = false, signal } = options;
  const requestHeaders = buildHeaders(body, headers);
  const requestSignal = combineSignals(TIMEOUT_MS, signal);

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    body,
    credentials: 'include',
    headers: requestHeaders,
    signal: requestSignal,
  });

  // Tenta refresh em 401 e repete uma vez
  if (response.status === 401 && !skipRefresh) {
    try {
      await refreshOnce();
    } catch {
      tokenStorage.clearTokens();
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      const expiredMsg =
        getErrorMessageByCode('Auth_InvalidOrExpiredRefreshToken', getCurrentLanguage()) ??
        'Sessão expirada. Faça login novamente.';
      throw new ApiError(
        expiredMsg,
        401,
        'Auth_InvalidOrExpiredRefreshToken',
        'Refresh token is invalid or expired.'
      );
    }

    const retryHeaders = buildHeaders(body, headers);
    const retryResponse = await fetch(`${BASE_URL}${path}`, {
      method,
      body,
      credentials: 'include',
      headers: retryHeaders,
      signal: requestSignal,
    });

    if (retryResponse.status === 401) {
      tokenStorage.clearTokens();
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }

    return parseResponse<T>(retryResponse);
  }

  return parseResponse<T>(response);
}

interface ExtractedError {
  code?: string;
  fallbackMessage?: string;
  status?: number;
  details?: unknown;
}

function extractErrorInfo(data: unknown, responseStatus: number): ExtractedError {
  if (!data) {
    return { status: responseStatus };
  }

  if (typeof data === 'string') {
    return { fallbackMessage: data, status: responseStatus };
  }

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;

    // Suporta camelCase e PascalCase para compatibilidade com o backend
    const code =
      (typeof obj.code === 'string' && obj.code.trim()) ||
      (typeof obj.Code === 'string' && obj.Code.trim()) ||
      undefined;

    let fallbackMessage =
      (typeof obj.message === 'string' && obj.message.trim()) ||
      (typeof obj.Message === 'string' && obj.Message.trim()) ||
      undefined;

    const status =
      (typeof obj.status === 'number' && obj.status) ||
      (typeof obj.Status === 'number' && obj.Status) ||
      responseStatus;

    // Erros de validação do FluentValidation / ModelState (ex: { errors: { field: ["msg"] } })
    if (!fallbackMessage && obj.errors && typeof obj.errors === 'object') {
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
        fallbackMessage = messages.join(' ');
      }
    }

    if (!fallbackMessage && typeof obj.detail === 'string' && obj.detail.trim()) {
      fallbackMessage = obj.detail;
    }

    if (!fallbackMessage && typeof obj.title === 'string' && obj.title.trim()) {
      fallbackMessage = obj.title;
    }

    if (!fallbackMessage && typeof obj.error === 'string' && obj.error.trim()) {
      fallbackMessage = obj.error;
    }

    return { code, fallbackMessage, status, details: data };
  }

  return { status: responseStatus };
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
    const { code, fallbackMessage, status, details } = extractErrorInfo(data, response.status);
    const currentLang = getCurrentLanguage();

    let displayMessage: string | undefined;

    // 1. Se veio código de erro estável, busca a tradução no dicionário do frontend
    if (code) {
      displayMessage = getErrorMessageByCode(code, currentLang);
    }

    // 2. Se o código for desconhecido ou não mapeado, usa a mensagem de fallback da API
    if (!displayMessage && fallbackMessage) {
      displayMessage = fallbackMessage;
    }

    // 3. Se for rate limit (429) e nenhuma mensagem foi resolvida, usa mensagem de rate limit
    if (!displayMessage && status === 429) {
      displayMessage = getRateLimitMessage(currentLang);
    }

    // 4. Fallback genérico no idioma ativo
    if (!displayMessage) {
      displayMessage = getDefaultErrorMessage(currentLang);
    }

    if (import.meta.env?.DEV) {
      console.warn(
        `[ApiError ${status}] Code: ${code ?? '(none)'} | Display: "${displayMessage}" | Fallback: "${fallbackMessage ?? '(none)'}"`
      );
    }

    throw new ApiError(displayMessage, status, code, fallbackMessage, details);
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
  get<T>(
    path: string,
    nestId?: string,
    headers?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<T> {
    return baseRequest<T>(path, {
      method: 'GET',
      headers: { ...buildNestHeaders(path, nestId), ...headers },
      skipRefresh: false,
      signal,
    });
  },

  post<T>(
    path: string,
    body?: unknown,
    options?: Pick<RequestOptions, 'skipRefresh' | 'headers' | 'signal'> & { nestId?: string }
  ): Promise<T> {
    return baseRequest<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: { ...buildNestHeaders(path, options?.nestId), ...options?.headers },
      skipRefresh: options?.skipRefresh,
      signal: options?.signal,
    });
  },

  postForm<T>(
    path: string,
    body: FormData,
    options?: Pick<RequestOptions, 'skipRefresh' | 'headers' | 'signal'> & { nestId?: string }
  ): Promise<T> {
    return baseRequest<T>(path, {
      method: 'POST',
      body,
      headers: { ...buildNestHeaders(path, options?.nestId), ...options?.headers },
      skipRefresh: options?.skipRefresh,
      signal: options?.signal,
    });
  },

  put<T>(path: string, body?: unknown, nestId?: string, signal?: AbortSignal): Promise<T> {
    return baseRequest<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: buildNestHeaders(path, nestId),
      signal,
    });
  },

  patch<T>(path: string, body?: unknown, nestId?: string, signal?: AbortSignal): Promise<T> {
    return baseRequest<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: buildNestHeaders(path, nestId),
      signal,
    });
  },

  del<T = void>(path: string, nestId?: string, signal?: AbortSignal): Promise<T> {
    return baseRequest<T>(path, {
      method: 'DELETE',
      headers: buildNestHeaders(path, nestId),
      signal,
    });
  },

  /** Expõe o refresh para uso explícito (ex: checkSession) */
  refresh: refreshOnce,
};
