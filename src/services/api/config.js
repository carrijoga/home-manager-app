/**
 * @fileoverview Configuração da API para integração futura
 * Este arquivo prepara a aplicação para consumir uma API REST externa
 */

/**
 * Ambiente da aplicação: 'development', 'staging', ou 'production'
 * Configure via variável de ambiente VITE_ENVIRONMENT
 */
export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';

/**
 * URLs base para cada ambiente
 */
const API_URLS = {
  development: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  staging: import.meta.env.VITE_API_STAGING_URL || 'https://staging-api.ninho.app/api',
  production: import.meta.env.VITE_API_PRODUCTION_URL || 'https://api.ninho.app/api'
};

/**
 * Retorna a URL base da API com base no ambiente atual
 */
function getApiBaseUrl() {
  return API_URLS[ENVIRONMENT] || API_URLS.development;
}

/**
 * Configuração da API
 */
export const API_CONFIG = {
  // URL base da API (selecionada automaticamente com base no ambiente)
  baseURL: getApiBaseUrl(),

  // Timeout para requisições (em milissegundos)
  timeout: 10000,

  // Headers padrão para todas as requisições
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Log de configuração em modo de desenvolvimento
// if (import.meta.env.DEV) {
//   console.log('🔧 API Configuration:', {
//     environment: ENVIRONMENT,
//     dataMode: DATA_MODE,
//     baseURL: API_CONFIG.baseURL
//   });
// }

/**
 * Endpoints da API
 */
export const API_ENDPOINTS = {
  notices: '/api/notices',
  tasks: '/api/tasks',
  shopping: '/api/shopping',
  expenses: '/api/financial-transactions',
  futureItems: '/api/future-items'
};

/**
 * Modo de operação: 'mock' usa dados locais, 'api' usa API externa
 * Configure via variável de ambiente VITE_DATA_MODE
 */
export const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'mock';

/**
 * Helper para fazer requisições HTTP
 * Esta função será usada quando implementarmos a API real
 *
 * @param {string} endpoint - Endpoint da API
 * @param {Object} options - Opções da requisição (method, body, headers)
 * @returns {Promise<any>} Resposta da API
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.baseURL}${endpoint}`;

  const config = {
    method: options.method || 'GET',
    headers: {
      ...API_CONFIG.headers,
      ...options.headers
    },
    // Ensure cookies (HttpOnly) are sent so server-side session cookies work
    credentials: options.credentials ?? 'include',
    ...options
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

/**
 * CORS: Quando implementar a API em outro domínio, será necessário:
 *
 * 1. Configurar CORS no backend:
 *    - Adicionar headers: Access-Control-Allow-Origin, Access-Control-Allow-Methods, etc.
 *    - Exemplo com Express.js:
 *      const cors = require('cors');
 *      app.use(cors({
 *        origin: 'http://localhost:3000', // URL do frontend
 *        credentials: true
 *      }));
 *
 * 2. Se usar autenticação, adicionar:
 *    - credentials: 'include' nas requisições fetch
 *    - Access-Control-Allow-Credentials: true no backend
 *
 * 3. Para requisições complexas (PUT, DELETE, custom headers):
 *    - Backend deve responder a requisições OPTIONS (preflight)
 */

export default {
  API_CONFIG,
  API_ENDPOINTS,
  DATA_MODE,
  apiRequest
};
