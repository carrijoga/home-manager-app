/**
 * Configuração de ambiente da aplicação.
 * Para fazer requisições HTTP, use `httpClient` de `./httpClient`.
 * Para os endpoints da API, use `ENDPOINTS` de `./endpoints`.
 */

/** Ambiente atual: 'development' | 'staging' | 'production' */
export const ENVIRONMENT =
  (import.meta.env.VITE_ENVIRONMENT as string | undefined) || 'development';

/** Modo de dados: 'mock' usa dados locais, 'api' usa a API externa */
export const DATA_MODE = (import.meta.env.VITE_DATA_MODE as string | undefined) || 'mock';

/**
 * URL base da API (usada pelo httpClient).
 * Vazia por padrão — as chamadas ficam relativas à origem atual e passam pelo
 * proxy do dev server (ver `server.proxy` em vite.config.ts). Defina
 * VITE_API_URL só para apontar direto a uma API externa (staging/produção).
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || '';

if (import.meta.env.DEV) {
  console.info('[Ninho] config:', { ENVIRONMENT, DATA_MODE, API_BASE_URL });
}
