/**
 * @fileoverview Configuração da API para integração futura
 * Este arquivo prepara a aplicação para consumir uma API REST externa
 */

/**
 * Configuração da API
 */
export const API_CONFIG = {
  // URL base da API (será configurada quando implementar a API real)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',

  // Timeout para requisições (em milissegundos)
  timeout: 10000,

  // Headers padrão para todas as requisições
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

/**
 * Endpoints da API
 */
export const API_ENDPOINTS = {
  notices: '/notices',
  tasks: '/tasks',
  shopping: '/shopping',
  expenses: '/expenses',
  futureItems: '/future-items'
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
